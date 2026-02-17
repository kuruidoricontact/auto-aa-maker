// characters.js - AA文字セット定義
// 2ch/aahub.org のAA研究に基づく文字セット
//
// 核心思想:
//   漢字・ひらがな・カタカナは「塗り」に使わない。
//   それらは「輪郭（線）」の形状にマッチするときだけ使う。
//   塗り（面の充填）にはASCII記号のみを使う。

// ============================================================
//  塗り用文字 (FILL) — 面の充填に使用
//  半角ASCII記号のみ。濃度ベースで選択。
// ============================================================
const FILL_HALF_CHARS = [
  { char: ' ',  density: 0.00, width: 1 },
  { char: '.',  density: 0.04, width: 1 },
  { char: ',',  density: 0.05, width: 1 },
  { char: '`',  density: 0.06, width: 1 },
  { char: "'",  density: 0.07, width: 1 },
  { char: ':',  density: 0.09, width: 1 },
  { char: '_',  density: 0.10, width: 1 },
  { char: '-',  density: 0.11, width: 1 },
  { char: '~',  density: 0.12, width: 1 },
  { char: '^',  density: 0.12, width: 1 },
  { char: ';',  density: 0.14, width: 1 },
  { char: '!',  density: 0.16, width: 1 },
  { char: 'i',  density: 0.17, width: 1 },
  { char: '|',  density: 0.19, width: 1 },
  { char: '/',  density: 0.21, width: 1 },
  { char: '\\', density: 0.21, width: 1 },
  { char: '1',  density: 0.23, width: 1 },
  { char: 'l',  density: 0.19, width: 1 },
  { char: 'r',  density: 0.24, width: 1 },
  { char: '+',  density: 0.27, width: 1 },
  { char: '7',  density: 0.28, width: 1 },
  { char: '*',  density: 0.29, width: 1 },
  { char: 't',  density: 0.30, width: 1 },
  { char: '=',  density: 0.31, width: 1 },
  { char: 'c',  density: 0.33, width: 1 },
  { char: 'y',  density: 0.34, width: 1 },
  { char: 'v',  density: 0.36, width: 1 },
  { char: 'x',  density: 0.37, width: 1 },
  { char: 'n',  density: 0.39, width: 1 },
  { char: 'o',  density: 0.41, width: 1 },
  { char: 's',  density: 0.41, width: 1 },
  { char: 'a',  density: 0.43, width: 1 },
  { char: 'e',  density: 0.44, width: 1 },
  { char: 'z',  density: 0.45, width: 1 },
  { char: 'w',  density: 0.46, width: 1 },
  { char: 'A',  density: 0.48, width: 1 },
  { char: 'm',  density: 0.50, width: 1 },
  { char: '%',  density: 0.51, width: 1 },
  { char: 'N',  density: 0.52, width: 1 },
  { char: 'B',  density: 0.55, width: 1 },
  { char: 'W',  density: 0.57, width: 1 },
  { char: '#',  density: 0.59, width: 1 },
  { char: '&',  density: 0.61, width: 1 },
  { char: 'M',  density: 0.63, width: 1 },
  { char: '$',  density: 0.65, width: 1 },
  { char: '@',  density: 0.72, width: 1 },
];

const FILL_FULL_CHARS = [
  { char: '\u3000', density: 0.00, width: 2 },  // 全角スペース
  { char: '．',     density: 0.04, width: 2 },
  { char: '：',     density: 0.09, width: 2 },
  { char: '；',     density: 0.12, width: 2 },
  { char: '＿',     density: 0.08, width: 2 },
  { char: '＝',     density: 0.20, width: 2 },
  { char: '＋',     density: 0.22, width: 2 },
  { char: '＊',     density: 0.24, width: 2 },
  { char: '※',     density: 0.34, width: 2 },
  { char: '◇',     density: 0.26, width: 2 },
  { char: '□',     density: 0.28, width: 2 },
  { char: '○',     density: 0.28, width: 2 },
  { char: '◎',     density: 0.38, width: 2 },
  { char: '★',     density: 0.48, width: 2 },
  { char: '◆',     density: 0.52, width: 2 },
  { char: '●',     density: 0.58, width: 2 },
  { char: '■',     density: 0.82, width: 2 },
  { char: '█',     density: 0.95, width: 2 },
];


// ============================================================
//  輪郭用文字 (OUTLINE) — 線を描くときだけ使用
//  方向タグ付き。エッジ方向に基づいて選択。
//
//  tags配列: その文字が表現できる線の方向/形状
//    h=横線, v=縦線, dr=右上→左下斜線(／), dl=左上→右下斜線(＼)
//    peak=山(∧), valley=谷(∨)
//    fork_down=下に分岐(人,八), fork_up=上に分岐
//    curve_br=右下弧(つ), curve_bl=左下弧(し)
//    curve_tr=右上弧(フ), curve_tl=左上弧(く)
//    corner_tl/tr/bl/br=角, cross=十字
//    t_down/t_up/t_left/t_right=T字
// ============================================================
const OUTLINE_HALF_CHARS = [
  // --- 基本方向 (半角ASCII) — 直線の主力 ---
  { char: '-',  tags: ['h'], width: 1 },
  { char: '_',  tags: ['h'], width: 1 },
  { char: '|',  tags: ['v'], width: 1 },
  { char: '/',  tags: ['dr'], width: 1 },
  { char: '\\', tags: ['dl'], width: 1 },
  // --- 曲線・角 (半角) ---
  { char: '(',  tags: ['curve_tl', 'curve_bl'], width: 1 },
  { char: ')',  tags: ['curve_tr', 'curve_br'], width: 1 },
  { char: '<',  tags: ['corner_tl', 'corner_bl'], width: 1 },
  { char: '>',  tags: ['corner_tr', 'corner_br'], width: 1 },
  // --- 半角カタカナ (最小限) ---
  { char: '\uFF89', tags: ['dr'],              width: 1 }, // ﾉ
  { char: '\uFF8A', tags: ['fork_down'],       width: 1 }, // ﾊ
  { char: '\uFF9A', tags: ['corner_bl', 'curve_bl'], width: 1 }, // ﾚ
  { char: '\uFF8C', tags: ['curve_tr'],        width: 1 }, // ﾌ
  { char: '\uFF70', tags: ['h'],               width: 1 }, // ｰ (長音)
];

const OUTLINE_FULL_CHARS = [
  // ============================================================
  //  Tier 1: 基本線記号 — 直線の主力。最優先で使用。
  //  h, v, dr, dl タグはこのTierの文字だけに付ける。
  // ============================================================
  { char: 'ー', tags: ['h'],               width: 2 },
  { char: '─',  tags: ['h'],               width: 2 },
  { char: '━',  tags: ['h'],               width: 2 },
  { char: '￣', tags: ['h'],               width: 2 },
  { char: '＿', tags: ['h'],               width: 2 },
  { char: '│',  tags: ['v'],               width: 2 },
  { char: '┃',  tags: ['v'],               width: 2 },
  { char: '｜', tags: ['v'],               width: 2 },
  { char: '／', tags: ['dr'],              width: 2 },
  { char: '＼', tags: ['dl'],              width: 2 },

  // ============================================================
  //  Tier 2: 罫線記号 — 角・T字・十字の主力。
  // ============================================================
  { char: '┌',  tags: ['corner_tl'],       width: 2 },
  { char: '┐',  tags: ['corner_tr'],       width: 2 },
  { char: '└',  tags: ['corner_bl'],       width: 2 },
  { char: '┘',  tags: ['corner_br'],       width: 2 },
  { char: '┏',  tags: ['corner_tl'],       width: 2 },
  { char: '┓',  tags: ['corner_tr'],       width: 2 },
  { char: '┗',  tags: ['corner_bl'],       width: 2 },
  { char: '┛',  tags: ['corner_br'],       width: 2 },
  { char: '├',  tags: ['t_right'],         width: 2 },
  { char: '┤',  tags: ['t_left'],          width: 2 },
  { char: '┬',  tags: ['t_down'],          width: 2 },
  { char: '┴',  tags: ['t_up'],            width: 2 },
  { char: '┣',  tags: ['t_right'],         width: 2 },
  { char: '┫',  tags: ['t_left'],          width: 2 },
  { char: '┳',  tags: ['t_down'],          width: 2 },
  { char: '┻',  tags: ['t_up'],            width: 2 },
  { char: '┼',  tags: ['cross'],           width: 2 },
  { char: '╋',  tags: ['cross'],           width: 2 },

  // ============================================================
  //  Tier 3: 括弧・山括弧 — 曲線・角の補助
  //  基本方向タグ(h,v,dr,dl)は付けない! 曲線/角専用。
  // ============================================================
  { char: '（', tags: ['curve_tl', 'curve_bl'], width: 2 },
  { char: '）', tags: ['curve_tr', 'curve_br'], width: 2 },
  { char: '「', tags: ['corner_tl'],         width: 2 },
  { char: '」', tags: ['corner_br'],         width: 2 },
  { char: '＜', tags: ['curve_tl', 'curve_bl'], width: 2 },
  { char: '＞', tags: ['curve_tr', 'curve_br'], width: 2 },

  // ============================================================
  //  Tier 4: カタカナ — 曲線・分岐・特殊形状のみ。
  //  重要: 基本方向(h,v,dr,dl)タグは付けない。
  //  直線には罫線記号を使い、カタカナは特殊形状でのみ候補に入る。
  // ============================================================
  { char: 'ノ',  tags: ['dr'],              width: 2 },  // 例外: 斜線の代表文字
  { char: 'ヽ',  tags: ['dl'],              width: 2 },  // 例外: 斜線の代表文字
  { char: 'ハ',  tags: ['fork_down'],        width: 2 },
  { char: 'フ',  tags: ['curve_tr'],         width: 2 },
  { char: 'ト',  tags: ['t_right'],          width: 2 },
  { char: 'レ',  tags: ['corner_bl', 'curve_bl'], width: 2 },
  { char: 'コ',  tags: ['corner_tr', 'corner_br'], width: 2 },
  { char: 'ヘ',  tags: ['peak'],             width: 2 },

  // ============================================================
  //  Tier 5: ひらがな — 柔らかい曲線専用。基本方向タグは付けない。
  // ============================================================
  { char: 'つ',  tags: ['curve_br'],         width: 2 },
  { char: 'っ',  tags: ['curve_br'],         width: 2 },
  { char: 'し',  tags: ['curve_bl'],         width: 2 },
  { char: 'く',  tags: ['curve_tl', 'curve_bl'], width: 2 },
  { char: 'へ',  tags: ['peak'],             width: 2 },

  // ============================================================
  //  Tier 6: 漢字 — 分岐専用。他に代替不可な形状だけ。
  // ============================================================
  { char: '人',  tags: ['fork_down'],        width: 2 },
  { char: '八',  tags: ['fork_down'],        width: 2 },

  // ============================================================
  //  曲線記号 — curve_top専用。太い記号はここだけ。
  // ============================================================
  { char: '⌒',  tags: ['curve_top'],         width: 2 },
];


// ============================================================
//  後方互換用: 既存コードが参照する旧配列名
//  （density/shapeモードの塗りで使う）
// ============================================================
const HALF_WIDTH_CHARS = FILL_HALF_CHARS;
const FULL_WIDTH_CHARS = FILL_FULL_CHARS;


// ============================================================
//  エッジ方向 → 方向タグ のマッピング
// ============================================================

/**
 * Sobelの角度(deg 0-180) + 曲率 + 角情報 + 分岐情報 → 方向タグを返す
 * @param {number} deg - 0〜180度
 * @param {number} curvature - 曲率 (0=直線, 高い=曲線)
 * @param {object} cornerInfo - 角情報 {isCorner, quadrant}
 * @param {object} [forkInfo] - 分岐情報 {isFork, direction}
 * @returns {string} 方向タグ
 */
function edgeToTag(deg, curvature, cornerInfo, forkInfo) {
  // 分岐が検出されている場合
  if (forkInfo && forkInfo.isFork) {
    return forkInfo.direction; // 'fork_down', 'fork_up'
  }

  // 角が検出されている場合
  if (cornerInfo && cornerInfo.isCorner) {
    return 'corner_' + cornerInfo.quadrant; // 'tl','tr','bl','br'
  }

  // 曲率が高い場合 → 曲線系タグ
  // 8px/cellの解像度に合わせた閾値(120)。低すぎるとノイズで曲線誤検出しギザギザの原因になる
  if (curvature > 120) {
    // 主に横方向のエッジ + 曲率 = 弧
    if (deg >= 60 && deg < 120) {
      return 'curve_top';
    }
    // 斜め方向 + 曲率 → 曲線の方向を推定
    if (deg >= 120 && deg < 150) return 'curve_bl';
    if (deg >= 30 && deg < 60)   return 'curve_br';
    if (deg < 30 || deg >= 150)  return 'curve_tr'; // 縦方向 + 曲率
    return 'peak';
  }

  // 基本4方向のみ — シンプルに
  // peak/valleyは曲率が高い場合にのみ上で返される。
  // 直線はすべてここで h/v/dr/dl に振り分ける。
  if (deg < 15 || deg >= 165) return 'v';
  if (deg < 60)  return 'dr';
  if (deg < 120) return 'h';
  if (deg < 165) return 'dl';
  return 'v';
}


// ============================================================
//  キャリブレーション & 文字検索
// ============================================================
let calibratedFillHalf = [...FILL_HALF_CHARS];
let calibratedFillFull = [...FILL_FULL_CHARS];

// 形状マッチング用テンプレート
const TEMPLATE_GRID = 5;
let outlineHalfTemplates = [];  // [{char, tags, width, template, gravity}]
let outlineFullTemplates = [];

// 方向タグ別インデックス (高速ルックアップ)
let outlineByTagHalf = {};   // { 'h': [template, ...], 'v': [...], ... }
let outlineByTagFull = {};
let outlineByTagMixed = {};  // 半角+全角を統合

/**
 * キャリブレーション:
 * - 塗り文字: 密度測定 + deduplicateAndSpread
 * - 輪郭文字: テンプレート(5x5)生成 + 方向タグ別インデックス構築
 */
function calibrateDensities(fontFamily, fontSize) {
  const canvas = document.createElement('canvas');
  const cellW = Math.ceil(fontSize * 0.6);
  const cellH = Math.ceil(fontSize * 1.2);
  canvas.width = cellW * 2;
  canvas.height = cellH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // --- 密度測定 ---
  function measureDensity(charEntry) {
    const w = charEntry.width === 2 ? cellW * 2 : cellW;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'top';
    ctx.fillText(charEntry.char, 0, 0);
    const data = ctx.getImageData(0, 0, w, cellH).data;
    let filled = 0;
    const total = w * cellH;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 128) filled++;
    }
    return total > 0 ? filled / total : 0;
  }

  // --- テンプレート + 重心測定 ---
  function measureTemplate(charEntry) {
    const w = charEntry.width === 2 ? cellW * 2 : cellW;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'top';
    ctx.fillText(charEntry.char, 0, 0);
    const data = ctx.getImageData(0, 0, w, cellH).data;

    const template = new Float32Array(TEMPLATE_GRID * TEMPLATE_GRID);
    const blockW = w / TEMPLATE_GRID;
    const blockH = cellH / TEMPLATE_GRID;
    let gx = 0, gy = 0, gTotal = 0;

    for (let by = 0; by < TEMPLATE_GRID; by++) {
      for (let bx = 0; bx < TEMPLATE_GRID; bx++) {
        const sx = Math.floor(bx * blockW);
        const ex = Math.floor((bx + 1) * blockW);
        const sy = Math.floor(by * blockH);
        const ey = Math.floor((by + 1) * blockH);
        let bf = 0, bt = 0;
        for (let py = sy; py < ey; py++) {
          for (let px = sx; px < ex; px++) {
            bt++;
            if (data[(py * w + px) * 4 + 3] > 128) bf++;
          }
        }
        const bd = bt > 0 ? bf / bt : 0;
        template[by * TEMPLATE_GRID + bx] = bd;
        gx += bd * (bx + 0.5);
        gy += bd * (by + 0.5);
        gTotal += bd;
      }
    }

    const gravity = gTotal > 0
      ? { x: gx / (gTotal * TEMPLATE_GRID), y: gy / (gTotal * TEMPLATE_GRID) }
      : { x: 0.5, y: 0.5 };

    return { template, gravity };
  }

  // ========== 塗り文字のキャリブレーション ==========
  calibratedFillHalf = FILL_HALF_CHARS.map(e => {
    const d = measureDensity(e);
    return { ...e, density: d > 0 ? d : e.density };
  });
  calibratedFillHalf = deduplicateAndSpread(calibratedFillHalf);

  calibratedFillFull = FILL_FULL_CHARS.map(e => {
    const d = measureDensity(e);
    return { ...e, density: d > 0 ? d : e.density };
  });
  calibratedFillFull = deduplicateAndSpread(calibratedFillFull);

  // ========== 輪郭文字のテンプレート生成 ==========
  outlineHalfTemplates = OUTLINE_HALF_CHARS.map(e => {
    const { template, gravity } = measureTemplate(e);
    return { ...e, template, gravity };
  });

  outlineFullTemplates = OUTLINE_FULL_CHARS.map(e => {
    const { template, gravity } = measureTemplate(e);
    return { ...e, template, gravity };
  });

  // ========== 方向タグ別インデックス構築 ==========
  outlineByTagHalf = buildTagIndex(outlineHalfTemplates);
  outlineByTagFull = buildTagIndex(outlineFullTemplates);
  outlineByTagMixed = buildTagIndex([...outlineHalfTemplates, ...outlineFullTemplates]);

  console.log(`[AA Maker] Fill chars: ${calibratedFillHalf.length} half, ${calibratedFillFull.length} full`);
  console.log(`[AA Maker] Outline chars: ${outlineHalfTemplates.length} half, ${outlineFullTemplates.length} full`);
  console.log(`[AA Maker] Mixed tags: ${Object.keys(outlineByTagMixed).length} tags`);
}

/**
 * 方向タグ別インデックスを構築
 */
function buildTagIndex(templates) {
  const idx = {};
  for (const t of templates) {
    if (!t.tags) continue;
    for (const tag of t.tags) {
      if (!idx[tag]) idx[tag] = [];
      idx[tag].push(t);
    }
  }
  return idx;
}


// ============================================================
//  塗り文字の検索 (濃度ベース二分探索)
// ============================================================
function getHalfWidthChar(brightness) {
  const targetDensity = 1 - (brightness / 255);
  return findClosestChar(calibratedFillHalf, targetDensity);
}

function getFullWidthChar(brightness) {
  const targetDensity = 1 - (brightness / 255);
  return findClosestChar(calibratedFillFull, targetDensity);
}


// ============================================================
//  輪郭文字の検索
// ============================================================

/**
 * エッジ方向 + 曲率 + セルパターンから最適な輪郭文字を選択
 * 戻り値: { char, width } オブジェクト
 *
 * @param {number} direction - Sobelの角度(ラジアン)
 * @param {number} curvature - 曲率
 * @param {string} widthMode - 'half', 'full', 'mixed'
 * @param {Float32Array|null} cellPattern - セルの5x5パターン
 * @param {object|null} cornerInfo - 角情報
 * @param {object|null} forkInfo - 分岐情報
 * @returns {{char: string, width: number}}
 */
function getOutlineCharEx(direction, curvature, widthMode, cellPattern, cornerInfo, forkInfo) {
  const deg = ((direction * 180) / Math.PI + 180) % 180;
  const tag = edgeToTag(deg, curvature, cornerInfo, forkInfo);

  let tagIndex;
  if (widthMode === 'mixed') {
    tagIndex = outlineByTagMixed;
  } else if (widthMode === 'full') {
    tagIndex = outlineByTagFull;
  } else {
    tagIndex = outlineByTagHalf;
  }

  const candidates = tagIndex[tag];

  if (!candidates || candidates.length === 0) {
    // フォールバック: 基本方向文字
    // mixed modeでは半角を優先（列アラインメントの安全性のため）
    const useFull = (widthMode === 'full');
    const ch = getBasicDirectionChar(deg, useFull);
    return { char: ch, width: useFull ? 2 : 1 };
  }

  if (candidates.length === 1) {
    return { char: candidates[0].char, width: candidates[0].width };
  }

  // セルパターンが無い場合
  if (!cellPattern) {
    // mixedの場合はなるべくシンプルな記号（半角）を優先
    if (widthMode === 'mixed') {
      const simple = candidates.find(c => c.width === 1);
      if (simple) return { char: simple.char, width: simple.width };
    }
    return { char: candidates[0].char, width: candidates[0].width };
  }

  // 形状テンプレートマッチングで最適候補を選択
  let bestEntry = candidates[0];
  let bestScore = Infinity;

  for (const cand of candidates) {
    if (!cand.template) continue;
    let ssd = 0;
    const t = cand.template;
    const gs = TEMPLATE_GRID * TEMPLATE_GRID;
    for (let j = 0; j < gs; j++) {
      const diff = cellPattern[j] - t[j];
      ssd += diff * diff;
    }

    // 文字の複雑さに応じたペナルティ (半角・全角共通)
    // → 罫線/基本ASCII記号を最優先。カタカナ等は形状が圧倒的に合う時だけ。
    const charPenalty = getCharComplexityPenalty(cand.char);
    ssd *= charPenalty;

    if (ssd < bestScore) {
      bestScore = ssd;
      bestEntry = cand;
    }
  }

  return { char: bestEntry.char, width: bestEntry.width };
}

/**
 * 後方互換用ラッパー: 文字列だけ返す版
 */
function getOutlineChar(direction, curvature, useFullWidth, cellPattern, cornerInfo) {
  const wm = useFullWidth ? 'full' : 'half';
  const result = getOutlineCharEx(direction, curvature, wm, cellPattern, cornerInfo, null);
  return result.char;
}

/**
 * 罫線文字かどうか
 */
function isBoxDrawing(ch) {
  const code = ch.charCodeAt(0);
  return (code >= 0x2500 && code <= 0x257F);  // Box Drawing block
}

/**
 * 基本全角記号（矢印、罫線、数学記号等）かどうか
 */
function isBasicFullwidthSymbol(ch) {
  const code = ch.charCodeAt(0);
  if (code >= 0xFF01 && code <= 0xFF60) return true;  // 全角ASCII
  if (code >= 0x2190 && code <= 0x21FF) return true;  // 矢印
  if (code >= 0x2200 && code <= 0x22FF) return true;  // 数学演算子
  if (code >= 0x2300 && code <= 0x23FF) return true;  // その他技術記号
  return false;
}

/**
 * 文字の複雑さに基づくSSDペナルティ倍率を返す
 * 1.0 = ペナルティなし（罫線記号）
 * 高い = よほど形状が合わないと使われない
 *
 * 方針: 罫線/基本記号 ≪ 括弧 < ひらがな < カタカナ < 漢字
 * ペナルティが大きいほど、SSDスコアが掛け算で不利になる。
 * 例: ペナルティ3.0なら、罫線のSSD=0.3に対してSSD=0.1でやっと互角。
 */
function getCharComplexityPenalty(ch) {
  const code = ch.charCodeAt(0);

  // 罫線 (Box Drawing U+2500–U+257F) → ペナルティなし
  if (isBoxDrawing(ch)) return 1.0;

  // 全角基本記号（ー ／ ＼ ｜ ＿ ￣ 等）→ ペナルティなし
  if (isBasicFullwidthSymbol(ch)) return 1.0;

  // ⌒ → 軽いペナルティ
  if (code === 0x2312) return 1.2;

  // 全角括弧(（）「」＜＞) → 軽いペナルティ
  if ('（）「」＜＞'.includes(ch)) return 1.5;

  // ひらがな → 曲線でしか候補にならないが、記号より重めに
  if (code >= 0x3040 && code <= 0x309F) return 2.5;

  // カタカナ (全角) → ひらがなより更に重く
  if (code >= 0x30A0 && code <= 0x30FF) return 3.0;

  // 半角カタカナ (U+FF65–U+FF9F) → 全角カタカナと同等
  if (code >= 0xFF65 && code <= 0xFF9F) return 3.0;

  // CJK漢字 → 最大ペナルティ (分岐でしか候補にならない)
  if (code >= 0x4E00 && code <= 0x9FFF) return 5.0;

  // 半角ASCII記号 → ペナルティなし
  if (code >= 0x20 && code <= 0x7E) return 1.0;

  // その他
  return 1.2;
}

/**
 * フォールバック用: 基本方向文字を返す
 */
function getBasicDirectionChar(deg, useFullWidth) {
  if (useFullWidth) {
    if (deg < 22.5 || deg >= 157.5) return '｜';
    if (deg < 67.5) return '／';
    if (deg < 112.5) return 'ー';
    return '＼';
  }
  if (deg < 22.5 || deg >= 157.5) return '|';
  if (deg < 67.5) return '/';
  if (deg < 112.5) return '-';
  return '\\';
}


// ============================================================
//  角検出ヘルパー
// ============================================================

/**
 * セルの周辺エッジ方向から角(コーナー)を検出
 */
function detectCorner(magnitude, direction, cx, cy, w, h, cellW, cellH, threshold) {
  const halfW = Math.floor(cellW / 2);
  const halfH = Math.floor(cellH / 2);

  let hasTop = false, hasBottom = false, hasLeft = false, hasRight = false;

  for (let y = cy - halfH; y < cy; y++) {
    for (let x = cx - halfW; x < cx + halfW; x++) {
      if (y < 0 || y >= h || x < 0 || x >= w) continue;
      if (magnitude[y * w + x] > threshold) { hasTop = true; break; }
    }
    if (hasTop) break;
  }
  for (let y = cy; y < cy + halfH; y++) {
    for (let x = cx - halfW; x < cx + halfW; x++) {
      if (y < 0 || y >= h || x < 0 || x >= w) continue;
      if (magnitude[y * w + x] > threshold) { hasBottom = true; break; }
    }
    if (hasBottom) break;
  }
  for (let y = cy - halfH; y < cy + halfH; y++) {
    for (let x = cx - halfW; x < cx; x++) {
      if (y < 0 || y >= h || x < 0 || x >= w) continue;
      if (magnitude[y * w + x] > threshold) { hasLeft = true; break; }
    }
    if (hasLeft) break;
  }
  for (let y = cy - halfH; y < cy + halfH; y++) {
    for (let x = cx; x < cx + halfW; x++) {
      if (y < 0 || y >= h || x < 0 || x >= w) continue;
      if (magnitude[y * w + x] > threshold) { hasRight = true; break; }
    }
    if (hasRight) break;
  }

  // エッジが2方向から来る箇所 = 角
  if (hasTop && hasRight && !hasBottom && !hasLeft) return { isCorner: true, quadrant: 'tr' };
  if (hasTop && hasLeft && !hasBottom && !hasRight) return { isCorner: true, quadrant: 'tl' };
  if (hasBottom && hasRight && !hasTop && !hasLeft) return { isCorner: true, quadrant: 'br' };
  if (hasBottom && hasLeft && !hasTop && !hasRight) return { isCorner: true, quadrant: 'bl' };

  return { isCorner: false, quadrant: null };
}


// ============================================================
//  分岐(フォーク)検出ヘルパー
// ============================================================

/**
 * セル内のエッジパターンから分岐（二股）を検出
 * 上部にエッジが集中 + 下部の左右に分かれている = fork_down (人)
 * 下部にエッジが集中 + 上部の左右に分かれている = fork_up (∨)
 *
 * 厳格な条件: 「上半分の中央にエッジが集中し、下半分は左右に分離している」ことを要求。
 * 単にエッジが多いだけでは発火しない。
 */
function detectFork(magnitude, cx, cy, w, h, cellW, cellH, threshold) {
  const halfW = Math.floor(cellW / 2);
  const halfH = Math.floor(cellH / 2);

  // 6領域: 上部左/上部中央/上部右、下部左/下部中央/下部右
  const thirdW = Math.floor(cellW / 3);
  let topCenter = 0, topCenterN = 0;
  let bottomLeft = 0, bottomLeftN = 0;
  let bottomRight = 0, bottomRightN = 0;
  let bottomCenter = 0, bottomCenterN = 0;
  let topLeft = 0, topLeftN = 0;
  let topRight = 0, topRightN = 0;

  for (let y = cy - halfH; y < cy + halfH; y++) {
    for (let x = cx - halfW; x < cx + halfW; x++) {
      if (y < 0 || y >= h || x < 0 || x >= w) continue;
      const mag = magnitude[y * w + x];
      const relX = x - (cx - halfW);
      const isTop = y < cy;

      if (isTop) {
        if (relX < thirdW)           { topLeft += mag; topLeftN++; }
        else if (relX < thirdW * 2)  { topCenter += mag; topCenterN++; }
        else                         { topRight += mag; topRightN++; }
      } else {
        if (relX < thirdW)           { bottomLeft += mag; bottomLeftN++; }
        else if (relX < thirdW * 2)  { bottomCenter += mag; bottomCenterN++; }
        else                         { bottomRight += mag; bottomRightN++; }
      }
    }
  }

  topLeft = topLeftN > 0 ? topLeft / topLeftN : 0;
  topCenter = topCenterN > 0 ? topCenter / topCenterN : 0;
  topRight = topRightN > 0 ? topRight / topRightN : 0;
  bottomLeft = bottomLeftN > 0 ? bottomLeft / bottomLeftN : 0;
  bottomCenter = bottomCenterN > 0 ? bottomCenter / bottomCenterN : 0;
  bottomRight = bottomRightN > 0 ? bottomRight / bottomRightN : 0;

  const forkThresh = threshold * 1.2; // 通常エッジ閾値より高めに設定

  // fork_down (人): 上部中央にエッジ集中、下部は左右に分離（中央は低い）
  if (topCenter > forkThresh &&
      bottomLeft > forkThresh && bottomRight > forkThresh &&
      bottomCenter < forkThresh * 0.6) {
    return { isFork: true, direction: 'fork_down' };
  }

  // fork_up (∨): 下部中央にエッジ集中、上部は左右に分離（中央は低い）
  if (bottomCenter > forkThresh &&
      topLeft > forkThresh && topRight > forkThresh &&
      topCenter < forkThresh * 0.6) {
    return { isFork: true, direction: 'fork_up' };
  }

  return { isFork: false, direction: null };
}


// ============================================================
//  形状マッチング (塗り文字限定版)
// ============================================================

/**
 * 形状マッチングで塗り文字から最適文字を選択（漢字等は含まない）
 */
function getShapeMatchChar(cellPattern, useFullWidth, densityWeight, gravityWeight) {
  densityWeight = densityWeight !== undefined ? densityWeight : 0.3;
  gravityWeight = gravityWeight !== undefined ? gravityWeight : 0.15;
  const brightness = 1 - averagePattern(cellPattern);
  return useFullWidth ? getFullWidthChar(brightness * 255) : getHalfWidthChar(brightness * 255);
}


// ============================================================
//  ユーティリティ関数
// ============================================================

function averagePattern(pattern) {
  let sum = 0;
  for (let i = 0; i < pattern.length; i++) sum += pattern[i];
  return pattern.length > 0 ? sum / pattern.length : 0;
}

function computeGravity(pattern) {
  let gx = 0, gy = 0, total = 0;
  for (let y = 0; y < TEMPLATE_GRID; y++) {
    for (let x = 0; x < TEMPLATE_GRID; x++) {
      const val = pattern[y * TEMPLATE_GRID + x];
      gx += val * (x + 0.5);
      gy += val * (y + 0.5);
      total += val;
    }
  }
  if (total <= 0) return { x: 0.5, y: 0.5 };
  return { x: gx / (total * TEMPLATE_GRID), y: gy / (total * TEMPLATE_GRID) };
}

/**
 * 重複除去 + 密度の均等分布化
 */
function deduplicateAndSpread(entries) {
  const seen = new Set();
  let arr = entries.filter(e => {
    if (seen.has(e.char)) return false;
    seen.add(e.char);
    return true;
  });
  arr.sort((a, b) => a.density - b.density);
  if (arr.length < 2) return arr;

  const maxDensity = arr[arr.length - 1].density;
  const minGap = maxDensity / (arr.length * 1.5);

  const result = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    const prev = result[result.length - 1];
    if (arr[i].density - prev.density >= minGap) {
      result.push(arr[i]);
    } else if (prev.density <= 0.001) {
      result.push(arr[i]);
    }
  }
  if (result[result.length - 1].char !== arr[arr.length - 1].char) {
    result.push(arr[arr.length - 1]);
  }
  return result;
}

/**
 * 二分探索で最も近い濃度の文字を検索
 */
function findClosestChar(sortedChars, targetDensity) {
  if (sortedChars.length === 0) return ' ';
  if (sortedChars.length === 1) return sortedChars[0].char;

  let lo = 0, hi = sortedChars.length - 1;
  if (targetDensity <= sortedChars[lo].density) return sortedChars[lo].char;
  if (targetDensity >= sortedChars[hi].density) return sortedChars[hi].char;

  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (sortedChars[mid].density <= targetDensity) lo = mid;
    else hi = mid;
  }

  const dLo = Math.abs(sortedChars[lo].density - targetDensity);
  const dHi = Math.abs(sortedChars[hi].density - targetDensity);
  return dLo <= dHi ? sortedChars[lo].char : sortedChars[hi].char;
}

/**
 * エッジの方向角度(ラジアン)から方向文字を返す (後方互換)
 */
function getDirectionalChar(angle, useFullWidth) {
  const deg = ((angle * 180) / Math.PI + 180) % 180;
  return getBasicDirectionChar(deg, useFullWidth);
}

/**
 * ハイブリッドモード用 (後方互換ラッパー)
 */
function getHybridChar(cellPattern, edgeMagnitude, edgeDirection, edgeThreshold, useFullWidth, brightness) {
  if (edgeMagnitude > edgeThreshold * 0.5) {
    return getOutlineChar(edgeDirection, 0, useFullWidth, cellPattern, null);
  }
  return useFullWidth ? getFullWidthChar(brightness) : getHalfWidthChar(brightness);
}
