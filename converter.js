// converter.js - 画像→AA変換エンジン (拡張版)
// 4モード: density(濃度), shape(形状), hybrid(ハイブリッド), outline(輪郭のみ)
// 幅モード: half(半角のみ), full(全角のみ), mixed(混在)

/**
 * 画像をターゲットサイズにリサイズし、ImageDataを返す
 */
function resizeImage(sourceCanvas, targetCols, targetRows) {
  const resizeCanvas = document.getElementById('resize-canvas');
  resizeCanvas.width = targetCols;
  resizeCanvas.height = targetRows;
  const ctx = resizeCanvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, targetCols, targetRows);
  return ctx.getImageData(0, 0, targetCols, targetRows);
}

/**
 * 形状マッチング用の高解像度リサイズ
 */
function resizeForShapeMatch(sourceCanvas, targetCols, targetRows, pixPerCellX, pixPerCellY) {
  const fullW = targetCols * pixPerCellX;
  const fullH = targetRows * pixPerCellY;
  const resizeCanvas = document.getElementById('resize-canvas');
  resizeCanvas.width = fullW;
  resizeCanvas.height = fullH;
  const ctx = resizeCanvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, fullW, fullH);
  return ctx.getImageData(0, 0, fullW, fullH);
}

/**
 * ImageDataからグレースケール配列を生成
 */
function toGrayscale(imageData) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const gray = new Float32Array(width * height);

  for (let i = 0; i < width * height; i++) {
    const offset = i * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const a = data[offset + 3] / 255;
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[i] = luma * a + 255 * (1 - a);
  }

  return { gray, width, height };
}

/**
 * 明るさ・コントラスト調整
 */
function adjustBrightnessContrast(gray, brightness, contrast) {
  const result = new Float32Array(gray.length);
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < gray.length; i++) {
    let val = factor * (gray[i] - 128) + 128 + brightness;
    result[i] = Math.max(0, Math.min(255, val));
  }

  return result;
}

/**
 * ガウシアンブラー (3x3 / 5x5)
 */
function applyGaussianBlur(gray, width, height, radius) {
  if (radius <= 0) return gray;

  const result = new Float32Array(gray.length);

  if (radius === 1) {
    const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
    const kSum = 16;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0, ki = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            sum += gray[(y + ky) * width + (x + kx)] * kernel[ki++];
          }
        }
        result[y * width + x] = sum / kSum;
      }
    }
  } else {
    const kernel = [1,4,7,4,1, 4,16,26,16,4, 7,26,41,26,7, 4,16,26,16,4, 1,4,7,4,1];
    const kSum = 273;
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        let sum = 0, ki = 0;
        for (let ky = -2; ky <= 2; ky++) {
          for (let kx = -2; kx <= 2; kx++) {
            sum += gray[(y + ky) * width + (x + kx)] * kernel[ki++];
          }
        }
        result[y * width + x] = sum / kSum;
      }
    }
  }

  // 境界コピー
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (result[y * width + x] === 0 && gray[y * width + x] !== 0) {
        result[y * width + x] = gray[y * width + x];
      }
    }
  }

  return result;
}

/**
 * Sobelエッジ検出フィルタ
 */
function applySobel(gray, width, height) {
  const magnitude = new Float32Array(width * height);
  const direction = new Float32Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const tl = gray[(y-1)*width+(x-1)];
      const tc = gray[(y-1)*width+x];
      const tr = gray[(y-1)*width+(x+1)];
      const ml = gray[y*width+(x-1)];
      const mr = gray[y*width+(x+1)];
      const bl = gray[(y+1)*width+(x-1)];
      const bc = gray[(y+1)*width+x];
      const br = gray[(y+1)*width+(x+1)];

      const gx = -tl + tr - 2*ml + 2*mr - bl + br;
      const gy = -tl - 2*tc - tr + bl + 2*bc + br;

      const idx = y * width + x;
      magnitude[idx] = Math.sqrt(gx*gx + gy*gy);
      direction[idx] = Math.atan2(gy, gx);
    }
  }

  return { magnitude, direction };
}

/**
 * 曲率判定 — 2次微分の大きさ
 */
function checkCurvature(x, y, width, height, gray) {
  if (x < 2 || x >= width - 2 || y < 2 || y >= height - 2) return 0;
  const center = gray[y * width + x];
  const left = gray[y * width + (x - 1)];
  const right = gray[y * width + (x + 1)];
  const up2 = gray[(y - 2) * width + x];
  const down2 = gray[(y + 2) * width + x];
  return Math.abs(up2 - 2 * center + down2) + Math.abs(left - 2 * center + right);
}

/**
 * Floyd-Steinbergディザリング
 */
function applyDithering(gray, width, height, levels) {
  const result = new Float32Array(gray);
  const step = 255 / (levels - 1);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldVal = result[idx];
      const newVal = Math.round(oldVal / step) * step;
      result[idx] = Math.max(0, Math.min(255, newVal));
      const error = oldVal - newVal;

      if (x + 1 < width) result[idx + 1] += error * 7 / 16;
      if (y + 1 < height) {
        if (x - 1 >= 0) result[(y+1)*width+(x-1)] += error * 3 / 16;
        result[(y+1)*width+x] += error * 5 / 16;
        if (x + 1 < width) result[(y+1)*width+(x+1)] += error * 1 / 16;
      }
    }
  }

  return result;
}

/**
 * セルから5x5パターンを抽出
 */
function extractCellPattern(gray, width, height, cellX, cellY, cellW, cellH) {
  const gs = typeof TEMPLATE_GRID !== 'undefined' ? TEMPLATE_GRID : 5;
  const pattern = new Float32Array(gs * gs);
  const bW = cellW / gs;
  const bH = cellH / gs;

  for (let gy = 0; gy < gs; gy++) {
    for (let gx = 0; gx < gs; gx++) {
      const sx = Math.floor(cellX + gx * bW);
      const ex = Math.floor(cellX + (gx + 1) * bW);
      const sy = Math.floor(cellY + gy * bH);
      const ey = Math.floor(cellY + (gy + 1) * bH);
      let sum = 0, count = 0;
      for (let py = sy; py < ey && py < height; py++) {
        for (let px = sx; px < ex && px < width; px++) {
          sum += (255 - gray[py * width + px]) / 255;
          count++;
        }
      }
      pattern[gy * gs + gx] = count > 0 ? sum / count : 0;
    }
  }

  return pattern;
}


// ============================================================
//  角度ユーティリティ
// ============================================================

/**
 * 角度(ラジアン)を0〜πの範囲に正規化（線の方向は180度対称）
 */
function normalizeAngle(rad) {
  let a = rad % Math.PI;
  if (a < 0) a += Math.PI;
  return a;
}

/**
 * 2つの角度の加重円環平均（0〜π範囲、線方向として）
 * 線方向は180度対称なので、2倍して0〜2πで平均→半分に戻す
 */
function circularWeightedMean(angles, weights) {
  let sinSum = 0, cosSum = 0;
  for (let i = 0; i < angles.length; i++) {
    const a2 = angles[i] * 2; // 2倍して全周にマップ
    sinSum += Math.sin(a2) * weights[i];
    cosSum += Math.cos(a2) * weights[i];
  }
  if (Math.abs(sinSum) < 1e-10 && Math.abs(cosSum) < 1e-10) {
    return angles.length > 0 ? angles[0] : 0;
  }
  let mean2 = Math.atan2(sinSum, cosSum);
  if (mean2 < 0) mean2 += 2 * Math.PI;
  return mean2 / 2; // 半分に戻して0〜πに
}


// ============================================================
//  メイン変換関数
// ============================================================

function convertToAA(sourceCanvas, options) {
  const {
    cols = 80, rows = 40,
    brightness = 0, contrast = 0,
    edgeDetection = false, edgeThreshold = 50,
    useFullWidth = false, invertBrightness = false,
    gaussianBlur = 0, ditheringLevels = 0,
    conversionMode = 'density',
    widthMode = null,
  } = options;

  const effectiveWidthMode = widthMode || (useFullWidth ? 'full' : 'half');

  let effectiveCols;
  if (effectiveWidthMode === 'full') {
    effectiveCols = Math.ceil(cols / 2);
  } else {
    effectiveCols = cols;
  }

  // outline / hybrid
  if (conversionMode === 'outline' || conversionMode === 'hybrid') {
    return convertEdgeBased(sourceCanvas, {
      effectiveCols, cols, rows, brightness, contrast,
      edgeThreshold, widthMode: effectiveWidthMode, invertBrightness,
      gaussianBlur, conversionMode,
    });
  }

  // shape
  if (conversionMode === 'shape') {
    return convertDensityBased(sourceCanvas, {
      effectiveCols, rows, brightness, contrast,
      edgeDetection, edgeThreshold,
      useFullWidth: effectiveWidthMode === 'full',
      invertBrightness, gaussianBlur, ditheringLevels,
    });
  }

  // density
  return convertDensityBased(sourceCanvas, {
    effectiveCols, rows, brightness, contrast,
    edgeDetection, edgeThreshold,
    useFullWidth: effectiveWidthMode === 'full',
    invertBrightness, gaussianBlur, ditheringLevels,
  });
}


/**
 * 濃度ベース変換 (density/shapeモード共通)
 */
function convertDensityBased(sourceCanvas, opts) {
  const {
    effectiveCols, rows, brightness, contrast,
    edgeDetection, edgeThreshold, useFullWidth,
    invertBrightness, gaussianBlur, ditheringLevels,
  } = opts;

  const imageData = resizeImage(sourceCanvas, effectiveCols, rows);
  const { gray, width, height } = toGrayscale(imageData);
  let adjusted = adjustBrightnessContrast(gray, brightness, contrast);

  if (gaussianBlur > 0) adjusted = applyGaussianBlur(adjusted, width, height, gaussianBlur);
  if (ditheringLevels > 0) adjusted = applyDithering(adjusted, width, height, ditheringLevels);

  let sobelData = null;
  if (edgeDetection) {
    const blurred = applyGaussianBlur(adjusted, width, height, 1);
    sobelData = applySobel(blurred, width, height);
  }

  const lines = [];
  for (let y = 0; y < height; y++) {
    let line = '';
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      let val = adjusted[idx];
      if (invertBrightness) val = 255 - val;

      if (edgeDetection && sobelData && sobelData.magnitude[idx] > edgeThreshold) {
        line += getDirectionalChar(sobelData.direction[idx], useFullWidth);
      } else {
        line += useFullWidth ? getFullWidthChar(val) : getHalfWidthChar(val);
      }
    }
    lines.push(line.trimEnd());
  }
  return lines.join('\n');
}


/**
 * エッジベース変換 (outline/hybridモード)
 *
 * 改善点:
 * - 解像度を8px/cellに向上（5から）
 * - セル内全エッジピクセルの加重平均方向を使用
 * - 2パス処理: (1)各セルの方向算出 → (2)隣接セル間で方向平滑化
 * - 曲率閾値を厳格化
 */
function convertEdgeBased(sourceCanvas, opts) {
  const {
    effectiveCols, cols, rows, brightness, contrast,
    edgeThreshold, widthMode, invertBrightness,
    gaussianBlur, conversionMode,
  } = opts;

  // 解像度: 8px/cell でSobelの精度を確保
  const pxPerCellX = 8;
  const pxPerCellY = 8;

  // 高解像度リサイズ
  const hiRes = resizeForShapeMatch(sourceCanvas, effectiveCols, rows, pxPerCellX, pxPerCellY);
  const { gray, width: hrW, height: hrH } = toGrayscale(hiRes);
  let adjusted = adjustBrightnessContrast(gray, brightness, contrast);

  if (gaussianBlur > 0) adjusted = applyGaussianBlur(adjusted, hrW, hrH, gaussianBlur);

  if (invertBrightness) {
    for (let i = 0; i < adjusted.length; i++) adjusted[i] = 255 - adjusted[i];
  }

  // Sobelエッジ検出 (ブラー後)
  const blurredForEdge = applyGaussianBlur(adjusted, hrW, hrH, 1);
  const sobelData = applySobel(blurredForEdge, hrW, hrH);

  // ============================================================
  //  パス1: 各セルのエッジ情報を収集
  // ============================================================
  const cellData = new Array(rows);
  for (let cellY = 0; cellY < rows; cellY++) {
    cellData[cellY] = new Array(effectiveCols);
    for (let cellX = 0; cellX < effectiveCols; cellX++) {
      const px = cellX * pxPerCellX;
      const py = cellY * pxPerCellY;

      // セル内の全エッジピクセルから加重平均方向を計算
      let avgMag = 0;
      let magCount = 0;
      const edgeAngles = [];
      const edgeWeights = [];

      for (let sy = py; sy < py + pxPerCellY && sy < hrH; sy++) {
        for (let sx = px; sx < px + pxPerCellX && sx < hrW; sx++) {
          const idx = sy * hrW + sx;
          const mag = sobelData.magnitude[idx];
          avgMag += mag;
          magCount++;

          // 閾値の半分以上のエッジピクセルを方向計算に使用
          if (mag > edgeThreshold * 0.3) {
            edgeAngles.push(normalizeAngle(sobelData.direction[idx]));
            edgeWeights.push(mag);
          }
        }
      }
      avgMag = magCount > 0 ? avgMag / magCount : 0;

      // 加重平均方向
      let avgDir = 0;
      if (edgeAngles.length > 0) {
        avgDir = circularWeightedMean(edgeAngles, edgeWeights);
      }

      // セル中央の座標
      const cx = Math.min(px + Math.floor(pxPerCellX / 2), hrW - 1);
      const cy = Math.min(py + Math.floor(pxPerCellY / 2), hrH - 1);

      // 曲率（セル中央）
      const curvature = checkCurvature(cx, cy, hrW, hrH, adjusted);

      cellData[cellY][cellX] = {
        avgMag,
        avgDir,        // 加重平均方向(0〜π)
        curvature,
        isEdge: avgMag > edgeThreshold,
        px, py, cx, cy,
      };
    }
  }

  // ============================================================
  //  パス2: 隣接セル間の方向平滑化 (3回反復)
  //  ゆるやかな曲線の一貫性を保ち、dr/dlの交互振動を抑制
  // ============================================================
  // 初期値: 各セルの生の avgDir
  let currentDir = new Array(rows);
  for (let y = 0; y < rows; y++) {
    currentDir[y] = new Float32Array(effectiveCols);
    for (let x = 0; x < effectiveCols; x++) {
      currentDir[y][x] = cellData[y][x].avgDir;
    }
  }

  const SMOOTH_PASSES = 3;
  const neighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (let pass = 0; pass < SMOOTH_PASSES; pass++) {
    const nextDir = new Array(rows);
    for (let cellY = 0; cellY < rows; cellY++) {
      nextDir[cellY] = new Float32Array(effectiveCols);
      for (let cellX = 0; cellX < effectiveCols; cellX++) {
        const cd = cellData[cellY][cellX];
        if (!cd.isEdge) {
          nextDir[cellY][cellX] = currentDir[cellY][cellX];
          continue;
        }

        const angles = [currentDir[cellY][cellX]];
        const weights = [cd.avgMag * 1.5]; // 自分

        for (const [dy, dx] of neighbors) {
          const ny = cellY + dy;
          const nx = cellX + dx;
          if (ny >= 0 && ny < rows && nx >= 0 && nx < effectiveCols) {
            const nd = cellData[ny][nx];
            if (nd.isEdge) {
              angles.push(currentDir[ny][nx]);
              weights.push(nd.avgMag * 0.7);
            }
          }
        }

        nextDir[cellY][cellX] = circularWeightedMean(angles, weights);
      }
    }
    currentDir = nextDir;
  }
  const smoothedDir = currentDir;

  // ============================================================
  //  パス3: 文字選択・出力生成
  // ============================================================
  const spaceHalf = ' ';
  const spaceFull = '\u3000';
  const lines = [];

  for (let cellY = 0; cellY < rows; cellY++) {
    let line = '';
    let cellX = 0;

    while (cellX < effectiveCols) {
      const cd = cellData[cellY][cellX];

      if (cd.isEdge) {
        // 平滑化された方向を使用
        const direction = smoothedDir[cellY][cellX];

        // 角・分岐検出
        const cornerInfo = detectCorner(
          sobelData.magnitude, sobelData.direction,
          cd.cx, cd.cy, hrW, hrH, pxPerCellX, pxPerCellY, edgeThreshold
        );
        const forkInfo = detectFork(
          sobelData.magnitude, cd.cx, cd.cy, hrW, hrH, pxPerCellX, pxPerCellY, edgeThreshold
        );

        // セルパターン (テンプレートマッチング用)
        const cellPattern = extractCellPattern(adjusted, hrW, hrH, cd.px, cd.py, pxPerCellX, pxPerCellY);

        let result = getOutlineCharEx(direction, cd.curvature, widthMode, cellPattern, cornerInfo, forkInfo);

        // mixed mode: 全角文字が行末からはみ出す場合は半角にフォールバック
        if (widthMode === 'mixed' && result.width === 2 && cellX + 2 > effectiveCols) {
          result = getOutlineCharEx(direction, cd.curvature, 'half', cellPattern, cornerInfo, forkInfo);
        }

        if (widthMode === 'mixed' && result.width === 2) {
          line += result.char;
          cellX += 2;
        } else {
          line += result.char;
          cellX += 1;
        }
      } else {
        // 非エッジセル
        if (conversionMode === 'outline') {
          if (widthMode === 'full') {
            line += spaceFull;
          } else {
            line += spaceHalf;
          }
          cellX += 1;
        } else {
          // hybrid: 塗り文字
          let avgBright = 0;
          let bCount = 0;
          for (let sy = cd.py; sy < cd.py + pxPerCellY && sy < hrH; sy++) {
            for (let sx = cd.px; sx < cd.px + pxPerCellX && sx < hrW; sx++) {
              avgBright += adjusted[sy * hrW + sx];
              bCount++;
            }
          }
          avgBright = bCount > 0 ? avgBright / bCount : 255;

          if (widthMode === 'full') {
            line += getFullWidthChar(avgBright);
          } else {
            line += getHalfWidthChar(avgBright);
          }
          cellX += 1;
        }
      }
    }

    lines.push(line.trimEnd());
  }

  return lines.join('\n');
}
