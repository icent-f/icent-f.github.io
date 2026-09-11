#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
扫描 content/所有文章/ 下的 Markdown，生成：

  data/posts.json   文章清单（含预渲染 HTML 的路径）
  data/tree.json    目录树（含空文件夹），供文件夹导航
  data/html/<id>.html   每篇文章预渲染好的正文 HTML
  rss.xml           订阅源
  sitemap.xml       站点地图

用法（在项目根目录执行）： python tools/build_index.py   （或双击 build.bat）
"""

import datetime
import email.utils
import json
import os
import re
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import md2html  # noqa: E402

# ---------------------------------------------------------------- 站点配置
# 部署后把这里改成你的域名（结尾不要带 /）
SITE_URL = "https://icent-f.github.io"
SITE_TITLE = "Pay3Cents 的博客"
SITE_DESC = "记录未确定事件的观察、CTF 解题与生活碎碎念。"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "content", "所有文章")
OUT_POSTS = os.path.join(ROOT, "data", "posts.json")
OUT_TREE = os.path.join(ROOT, "data", "tree.json")
OUT_HTML = os.path.join(ROOT, "data", "html")

FM_RE = re.compile(r"^---\r?\n(.*?)\r?\n---\r?\n?", re.S)
H1_RE = re.compile(r"^\s*#\s+(.+?)\s*$", re.M)

# 这些目录名不参与文件夹导航（是文章的资源目录）
SKIP_DIRS = {"图片", "assets", "img", "images", ".git"}


def parse_front_matter(text):
    m = FM_RE.match(text)
    if not m:
        return {}, text
    data = {}
    for line in m.group(1).splitlines():
        mm = re.match(r"^([A-Za-z_][\w-]*)\s*:\s*(.*)$", line)
        if mm:
            data[mm.group(1)] = mm.group(2).strip().strip('"').strip("'")
    return data, text[m.end():]


def first_paragraph(body):
    for block in re.split(r"\r?\n\s*\r?\n", body):
        b = block.strip()
        if not b or b[0] in "#!>|":
            continue
        if b.startswith("```"):
            continue
        b = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", b)
        b = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", b)
        b = re.sub(r"[*_`~#>-]", "", b).strip()
        if b:
            return b[:80] + ("…" if len(b) > 80 else "")
    return ""


def slugify(rel):
    s = rel[:-3] if rel.lower().endswith(".md") else rel
    s = re.sub(r"[\\/]+", "-", s)
    s = re.sub(r"[^\w\u4e00-\u9fff-]", "-", s)
    return re.sub(r"-+", "-", s).strip("-").lower()


def resolve_urls(html_text, base_dir):
    """把正文里的相对路径（图片/链接）解析成相对于站点根的路径"""
    def repl(m):
        attr, url = m.group(1), m.group(2)
        if re.match(r"^(?:[a-z][a-z0-9+.-]*:|//|/|#)", url, re.I) or url.startswith("assets/"):
            return m.group(0)
        return '%s="%s%s"' % (attr, base_dir, url)

    return re.sub(r'\b(src|href)="([^"]*)"', repl, html_text)


def rfc822(date_str):
    try:
        d = datetime.datetime.strptime(date_str, "%Y-%m-%d").replace(
            tzinfo=datetime.timezone.utc)
    except Exception:
        d = datetime.datetime.now(datetime.timezone.utc)
    return email.utils.format_datetime(d)


def main():
    if not os.path.isdir(CONTENT):
        print("找不到目录：" + CONTENT)
        sys.exit(1)

    posts = []
    folders = set()

    for dirpath, _dirnames, filenames in os.walk(CONTENT):
        drel = os.path.relpath(dirpath, CONTENT).replace("\\", "/")
        if drel != ".":
            segs = drel.split("/")
            for i in range(1, len(segs) + 1):
                folders.add("/".join(segs[:i]))

        for fn in filenames:
            if not fn.lower().endswith(".md"):
                continue
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, CONTENT).replace("\\", "/")
            parts = rel.split("/")
            category = parts[0] if len(parts) > 1 else "未分类"
            group = " / ".join(parts[1:-1]) if len(parts) > 2 else ""
            folder = "/".join(parts[:-1]) if len(parts) > 1 else ""

            text = open(full, encoding="utf-8").read()
            fm, body = parse_front_matter(text)

            title = fm.get("title", "").strip()
            if not title:
                m = H1_RE.search(body)
                title = m.group(1).strip() if m else os.path.splitext(fn)[0]

            date = fm.get("date", "").strip() or datetime.date.fromtimestamp(
                os.path.getmtime(full)).isoformat()

            excerpt = fm.get("excerpt", "").strip() or first_paragraph(body)
            pid = slugify(rel)

            # ---- 预渲染正文 ----
            md = re.sub(r"^\s*#\s+.*(?:\r?\n|$)", "", body, count=1)   # 去掉重复的一级标题
            base_dir = ("content/所有文章/" + folder + "/") if folder else "content/所有文章/"
            body_html = resolve_urls(md2html.render(md), base_dir)

            head = ""
            if category:
                chip = category + ((" · " + group) if group else "")
                head += '<span class="chip">%s</span>' % chip
            head += "<span>%s</span>" % date
            inner = ("<h1>%s</h1>\n<div class=\"post-meta\">%s</div>\n%s"
                     % (md2html._inline(title), head, body_html))

            posts.append({
                "id": pid,
                "title": title,
                "date": date,
                "category": category,
                "group": group,
                "folder": folder,
                "file": "content/所有文章/" + rel,
                "html": "data/html/%s.html" % pid,
                "excerpt": excerpt,
                "_inner": inner,
            })

    posts.sort(key=lambda p: (p["date"], p["title"]), reverse=True)
    folders = {f for f in folders if not any(seg in SKIP_DIRS for seg in f.split("/"))}

    # ---- 写预渲染 HTML ----
    if os.path.isdir(OUT_HTML):
        shutil.rmtree(OUT_HTML)
    os.makedirs(OUT_HTML, exist_ok=True)
    for p in posts:
        with open(os.path.join(OUT_HTML, p["id"] + ".html"), "w", encoding="utf-8") as f:
            f.write(p.pop("_inner"))

    # ---- 写清单 / 目录树 ----
    os.makedirs(os.path.dirname(OUT_POSTS), exist_ok=True)
    with open(OUT_POSTS, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
    with open(OUT_TREE, "w", encoding="utf-8") as f:
        json.dump(sorted(folders), f, ensure_ascii=False, indent=2)

    # ---- RSS ----
    items = []
    for p in posts:
        link = "%s/#post-%s" % (SITE_URL, p["id"])
        items.append(
            "  <item>\n"
            "    <title>%s</title>\n"
            "    <link>%s</link>\n"
            "    <guid isPermaLink=\"false\">%s</guid>\n"
            "    <pubDate>%s</pubDate>\n"
            "    <description>%s</description>\n"
            "  </item>" % (
                md2html._inline(p["title"]), link, p["id"],
                rfc822(p["date"]), md2html._inline(p["excerpt"]))
        )
    rss = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<rss version="2.0">\n<channel>\n'
           '  <title>%s</title>\n  <link>%s/</link>\n  <description>%s</description>\n'
           '  <language>zh-cn</language>\n%s\n</channel>\n</rss>\n'
           % (SITE_TITLE, SITE_URL, SITE_DESC, "\n".join(items)))
    with open(os.path.join(ROOT, "rss.xml"), "w", encoding="utf-8") as f:
        f.write(rss)

    # ---- sitemap ----
    urls = ['  <url><loc>%s/</loc></url>' % SITE_URL]
    for p in posts:
        urls.append("  <url><loc>%s/#post-%s</loc><lastmod>%s</lastmod></url>"
                    % (SITE_URL, p["id"], p["date"]))
    sitemap = ('<?xml version="1.0" encoding="UTF-8"?>\n'
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n%s\n</urlset>\n'
               % "\n".join(urls))
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(sitemap)

    print("文章 %d 篇 | 文件夹 %d 个 | 预渲染 HTML %d 个" % (len(posts), len(folders), len(posts)))
    print("输出：data/posts.json  data/tree.json  data/html/  rss.xml  sitemap.xml")
    for p in posts:
        head = p["category"] + (" / " + p["group"] if p["group"] else "")
        print("  [%s] %s  (%s)" % (head, p["title"], p["date"]))


if __name__ == "__main__":
    main()
