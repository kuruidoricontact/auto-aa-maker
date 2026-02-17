// canvas-draw.js - 手描きキャンバス機能

const DrawingCanvas = {
  canvas: null,
  ctx: null,
  isDrawing: false,
  brushSize: 5,
  tool: 'brush',  // 'brush' | 'eraser'
  lastX: 0,
  lastY: 0,
  onChange: null,

  /**
   * キャンバスを初期化
   */
  init(canvasElement, onChangeCallback) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.onChange = onChangeCallback;

    // キャンバスサイズ設定
    this.resize();

    // 白背景で初期化
    this.clear();

    // マウスイベント
    this.canvas.addEventListener('mousedown', (e) => this.startDraw(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    document.addEventListener('mouseup', () => this.endDraw());

    // タッチイベント
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startDraw(this.touchToMouse(e));
    }, { passive: false });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.draw(this.touchToMouse(e));
    }, { passive: false });
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.endDraw();
    }, { passive: false });
  },

  /**
   * キャンバスサイズをコンテナに合わせる
   */
  resize() {
    const parent = this.canvas.parentElement;
    const w = Math.min(parent.clientWidth - 40, 800);
    const h = Math.min(parent.clientHeight - 40, 600);
    this.canvas.width = w;
    this.canvas.height = h;
    this.clear();
  },

  /**
   * タッチイベントからマウス座標に変換
   */
  touchToMouse(e) {
    const touch = e.touches[0] || e.changedTouches[0];
    const rect = this.canvas.getBoundingClientRect();
    return {
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
    };
  },

  /**
   * 描画位置を取得 (DPR対応)
   */
  getPos(e) {
    return { x: e.offsetX, y: e.offsetY };
  },

  /**
   * 描画開始
   */
  startDraw(e) {
    this.isDrawing = true;
    const pos = this.getPos(e);
    this.lastX = pos.x;
    this.lastY = pos.y;

    // 点を打つ (クリックのみの場合)
    this.ctx.beginPath();
    this.setupBrush();
    this.ctx.arc(pos.x, pos.y, this.brushSize / 2, 0, Math.PI * 2);
    this.ctx.fill();
  },

  /**
   * 描画中
   */
  draw(e) {
    if (!this.isDrawing) return;
    const pos = this.getPos(e);

    this.ctx.beginPath();
    this.setupBrush();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();

    this.lastX = pos.x;
    this.lastY = pos.y;
  },

  /**
   * 描画終了
   */
  endDraw() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.ctx.closePath();

    // 描画変更を通知
    if (this.onChange) {
      this.onChange();
    }
  },

  /**
   * ブラシ設定を適用
   */
  setupBrush() {
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.lineWidth = this.brushSize;

    if (this.tool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.strokeStyle = 'rgba(0,0,0,1)';
      this.ctx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = '#000000';
      this.ctx.fillStyle = '#000000';
    }
  },

  /**
   * ブラシサイズを設定
   */
  setBrushSize(size) {
    this.brushSize = size;
  },

  /**
   * ツールを切り替え
   */
  setTool(tool) {
    this.tool = tool;
  },

  /**
   * キャンバスをクリア (白背景)
   */
  clear() {
    if (!this.ctx) return;
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.onChange) {
      this.onChange();
    }
  },

  /**
   * キャンバスの内容を取得
   */
  getCanvas() {
    return this.canvas;
  },
};
