# Pay3Cents 的博客 · 电脑桌面版

一个把博客做成「电脑桌面」的本地站点。灵感来自视觉小说《未确定事件的观察者(EPORO)》的界面风格：
青绿毛玻璃的桌面，文章被收纳进文件夹与快捷方式里，点侧边栏的头像就是博客归属人的信息。

- 纯 **HTML / CSS / 原生 JS**，无构建、无框架、无依赖。
- 桌面图标统一放在**右半边**，**左侧边缘**有一个鼠标移过去才弹出的侧边栏。
- 图标是**自绘的线条 SVG**（青绿描边，与毛玻璃主题统一）。
- 壁纸是一张**真实图片**（`assets/wallpaper.jpg`），后续直接替换同名文件即可。
- 支持**深色 / 浅色**两种主题（欢迎组件里的圆角矩形切换）。
- 本地运行即可，浏览器访问，无需上线。

---

## 怎么运行（本地访问）

需要本机有 **Python 3**（Windows 自带 `py`/`python`，或 Git Bash / WSL 里的 `python3`）。

### Windows 双击运行

双击 `start.bat`。它会在 `http://127.0.0.1:8080` 启动并自动打开浏览器。

### 命令行运行

```bash
# 在该目录下执行：
python -m http.server 8080
# 然后浏览器打开 http://127.0.0.1:8080
```

> 服务器启动必须基于项目根目录（`F:\blog`），否则文章/资源路径会 404。
> 停止服务器：命令行里按 `Ctrl+C`。

---

## 界面都有什么

| 区域 | 作用 |
| --- | --- |
| 壁纸 | 真实图片（`assets/wallpaper.jpg`），可直接替换 |
| 右半边图标 | **全部文章 + 每个顶层文件夹 + 归档**（新建顶层文件夹并重跑索引后自动出现） |
| 左侧侧边栏 | 鼠标移到屏幕**左边缘**自动滑出：头像 / 名字 / 标签 / GitHub·Bilibili / 快捷方式 |
| 锁屏 | 页面打开时出现一次，点 **Login** 进入桌面 |
| 底部任务栏 | Win11 风格：居中图标（开始 + 侧边栏图标 + 已打开窗口）、右侧托盘、两行时钟 |

窗口支持：**拖动标题栏移动**、**拖拽任意边缘/角缩放**、**最小化/关闭**、**层叠聚焦**、**任务栏切换**。
桌面支持：**右键菜单**、双击图标打开、单击选中、鼠标移动带动壁纸视差。

---

## 关于我（侧边栏头像）

「关于我」窗口是左右两栏：

- **左侧大图**：`assets/about-illustration.jpg`（你提供的第一张图）。
- **右侧**：圆形头像 `assets/avatar.png`（你提供的第二张图）+ 名字 / 简介 / 标签 / 联系方式。

---

## 如何添加 / 修改你自己的生活内容

### 1. 站点信息（博客归属人）

编辑 `js/content.js` 顶部的 `META`：名字、简介、标签、社交链接、头像与侧边图路径。

### 2. 换壁纸 / 头像 / 侧边图

直接替换同名文件即可（无需改代码）：

| 文件 | 用途 |
| --- | --- |
| `assets/wallpaper.jpg` | 桌面壁纸 |
| `assets/avatar.png` | 头像 |
| `assets/about-illustration.jpg` | 关于我页面的侧边大图 |

### 3. 添加一篇文章（Markdown + 目录结构）

文章用 **Markdown** 写，渲染由本地 `js/vendor/marked.min.js` 完成，**完全离线**。

**目录结构**（`content/所有文章/` 下，层级即分类）：

```
content/所有文章/
├─ 随笔/hello.md                        ← 单文件文章
├─ 技术/register.md
├─ Wirteup/BUUCTF/Misc/1.md
└─ Wirteup/BUUCTF/Misc/2/               ← 带图片的文章：独立文件夹
   ├─ 2.md
   └─ 图片/shot-01.png
```

- **第一层** = 分类（桌面上的文件夹图标由它自动生成）
- **更深的层** = 子分类，会显示在卡片标签上（如 `解题记录 · BUUCTF / Misc / demo`）
- 文章可以是**单个 .md**，也可以是**一个同名文件夹**（内含 .md + `图片/` 等资源）
- `图片/`、`assets/`、`img/`、`images/` 这些目录名**不会**出现在文件夹导航里

**三个入口的行为：**

| 图标 | 行为 |
|---|---|
| 全部文章 | 直接列出全部文章，按日期倒序，带搜索与分页 |
| 随笔 | 直接列出该目录下的文章（不加子文件夹也可以），带分页 |
| 知识笔记 / 解题记录 | 进入**文件夹导航**：面包屑 + 子文件夹卡片，逐层点进去（文章列表带分页） |

子文件夹卡片上显示该目录（含子目录）的文章数。

**分页**：每页 12 篇（`js/content.js` 里的 `PAGE_SIZE`）。底部有 `上一页 / 页码 / 下一页`，
页码多了会折叠成 `1 … 5 6 7 … 20`。搜索时会自动回到第 1 页。

**每篇开头写 front matter（可选，但推荐）：**

```md
---
title: BUUCTF Misc 2
date: 2026-09-10
excerpt: 一句话摘要，显示在卡片上。
---

正文……

![截图](图片/shot-01.png)
```

不写 front matter 也能跑：标题取第一个 `# 标题`（再不然用文件名），日期取文件修改时间，摘要取正文第一段。

**然后重建索引：**

```bash
python tools/build_index.py     # 或双击 build.bat
```

它会扫描整个目录树，生成：

| 产物 | 内容 |
| --- | --- |
| `data/posts.json` | 文章清单（标题/日期/分类/子分类/所在目录/路径/摘要） |
| `data/tree.json` | 目录树（含空文件夹），供文件夹导航使用 |
| `data/html/<id>.html` | **每篇文章预渲染好的 HTML**（打开文章直接读它，不再现拉 .md） |
| `rss.xml` / `sitemap.xml` | 订阅源与站点地图 |

刷新页面即可，**不用重启服务器**。

**关于预渲染**：正文在构建时就用纯 Python 转换器（`tools/md2html.py`，无第三方依赖）编译成 HTML，
并把 `图片/a.png` 这类相对路径重写成正确的站点路径。前端优先读预渲染文件，读不到才回退到
运行时 marked 渲染——所以**即使 marked 没加载，文章也能正常显示**。

**部署前记得改** `tools/build_index.py` 顶部的 `SITE_URL`（RSS / sitemap 里的链接要用它）。

支持的标准 Markdown：标题、**加粗**、*斜体*、`行内代码`、代码块、列表、引用、链接、图片、表格、分割线。

> 新增分类只要新建一层文件夹（重跑脚本后桌面图标自动多出来），无需改代码。
> 每篇文章有独立地址 `你的域名/#post-<id>`，可以直接分享。

### 4. 桌面图标 / 左侧侧边栏

- 右半边图标：**由顶层文件夹自动生成**（`js/content.js` 的 `desktopIcons()`；先后顺序在 `CAT_ORDER` 里调整）
- 左侧侧边栏：`js/content.js` 的 `RAIL_ITEMS`
- 图标路径都指向 `assets/icons/*.png`，想换风格就替换这些 PNG。

---

## 留言板（giscus）

「留言板」那个窗口是一个 **giscus 留言板** —— 评论存在 GitHub Discussions 里，不需要自己的数据库和服务器。

评论放在一个**独立的公开仓库**里（默认 `icent-f/blog-comments`），跟博客仓库分开，这样以后换框架、换域名，评论都还在。

### 配置步骤

1. **新建评论仓库**
   - 名字：`blog-comments`
   - 可见性：**Public**（giscus 只认公开仓库）
   - README / .gitignore / license 都不用勾

2. **开启 Discussions**
   打开那个仓库 → `Settings` → `General` → `Features` → 勾选 **Discussions**

3. **安装 giscus App**
   打开 <https://github.com/apps/giscus> → `Install` → 选 **Only select repositories** → 只勾**评论仓库**
   （⚠️ 是装在评论仓库上，不是博客仓库）

4. **在 giscus.app 生成配置**
   打开 <https://giscus.app>：
   - Repository：填**评论仓库**的全名，如 `icent-f/blog-comments`
   - Discussion Category：选 **`General`**（见下方警告）
   - Mapping：随便选，代码里写死了
   - 抄下页面生成的 `data-repo-id` 和 `data-category-id`

5. **填进 `js/content.js`**

   ```js
   giscus: {
     repo: "icent-f/blog-comments",
     repoId: "R_kgDO...",        // ← data-repo-id
     category: "General",
     categoryId: "DIC_kwDO...",  // ← data-category-id
     mapping: "specific",
     term: "留言板",
   },
   ```

   填好之前，留言板窗口会显示一段配置说明，不会白屏。

### ⚠️ 分类别选 Announcements

`Announcements` 是 GitHub 的**受限分类**——只有仓库维护者能在那里开新帖。
而 giscus 自动创建讨论串时，是以**留言者的身份**去创建的，GitHub 会拒绝，
于是**第一个留言的人**会看到 `Discussion not found`，你只能每次手动去建讨论串。

**必须用 Open-Ended 格式的分类**（`General` 就是）。

### 主题：跟博客配色统一

giscus 自带的主题是 GitHub 那套（灰蓝 + 绿色按钮、4px 直角），跟本站的青绿毛玻璃不搭。
所以本站用的是**自定义主题**，放在：

```
assets/giscus-theme-light.css
assets/giscus-theme-dark.css
```

这两份是拿 giscus 官方主题（MIT, GitHub Inc.）的全部 82 个 CSS 变量改值生成的，配色直接取自
`css/style.css` 的 `:root` / `.dark`，末尾追加了一段结构覆盖（圆角 14px、画布透明等）。

`js/content.js` 的 `giscusTheme()` 会根据当前深浅色拼出**绝对地址**返回。
想退回内置主题：把 `META.giscus.customTheme` 改成 `false` 即可。

> ⚠️ **主题 CSS 必须能跨域访问。**
> giscus 是在它自己的 iframe 里用 `<link crossorigin="anonymous">` 加载这个文件的，
> 属于跨域请求。GitHub Pages 自带 `Access-Control-Allow-Origin: *`，没问题；
> 但 `python -m http.server` **不发这个头**，本地会加载不出主题 ——
> 所以本地预览请用 `tools/serve.py`（`start.bat` / `start.sh` 已经改成用它了），
> 它除了加 CORS 头还会禁用缓存，改完刷新即生效。

### 其它说明

- 用 `mapping: "specific"` + `term: "留言板"`，**所有留言集中在同一个讨论串**（留言板语义）
- `data-strict="1"`：精确匹配或新建，避免 GitHub 模糊搜索抓错讨论串
- 切换深色/浅色时，会通过 `postMessage` 同步重新加载 giscus 的主题
- 改名 `term` 会另起一个新的讨论串（原来的评论还在 GitHub，只是不再显示）

---

## 目录结构

```
blog/
├─ index.html            桌面外壳（壁纸 / 左侧栏 / 右侧图标 / 任务栏 / 窗口容器）
├─ start.bat             Windows 一键启动
├─ start.sh              Git Bash / WSL 启动
├─ css/
│  └─ style.css          全部样式（配色变量、窗口、任务栏、侧边栏、图标）
├─ js/
│  ├─ vendor/
│  │  └─ marked.min.js   Markdown 解析（本地内置，离线可用）
│  ├─ window-manager.js  窗口管理（拖拽/缩放/最小化/层叠/任务栏）
│  ├─ content.js         站点数据 + 各窗口内容渲染器
│  └─ desktop.js         桌面引导（图标/侧边栏/时钟/开始菜单/交互）
├─ content/
│  └─ 所有文章/          文章（目录层级 = 分类，见上文）
├─ data/
│  ├─ posts.json         自动生成的清单（跑 build_index.py 重建）
│  ├─ tree.json          自动生成的目录树
│  └─ html/              自动生成的预渲染文章 HTML
├─ tools/
│  ├─ build_index.py     扫描文章目录，生成清单 / 目录树 / 预渲染 HTML / RSS / sitemap
│  └─ md2html.py         纯 Python 的 Markdown 转换器（无第三方依赖）
├─ rss.xml               自动生成
├─ sitemap.xml           自动生成
└─ assets/
   ├─ wallpaper.jpg      浅色壁纸（可替换）
   ├─ wallpaper-dark.jpg 深色壁纸（可替换）
   ├─ avatar.png         头像（可替换）
   ├─ about-illustration.jpg  关于我侧边大图（可替换）
   ├─ mode-light.jpg / mode-dark.jpg  主题切换按钮的填充图
   ├─ favicon.svg
   ├─ icons/             线条图标（user/folder/archive/notes/settings/home/file/start/github/bilibili/twitter/mail/rss）
   └─ placeholders/      占位素材
```

---

## 自定义配色 / 玻璃质感

面板统一是**青绿色调毛玻璃**，参数都在 `css/style.css` 顶部的 `:root`：

```css
--panel:  rgba(213, 240, 231, .58);      /* 窗口玻璃底，改最后一个值调透明度 */
--glass-blur: blur(18px) saturate(1.35); /* 毛玻璃强度 */
--accent: #2f6b5c;                       /* 青绿主色 */
--ink:    #2f4f47;                       /* 文字色 */
```

Markdown 解析：[marked](https://github.com/markedjs/marked)（MIT，本地内置在 `js/vendor/`）。
