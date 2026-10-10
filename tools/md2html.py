#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
极简 Markdown -> HTML 转换器（纯标准库，无第三方依赖）

支持博客常用子集：
  # 标题、段落、**粗体**、*斜体*、`行内代码`、``` 代码块 ```、
  无序/有序列表、> 引用、--- 分割线、[链接](url)、![图片](url)、GFM 表格

输出风格对齐前端用的 marked（breaks: true，即单个换行也换行）。
"""
import html
import re

_FENCE = re.compile(r"^```\s*([^`]*)$")
_HEADING = re.compile(r"^(#{1,6})\s+(.*)$")
_HR = re.compile(r"^\s*([-*_])\s*(\1\s*){2,}$")
_QUOTE = re.compile(r"^\s*>")
_TABLE_SEP = re.compile(r"^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$")
_LIST_ITEM = re.compile(r"^([ \t]*)([-*+]|\d+[.)])[ \t]+(.*)$")


def _indent_w(ws):
    """缩进宽度，tab 记 4"""
    return sum(4 if c == "\t" else 1 for c in ws)


def _slug(text, used):
    """把标题文本转成一个稳定的锚点 id（中文保留，重名自动加序号）"""
    s = re.sub(r"`([^`]*)`", r"\1", text)                 # 行内代码
    s = re.sub(r"\*\*([^*]+)\*\*", r"\1", s)              # 粗体
    s = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"\1", s)     # 斜体
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)        # 链接取文字
    s = re.sub(r"!\[([^\]]*)\]\([^)]*\)", r"\1", s)       # 图片取 alt
    s = re.sub(r"[^\w\-]+", "-", s).strip("-").lower()
    if not s:
        s = "sec"
    base, n = s, 2
    while s in used:
        s = "%s-%d" % (base, n)
        n += 1
    used.add(s)
    return s


def _inline(text):
    """行内元素（输入是单段纯文本，输出 HTML）"""
    text = html.escape(text, quote=False)

    # 先把行内代码抠出来，避免里面的 * _ [ ] 被当成语法
    codes = []

    def stash(m):
        codes.append(m.group(1))
        return "\x00%d\x00" % (len(codes) - 1)

    text = re.sub(r"`([^`]+)`", stash, text)

    # 图片（必须在链接之前）；referrerpolicy 用于绕过部分图床的防盗链
    text = re.sub(
        r"!\[([^\]]*)\]\(([^)\s]+)\)",
        lambda m: '<img src="%s" alt="%s" referrerpolicy="no-referrer">' % (m.group(2), m.group(1)),
        text,
    )
    # 链接
    text = re.sub(
        r"\[([^\]]*)\]\(([^)\s]+)\)",
        lambda m: '<a href="%s">%s</a>' % (m.group(2), m.group(1)),
        text,
    )
    # 粗体 / 斜体（下划线只认词边界，避免 this_is_a_demo 被误判）
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![\w_])__([^_]+)__(?![\w_])", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"<em>\1</em>", text)
    text = re.sub(r"(?<![\w_])_([^_\n]+)_(?![\w_])", r"<em>\1</em>", text)

    # 还原行内代码
    text = re.sub(
        r"\x00(\d+)\x00",
        lambda m: "<code>%s</code>" % codes[int(m.group(1))],
        text,
    )
    # 单换行 -> <br>（对齐 marked 的 breaks:true）
    return text.replace("\n", "<br>")


def _split_row(line):
    line = line.strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|"):
        line = line[:-1]
    return [c.strip() for c in line.split("|")]


def _collect_list(lines, i, n):
    """从 lines[i] 开始收集整个列表块。

    返回 (entries, 下一个索引)，entries 为 [[缩进宽度, 是否有序, 文本], ...]。
    缩进的后续行并入上一项的文本（渲染时变成 <br>）；
    项与项之间的空行不打断列表（松散列表）。
    """
    entries = []
    cont = []
    while i < n:
        s = lines[i]
        m = _LIST_ITEM.match(s)
        if m:
            if cont:
                entries[-1][2] += "\n" + "\n".join(cont)
                cont = []
            entries.append([_indent_w(m.group(1)), m.group(2)[0].isdigit(), m.group(3)])
            i += 1
            continue
        if not s.strip():
            j = i + 1
            while j < n and not lines[j].strip():
                j += 1
            if j < n and _LIST_ITEM.match(lines[j]):
                i = j
                continue
            break
        if entries and s[:1] in (" ", "\t"):
            cont.append(s.strip())
            i += 1
            continue
        break
    if cont:
        entries[-1][2] += "\n" + "\n".join(cont)
    return entries, i


def _render_list(entries):
    """按缩进层级渲染成嵌套的 <ul> / <ol>"""
    out = []
    stack = []          # [{"indent":, "tag":, "open": bool}]

    for idx, (indent, ordered, text) in enumerate(entries):
        tag = "ol" if ordered else "ul"
        nxt = entries[idx + 1][0] if idx + 1 < len(entries) else -1

        # 关掉所有比当前更深的层级（连同承载它们的 <li>）
        while stack and stack[-1]["indent"] > indent:
            lvl = stack.pop()
            if lvl["open"]:
                out.append("</li>")
            out.append("</%s>" % lvl["tag"])

        if stack and stack[-1]["indent"] == indent:
            if stack[-1]["open"]:
                out.append("</li>")
                stack[-1]["open"] = False
            if stack[-1]["tag"] != tag:          # 同层但换了类型
                out.append("</%s>" % stack[-1]["tag"])
                stack.pop()

        if not stack:
            out.append("<%s>" % tag)
            stack.append({"indent": indent, "tag": tag, "open": False})
        elif indent > stack[-1]["indent"]:
            out.append("<%s>" % tag)
            stack.append({"indent": indent, "tag": tag, "open": False})

        out.append("<li>%s" % _inline(text))
        stack[-1]["open"] = True

        if nxt <= indent:                        # 没有子项，直接闭合
            out.append("</li>")
            stack[-1]["open"] = False

    while stack:
        lvl = stack.pop()
        if lvl["open"]:
            out.append("</li>")
        out.append("</%s>" % lvl["tag"])

    return "".join(out)


def render(md, _ids=None):
    """Markdown -> HTML（_ids 在整篇内共享，保证标题锚点不重复）"""
    if _ids is None:
        _ids = set()
    lines = md.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    out = []
    i, n = 0, len(lines)

    while i < n:
        line = lines[i]

        # 代码块
        m = _FENCE.match(line)
        if m:
            info = m.group(1).strip()          # 原始语言串，如 "Plain Text"
            _parts = info.split()
            lang = re.sub(r"[^\w+#.-]", "", _parts[0]) if _parts else ""
            i += 1
            buf = []
            while i < n and not _FENCE.match(lines[i]):
                buf.append(lines[i])
                i += 1
            i += 1  # 跳过结束的 ```
            code = html.escape("\n".join(buf))
            cls = ' class="language-%s"' % lang if lang else ""
            if info:
                # 有语言标注：在代码块上方加一条标签行
                out.append(
                    '<div class="code-block">'
                    '<div class="code-lang">%s</div>'
                    "<pre><code%s>%s</code></pre>"
                    "</div>" % (html.escape(info), cls, code)
                )
            else:
                out.append("<pre><code>%s</code></pre>" % code)
            continue

        # 标题（带锚点 id，供目录跳转）
        m = _HEADING.match(line)
        if m:
            lvl = len(m.group(1))
            raw = m.group(2).strip()
            out.append('<h%d id="%s">%s</h%d>' % (lvl, _slug(raw, _ids), _inline(raw), lvl))
            i += 1
            continue

        # 分割线
        if _HR.match(line):
            out.append("<hr>")
            i += 1
            continue

        # 引用（可多行）
        if _QUOTE.match(line):
            buf = []
            while i < n and _QUOTE.match(lines[i]):
                buf.append(re.sub(r"^\s*>\s?", "", lines[i]))
                i += 1
            out.append("<blockquote>\n%s\n</blockquote>" % render("\n".join(buf), _ids))
            continue

        # GFM 表格
        if "|" in line and i + 1 < n and _TABLE_SEP.match(lines[i + 1]):
            head = _split_row(line)
            i += 2
            rows = []
            while i < n and lines[i].strip() and "|" in lines[i]:
                rows.append(_split_row(lines[i]))
                i += 1
            th = "".join("<th>%s</th>" % _inline(c) for c in head)
            tb = "".join(
                "<tr>%s</tr>" % "".join("<td>%s</td>" % _inline(c) for c in r) for r in rows
            )
            out.append("<table><thead><tr>%s</tr></thead><tbody>%s</tbody></table>" % (th, tb))
            continue

        # 列表（支持缩进嵌套；有序/无序可混合）
        if _LIST_ITEM.match(line):
            entries, i = _collect_list(lines, i, n)
            out.append(_render_list(entries))
            continue

        # 空行
        if not line.strip():
            i += 1
            continue

        # 段落：吃到空行或下一个块级元素
        buf = []
        while i < n and lines[i].strip():
            nxt = lines[i]
            if buf and (
                _HEADING.match(nxt)
                or _FENCE.match(nxt)
                or _QUOTE.match(nxt)
                or _LIST_ITEM.match(nxt)
                or _HR.match(nxt)
            ):
                break
            buf.append(nxt)
            i += 1
        out.append("<p>%s</p>" % _inline("\n".join(buf)))

    return "\n".join(out)
