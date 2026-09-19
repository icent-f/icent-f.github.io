/* ============================================================
   desktop.js — 桌面引导：右半边图标、左侧弹出侧边栏、时钟、开始菜单
   ============================================================ */
(function () {
  "use strict";

  const Blog = window.Blog;
  const WM = window.WindowManager;

  /* ---------- 触摸设备提示：进入极简移动版 ---------- */
  const mtContinue = document.getElementById("mt-continue");
  if (mtContinue) mtContinue.addEventListener("click", () => Blog.mobileEnter());

  /* ---------- 右半边：桌面图标网格（分类由文章清单动态生成） ---------- */
  const iconRoot = document.getElementById("desktop-icons");
  function buildDesktopIcons() {
    iconRoot.innerHTML = "";
    Blog.desktopIcons().forEach((it) => {
      const el = document.createElement("div");
      el.className = "icon" + (it.type === "archives" ? " icon-right" : "");
      el.innerHTML =
        '<div class="ic"><img src="' + it.icon + '" alt="" /></div>' +
        '<div class="lbl">' + it.label + "</div>";
      el.title = "双击打开 " + it.label;
      el.addEventListener("dblclick", () => Blog.open(it.type, { cat: it.cat }));
      el.addEventListener("click", () => { clearSelection(); el.classList.add("selected"); });
      iconRoot.appendChild(el);
    });
  }

  /* ---------- 左侧：鼠标移过去弹出的侧边栏 ---------- */
  const railPanel = document.getElementById("rail-panel");
  const M = Blog.META;

  // 个人资料区：头像（收起时也显示）+ 名字 / 签名（仅展开时显示）
  const profile = document.createElement("div");
  profile.className = "rail-profile";
  profile.innerHTML =
    '<div class="rail-avatar"><img src="' + M.avatar + '" alt="头像" /></div>' +
    '<div class="rail-name collapse-hide">' + M.owner + "</div>" +
    '<div class="rail-handle collapse-hide">' + M.handle + "</div>";
  railPanel.appendChild(profile);

  // 头像可点击：打开「关于我」
  const avatarEl = profile.querySelector(".rail-avatar");
  if (avatarEl) {
    avatarEl.title = "关于我";
    avatarEl.addEventListener("click", () => Blog.open("about"));
  }

  // 标签（仅展开时显示）
  const tags = document.createElement("div");
  tags.className = "rail-tags collapse-hide";
  M.tags.forEach((t) => {
    const s = document.createElement("span");
    s.textContent = t;
    tags.appendChild(s);
  });
  railPanel.appendChild(tags);

  // 社交图标（仅展开时显示；href 留空，后续填）
  const socials = document.createElement("div");
  socials.className = "rail-social collapse-hide";
  Blog.RAIL_SOCIALS.forEach((s) => {
    const a = document.createElement("a");
    a.href = s.href || "#";
    a.title = s.label;
    a.innerHTML = '<img src="' + s.icon + '" alt="' + s.label + '" />';
    if (s.href) { a.target = "_blank"; a.rel = "noopener"; }
    socials.appendChild(a);
  });
  railPanel.appendChild(socials);

  // 快捷方式（标题仅展开时显示，图标始终显示）
  const railTitle = document.createElement("div");
  railTitle.className = "rail-title collapse-hide";
  railTitle.textContent = "快捷方式";
  railPanel.appendChild(railTitle);

  Blog.RAIL_ITEMS.forEach((it) => {
    const b = document.createElement("button");
    b.className = "rail-item";
    b.innerHTML =
      '<span class="ri-ic"><img src="' + it.icon + '" alt="" /></span>' +
      '<span class="ri-label">' + it.label + "</span>";
    b.addEventListener("click", () => {
      if (it.type === "home") return goHome();
      Blog.open(it.type, { cat: it.cat });
    });
    railPanel.appendChild(b);
  });

  function goHome() {
    WM.list().forEach((w) => w.close());
    toast("已回到桌面");
  }

  /* ---------- 任务栏：钉住侧边栏的快捷图标 ---------- */
  const pinnedRoot = document.getElementById("tb-pinned");
  if (pinnedRoot) {
    Blog.RAIL_ITEMS.forEach((it) => {
      const b = document.createElement("button");
      b.className = "tb-app";
      b.title = it.label;
      b.innerHTML = '<img src="' + it.icon + '" alt="' + it.label + '" />';
      b.addEventListener("click", () => {
        if (it.type === "home") return goHome();
        Blog.open(it.type, { cat: it.cat });
      });
      pinnedRoot.appendChild(b);
    });
  }

  /* ---------- 深色 / 浅色模式切换 ---------- */
  const MODE_KEY = "pay3cents-theme";
  const modeBtn = document.getElementById("mode-toggle");
  const modeLabel = document.getElementById("mode-toggle-label");
  function applyMode(dark, animate) {
    const root = document.documentElement;
    if (animate) {
      // 切换期间给所有元素挂上颜色过渡，结束后移除
      root.classList.add("theme-anim");
      clearTimeout(applyMode._t);
      applyMode._t = setTimeout(() => root.classList.remove("theme-anim"), 600);
    }
    root.classList.toggle("dark", dark);
    if (modeLabel) modeLabel.textContent = dark ? "深色模式" : "浅色模式";
    if (modeBtn) modeBtn.title = dark ? "切换到浅色模式" : "切换到深色模式";
    if (Blog.syncGiscusTheme) Blog.syncGiscusTheme();   // 留言板跟着换配色
  }
  let savedDark = false;
  try { savedDark = localStorage.getItem(MODE_KEY) === "dark"; } catch (e) {}
  applyMode(savedDark, false);
  if (modeBtn) {
    modeBtn.addEventListener("click", () => {
      const dark = !document.documentElement.classList.contains("dark");
      applyMode(dark, true);
      try { localStorage.setItem(MODE_KEY, dark ? "dark" : "light"); } catch (e) {}
    });
  }

  /* 极简移动版顶栏的同一个开关（图标由 CSS 按 .dark 自动切换） */
  const mobileThemeBtn = document.getElementById("m-theme");
  if (mobileThemeBtn) {
    mobileThemeBtn.addEventListener("click", () => {
      const dark = !document.documentElement.classList.contains("dark");
      applyMode(dark, true);
      try { localStorage.setItem(MODE_KEY, dark ? "dark" : "light"); } catch (e) {}
    });
  }

  /* ---------- 开始菜单 ---------- */
  const startBtn = document.getElementById("start-btn");
  let startMenu = null;
  startBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (startMenu) { closeStartMenu(); return; }
    startMenu = document.createElement("div");
    startMenu.className = "context-menu";
    startMenu.style.left = "12px";
    startMenu.style.bottom = "48px";
    startMenu.style.top = "auto";
    const items = [
      { label: "关于我 · " + Blog.META.owner, act: () => Blog.open("about") },
      { label: "全部文章", act: () => Blog.open("posts") },
      { label: "归档", act: () => Blog.open("archives") },
      { label: "灵感", act: () => Blog.open("notes") },
      { label: "设置", act: () => Blog.open("settings") },
      { label: "回到桌面", act: goHome },
      { label: "刷新桌面", act: () => location.reload() },
    ];
    items.forEach((it) => {
      const b = document.createElement("button");
      b.textContent = it.label;
      b.addEventListener("click", () => { closeStartMenu(); it.act(); });
      startMenu.appendChild(b);
    });
    document.body.appendChild(startMenu);
  });

  function closeStartMenu() {
    if (startMenu) { startMenu.remove(); startMenu = null; }
  }

  /* ---------- 时钟（任务栏 + 桌面时钟组件） ---------- */
  const clockEl = document.getElementById("taskbar-clock");
  const WEEK = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const WEEK_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const wTime = document.getElementById("widget-time");
  const wWeek = document.getElementById("widget-week");
  const wDate = document.getElementById("widget-date");
  function tick() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    clockEl.innerHTML =
      '<span class="t-time">' + hh + ":" + mm + "</span>" +
      '<span class="t-date">' + y + "/" + m + "/" + day + "</span>";
    clockEl.title = y + "/" + m + "/" + day + " " + WEEK[d.getDay()];
    if (wTime) wTime.textContent = hh + ":" + mm;
    if (wWeek) wWeek.textContent = WEEK_EN[d.getDay()];
    if (wDate) wDate.textContent = y + "/" + m + "/" + day;
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- 桌面右键菜单 ---------- */
  const desktop = document.getElementById("desktop");
  let ctx = null;
  desktop.addEventListener("contextmenu", (e) => {
    if (e.target.closest(".window")) return;
    e.preventDefault();
    if (ctx) ctx.remove();
    ctx = document.createElement("div");
    ctx.className = "context-menu";
    ctx.style.left = e.clientX + "px";
    ctx.style.top = e.clientY + "px";
    const items = [
      { label: "回到桌面", act: goHome },
      { label: "全部文章", act: () => Blog.open("posts") },
      { label: "关于我", act: () => Blog.open("about") },
      { label: "设置", act: () => Blog.open("settings") },
      { label: "刷新", act: () => location.reload() },
    ];
    items.forEach((it) => {
      const b = document.createElement("button");
      b.textContent = it.label;
      b.addEventListener("click", () => { ctx.remove(); ctx = null; it.act(); });
      ctx.appendChild(b);
    });
    document.body.appendChild(ctx);
  });
  document.addEventListener("click", () => { if (ctx) { ctx.remove(); ctx = null; } clearSelection(); });

  function clearSelection() {
    document.querySelectorAll(".icon.selected").forEach((i) => i.classList.remove("selected"));
  }

  /* ---------- 壁纸跟随鼠标微动（视差） ---------- */
  const wallpaperEl = document.querySelector(".wallpaper");
  if (wallpaperEl) {
    const MAX = 14;        // 最大位移（px），CSS 里 inset:-24px 已预留余量
    let raf = null;
    document.addEventListener("mousemove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const nx = e.clientX / window.innerWidth - 0.5;   // -0.5 ~ 0.5
        const ny = e.clientY / window.innerHeight - 0.5;
        wallpaperEl.style.transform =
          "translate3d(" + (-nx * MAX).toFixed(2) + "px," + (-ny * MAX).toFixed(2) + "px,0)";
      });
    });
  }

  /* ---------- 锁屏：点 Login 进入桌面（只在页面打开时出现一次） ---------- */
  const lockscreen = document.getElementById("lockscreen");
  const lockBtn = document.getElementById("lock-login");
  // 名字与头像以 META 为准
  const lockNameEl = document.querySelector(".lock-name");
  const lockAvatarEl = document.querySelector(".lock-avatar img");
  if (lockNameEl) lockNameEl.textContent = Blog.META.owner;
  if (lockAvatarEl) lockAvatarEl.src = Blog.META.avatar;

  let entered = false;
  function enterDesktop() {
    if (entered) return;
    entered = true;
    if (lockscreen) {
      lockscreen.classList.add("hide");
      setTimeout(() => lockscreen.remove(), 620);
    }
    setTimeout(greet, 520);   // 等锁屏淡出后再问候
  }
  if (lockBtn) lockBtn.addEventListener("click", enterDesktop);
  // 回车 / 空格也能进入
  document.addEventListener("keydown", (e) => {
    if (entered) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      enterDesktop();
    }
  });

  /* ---------- 提示条 ---------- */
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
  }
  Blog.toast = toast;   // 暴露给内容层（拖拽引用时提示用）

  /* ---------- 欢迎提示 ---------- */
  function greet() {
    const h = new Date().getHours();
    let word = "早上好";
    if (h >= 12 && h < 18) word = "下午好";
    else if (h >= 18) word = "晚上好";
    toast(word + "，" + Blog.META.owner + "。鼠标移到左边缘打开侧边栏，双击右侧图标打开窗口。");
  }

  Boot();
  async function Boot() {
    await Promise.all([Blog.loadPosts(), Blog.loadTree()]);
    buildDesktopIcons();
    Blog.openFromHash();   // 支持 #post-<id> 直达某篇文章
    Blog.initMobile();     // 极简移动版：绑定返回键 + 必要时渲染列表
  }
})();
