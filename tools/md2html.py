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

_FENCE = re.compile(r"^```\s*([\w+#.-]*)\s*$")
_HEADING = re.compile(r"^(#{1,6})\s+(.*)$")
_HR = re.compile(r"^\s*([-*_])\s*(\1\s*){2,}$")
_QUOTE = re.compile(r"^\s*>")
_UL = re.compile(r"^\s*[-*+]\s+")
_OL = re.compile(r"^\s*\d+\.\s+")
_TABLE_SEP = re.compile(r"^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$")


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


def render(md):
    """Markdown -> HTML"""
    lines = md.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    out = []
    i, n = 0, len(lines)

    while i < n:
        line = lines[i]

        # 代码块
        m = _FENCE.match(line)
        if m:
            lang = m.group(1)
            i += 1
            buf = []
            while i < n and not _FENCE.match(lines[i]):
                buf.append(lines[i])
                i += 1
            i += 1  # 跳过结束的 ```
            cls = ' class="language-%s"' % lang if lang else ""
            out.append("<pre><code%s>%s</code></pre>" % (cls, html.escape("\n".join(buf))))
            continue

        # 标题
        m = _HEADING.match(line)
        if m:
            lvl = len(m.group(1))
            out.append("<h%d>%s</h%d>" % (lvl, _inline(m.group(2).strip()), lvl))
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
            out.append("<blockquote>\n%s\n</blockquote>" % render("\n".join(buf)))
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

        # 列表（连续同类项）
        if _UL.match(line) or _OL.match(line):
            ordered = bool(_OL.match(line))
            pat = _OL if ordered else _UL
            items = []
            while i < n and pat.match(lines[i]):
                items.append(pat.sub("", lines[i]))
                i += 1
            tag = "ol" if ordered else "ul"
            out.append(
                "<%s>%s</%s>" % (tag, "".join("<li>%s</li>" % _inline(x) for x in items), tag)
            )
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
                or _UL.match(nxt)
                or _OL.match(nxt)
                or _HR.match(nxt)
            ):
                break
            buf.append(nxt)
            i += 1
        out.append("<p>%s</p>" % _inline("\n".join(buf)))

    return "\n".join(out)
