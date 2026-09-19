/* ============================================================
   content.js — 博客数据 + 各窗口内容渲染器
   ============================================================ */
(function (global) {
  "use strict";

  const WM = global.WindowManager;
  const esc = WM.escapeHtml;

  /* ---------- 站点信息 ---------- */
  const META = {
    name: "Pay3Cents 的博客",
    owner: "Pay3Cents",
    handle: "@一只学网安的魂淡",
    avatar: "assets/avatar.png",
    illustration: "assets/about-illustration.jpg",
    desc: "这里是 Pay3Cents 的电脑桌面。用来记录一些知识、随笔与生活碎碎念。欢迎随便逛逛。",
    tags: ["MISC手", "CTF", "半个画师", "勉强算个人类", "蓝色大肥鱼"],
    socials: [
      { icon: "assets/icons/twitter.svg", label: "Twitter / X", href: "#" },
      { icon: "assets/icons/github.svg",  label: "GitHub",      href: "#" },
      { icon: "assets/icons/mail.svg",    label: "邮箱",        href: "#" },
      { icon: "assets/icons/rss.svg",     label: "RSS 订阅",    href: "#" },
    ],
    /* ---------- 留言板（giscus）----------
       用一个**独立的公开仓库**存放评论，与博客仓库分开。
       完整步骤见 README「留言板（giscus）」一节，简述：

         1. 新建一个 public 仓库（默认名 blog-comments），不用勾 README
         2. 那个仓库 → Settings → General → Features → 勾选 Discussions
         3. https://github.com/apps/giscus → Install → 只授权评论仓库
         4. https://giscus.app 填入「评论仓库」名，分类选 Open-Ended 格式
         5. 把生成的 data-repo-id / data-category-id 抄到下面

       ⚠️ 分类必须选 Open-Ended 格式的（如 General）。
          不要选 Announcements —— 只有维护者能在那里开帖，
          而 giscus 自动建串时是以「评论者」的身份创建，会被拒绝，
          导致第一个人留言时报 "Discussion not found"。
    ------------------------------------ */
    giscus: {
      repo: "icent-f/blog-comments",   // ← 你实际建的评论仓库（owner/name）
      repoId: "R_kgDOUhL-fw",          // ← data-repo-id
      category: "General",             // ← 必须是 Open-Ended 格式的分类
      categoryId: "DIC_kwDOUhL-f84DF8R1",  // ← data-category-id
      mapping: "specific",             // 固定一个讨论串当留言板
      term: "留言板",
    },
  };

  /* ---------- 桌面图标：全部文章 + 顶层文件夹（自动生成）+ 归档 ---------- */
  /* 固定这几个的先后顺序，其余新建的顶层文件夹排在它们后面 */
  const CAT_ORDER = ["随笔", "知识笔记", "解题记录"];

  /* ---------- 分类配色 / 图标（未知分类自动分配） ---------- */
  const CAT_COLOR = { "随笔": "#b5954a", "知识笔记": "#5b8f7a", "解题记录": "#4a7fa0" };
  const CAT_ICON = {
    "随笔":     "assets/icons/folder-yellow.svg",
    "知识笔记": "assets/icons/folder-green.svg",
    "解题记录": "assets/icons/folder-blue.svg",
  };
  const PALETTE = ["#4a7fa0", "#5b8f7a", "#b5954a", "#c86a86"];
  const FOLDER_ICONS = [
    "assets/icons/folder-blue.svg",
    "assets/icons/folder-green.svg",
    "assets/icons/folder-yellow.svg",
    "assets/icons/folder-red.svg",
  ];
  function hashOf(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
  function catColor(cat) {
    return CAT_COLOR[cat] || PALETTE[hashOf(cat || "") % PALETTE.length];
  }
  function catIcon(cat) {
    return CAT_ICON[cat] || FOLDER_ICONS[hashOf(cat || "") % FOLDER_ICONS.length];
  }

  /* ---------- 左侧：鼠标移过去的侧边栏 ---------- */
  const RAIL_ITEMS = [
    { type: "home",     label: "首页",   icon: "assets/icons/home.svg" },
    { type: "notes",    label: "灵感",   icon: "assets/icons/notes.svg" },
    { type: "about",    label: "关于我", icon: "assets/icons/user.svg" },
    { type: "settings", label: "设置",   icon: "assets/icons/settings.svg" },
  ];

  /* 侧边栏社交链接（href 留空，后续填你自己的地址即可） */
  const RAIL_SOCIALS = [
    { label: "GitHub",   icon: "assets/icons/github.svg",   href: "" },
    { label: "Bilibili", icon: "assets/icons/bilibili.svg", href: "" },
  ];

  /* ---------- 文章清单 + 目录树 ---------- */
  let POSTS = [];
  let FOLDERS = [];

  function loadPosts() {
    return fetch("data/posts.json")
      .then((r) => { if (!r.ok) throw new Error("load posts failed"); return r.json(); })
      .then((arr) => { POSTS = arr; return arr; })
      .catch(() => { POSTS = []; return []; });
  }

  function loadTree() {
    return fetch("data/tree.json")
      .then((r) => { if (!r.ok) throw new Error("load tree failed"); return r.json(); })
      .then((arr) => { FOLDERS = arr; return arr; })
      .catch(() => { FOLDERS = []; return []; });
  }

  /* 某个文件夹的直接子文件夹 */
  function childFolders(path) {
    const prefix = path ? path + "/" : "";
    return FOLDERS
      .filter((f) => f.indexOf(prefix) === 0 && f.slice(prefix.length).indexOf("/") === -1)
      .map((f) => ({ path: f, name: f.slice(prefix.length) }));
  }

  /* 某个文件夹下的直接文章（按日期倒序） */
  function postsIn(path) {
    return POSTS.filter((p) => (p.folder || "") === path)
      .sort((a, b) => (b.date > a.date ? 1 : -1));
  }

  /* 某个文件夹下（含子目录）的文章总数 */
  function countUnder(path) {
    return POSTS.filter((p) => p.folder === path || (p.folder && p.folder.indexOf(path + "/") === 0)).length;
  }

  /* 顶层文件夹（来自 tree.json，空文件夹也算） */
  function topFolders() {
    return FOLDERS.filter((f) => f.indexOf("/") === -1);
  }

  /* 桌面图标：全部文章 + 每个顶层文件夹 + 归档 */
  function desktopIcons() {
    const tops = topFolders();
    const known = CAT_ORDER.filter((c) => tops.indexOf(c) !== -1);
    const extra = tops.filter((c) => CAT_ORDER.indexOf(c) === -1);
    const icons = [{ type: "posts", label: "全部文章", icon: "assets/icons/folder-blue.svg" }];
    known.concat(extra).forEach((c) => {
      icons.push({ type: "browse", label: c, icon: catIcon(c), cat: c });
    });
    icons.push({ type: "archives", label: "归档", icon: "assets/icons/archive.svg" });
    return icons;
  }

  /* 根据 id / 类别 / 全部分组文章 */
  function postsBy() {
    const all = POSTS.slice().sort((a, b) => (b.date > a.date ? 1 : -1));
    return { all };
  }

  /* ---------- 渲染各类型窗口内容 ---------- */
  const renderers = {
    /* 关于我 —— 博客归属人信息（右上角 User） */
    about(bodyEl) {
      const linkHTML = META.socials.map((s) =>
        '<a href="' + esc(s.href) + '" target="_blank" rel="noopener">' +
        '<span class="s-ic"><img src="' + esc(s.icon) + '" alt="" /></span>' +
        "<span>" + esc(s.label) + "</span></a>"
      ).join("");
      const tagsHTML = META.tags.map((t) => "<span>" + esc(t) + "</span>").join("");
      bodyEl.innerHTML =
        '<div class="about-wrap">' +
          '<div class="about-side"></div>' +
          '<div class="about-main">' +
            '<div class="avatar-row">' +
              '<div class="avatar"><img src="' + esc(META.avatar) + '" alt="头像" /></div>' +
              '<div class="who">' +
                "<h1>" + esc(META.owner) + "</h1>" +
                '<div class="handle">' + esc(META.handle) + "</div>" +
              "</div>" +
            "</div>" +
            '<div class="bio"><p>' + esc(META.desc) + "</p></div>" +
            '<div class="tags">' + tagsHTML + "</div>" +
            '<div class="section-head">联系方式</div>' +
            '<div class="social-links">' + linkHTML + "</div>" +
          "</div>" +
        "</div>";
    },

    /* 全部文章文件夹（分页） */
    posts(bodyEl) {
      const all = postsBy().all;
      let list = all;
      let page = 1;

      bodyEl.innerHTML =
        '<div class="folder-view">' +
          '<div class="folder-toolbar"><img class="ft-ic" src="assets/icons/search.svg" alt="" /><input type="text" placeholder="搜索文章标题…" class="search-input" /><span class="count"></span></div>' +
          '<div class="card-grid"></div>' +
          '<div class="pager-slot"></div>' +
        "</div>";

      const grid = bodyEl.querySelector(".card-grid");
      const pagerSlot = bodyEl.querySelector(".pager-slot");
      const countEl = bodyEl.querySelector(".count");

      function paint() {
        const start = (page - 1) * PAGE_SIZE;
        grid.innerHTML = renderCards(list.slice(start, start + PAGE_SIZE));
        bindPostLinks(grid);
        bindPager(pagerSlot, list.length, page, (p) => { page = p; paint(); bodyEl.scrollTop = 0; });
        countEl.textContent = "共 " + list.length + " 篇";
      }

      const input = bodyEl.querySelector(".search-input");
      input.addEventListener("input", () => {
        const q = input.value.trim().toLowerCase();
        list = q
          ? all.filter((p) => (p.title + p.category + (p.group || "") + (p.excerpt || "")).toLowerCase().includes(q))
          : all;
        page = 1;
        paint();
      });

      paint();
    },

    /* 文件夹浏览（随笔 / 知识笔记 / 解题记录）：面包屑 + 子文件夹 + 文章（分页） */
    browse(bodyEl, cfg) {
      renderFolder(bodyEl, cfg.path != null ? cfg.path : (cfg.cat || ""));
    },

    /* 归档（按年份分组 + 分页） */
    archives(bodyEl) {
      const all = postsBy().all;
      let page = 1;

      bodyEl.innerHTML =
        '<div class="folder-view">' +
          '<div class="folder-toolbar"><img class="ft-ic" src="assets/icons/archive.svg" alt="" /><span>归档 · 共 ' +
            all.length + " 篇</span></div>" +
          '<div class="archive-slot"></div>' +
          '<div class="pager-slot"></div>' +
        "</div>";

      const slot = bodyEl.querySelector(".archive-slot");
      const pagerSlot = bodyEl.querySelector(".pager-slot");

      function paint() {
        const start = (page - 1) * PAGE_SIZE;
        const byYear = {};
        all.slice(start, start + PAGE_SIZE).forEach((p) => {
          const y = p.date.slice(0, 4);
          (byYear[y] = byYear[y] || []).push(p);
        });
        let html = '<div class="archive-list">';
        Object.keys(byYear).sort().reverse().forEach((year) => {
          html += '<div class="archive-year">' + year + "</div>";
          byYear[year].forEach((p) => {
            html += "<li><a data-post='" + esc(p.file) + "' data-title='" + esc(p.title) + "'>" +
              '<span class="d">' + esc(p.date) + "</span>" +
              '<span class="t">' + esc(p.title) + "</span>" +
              '<span class="cat">' + esc(p.category) + "</span></a></li>";
          });
        });
        html += "</div>";
        slot.innerHTML = html;
        bindPostLinks(slot);
        bindPager(pagerSlot, all.length, page, (p) => { page = p; paint(); bodyEl.scrollTop = 0; });
      }

      paint();
    },

    /* 留言板（giscus / GitHub Discussions） */
    notes(bodyEl) {
      const g = META.giscus || {};
      const ready = !!(g.repoId && g.categoryId);

      bodyEl.innerHTML =
        '<div class="folder-view board-view">' +
          '<div class="folder-toolbar">' +
            '<img class="ft-ic" src="assets/icons/notes.svg" alt="" />' +
            "<span>留言板 · GitHub Discussions</span>" +
            '<span class="count">把文章卡片拖到这里可引用</span>' +
          "</div>" +
          '<div class="board-drop" id="board-drop">' +
            (ready
              ? '<div class="giscus-slot" id="giscus-slot"></div>'
              : '<div class="empty-state">留言板还没配置好。<br /><br />' +
                "需要先在 <code>js/content.js</code> 的 <code>META.giscus</code> 里填入 " +
                "<code>repoId</code> 与 <code>categoryId</code>（在 " +
                '<a href="https://giscus.app" target="_blank" rel="noopener">giscus.app</a> 生成），' +
                "并确认仓库已开启 Discussions、已安装 giscus App。</div>") +
          "</div>" +
        "</div>";

      if (ready) mountGiscus(bodyEl.querySelector("#giscus-slot"));
    },

    /* 设置（伪设置，演示交互） */
    settings(bodyEl) {
      bodyEl.innerHTML =
        '<div class="settings-view">' +
          '<div class="set-row"><div class="set-label">护眼模式<small>降低窗口纸面亮度</small></div><button class="switch on" data-key="eye"></button></div>' +
          '<div class="set-row"><div class="set-label">窗口透明度<small>开启后窗口半透</small></div><button class="switch" data-key="glass"></button></div>' +
          '<div class="set-row"><div class="set-label">恢复默认布局<small>重置所有窗口与开关</small></div><button class="set-btn" data-reset>重置</button></div>' +
        "</div>";
      bodyEl.querySelectorAll(".switch").forEach((sw) => {
        sw.addEventListener("click", () => {
          sw.classList.toggle("on");
          const key = sw.dataset.key;
          if (key === "glass") document.querySelectorAll(".window").forEach((w) =>
            w.style.opacity = sw.classList.contains("on") ? ".92" : "");
        });
      });
      const reset = bodyEl.querySelector("[data-reset]");
      if (reset) reset.addEventListener("click", () => {
        location.reload();
      });
    },
  };

  /* ---------- 分页 ---------- */
  const PAGE_SIZE = 12;

  /* 页码序列：1 … 4 5 6 … 20 */
  function pageNumbers(page, pages) {
    const nums = [];
    const add = (v) => { if (nums.indexOf(v) === -1) nums.push(v); };
    add(1);
    for (let p = page - 2; p <= page + 2; p++) if (p > 1 && p < pages) add(p);
    if (pages > 1) add(pages);
    nums.sort((a, b) => a - b);
    const out = [];
    nums.forEach((v, i) => {
      if (i && v - nums[i - 1] > 1) out.push("…");
      out.push(v);
    });
    return out;
  }

  function renderPager(total, page) {
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (pages <= 1) return "";
    let html = '<div class="pager">';
    html += '<button class="pg-btn" data-page="' + (page - 1) + '"' + (page <= 1 ? " disabled" : "") + ">上一页</button>";
    pageNumbers(page, pages).forEach((n) => {
      if (n === "…") {
        html += '<span class="pg-gap">…</span>';
      } else {
        html += '<button class="pg-btn' + (n === page ? " active" : "") + '" data-page="' + n + '">' + n + "</button>";
      }
    });
    html += '<button class="pg-btn" data-page="' + (page + 1) + '"' + (page >= pages ? " disabled" : "") + ">下一页</button>";
    html += '<span class="pager-info">' + page + " / " + pages + " 页</span>";
    return html + "</div>";
  }

  function bindPager(slot, total, page, go) {
    slot.innerHTML = renderPager(total, page);
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    slot.querySelectorAll("[data-page]").forEach((b) => {
      b.addEventListener("click", () => {
        const p = parseInt(b.dataset.page, 10);
        if (!isNaN(p) && p >= 1 && p <= pages && p !== page) go(p);
      });
    });
  }

  /* 卡片渲染 */
  function renderCards(list) {
    if (!list.length) return '<div class="empty-state" style="grid-column:1/-1">暂无文章</div>';
    return list.map((p) => {
      const c = catColor(p.category);
      const head = p.category + (p.group ? " · " + p.group : "");
      return (
        '<div class="card" data-post="' + esc(p.file) + '" data-title="' + esc(p.title) + '">' +
          '<span class="c-cat" style="background:' + c + '22;color:' + c + '">' + esc(head) + "</span>" +
          '<div class="c-title">' + esc(p.title) + "</div>" +
          '<div class="c-excerpt">' + esc(p.excerpt || "") + "</div>" +
          '<div class="c-date">' + esc(p.date) + "</div>" +
        "</div>"
      );
    }).join("");
  }

  /* 文件夹视图：面包屑 + 子文件夹 + 当前文件夹的文章（分页） */
  function renderFolder(bodyEl, path) {
    const children = childFolders(path);
    const posts = postsIn(path);
    let page = 1;

    let crumbs = '<a class="crumb" data-path="">全部文章</a>';
    let acc = "";
    (path ? path.split("/") : []).forEach((seg) => {
      acc = acc ? acc + "/" + seg : seg;
      crumbs += '<span class="crumb-sep">/</span>' +
        '<a class="crumb" data-path="' + esc(acc) + '">' + esc(seg) + "</a>";
    });

    bodyEl.innerHTML =
      '<div class="folder-view">' +
        '<div class="folder-toolbar">' +
          (path ? '<button class="crumb-up" title="上一层">↑</button>' : "") +
          '<span class="crumbs">' + crumbs + "</span>" +
          '<span class="count">' + posts.length + " 篇</span>" +
        "</div>" +
        '<div class="card-grid"></div>' +
        '<div class="pager-slot"></div>' +
      "</div>";

    const grid = bodyEl.querySelector(".card-grid");
    const pagerSlot = bodyEl.querySelector(".pager-slot");

    function folderCards() {
      let h = "";
      children.forEach((c) => {
        h +=
          '<div class="card card-folder" data-folder="' + esc(c.path) + '">' +
            '<div class="cf-ic"><img src="' + catIcon(c.name) + '" alt="" /></div>' +
            '<div class="c-title">' + esc(c.name) + "</div>" +
            '<div class="c-excerpt">' + countUnder(c.path) + " 篇</div>" +
          "</div>";
      });
      return h;
    }

    function paint() {
      const start = (page - 1) * PAGE_SIZE;
      let cards = folderCards();
      if (posts.length) {
        cards += renderCards(posts.slice(start, start + PAGE_SIZE));
      } else if (!children.length) {
        cards += '<div class="empty-state" style="grid-column:1/-1">这里还没有文章</div>';
      }
      grid.innerHTML = cards;

      grid.querySelectorAll("[data-folder]").forEach((el) => {
        el.addEventListener("click", () => renderFolder(bodyEl, el.dataset.folder));
      });
      bindPostLinks(grid);
      bindPager(pagerSlot, posts.length, page, (p) => { page = p; paint(); bodyEl.scrollTop = 0; });
    }

    // 返回上层 / 面包屑跳转
    bodyEl.querySelectorAll(".crumb").forEach((el) => {
      el.addEventListener("click", () => renderFolder(bodyEl, el.dataset.path));
    });
    const up = bodyEl.querySelector(".crumb-up");
    if (up) up.addEventListener("click", () => {
      const parts = path.split("/");
      parts.pop();
      renderFolder(bodyEl, parts.join("/"));
    });

    paint();
  }

  /* ============================================================
     留言板：giscus
     ============================================================ */
  function giscusTheme() {
    return document.documentElement.classList.contains("dark") ? "dark_dimmed" : "light";
  }

  function mountGiscus(slot) {
    const g = META.giscus || {};
    if (!slot) return;
    const mapping = g.mapping || "specific";
    const attrs = {
      "data-repo": g.repo,
      "data-repo-id": g.repoId,
      "data-category": g.category,
      "data-category-id": g.categoryId,
      "data-mapping": mapping,
      "data-strict": "1",
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-input-position": "top",
      "data-theme": giscusTheme(),
      "data-lang": "zh-CN",
      "data-loading": "lazy",
    };
    if (mapping === "specific") attrs["data-term"] = g.term || "留言板";

    slot.innerHTML = "";
    const s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.crossOrigin = "anonymous";
    Object.keys(attrs).forEach((k) => s.setAttribute(k, attrs[k]));
    slot.appendChild(s);
  }

  /* 主题切换时同步 giscus 内部配色 */
  function syncGiscusTheme() {
    const f = document.querySelector("iframe.giscus-frame");
    if (!f || !f.contentWindow) return;
    try {
      f.contentWindow.postMessage(
        { giscus: { setConfig: { theme: giscusTheme() } } }, "https://giscus.app");
    } catch (e) {}
  }

  /* ============================================================
     卡片拖拽
       拖到桌面空白处 → 在该位置打开文章
       拖到留言板     → 复制该文章的 Markdown 引用（giscus 无法程序化发帖）
     ============================================================ */
  let dragEndAt = 0;          // 刚拖完的时间戳，用来吃掉随后的 click

  function popToast(msg) {
    if (global.Blog && typeof global.Blog.toast === "function") global.Blog.toast(msg);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(() => true).catch(() => legacyCopy(text));
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch (e) { return false; }
  }

  function makeGhost(card) {
    const g = document.createElement("div");
    g.className = "card card-ghost";
    const cat = card.querySelector(".c-cat");
    const title = card.querySelector(".c-title") || card.querySelector(".t");
    const date = card.querySelector(".c-date") || card.querySelector(".d");
    g.innerHTML =
      (cat ? cat.outerHTML : "") +
      '<div class="c-title">' +
        esc(title ? title.textContent : (card.dataset.title || "")) +
      "</div>" +
      (date ? '<div class="c-date">' + esc(date.textContent) + "</div>" : "");
    return g;
  }

  function clearDropHints() {
    document.querySelectorAll(".board-drop.over").forEach((b) => b.classList.remove("over"));
    document.body.classList.remove("dragging-card");
  }

  function handleCardDrop(card, x, y) {
    const file = card.dataset.post;
    if (!file) return;
    const target = document.elementFromPoint(x, y);
    if (!target) return;

    // ① 拖到留言板 → 复制引用链接
    if (target.closest(".board-drop")) {
      const p = POSTS.find((it) => it.file === file) || {};
      const base = global.location.origin + global.location.pathname;
      const url = base + "#post-" + (p.id || "");
      const md = "[" + (p.title || card.dataset.title || "文章") + "](" + url + ")";
      copyText(md).then((ok) => {
        popToast(ok ? "已复制文章引用，粘贴到留言框即可" : "复制失败，请手动复制：" + md);
      });
      return;
    }

    // ② 拖到桌面空白处 → 在该位置打开文章
    if (!target.closest(".window") && target.closest("#desktop")) {
      openPost(file, card.dataset.title, { x: x, y: y });
    }
  }

  function clearTextSelection() {
    try {
      const sel = global.getSelection && global.getSelection();
      if (sel && sel.removeAllRanges) sel.removeAllRanges();
    } catch (e) {}
  }

  function startCardDrag(e, card) {
    if (e.button !== 0) return;
    e.preventDefault();          // 阻止浏览器从卡片开始拖选文本
    clearTextSelection();
    const start = { x: e.clientX, y: e.clientY };
    let ghost = null;

    const move = (ev) => {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      if (!ghost) {
        if (Math.abs(dx) + Math.abs(dy) < 6) return;   // 抖动阈值，避免误拖
        clearTextSelection();                          // 兜底：清掉残留选区
        ghost = makeGhost(card);
        document.body.appendChild(ghost);
        document.body.classList.add("dragging-card");
      }
      const gw = ghost.offsetWidth || 180;
      ghost.style.left = Math.max(0, Math.min(ev.clientX - gw / 2, global.innerWidth - gw)) + "px";
      ghost.style.top = Math.max(0, ev.clientY - 24) + "px";

      const t = document.elementFromPoint(ev.clientX, ev.clientY);
      const overBoard = !!(t && t.closest(".board-drop"));
      document.querySelectorAll(".board-drop").forEach((b) => b.classList.toggle("over", overBoard));
    };

    const up = (ev) => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      if (!ghost) return;                 // 没超过阈值 → 交给 click，正常打开
      dragEndAt = Date.now();
      ghost.remove();
      clearDropHints();
      handleCardDrop(card, ev.clientX, ev.clientY);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  }

  /* 为卡片 / 归档绑定点击 -> 打开文章窗口 */
  function bindPostLinks(root) {
    root.querySelectorAll("[data-post]").forEach((a) => {
      a.addEventListener("click", (e) => {
        if (Date.now() - dragEndAt < 300) { e.preventDefault(); return; }   // 刚拖完，别当成点击
        openPost(a.dataset.post, a.dataset.title);
      });
      a.addEventListener("mousedown", (e) => startCardDrag(e, a));
    });
  }

  /* ---------- Markdown -> HTML（本地 marked，离线可用） ---------- */
  function stripFrontMatter(text) {
    const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(text);
    return m ? text.slice(m[0].length) : text;
  }

  /* 把文章里的相对路径（图片/链接）解析成相对于文章所在目录的路径 */
  function resolveRelativeUrls(html, baseDir) {
    if (!baseDir) return html;
    return html.replace(/\b(src|href)="([^"]*)"/g, (whole, attr, url) => {
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(url) || url.indexOf("assets/") === 0) {
        return whole;   // 绝对地址 / 锚点 / assets 保持原样
      }
      return attr + '="' + baseDir + url + '"';
    });
  }

  function renderMarkdown(md, baseDir) {
    md = stripFrontMatter(md);
    // 正文开头若重复写了一级标题，去掉（标题由清单提供）
    md = md.replace(/^\s*#\s+.*(?:\r?\n|$)/, "");
    if (global.marked && typeof global.marked.parse === "function") {
      let html = resolveRelativeUrls(global.marked.parse(md, { gfm: true, breaks: true }), baseDir);
      // 图片加 referrerpolicy，绕过部分图床防盗链
      html = html.replace(/<img (?![^>]*referrerpolicy)/g, '<img referrerpolicy="no-referrer" ');
      return html;
    }
    // 没加载到 marked 时兜底成纯文本
    return '<pre class="md-fallback">' + esc(md) + "</pre>";
  }

  /* ---------- 打开文章窗口 ----------
     pos 可选：{ x, y } —— 传了就在该位置打开（卡片拖到桌面松手时用） */
  function openPost(file, title, pos) {
    const meta = POSTS.find((p) => p.file === file) || {};
    const isMd = /\.md$/i.test(file);
    const baseDir = file.replace(/[^/]*$/, "");   // 文章所在目录

    // 更新地址栏 hash，方便分享 / RSS 回链
    if (meta.id) {
      try { history.replaceState(null, "", "#post-" + meta.id); } catch (e) {}
    }

    const cfg = {
      id: "post_" + file,
      title: title || meta.title || "阅读文章",
      iconImg: "assets/icons/file.svg",
      place: "right",           // 默认占满右半边
      typeset: "article-window",
      bodyHTML: '<div class="empty-state"><span class="spinner"></span>正在加载…</div>',
      onRender(bodyEl) {
        const show = (inner) => {
          bodyEl.innerHTML = '<div class="post-article">' + inner + "</div>";
        };
        const fail = () => {
          show('<h1>加载失败</h1><p>无法读取文章文件：<code>' + esc(file) + "</code></p>");
        };

        // 兜底：直接读源文件，运行时渲染
        const loadSource = () => fetch(file)
          .then((r) => { if (!r.ok) throw new Error(); return r.text(); })
          .then((text) => {
            if (!isMd) return show(text);   // .html 文章：自带标题与元信息
            const head = meta.category
              ? '<span class="chip">' + esc(meta.category + (meta.group ? " · " + meta.group : "")) + "</span>"
              : "";
            show(
              "<h1>" + esc(meta.title || title || "文章") + "</h1>" +
              '<div class="post-meta">' + head +
                "<span>" + esc(meta.date || "") + "</span>" +
              "</div>" +
              renderMarkdown(text, baseDir)
            );
          })
          .catch(fail);

        // 优先用构建时预渲染好的 HTML
        if (isMd && meta.html) {
          fetch(meta.html)
            .then((r) => { if (!r.ok) throw new Error(); return r.text(); })
            .then(show)
            .catch(loadSource);
        } else {
          loadSource();
        }
      },
    };

    // 拖到桌面松手：把窗口摆在落点附近（并夹在可视区内）
    if (pos) {
      const vw = global.innerWidth;
      const vh = global.innerHeight;
      const w = Math.max(560, Math.round(vw * 0.5));
      const h = Math.max(400, vh - 72);
      cfg.x = Math.round(Math.min(Math.max(0, pos.x - w / 2), Math.max(0, vw - w)));
      cfg.y = Math.round(Math.min(Math.max(0, pos.y - 24), Math.max(0, vh - h)));
    }

    const win = WM.open(cfg);
    // 窗口已存在时 WM 会直接复用，这里强制挪到落点
    if (pos && win && win.el) {
      win.x = cfg.x;
      win.y = cfg.y;
      win.el.style.left = cfg.x + "px";
      win.el.style.top = cfg.y + "px";
    }
    // 触发渲染
    if (win.onRender) win.onRender(win.bodyEl);
  }

  /* 从地址栏 hash 打开文章（#post-<id>） */
  function openFromHash() {
    const m = /^#post-(.+)$/.exec(global.location.hash || "");
    if (!m) return false;
    const id = decodeURIComponent(m[1]);
    const p = POSTS.find((x) => x.id === id);
    if (!p) return false;
    openPost(p.file, p.title);
    return true;
  }

  /* 通用打开入口 */
  function open(type, cfg) {
    cfg = cfg || {};
    const defs = {
      about:     { id: "about", title: "关于我 · " + META.owner, iconImg: "assets/icons/user.svg", width: 780, height: 580 },
      posts:     { id: "posts", title: "全部文章", iconImg: "assets/icons/folder-blue.svg", place: "right" },
      browse:    { id: "browse_" + (cfg.cat || ""), title: cfg.cat || "文件夹", iconImg: catIcon(cfg.cat), place: "right" },
      archives:  { id: "archives", title: "归档", iconImg: "assets/icons/archive.svg", place: "right" },
      notes:     { id: "notes", title: "灵感", iconImg: "assets/icons/notes.svg", place: "right" },
      settings:  { id: "settings", title: "设置", iconImg: "assets/icons/settings.svg", width: 600, height: 540 },
    };
    const d = defs[type];
    if (!d) return;
    const win = WM.open(Object.assign({}, d, { typeset: "default-window" }));
    const render = renderers[type];
    if (render) render(win.bodyEl, cfg);
    return win;
  }

  /* ============================================================
     极简移动版：纯列表 + 正文（触摸设备点「看文章（极简版）」后进入）
     ============================================================ */
  const MOBILE_KEY = "pay3cents-mobile";

  function mBody() { return document.getElementById("m-body"); }

  /* 列表页 */
  function mobileList() {
    const body = mBody();
    if (!body) return;
    const back = document.getElementById("m-back");
    const title = document.getElementById("m-title");
    if (back) back.hidden = true;
    if (title) title.textContent = META.name || "博客";

    const cats = [];
    POSTS.forEach((p) => { if (p.category && cats.indexOf(p.category) === -1) cats.push(p.category); });

    let cur = "";
    let html = '<div class="m-chips">';
    html += '<button class="m-chip active" data-cat="">全部</button>';
    cats.forEach((c) => {
      html += '<button class="m-chip" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
    });
    html += '</div><div class="m-list"></div>';
    body.innerHTML = html;

    const listEl = body.querySelector(".m-list");

    function paint() {
      const list = cur ? POSTS.filter((p) => p.category === cur) : POSTS;
      listEl.innerHTML = list.length
        ? list.map((p) =>
            '<a class="m-item" data-file="' + esc(p.file) + '">' +
              '<div class="m-item-t">' + esc(p.title) + "</div>" +
              '<div class="m-item-m">' +
                '<span class="m-cat" style="color:' + catColor(p.category) + '">' + esc(p.category) + "</span>" +
                "<span>" + esc(p.date) + "</span>" +
              "</div>" +
            "</a>").join("")
        : '<div class="empty-state">暂无文章</div>';
      listEl.querySelectorAll(".m-item").forEach((a) => {
        a.addEventListener("click", () => {
          const p = POSTS.find((x) => x.file === a.dataset.file);
          if (p) mobileArticle(p);
        });
      });
    }

    body.querySelectorAll(".m-chip").forEach((b) => {
      b.addEventListener("click", () => {
        cur = b.dataset.cat || "";
        body.querySelectorAll(".m-chip").forEach((x) => x.classList.toggle("active", x === b));
        paint();
      });
    });

    paint();
    body.scrollTop = 0;
  }

  /* 正文页 */
  function mobileArticle(p) {
    const body = mBody();
    if (!body) return;
    const back = document.getElementById("m-back");
    const title = document.getElementById("m-title");
    if (back) back.hidden = false;
    if (title) title.textContent = p.title;

    const show = (inner) => {
      body.innerHTML = '<div class="post-article m-article">' + inner + "</div>";
      body.scrollTop = 0;
    };
    const fromMd = () => fetch(p.file)
      .then((r) => { if (!r.ok) throw new Error(); return r.text(); })
      .then((t) => show(
        "<h1>" + esc(p.title) + "</h1>" +
        '<div class="post-meta"><span class="chip">' + esc(p.category) + "</span>" +
        "<span>" + esc(p.date) + "</span></div>" +
        renderMarkdown(t, p.file.replace(/[^/]*$/, ""))
      ))
      .catch(() => show("<h1>加载失败</h1><p>无法读取：" + esc(p.file) + "</p>"));

    body.innerHTML = '<div class="empty-state"><span class="spinner"></span>加载中…</div>';
    body.scrollTop = 0;

    if (p.html) {
      fetch(p.html)
        .then((r) => { if (!r.ok) throw new Error(); return r.text(); })
        .then(show)
        .catch(fromMd);
    } else {
      fromMd();
    }
  }

  /* 进入极简版 */
  function mobileEnter() {
    document.documentElement.classList.add("mobile-mode");
    try { localStorage.setItem(MOBILE_KEY, "1"); } catch (e) {}
    mobileList();
  }

  /* 初始化：绑定返回按钮；若是从 localStorage 恢复的，就直接渲染列表 */
  function initMobile() {
    const back = document.getElementById("m-back");
    if (back) back.addEventListener("click", mobileList);
    if (document.documentElement.classList.contains("mobile-mode")) mobileList();
  }

  /* 暴露 */
  global.Blog = {
    META, RAIL_ITEMS, RAIL_SOCIALS, open, openPost, openFromHash,
    loadPosts, loadTree, desktopIcons, topFolders, postsIn, childFolders, catColor, catIcon,
    mobileEnter, initMobile, syncGiscusTheme,
  };
})(window);
