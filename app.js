// app.js - メインアプリケーションコントローラー

(function () {
  'use strict';

  // ===== アプリケーション状態 =====
  const state = {
    mode: 'upload',           // 'upload' | 'draw'
    conversionMode: 'density', // 'density' | 'shape' | 'hybrid' | 'outline'
    widthMode: 'half',        // 'half' | 'full' | 'mixed'
    lightBg: false,           // 白背景プレビュー
    sourceImage: null,        // HTMLImageElement
    lastAaOutput: '',
    autoUpdate: true,
  };

  // ===== DOM要素 =====
  const els = {};

  function cacheDom() {
    // モード
    els.modeUpload = document.getElementById('mode-upload');
    els.modeDraw = document.getElementById('mode-draw');
    // アップロード
    els.uploadSection = document.getElementById('upload-section');
    els.fileInput = document.getElementById('file-input');
    // 描画ツール
    els.drawTools = document.getElementById('draw-tools');
    els.toolBrush = document.getElementById('tool-brush');
    els.toolEraser = document.getElementById('tool-eraser');
    els.clearCanvas = document.getElementById('clear-canvas');
    els.brushSize = document.getElementById('brush-size');
    els.brushSizeVal = document.getElementById('brush-size-val');
    // 出力設定
    els.outputCols = document.getElementById('output-cols');
    els.outputRows = document.getElementById('output-rows');
    els.keepAspect = document.getElementById('keep-aspect');
    // 画像調整
    els.brightness = document.getElementById('brightness');
    els.brightnessVal = document.getElementById('brightness-val');
    els.contrast = document.getElementById('contrast');
    els.contrastVal = document.getElementById('contrast-val');
    // 変換モード
    els.convDensity = document.getElementById('conv-density');
    els.convShape = document.getElementById('conv-shape');
    els.convHybrid = document.getElementById('conv-hybrid');
    els.convOutline = document.getElementById('conv-outline');
    els.convModeHint = document.getElementById('conv-mode-hint');
    // 変換オプション
    els.edgeDetection = document.getElementById('edge-detection');
    els.edgeThreshold = document.getElementById('edge-threshold');
    els.edgeThresholdVal = document.getElementById('edge-threshold-val');
    els.widthHalf = document.getElementById('width-half');
    els.widthFull = document.getElementById('width-full');
    els.widthMixed = document.getElementById('width-mixed');
    els.invert = document.getElementById('invert');
    // 白背景トグル
    els.toggleBg = document.getElementById('toggle-bg');
    // 高度な設定
    els.gaussianBlur = document.getElementById('gaussian-blur');
    els.gaussianBlurVal = document.getElementById('gaussian-blur-val');
    els.dithering = document.getElementById('dithering');
    els.ditheringVal = document.getElementById('dithering-val');
    // 中央パネル
    els.centerPanel = document.getElementById('center-panel');
    els.dropZone = document.getElementById('drop-zone');
    els.previewCanvas = document.getElementById('preview-canvas');
    els.drawCanvas = document.getElementById('draw-canvas');
    // 右パネル
    els.aaOutput = document.getElementById('aa-output');
    els.fontSize = document.getElementById('font-size');
    els.fontSizeVal = document.getElementById('font-size-val');
    els.copyBtn = document.getElementById('copy-btn');
    els.exportBtn = document.getElementById('export-btn');
    // ワークキャンバス
    els.workCanvas = document.getElementById('work-canvas');
  }

  // ===== 初期化 =====
  function init() {
    cacheDom();

    // 濃度キャリブレーション
    const fontStack = "'MS PGothic', 'ＭＳ Ｐゴシック', 'IPAGothic', 'Noto Sans Mono CJK JP', monospace";
    calibrateDensities(fontStack, 16);

    // 描画キャンバス初期化
    DrawingCanvas.init(els.drawCanvas, debounce(triggerConversion, 150));

    // イベントリスナーを設定
    bindEvents();
  }

  // ===== イベントバインド =====
  function bindEvents() {
    // モード切替
    els.modeUpload.addEventListener('click', () => setMode('upload'));
    els.modeDraw.addEventListener('click', () => setMode('draw'));

    // ファイルアップロード
    els.fileInput.addEventListener('change', handleFileUpload);

    // ドラッグ＆ドロップ
    els.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      els.dropZone.classList.add('drag-over');
    });
    els.dropZone.addEventListener('dragleave', () => {
      els.dropZone.classList.remove('drag-over');
    });
    els.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      els.dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        loadImageFile(file);
      }
    });

    // 描画ツール
    els.toolBrush.addEventListener('click', () => {
      DrawingCanvas.setTool('brush');
      els.toolBrush.classList.add('active');
      els.toolEraser.classList.remove('active');
    });
    els.toolEraser.addEventListener('click', () => {
      DrawingCanvas.setTool('eraser');
      els.toolEraser.classList.add('active');
      els.toolBrush.classList.remove('active');
    });
    els.clearCanvas.addEventListener('click', () => DrawingCanvas.clear());

    // ブラシサイズ
    els.brushSize.addEventListener('input', () => {
      const val = parseInt(els.brushSize.value);
      els.brushSizeVal.textContent = val;
      DrawingCanvas.setBrushSize(val);
    });

    // 出力設定変更
    const debouncedConvert = debounce(triggerConversion, 200);

    els.outputCols.addEventListener('change', () => {
      if (els.keepAspect.checked && state.sourceImage) {
        updateRowsFromAspect();
      }
      debouncedConvert();
    });
    els.outputRows.addEventListener('change', debouncedConvert);
    els.keepAspect.addEventListener('change', () => {
      if (els.keepAspect.checked && state.sourceImage) {
        updateRowsFromAspect();
        debouncedConvert();
      }
    });

    // スライダー
    els.brightness.addEventListener('input', () => {
      els.brightnessVal.textContent = els.brightness.value;
      debouncedConvert();
    });
    els.contrast.addEventListener('input', () => {
      els.contrastVal.textContent = els.contrast.value;
      debouncedConvert();
    });

    // 変換モード切替
    const convModeHints = {
      density: '塗り文字(ASCII記号)で明暗を表現',
      shape: '塗り文字(ASCII記号)の形状マッチング',
      hybrid: '輪郭=カタカナ等、塗り=ASCII記号',
      outline: '輪郭線のみ（塗りなし）',
    };
    const convBtns = [els.convDensity, els.convShape, els.convHybrid, els.convOutline];
    convBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        state.conversionMode = mode;
        convBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
        els.convModeHint.textContent = convModeHints[mode] || '';
        updateEdgeControls();
        debouncedConvert();
      });
    });

    // エッジ検出
    els.edgeDetection.addEventListener('change', () => {
      updateEdgeControls();
      debouncedConvert();
    });
    els.edgeThreshold.addEventListener('input', () => {
      els.edgeThresholdVal.textContent = els.edgeThreshold.value;
      debouncedConvert();
    });

    // 文字幅モード切替
    const widthBtns = [els.widthHalf, els.widthFull, els.widthMixed];
    widthBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const wm = btn.dataset.width;
        state.widthMode = wm;
        widthBtns.forEach(b => b.classList.toggle('active', b.dataset.width === wm));
        debouncedConvert();
      });
    });

    // その他トグル
    els.invert.addEventListener('change', debouncedConvert);

    // 白背景トグル
    els.toggleBg.addEventListener('click', () => {
      state.lightBg = !state.lightBg;
      els.aaOutput.classList.toggle('light-bg', state.lightBg);
      els.toggleBg.textContent = state.lightBg ? '☾' : '☀';
      els.toggleBg.title = state.lightBg ? '暗い背景に切替' : '明るい背景に切替';
    });

    // 高度な設定
    els.gaussianBlur.addEventListener('input', () => {
      const val = parseInt(els.gaussianBlur.value);
      els.gaussianBlurVal.textContent = val === 0 ? '0' : val === 1 ? '3x3' : '5x5';
      debouncedConvert();
    });
    els.dithering.addEventListener('input', () => {
      const val = parseInt(els.dithering.value);
      els.ditheringVal.textContent = val === 0 ? 'OFF' : val + '階調';
      debouncedConvert();
    });

    // フォントサイズ
    els.fontSize.addEventListener('input', () => {
      const val = parseInt(els.fontSize.value);
      els.fontSizeVal.textContent = val;
      els.aaOutput.style.fontSize = val + 'px';
      els.aaOutput.style.lineHeight = (val * 1.1) + 'px';
    });

    // コピー・エクスポート
    els.copyBtn.addEventListener('click', copyToClipboard);
    els.exportBtn.addEventListener('click', exportAsText);

    // ウィンドウリサイズ
    window.addEventListener('resize', debounce(() => {
      if (state.mode === 'draw') {
        DrawingCanvas.resize();
      }
    }, 300));
  }

  // ===== エッジ系コントロールの有効/無効 =====
  function updateEdgeControls() {
    const mode = state.conversionMode;
    const edgeAlwaysNeeded = (mode === 'outline' || mode === 'hybrid');
    // outline/hybridでは常にエッジ閾値スライダーを有効化
    if (edgeAlwaysNeeded) {
      els.edgeThreshold.disabled = false;
    } else {
      els.edgeThreshold.disabled = !els.edgeDetection.checked;
    }
  }

  // ===== モード切替 =====
  function setMode(mode) {
    state.mode = mode;

    // タブ表示更新
    els.modeUpload.classList.toggle('active', mode === 'upload');
    els.modeDraw.classList.toggle('active', mode === 'draw');

    // セクション表示切替
    els.uploadSection.style.display = mode === 'upload' ? 'block' : 'none';
    els.drawTools.style.display = mode === 'draw' ? 'block' : 'none';

    // キャンバス表示切替
    if (mode === 'upload') {
      els.drawCanvas.style.display = 'none';
      if (state.sourceImage) {
        els.dropZone.style.display = 'none';
        els.previewCanvas.style.display = 'block';
      } else {
        els.dropZone.style.display = 'flex';
        els.previewCanvas.style.display = 'none';
      }
    } else {
      els.dropZone.style.display = 'none';
      els.previewCanvas.style.display = 'none';
      els.drawCanvas.style.display = 'block';
      DrawingCanvas.resize();
    }

    triggerConversion();
  }

  // ===== 画像アップロード =====
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    loadImageFile(file);
  }

  function loadImageFile(file) {
    const img = new Image();
    img.onload = () => {
      state.sourceImage = img;

      // プレビューキャンバスに描画
      const maxW = els.centerPanel.clientWidth - 40;
      const maxH = els.centerPanel.clientHeight - 40;
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      els.previewCanvas.width = img.width * scale;
      els.previewCanvas.height = img.height * scale;
      const pctx = els.previewCanvas.getContext('2d');
      pctx.drawImage(img, 0, 0, els.previewCanvas.width, els.previewCanvas.height);

      // 表示切替
      els.dropZone.style.display = 'none';
      els.previewCanvas.style.display = 'block';

      // アスペクト比維持が有効なら行数を自動調整
      if (els.keepAspect.checked) {
        updateRowsFromAspect();
      }

      triggerConversion();
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  }

  /**
   * アスペクト比を維持して行数を自動計算
   * 文字のアスペクト比(約2:1, 縦が横の2倍)を考慮
   */
  function updateRowsFromAspect() {
    if (!state.sourceImage) return;
    const cols = parseInt(els.outputCols.value) || 80;
    const imgRatio = state.sourceImage.height / state.sourceImage.width;
    // 文字セルは横:縦 ≒ 1:2 なので、行数 = cols * imgRatio * 0.5
    const rows = Math.round(cols * imgRatio * 0.5);
    els.outputRows.value = Math.max(5, Math.min(150, rows));
  }

  // ===== 変換実行 =====
  function triggerConversion() {
    let sourceCanvas = null;

    if (state.mode === 'upload') {
      if (!state.sourceImage) return;
      // ワークキャンバスに元画像を描画
      els.workCanvas.width = state.sourceImage.naturalWidth;
      els.workCanvas.height = state.sourceImage.naturalHeight;
      const wctx = els.workCanvas.getContext('2d');
      wctx.drawImage(state.sourceImage, 0, 0);
      sourceCanvas = els.workCanvas;
    } else {
      sourceCanvas = DrawingCanvas.getCanvas();
      if (!sourceCanvas) return;
    }

    const options = {
      cols: parseInt(els.outputCols.value) || 80,
      rows: parseInt(els.outputRows.value) || 40,
      brightness: parseInt(els.brightness.value) || 0,
      contrast: parseInt(els.contrast.value) || 0,
      edgeDetection: els.edgeDetection.checked,
      edgeThreshold: parseInt(els.edgeThreshold.value) || 50,
      useFullWidth: state.widthMode === 'full',
      widthMode: state.widthMode,
      invertBrightness: els.invert.checked,
      gaussianBlur: parseInt(els.gaussianBlur.value) || 0,
      ditheringLevels: parseInt(els.dithering.value) || 0,
      conversionMode: state.conversionMode,
    };

    const aaText = convertToAA(sourceCanvas, options);
    state.lastAaOutput = aaText;
    els.aaOutput.textContent = aaText;
  }

  // ===== コピー =====
  function copyToClipboard() {
    if (!state.lastAaOutput) return;
    navigator.clipboard.writeText(state.lastAaOutput).then(() => {
      showToast('コピーしました');
      els.copyBtn.classList.add('copied');
      els.copyBtn.textContent = 'コピー完了!';
      setTimeout(() => {
        els.copyBtn.classList.remove('copied');
        els.copyBtn.textContent = 'コピー';
      }, 2000);
    });
  }

  // ===== エクスポート =====
  function exportAsText() {
    if (!state.lastAaOutput) return;
    const blob = new Blob([state.lastAaOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aa_art.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('エクスポートしました');
  }

  // ===== トースト通知 =====
  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  // ===== ユーティリティ =====
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ===== DOM読み込み後に初期化 =====
  document.addEventListener('DOMContentLoaded', init);
})();
