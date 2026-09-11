/* ============================================================
   window-manager.js — 窗口管理（打开/拖动/缩放/最小化/层叠/任务栏）
   ============================================================ */
(function (global) {
  "use strict";

  const windowsLayer = document.getElementById("windows");
  const taskbarLayer = document.getElementById("taskbar-windows");

  let zTop = 10;
  const winRegistry = new Map(); // id -> Win

  let drag = null;

  /* ---------- 窗口对象 ---------- */
  class Win {
    constructor(cfg) {
      this.id = cfg.id || ("win-" + Math.random().toString(36).slice(2, 8));
      this.title = cfg.title || "窗口";
      this.icon = cfg.icon || "📁";
      this.iconImg = cfg.iconImg || null;
      this.width = cfg.width || 560;
      this.height = cfg.height || 420;
      this.minWidth = cfg.minWidth || 320;
      this.minHeight = cfg.minHeight || 200;
      this.typeset = cfg.typeset || null;      // 窗口类型的 class 标记
      this.bodyHTML = cfg.bodyHTML || "";
      this.onRender = cfg.onRender || null;   // (bodyEl, win) => void
      this.onClose = cfg.onClose || null;
      this.resizable = cfg.resizable !== false;
      this.minimizable = cfg.minimizable !== false;

      // 窗口默认位置：place="right" 时占据屏幕右半边
      const vw = windowsLayer.clientWidth || global.innerWidth;
      const vh = windowsLayer.clientHeight || global.innerHeight;
      if (cfg.place === "right") {
        this.width = Math.max(560, Math.round(vw * 0.5));
        this.height = Math.max(400, vh - 72);
        this.x = cfg.x != null ? cfg.x : Math.max(0, vw - this.width - 10);
        this.y = cfg.y != null ? cfg.y : 10;
      } else {
        this.x = cfg.x != null ? cfg.x : Math.max(20, (vw - this.width) / 2 + (cfg.offsetX || 0));
        this.y = cfg.y != null ? cfg.y : Math.max(20, (vh - this.height) / 2 - 24 + (cfg.offsetY || 0));
      }

      this.minimized = false;
      this.closed = false;

      this._build();
    }

    _build() {
      const el = document.createElement("div");
      el.className = "window" + (this.typeset ? " " + this.typeset : "");
      el.id = "win-" + this.id;
      el.style.width = this.width + "px";
      el.style.height = this.height + "px";
      el.style.left = this.x + "px";
      el.style.top = this.y + "px";

      // 标题栏
      const tb = document.createElement("div");
      tb.className = "win-titlebar";
      const winIcon = this.iconImg
        ? '<img src="' + escapeHtml(this.iconImg) + '" alt="" />'
        : escapeHtml(this.icon);
      tb.innerHTML =
        '<span class="win-icon">' + winIcon + "</span>" +
        '<span class="win-title">' + escapeHtml(this.title) + "</span>" +
        '<div class="win-controls">' +
          (this.minimizable
            ? '<button class="win-btn min" title="最小化">—</button>' : "") +
          '<button class="win-btn close" title="关闭">×</button>' +
        "</div>";
      tb.addEventListener("mousedown", (e) => this._onTitleDown(e));

      const body = document.createElement("div");
      body.className = "win-body";
      body.innerHTML = this.bodyHTML;
      body.addEventListener("mousedown", () => this.focus());

      // 缩放柄：八方向，可拖拽任意边缘/角
      const handles = [];
      if (this.resizable) {
        ["n", "s", "e", "w", "ne", "nw", "se", "sw"].forEach((dir) => {
          const h = document.createElement("div");
          h.className = "rs rs-" + dir;
          h.addEventListener("mousedown", (e) => this._onResizeDown(e, dir));
          handles.push(h);
        });
      }

      el.appendChild(tb);
      el.appendChild(body);
      handles.forEach((h) => el.appendChild(h));

      // 关闭 / 最小化
      tb.querySelector(".close").addEventListener("click", () => this.close());
      const minBtn = tb.querySelector(".min");
      if (minBtn) minBtn.addEventListener("click", () => this.minimize());

      this.el = el;
      this.titleEl = tb.querySelector(".win-title");
      this.bodyEl = body;

      this._setSize(this.width, this.height);
      windowsLayer.appendChild(el);

      // 聚焦 & 层叠
      el.addEventListener("mousedown", () => {
        if (!this.minimized) this.focus();
      });

      el.style.zIndex = ++zTop;
      this._syncTaskbar();
      window.dispatchEvent(new CustomEvent("dsh-window-opened", { detail: { win: this } }));
    }

    _setSize(w, h) {
      this.width = w; this.height = h;
      if (this.el) {
        this.el.style.width = w + "px";
        this.el.style.height = h + "px";
      }
    }

    /* 从指定方向拖拽缩放 */
    _onResizeDown(e, dir) {
      e.preventDefault();
      e.stopPropagation();
      this.focus();
      const vw = windowsLayer.clientWidth || global.innerWidth;
      const vh = windowsLayer.clientHeight || global.innerHeight;
      const start = { mx: e.clientX, my: e.clientY, x: this.x, y: this.y, w: this.width, h: this.height };

      const move = (ev) => {
        const dx = ev.clientX - start.mx;
        const dy = ev.clientY - start.my;
        let { x, y, w, h } = start;

        if (dir.indexOf("e") !== -1) w = start.w + dx;
        if (dir.indexOf("s") !== -1) h = start.h + dy;
        if (dir.indexOf("w") !== -1) { w = start.w - dx; x = start.x + dx; }
        if (dir.indexOf("n") !== -1) { h = start.h - dy; y = start.y + dy; }

        // 最小尺寸（从西/北缩放时保持对边不动）
        if (w < this.minWidth) { if (dir.indexOf("w") !== -1) x -= (this.minWidth - w); w = this.minWidth; }
        if (h < this.minHeight) { if (dir.indexOf("n") !== -1) y -= (this.minHeight - h); h = this.minHeight; }

        // 不越出屏幕左上角
        if (x < 0) { if (dir.indexOf("w") !== -1) w += x; x = 0; }
        if (y < 0) { if (dir.indexOf("n") !== -1) h += y; y = 0; }

        // 不超出屏幕右下角
        if (x + w > vw) w = vw - x;
        if (y + h > vh) h = vh - y;

        this.x = x; this.y = y;
        this.el.style.left = x + "px";
        this.el.style.top = y + "px";
        this._setSize(w, h);
      };
      const up = () => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    }

    _onTitleDown(e) {
      if (e.target.classList.contains("win-btn")) return;
      this.focus();
      e.preventDefault();
      const start = { x: e.clientX - this.x, y: e.clientY - this.y };
      drag = { win: this, start };

      const move = (ev) => {
        if (!drag) return;
        const w = drag.win;
        const vw = windowsLayer.clientWidth || global.innerWidth;
        const vh = windowsLayer.clientHeight || global.innerHeight;
        const nx = Math.min(Math.max(0, ev.clientX - drag.start.x), vw - 60);
        const ny = Math.min(Math.max(0, ev.clientY - drag.start.y), vh - 40);
        w.x = nx; w.y = ny;
        if (w.el) { w.el.style.left = nx + "px"; w.el.style.top = ny + "px"; }
      };
      const up = () => {
        drag = null;
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    }

    focus() {
      if (this.closed) return;
      this.minimized = false;
      this.el.classList.remove("minimized");
      this.el.style.zIndex = ++zTop;
      // 其他窗口失焦
      winRegistry.forEach((w) => {
        if (w !== this) w.el.classList.remove("focused");
      });
      this.el.classList.add("focused");
      // 记录最近激活
      if (this._lastFocus === undefined) this._lastFocus = 0;
      winRegistry._active = this;
      this._syncTaskbar();
    }

    minimize() {
      if (!this.minimizable) return;
      this.minimized = true;
      this.el.classList.add("minimized");
      this.el.classList.remove("focused");
      if (winRegistry._active === this) {
        // 聚焦下一个
        const others = [...winRegistry.values()].filter((w) => !w.closed && !w.minimized);
        if (others.length) others[others.length - 1].focus();
      }
      this._syncTaskbar();
    }

    toggleFromTaskbar() {
      if (this.closed) return;
      if (this.minimized) this.focus();
      else if (winRegistry._active === this) this.minimize();
      else this.focus();
    }

    setTitle(t) { this.title = t; this.titleEl.textContent = t; this._syncTaskbar(); }

    close() {
      if (this.closed) return;
      this.closed = true;
      this.el.remove();
      winRegistry.delete(this.id);
      this._syncTaskbar();
      if (this.onClose) this.onClose(this);
    }

    _syncTaskbar() {
      const existing = taskbarLayer.querySelector('[data-win="' + this.id + '"]');
      if (this.closed) { if (existing) existing.remove(); return; }
      const active = winRegistry._active === this && !this.minimized;
      if (existing) {
        existing.classList.toggle("active", active);
        existing.title = this.title;
        return;
      }
      const btn = document.createElement("button");
      btn.className = "tb-win";
      btn.dataset.win = this.id;
      btn.title = this.title;
      btn.innerHTML = this.iconImg
        ? '<img src="' + escapeHtml(this.iconImg) + '" alt="" />'
        : '<span class="i">' + escapeHtml(this.icon) + "</span>";
      btn.addEventListener("click", () => this.toggleFromTaskbar());
      taskbarLayer.appendChild(btn);
      btn.classList.toggle("active", active);
    }
  }

  /* ---------- 公开接口 ---------- */
  const api = {
    open(cfg) {
      // 若已存在同 id 窗口则聚焦并返回
      if (cfg.id && winRegistry.has(cfg.id)) {
        const w = winRegistry.get(cfg.id);
        w.focus();
        return w;
      }
      const win = new Win(cfg);
      winRegistry.set(win.id, win);
      win.focus();
      // 内容渲染完后再偏移到居中新窗口的打开位置
      return win;
    },
    close(id) {
      const w = winRegistry.get(id);
      if (w) w.close();
    },
    list() { return [...winRegistry.values()]; },
    active() { return winRegistry._active; },
    get(id) { return winRegistry.get(id); },
  };

  winRegistry._active = null;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }
  api.escapeHtml = escapeHtml;

  global.WindowManager = api;
})(window);
