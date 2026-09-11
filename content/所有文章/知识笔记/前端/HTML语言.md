---
title: HTML语言
date: 2026-02-12
excerpt: HTML语言是一种浏览器标记语言 此文章较详细地记录了html的知识
---

# HTML语言

## **PART 0 前言**

该文章算是属于个人学习的笔记 可能在有些地方有误或不全 只是单纯记录学习过程

文章中有多次直接在当前页运行html代码 有些效果可能显示不成功
如果有人有兴趣可以自己复制html代码在浏览器运行看看

没有写出所有的html标签和属性 只写了常用的

## **PART 1 简述**

HTML是一种 **标签语言** 负责“绘制”网页  
标签的形态大多为 `<标签></标签>` 或 `<标签>`  
比如整个html文件的内容 实际上就是由 `<html></html>` 标签包裹起来的

标签就如同一本手册 浏览器通过手册中的内容“识别”网页开发者们写下的标签 将具有不同标签的内容渲染为不同的样式/功能  
在互联网发展之初 每个浏览器的“手册”都有一本自己的手册 导致了那时的网页编写需要为不同浏览器编写好几套代码 对于开发者与维护者来说非常的不友好  
于是后来出现了万维网联盟( _W3C_ )( _World Wild Web Consortium_ )来统一手册 而html与css就是由它们组织管理的

目前 html的标签种类由近百种 但事实上 平时常用的种类不过 20 多种  
html的编写对环境的要求几乎为0 只要有浏览器都可以跑 vscode只是方便编写 实际的运行还是要到浏览器中

## **PART 2 HTML的基本结构**

一个html文件的后缀名为 `.html` 一般来说 我们会将html文件命名为 `index.html`  
进入vscode 输入 `!` 或者 `html5` 再按下 `tab` 编译器就会帮助补全一个基本的html结构

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>

</body>
</html>
```

在这个结构中 我们见到了几个标签 `!DOCTYPE` `html` `head` `body` `meta` `title`  
同时我们发现 像 `<html lang="en"></html>` 它的左标签还拥有 `lang="en"` 这样 像给标签上补丁的一样的内容  
我们将标签内的“补丁”内容称为 属性

> 打个比方 浏览器就是一家 **公司** ,开发者则为 **求职者** ,开发者撰写的html文件为 **简历**  
> 当公司收到简历时 他首先看到的是 `<求职者>我是简历</求职者>` 这个标签 就可以知道它是来求职的  
> 但是这个标签只能说明它是来求职的 不能说明它是来求哪个岗位的职的 所以这份简历还打了补丁内容  
> `<求职者 岗位=渗透测试工程师>我是简历</求职者>` 标签内的补丁内容补充了求职者要应聘的岗位 使公司可以更好地理解这份简历  
> 也就是说 在标签中添加属性 可以让浏览器更好地理解你的html文件 渲染为开发者更希望的形态

### **PART 2.1 简单解释编译器补全的标签**

接下来我们来简单解释一下编译器补全后的结构代表的内容

- `<!DOCTYPE html>`  
  这个标签没有成对出现 是一个单标签  
  它的作用是告知浏览器 要用 **HTML5** 的标准去解析这个html文件  
  DOCTYPE 标签不区分大小写
  如果我们不想要用 **HTML5** 这个最新标准来解析 而是像使用以前的版本 我们可以更改这个标签的属性  
  简单列举几种html版本：  
  HTML 2.0 -1995年发布 是第一个正式的HTML版本  
  `<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML//EN">`  
  HTML 3.2 -1997年发布 增加了一些新的标签和特性  
  `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2//EN">`  
  HTML 5 -2014年发布 增加了很多新的标签和特性 包括音频、视频、画布、地理位置等  
  `<!DOCTYPE html>`

- `<html lang="en"></html>`  
  html标签内的内容会被浏览器解析渲染 我们也是在这个标签内编写网页内容  
  我们发现补全的标签拥有一个属性 `lang` 其实就是 **language** 设置语言  
  en就是英语  
  zh-CN就是简体中文（大陆）  
  zh-TW就是繁体中文（台湾）  
  zh-HK就是繁体中文（香港）  
  html标签中包含 `<head></head>` `<body></body>`两个标签

- `<head></head>`  
  头标签 引申一下其实就是思维  
  既然是思维 那么head中的内容就 **不会被浏览器渲染为可视化内容** 只是为浏览器提供“指导”

- `<title></title>`  
  标题 其实就是 **网页的名称**  
  默认的网页名称为 `Document`  
  假如我改写为`<title>我是标题</title>` 那么网页的名称就会变为 `我是标题`  
  我们只会设置一个title标签 如果这个网页是要通过(云)服务器上传到公网上的  
  那么title标签的内容决定了搜索引擎搜索时 是否推荐你的网页 所以如果是网页开发 title的编写还是需要斟酌一下的

- `<meta></meta>`  
  元数据 其实就是为浏览器提供解析的指导 可以编写多个  
  比如 `<meta charset="UTF-8">` 的属性 指导浏览器要通过 **UTF-8** 这个字符集(文件编码模式)来解析html文件  
  `<meta name="viewport" content="width=device-width, initial-scale=1.0">` 就是对视窗的设置(比如显示区域的缩放)  
  meta还可以设置网页的 关键字 和 描述信息 也是对于搜索引擎搜索到你的网页是有帮助的
  meta标签的内容对于初学者 或者 非网页开发者(只是来简单了解html) 并不需要细究

- `<body></body>`  
  体标签 区别于头标签 body的内容会被渲染为可视化内容  
  也就是说 网页呈现的形态结构基本都是在body标签内编写的

### **PART 2.2 补充标签**

- `<link>`  
  链接 用于引入文件 比如css文件 js文件

- `<style></style>`  
  样式 可以在内部直接编写css代码(内部css) 也可以通过src属性引入(外部css)

- `<script></script>`  
  脚本 可以在内部直接编写JavaScript代码(内部js) 也可以通过src引入(外部js)

## **PART 3 HTML常用标签**

### **PART 3.1 文字类标签**

简单地将常用的文字类标签分为 **文本结构类 文本修饰类 列表类 通用类 其他类**

#### **PART 3.1.1 文本结构类**

| 文本结构类  | 作用                | 效果(建议还是在html文件里自己去写去试) |
| ----------- | ------------------- | -------------------------------------- |
| `<h1></h1>` | 一级标题(Heading1)  | <h1>Heading1</h1>                      |
| `<h2></h2>` | 二级标题(Heading2)  | <h2>Heading2</h2>                      |
| `<h3></h3>` | 三级标题(Heading3)  | <h3>Heading3</h3>                      |
| `<h4></h4>` | 四级标题(Heading4)  | <h4>Heading4</h4>                      |
| `<h5></h5>` | 五级标题(Heading5)  | <h5>Heading5</h5>                      |
| `<h6></h6>` | 六级标题(Heading6)  | <h6>Heading6</h6>                      |
| `<p></p>`   | 段落标题(Paragraph) | <p>Paragraph</p>                       |

#### **PART 3.1.2 文本修饰类**

| 文本修饰类                  | 作用               | 效果                                |
| --------------------------- | ------------------ | ----------------------------------- |
| `<em></em>`                 | 强调(Emphasis)     | <em>Emphasis</em>                   |
| `<i></i>`                   | 斜体               | <i>斜体</i>                         |
| `<strong></strong>`         | 加粗(Strong)       | <strong>Strong</strong>             |
| `<b></b>`                   | 粗体               | <b>粗体</b>                         |
| `<u></u>`                   | 下划线(Underline)  | <u>Underline</u>                    |
| `<ins></ins>`               | 插入(Insert)       | <ins>Insert</ins>                   |
| `<del></del>`               | 删除(Delete)       | <del>Delete</del>                   |
| `<s></s>`                   | 删除线             | <s>删除线</s>                       |
| `<sup></sup>`               | 上标(Superscript)  | <sup>Superscript</sup>              |
| `<sub></sub>`               | 下标(Subscript)    | <sub>Subscript</sub>                |
| `<blockquote></blockquote>` | 长引用(Blockquote) | <blockquote>Blockquote</blockquote> |
| `<q></q>`                   | 短引用(Quote)      | <q>Quote</q>                        |

#### **PART 3.1.3 列表类**

`<ul><li></li></ul>`无序列表

```
<ul>
  <li> Unorder List 1 </li>
  <li> Unorder List 2 </li>
  <li> Unorder List 3 </li>
</ul>
```

效果：

<ul>
  <li> Unorder List 1 </li>
  <li> Unorder List 2 </li>
  <li> Unorder List 3 </li>
</ul>

`<ol><li></li></ol>`有序列表

```
<ol>
  <li> Order List 1 </li>
  <li> Order List 2 </li>
  <li> Order List 3 </li>
</ol>
```

效果：

<ol>
  <li> Order List 1 </li>
  <li> Order List 2 </li>
  <li> Order List 3 </li>
</ol>

#### **PART 3.1.4 通用类**

`<span></span>`  
这个标签本身没有特殊的渲染 与直接写文字无异  
它更多用来添加属性 类似于“自定义”标签的功能(主要用css)

事实上 所有的标签都可以用span来表示  
之所以设计这么多别的签 主要是为了开发友好 让html文件的可读性更强

#### **PART 3.1.5 其他类**

`<br>` 换行(Line Break)

```
我用来展示 Line Break<br>现在我换行了
```

效果：

我用来展示 Line Break<br>现在我换行了

`<hr>` 横线(Horizontal Rule)

```
<hr>
```

效果：

<hr>

`<!--  -->` 注释  
和其他语言一样 注释内的内容不会参与编译 可以使代码更具可读性  
html的注释可以通过`Ctrl+/`来快捷产生

### **PART 3.2 结构化标签**

首先我们要知道 绝大多数的html文件都是通过 **嵌套标签** 的方式来让网页变得更好管理的  
我们当然也可以选择不用任何嵌套 选择“平铺” 但这会大大增加我们的管理与维护成本  
所以 大多数的网页开发者都会选择“嵌套”的方式来“多层地打包”一个网页  
并且 在学习css时 实现高效的元素布局 结构上必须得是父子级关系
在后期学习js后 我们也会发现很多的调整都是通过“组”来调整 而非单一元素逐个调整

那么为了让嵌套更有体系 我们就离不开结构化标签  
结构化标签在没有进行样式的设置前 是没有任何可视的效果的(就是和直接输入文本一样) 它们只是方便可读的语义化的标签  
我们简单地将常用的结构化标签分为 **常规标签类 文章结构类 通用类**

#### **PART 3.2.1 常规标签类**

| 常规结构类标签      | 内容         | 作用                                                              |
| ------------------- | ------------ | ----------------------------------------------------------------- |
| `<header></header>` | 页面头部     | 表示页面或页面片段的页眉 通常包含网站的标志、导航链接和其他元素   |
| `<nav><nav>`        | 页面导航     | 表示导航链接的区域 通常包括主要的文章、产品列表或其他主要内容     |
| `<main><main>`      | 页面主要区域 | 表示页面的主要内容区域 通常包含主要的文章、产品列表或其他主要内容 |
| `<footer></footer>` | 页脚         | 表示页面或页面片段的页脚 通常包含版权信息、联系方式和其他元素     |

#### **PART 3.2.2 文章结构类**

| 文章结构类标签        | 内容              | 作用                                                                                 |
| --------------------- | ----------------- | ------------------------------------------------------------------------------------ |
| `<article></article>` | 文章/文字内容     | 表示独立的文章、博客帖子、评论或其他类似的内容块                                     |
| `<section></section>` | 文章/文档部分区块 | 表示文档中的一个通用区块 通常包含一组相关的内容 如章节、页脚或侧边栏                 |
| `<aside></aside>`     | 文章/文档附加区块 | 表述文档中的一个附加区块 通常包含与主要内容相关但不是必须的内容 如侧边栏、广告或引用 |

#### **PART 3.2.3 通用类**

`<div></div>`  
Division 类似于文本的span标签  
由于结构化标签不加入样式与普通文本没有任何变化  
所以一个网页可能顶多有个header main footer 其他都是大片大片的div

### **PART 3.3 媒体资源类标签**

在网页中 除了文字 还有 视频 图片 音频 等其他的 **媒体资源**  
这些媒体资源本质上都是文件 那么我们如果要展现这些文件 首先需要让网页能够访问到它们  
一般我们会选择用 **地址** 来访问文件资源

#### **PART 3.3.1 文件资源地址 **

我们访问文件资源的地址 一般是通过 `src` 这个属性来访问的

对于网络中的文件(以浏览器为例) 我们可以选择右键复制它的地址

以图片为例 图片的标签为 `img` 我们想让一个图片显示 就可以写:  
`<img src="复制的图片地址" >`

然而在真正网页开发中 其实更常见的方法是将图片存储在项目文件夹中  
这种用法中 src这个属性写的是 **文件的路径**
这里可以写绝对路径也可以写相对路径 这里以相对路径为例
举个例子 如果项目的文件排布为：

- srctest
  - index.html
  - photo.png

我们在index.html里就可以写 `<img src="photo.png" >`

如果项目的排布为

- srctest
  - index.html
  - photo
    - photo.png

我们在index.html里就可以写 `<img src="photo/photo.png" >`  
或者写 `<img src="./photo/photo.png" >`

> 这里的 `.` 指的是当前文件(即index.html)

如果项目的排布为

- srctest
  - HTML
    - index.html
  - photo
    - photo.png

我们在index.html里就可以写 `<img src="../photo/photo.png" >`

> 这里的 `..`指的是上级目录(即HTML)

#### **PART 3.3.2 图片**

我们访问的图片 后缀一般为以下几种:

| 后缀  | 特点                                                                          |
| ----- | ----------------------------------------------------------------------------- |
| .jpg  | 文件相对较小 有损压缩 不支持透明度                                            |
| .png  | 文件相对较大 无损压缩 支持透明度                                              |
| .gif  | 文件尺寸大 简单动态图形 色彩范围较窄 不适合复杂图像                           |
| .svg  | 矢量格式 无损任意缩放 支持动态效果 支持透明度 复杂图像文件尺寸偏大            |
| .webp | 支持透明度和动画 支持无损压缩和有损压缩 图片质量比jpg好 文件大小比png小(得多) |

访问图片我们一般使用的标签为 `img`  
除了刚刚提到的 **src** 属性外 它还有许多别的常用的属性

| 属性   | 效果                                     |
| ------ | ---------------------------------------- |
| alt    | 在图片访问失败时显示的文字               |
| title  | 将鼠标移到图片上时显示的文字             |
| width  | 设置图片的宽度                           |
| hight  | 设置图片的高度                           |
| srcset | 让高分辨率的屏幕可以显示更高分辨率的图片 |

> 一般 width 和 hight 这两个标签写一个即可 可以让图片以原比例增大/缩小  
> 都写的大小是遵从于写的数值的 很可能会让图片比例失调

#### **PART 3.3.3 视频**

视频的后缀一般有以下几种：

| 后缀  | 特点                                   |
| ----- | -------------------------------------- |
| .mp4  | 支持率高 文件相对较小 视频质量相对较高 |
| .webm | 支持率高 文件相对较小 视频质量相对较高 |
| .ogg  | 不咋样                                 |
| .avi  | 不咋样                                 |
| .mov  | 不咋样                                 |
| .fly  | 不咋样                                 |

> 视频文件其实是一种“容器” 容纳了两种数据 视觉数据和音频数据 二者其实是分开的

视频的标签为 `video` 写法为: `<video></video>`  
在视频标签中可以写文字 在浏览器不支持解析视频的时候会显示这段文字

视频也有很多常用的属性

| 属性     | 效果                                  |
| -------- | ------------------------------------- |
| width    | 设置视频的宽度                        |
| hight    | 设置视频的高度                        |
| volume   | 设置视频音量(范围为0~1)               |
| muted    | 视频静音                              |
| autopaly | 自动播放                              |
| loop     | 循环播放                              |
| controls | 视频显示控制按钮(暂停全屏 音量调节等) |
| poster   | 设置视频封面图片(写法和src一样)       |
| preload  | 预加载视频资源                        |

#### **PART 3.3.4 音频**

音频的后缀一般有以下几种：

| 后缀 | 特点                   |
| ---- | ---------------------- |
| .mp3 | 有损压缩 文件较小      |
| .wav | 无损 文件大 高质量音频 |
| .ogg | 不咋样                 |
| .aac | 不咋样                 |

音频的标签为 `audio` 写法为: `<audio></audio>`  
和视频标签一样 在标签中可以写文字 在浏览器不支持解析的时候会显示这段文字

音频一般常用的属性就是 `volume`

#### **PART 3.3.5 网页**

我们可以用 `iframe` 这个标签在页面中再嵌入网页  
写法为: `<iframe></iframe>`

常用的属性有

| 属性        | 效果                       |
| ----------- | -------------------------- |
| width       | 设置显示出的嵌入网页的宽度 |
| hight       | 设置显示出的嵌入网页的高度 |
| frameborder | 为嵌入的网页设置边框       |

> 嵌入的网页不是拉伸(缩放 放大)的 而是显示部分区域 条件宽高也是调整显示内容的大小

#### **PART 3.3.6 矢量图片**

我们在绘图软件中 可能用一些几何图形拼凑出一些图形  
某些绘图软件可以将这种图片复制/保存为 SVG  
在html中 我们可以用 `svg` 这个标签来显示这种图片 写法为: `<svg></svg>`

svg标签内写的是各个几何图形的数值 在绘图软件中保存的就是它  
它的原理其实是照着参数自己“画”了一个图片  
这样的好处是 页面的优化更好 避免的读取图片渲染的过程 而是直接用html“绘画”

并且 svg可以单独的写成一个文件(.svg) 就用svg标签的形式写 然后在.html文件中用img标签读取 也方便管理

常用的属性:

| 属性  | 效果           |
| ----- | -------------- |
| width | 设置图片的宽度 |
| hight | 设置图片的高度 |

#### **PART 3.3.7 画布**

使用的标签是 `canvas` 写法为 `<canvas></canvas>`

默认是不可见的一部分区域 在做动画的时候非常好用(玩PPT的会知道)  
在学了js后才会经常操作他

### **PART 3.4 页面跳转标签**

一般使用的是 `a`标签 写法为: `<a></a>`

几乎必写的属性为 `href` 值为地址或路径(和src相同)  
只要点击a标签中的内容就会跳转到别的页面

> 之所以建议把html命名为 index.html 是因为如果a标签读取的是文件夹  
> 它会自动访问名称为 index.html 的文件 不用写繁杂的路径 让代码更简洁

a标签常用的属性

- target  
  有几个参数：  
  \_self(默认): 在当前页面打开  
  \_blank: 在新标签页打开
  \_top: 和iframe一起使用 打开当前页面在iframe框架中最顶层的页面
  \_parent: 和iframe一起使用 打开当前页面在iframe框架中上层的页面

还有一个属性 结合a标签很好用 可以实现页面某个区段的跳转

这里用到的属性为 id 很多元素都可以设置id这个属性 但id的值必须是唯一的

假设我的页面由四个使用 `<img>` 的图片构成  
它们的id分别设置为 1 2 3 4

我们可以通过为a标签的herf属性设置为 #1 #2 #3 #4  
来分别将页面跳转到相应的图片的位置

> 形如`#xxx`的地址叫做锚地址

这个方法适合去写 位于一个页面的长文章 为他配备目录 等场景

### **PART 3.5 表单相关标签**

表单(Form)  
填写资料 填写数据等页面 都是通过表单及其元素实现的  
也就是说表单是用来让用户输入数据并与服务器发生交互的  
所以真正要让表单用起来 是需要通过js打交道的

表单的标签为 `form` 写法为: `<form></form>`

先来看看form内大概涉及到哪些标签

| 标签                         | 用途         |
| ---------------------------- | ------------ |
| `input` `textarea`           | 输入或者选择 |
| `select` `option` `optgroup` | 下拉列表     |
| `filedset` `legend`          | 做结构       |
| `button`                     | 按钮         |
| `label`                      | 绑定         |

#### **PART 3.5.1 输入或选择**

`input` 写法为: `<input>`

input 的一个相当重要的属性为 `type`  
列举一些 type 的参数

| 参数       | 效果                            |
| ---------- | ------------------------------- |
| text(默认) | 用于文本输入                    |
| range      | 范围                            |
| password   | 用于密码输入 输入的字符会被隐藏 |
| email      | 用于电子邮箱地址输入            |
| number     | 用于数字输入                    |
| date       | 用于日期选择                    |
| time       | 用于时间选择                    |
| checkbox   | 用于多选框                      |
| radio      | 用于单选框                      |
| file       | 用于文件上传                    |
| submit     | 用于提交表单数据                |
| reset      | 用于清除表单数据                |
| button     | 用于按钮                        |

简单列举几例

```
<input type="text"><br>
<input type="password"><br>
<input type="radio"><br>
```

<input type="text"><br>
<input type="password"><br>
<input type="radio"><br>

然后是 `name` 和 `value` 这两个属性  
我们输入框中输入的数据 可以理解为赋值给了以 name 这个属性的内容为名的变量 也就是说 name 相当于数据的名称  
而 value 相当于输入后的值为什么

> 在类似文本这种非选择输入时 value设置是非必须的 设置的 value 为初始值 用户输入可以将其覆盖

> 在实现单选的输入框中 我们可以通过给不同选项的input标签
> 设置同一个name 不同的value
> 以此来实现单选

剩下的input的属性就简单列一下了

| 属性        | 效果                                      |
| ----------- | ----------------------------------------- |
| placeholder | 提供 输入字段的简短描述或示例             |
| required    | 指定输入字段是否为必填项                  |
| disabled    | 禁止输入字符 使其无法编辑或选择           |
| readonly    | 将输入字段设置为只读 用户无法编辑但可查看 |
| maxlength   | 限制输入字段的最大字符数                  |
| min         | 设置数字输入字段的最小值                  |
| max         | 设置数字输入字段的最大值                  |
| pattern     | 使用正则表达式指定输入字段的验证规则      |

在做选择类输入的时候 有的时候不想点那个圆圈 想要点击前面的文本也能生效  
我们可以通过 `label` 这个标签将文字与输入圈绑定

```
<label for="icent">你是icent吗?</label><input id="icent" type="radio">
<!-- 这里的 id 要对应 label 的 for -->
```

效果：

<label for="icent">你是icent吗?</label><input id="icent" type="radio">

然后是 `textarea` 这个标签 也可以实现用户的输入  
相较于 input 它适合多行输入 且不需要设置value

textarea的文本框在网页上默认是可以进行拉伸的

简单列一下属性

| 属性        | 效果                                      |
| ----------- | ----------------------------------------- |
| name        | 同上                                      |
| cols        | 列数                                      |
| rows        | 行数                                      |
| readonly    | 将输入字段设置为只读 用户无法编辑但可查看 |
| disabled    | 禁止输入字符 使其无法编辑或选择           |
| placeholder | 提供 输入字段的简短描述或示例             |
| maxlength   | 限制输入字段的最大字符数                  |
| required    | 指定输入字段是否为必填项                  |

输入的场景也不是只能通过 input 和 textarea 来实现  
也可以通过给各种标签添加 `contenteditable` 这个属性来实现

#### **PART 3.5.2 下拉列表**

必须是组合式的用法 先看 `select`  
用代码实例来看好了

```
<select name="MySelect">
  <option value="option1">选项一</option>
  <option value="option2">选项二</option>
  <option value="option3">选项三</option>
</select>
```

效果：

<select name="MySelect">
  <option value="option1">选项一</option>
  <option value="option2">选项二</option>
  <option value="option3">选项三</option>
</select>

我们还可以通过 `optgroup`进行接着分组

```
<select name="MySelect">
  <optgrpup label="组一">
    <option value="option1">选项一</option>
    <option value="option2">选项二</option>
  </optgrpup>
  <optgrpup label="组二">
    <option value="option3">选项三</option>
    <option value="option4">选项四</option>
  </optgrpup>
</select>
```

效果:

<select name="MySelect">
  <optgrpup label="组一">
    <option value="option1">选项一</option>
    <option value="option2">选项二</option>
  </optgrpup>
  <optgrpup label="组二">
    <option value="option3">选项三</option>
    <option value="option4">选项四</option>
  </optgrpup>
</select>

用 input标签 配合 list标签 其实也可以达到类似的效果

```
<input list="MySelect">
<datalist id="MySelect">
  <!-- id要对应list的值 -->
  <option value="选项一">
  <option value="选项二">
  <option value="选项三">
</datalist>
```

效果:

<input list="MySelect">
<datalist id="MySelect">
  <option value="选项一">
  <option value="选项二">
  <option value="选项三">
</datalist>

#### **PART 3.5.3 表单结构**

在创建网页的适合 一般所有的表单都会写在 `<form></form>`中

form有两个比较重要的属性 `method` 和 `action`  
method 设置的是发送请求的方法 比如GET POST  
action 设置的是一个地址或路径 用于将填写的表单数据发送到这个地址

一般来说 发送地址这个行为需要一个动作来作为信号 常用的就是用按钮  
按钮的标签为 `button`

```
<button>submit</button>
```

效果:

<button>submit</button>

button的属性一般用type 列举一下type的参数

| 参数         | 效果                     |
| ------------ | ------------------------ |
| submit(默认) | 将表单数据提交给服务器   |
| reset        | 重置表单所有组件为初始值 |
| button       | 此按钮没有默认行为       |

我们可以用`<filedset></filedset>`在 form 中划分“区块”  
`<legend></legend>`来设置这个区块的名称 比如：

```
<form>
  <filedset>
    <legend>区块一</legend>
    我是表单内容
  </filedset>

  <filedset>
    <legend>区块二</legend>
    我是表单内容
  </filedset>

  <filedset>
    <legend>区块三</legend>
    我是表单内容
  </filedset>
</form>
```

效果：

<form>
  <filedset>
    <legend>区块一</legend>
    我是表单内容
  </filedset>

  <filedset>
    <legend>区块二</legend>
    我是表单内容
  </filedset>

  <filedset>
    <legend>区块三</legend>
    我是表单内容
  </filedset>
</form>

### **PART 3.6 表格相关标签**

一般来说不太常用 但还是写一点吧

表格内容一般都包含在`<table></table>`之间(参考form)  
在 table标签 内我们还可以包含表格相关的标签

| 标签    | 效果                 |
| ------- | -------------------- |
| caption | 表格标题             |
| thead   | 表头                 |
| tbody   | 表体                 |
| tr      | 单行                 |
| th      | 表头单列的标题       |
| td      | 表体单个单元格的内容 |

然后还有些td的属性  
`rowspan` 和 `colspan` 可以跨行跨列

简单用一下好了

```
<table>
  <caption>表格标题</caption>
  <thead>
    <tr>
      <th>标题一</th>
      <th>标题二</th>
      <th>标题三</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">内容一</td>
      <td>内容二</td>
      <td >内容三</td>
    </tr>
    <tr>
      <td>内容四</td>
      <td>内容五</td>
    </tr>
    <tr>
      <td>内容六</td>
      <td>内容七</td>
      <td>内容八</td>
    </tr>
  </tbody>
</table>
```

效果：

<table>
  <caption>表格标题</caption>
  <thead>
    <tr>
      <th>标题一</th>
      <th>标题二</th>
      <th>标题三</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">内容一</td>
      <td>内容二</td>
      <td >内容三</td>
    </tr>
    <tr>
      <td>内容四</td>
      <td>内容五</td>
    </tr>
    <tr>
      <td>内容六</td>
      <td>内容七</td>
      <td>内容八</td>
    </tr>
  </tbody>
</table>

### **PART 3.7 页面焦点**

当你将鼠标移到一个元素上 比如输入框 点击  
你会发现输入框出现了一个闪动的 `|` 类似这样的状态称为焦点

我们按下 `tab` 可以切换至下一个焦点 `shift` + `tab` 可以切换至下一个焦点

在一个页面中 同时只能存在一个焦点 且不是所有的标签都可以成为焦点  
能让元素成为焦点的标签有:

- a
- button
- input
- select
- textarea
- iframe(tab键无法获得 需要鼠标去点)
- contenteditable属性 为 true 的标签(tab键无法获得 需要鼠标去点)

为标签设置 autofocus 这个属性 可以让页面自动以该元素为焦点  
`<input type="text" autofocus>`  
而为标签设置 tabindex 属性 可以决定按下tab键时焦点切换的顺序  
序数越小优先级越高

写法参考：

```
<input type="text" autofocus tabindex="1">
<input type="text" tabindex="5">
<input type="text" tabindex="4">
<input type="text" tabindex="3">
<input type="text" tabindex="2">
```

由于这个涉及到焦点的转换 就不把效果拿出来了

## **PART 4 零碎知识补充**

### **PART 4.1 实体符号**

我们可以用 **实体符号** 来表示一些特殊符号 浏览器会识别它们  
这里只罗列 还是以查找为主 不要死背

| 实体符号   | 对应符号     | 效果     |
| ---------- | ------------ | -------- |
| `&amp;`    | 和符号       | &amp;    |
| `&lt;`     | 小于符号     | &lt;     |
| `&gt;`     | 大于符号     | &gt;     |
| `&quot;`   | 双引号       | &quot;   |
| `&apos;`   | 单引号       | &apos;   |
| `&nbsp;`   | 非断行空格   | &nbsp;   |
| `&copy;`   | 版权符号     | &copy;   |
| `&reg;`    | 注册商标符号 | &reg;    |
| `&trade;`  | 商标符号     | &trade;  |
| `&euro;`   | 欧元符号     | &euro;   |
| `&pound;`  | 英镑符号     | &pound;  |
| `&yen;`    | 中元符号     | &yen;    |
| `&cent;`   | 分符号       | &cent;   |
| `&dollar;` | 美元符号     | &dollar; |
| `&sect;`   | 小节符号     | &sect;   |
| `&deg;`    | 度符号       | &deg;    |
| `&plusmn;` | 正负号       | &plusmn; |
| `&times;`  | 乘号         | &times;  |
| `&divide;` | 除号         | &divide; |

### **PART 4.2 网页图标**

就是在浏览器最上面一栏中 网页标题左侧的小图标

准备一个 1:1 的图片 然后运用于一些转化工具把它转为ICO格式  
[这里提供一个](https://www.icoconverter.com/)

一般用于网页图标的话 会选择 16 或者 32 分辨率的  
位深度上 32位 有透明通道 颜色相比 8位 要更丰富 按需选择即可

获取.ico文件后 把文放入项目文件夹中 并且位置上与相应html文件平级  
命名为 `favicon.ico`

> 测试的时候可能会发现刷新了页面 图标依旧没有显示  
> 这是缓存的原因 只需要清除浏览器的缓存即可

也可以在 `<header></header>` 中使用 `<link>` 来引入图标
