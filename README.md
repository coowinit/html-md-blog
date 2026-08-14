# HTML MD Blog

一个基于 **HTML + Markdown** 的极简单页博客。

项目采用：

- **HTML**：维护文章索引与页面骨架
- **Markdown**：保存文章正文
- **CSS**：负责页面样式与 Markdown 阅读体验
- **JavaScript**：负责文章列表渲染、Markdown 读取与全屏 Drawer 交互
- **Marked**：本地解析 Markdown，不依赖外部 CDN

项目不使用数据库、不使用后台系统、不使用 Node.js 构建流程，也不依赖 GitHub Actions 自动生成页面。

> 核心目标不是“功能越多越好”，而是让一个几十篇到上百篇文章的个人博客，在几年以后重新打开仓库时，仍然能一眼看懂、马上会改。

当前版本：`v1.0.0`

---

## 1. 核心架构

整个项目只保留四个明确职责：

```text
HTML       → 文章索引 / 页面骨架
Markdown   → 文章正文
CSS        → 页面样式 / Markdown 阅读排版
JavaScript → 页面行为 / Markdown 解析与 Drawer 交互
```

日常真正需要维护的只有：

```text
index.html
articles/*.md
```

页面结构与阅读样式稳定以后：

```text
css/style.css
js/app.js
js/marked.umd.js
```

都应该尽量保持不变。

这也是本项目最重要的维护原则：

> **内容变化只改内容；与内容无关的逻辑统一放到外部 CSS / JavaScript 中。**

---

## 2. 为什么采用这种结构

这个项目最终没有采用：

```text
Jekyll
build.mjs
npm
package.json
JSON 文章索引
GitHub Actions workflow
静态站生成器
```

这些方案可以实现更多自动化，但对于几十篇到上百篇文章的个人博客来说，也会增加额外概念和维护步骤。

本项目选择更直接的流程：

```text
index.html 维护文章索引
        ↓
点击文章
        ↓
app.js 读取对应 Markdown
        ↓
本地 marked.umd.js
        ↓
Markdown → HTML
        ↓
全屏 Drawer 展示正文
```

这种方式牺牲了一点“自动发现文章”的能力，但换来了更重要的优势：

- 不需要构建
- 不需要记命令
- 不需要安装 Node.js
- 不需要维护 JSON
- 不需要 GitHub Actions
- 不依赖外部 Markdown CDN
- 打开 `index.html` 就能看到文章数据
- 很久以后重新维护，也容易快速恢复思路

对于个人长期项目，**可理解性、透明度和维护稳定性优先于自动化程度。**

---

## 3. 目录结构

```text
html-md-blog/
├── index.html
├── README.md
├── .nojekyll
│
├── articles/
│   ├── 001.md
│   ├── 002.md
│   ├── 003.md
│   └── 004.md
│
├── css/
│   └── style.css
│
└── js/
    ├── marked.umd.js
    └── app.js
```

### 文件职责

| 文件 | 日常修改 | 作用 |
|---|---:|---|
| `index.html` | 是 | 维护文章文件名、日期、标题，以及页面基础结构 |
| `articles/*.md` | 是 | 保存文章正文 |
| `css/style.css` | 通常否 | 首页、Drawer、Markdown Typography、响应式 |
| `js/app.js` | 通常否 | 生成列表、读取 Markdown、打开/关闭 Drawer |
| `js/marked.umd.js` | 否 | 本地 Markdown 解析库 |
| `.nojekyll` | 否 | GitHub Pages 按普通静态文件发布 |
| `README.md` | 偶尔 | 项目说明和维护规范 |

---

## 4. Marked 已本地化

项目不再通过 CDN 加载 Marked。

当前直接使用仓库内的：

```text
js/marked.umd.js
```

`index.html` 中的引用方式：

```html
<script src="js/marked.umd.js"></script>
<script src="js/app.js"></script>
```

加载顺序必须保持：

```text
marked.umd.js
      ↓
app.js
```

因为 `app.js` 中会使用：

```javascript
marked.parse(...)
```

### 本地化的好处

- 不依赖 jsDelivr 等第三方 CDN
- 断网环境下仍可本地预览
- GitHub Pages 运行更独立
- 固定当前可用版本，避免外部升级影响
- 整个项目真正做到自包含
- 后期维护时不需要检查外部资源是否失效

如果当前版本运行稳定，**没有必要频繁升级 Marked**。

---

## 5. 文章索引：只在 index.html 维护

文章数据直接写在 `index.html`：

```javascript
window.BLOG_POSTS = [
  {
    file: "004.md",
    date: "2026-08-14",
    title: "后期如何新增一篇文章"
  },
  {
    file: "003.md",
    date: "2026-08-14",
    title: "Markdown 排版样式完整测试"
  },
  {
    file: "002.md",
    date: "2026-08-13",
    title: "为什么使用全屏右侧抽屉阅读"
  }
];
```

每篇文章只维护三个字段：

```text
file   = Markdown 文件名
date   = 页面显示日期
title  = 首页和 Drawer 的文章主标题
```

没有分类、标签、摘要、封面、作者等额外字段。

### 为什么文章数组写在 HTML

文章数组属于“日常内容配置”，不是程序逻辑。

把它放在 `index.html` 有几个实际好处：

- 打开首页文件就能看到所有文章记录
- 新增文章只需要复制一条对象
- 不必进入复杂 JavaScript 文件寻找配置
- `app.js` 可以长期冻结
- 更容易理解和记住维护位置

因此本项目固定采用：

> **文章数据写在 HTML，程序逻辑写在外部 JavaScript。**

---

## 6. Markdown 文件规则

文章统一使用三位数字编号：

```text
001.md
002.md
003.md
...
099.md
100.md
```

建议把编号看成文章的永久 ID。

例如：

```text
articles/027.md
```

以后即使修改标题、日期或正文，也尽量不要修改 `027.md` 这个文件名。

如果删除文章，也不需要重新整理后面的编号：

```text
016.md
017.md
019.md
020.md
```

编号存在空缺没有问题。

---

## 7. Markdown 正文没有结构限制

这是当前版本非常重要的一条规则：

> **Markdown 只负责正文，不负责博客元数据。**

因此不要求：

```text
第一行必须是 H1
必须有标题
必须有日期
必须写 Front Matter
必须使用固定章节结构
```

下面几种开头都可以正常使用。

### 普通正文开头

```markdown
这里直接开始正文。

## 第一部分

正文内容。
```

### H1 开头

```markdown
# 正文中的一级标题

正文内容。
```

### H2 开头

```markdown
## 项目背景

正文内容。
```

博客真正的文章标题始终来自 `index.html`：

```javascript
title: "文章标题"
```

Markdown 内部的 H1、H2、H3 只是正文层级，与首页文章标题互不依赖。

---

## 8. 新增文章：最终维护流程

假设目前最后一篇是：

```text
articles/004.md
```

### 第一步：新增 Markdown

创建：

```text
articles/005.md
```

直接写正文即可：

```markdown
这是一篇新的文章。

## 第一部分

正文内容。
```

### 第二步：修改 index.html

找到：

```javascript
window.BLOG_POSTS = [
```

增加：

```javascript
{
  file: "005.md",
  date: "2026-08-15",
  title: "我的新文章"
},
```

完成。

正常情况下不需要修改：

```text
css/style.css
js/app.js
js/marked.umd.js
.nojekyll
```

也不需要执行任何构建命令。

### 页面排序

数组中的顺序就是首页显示顺序。

```javascript
window.BLOG_POSTS = [
  { file: "005.md", ... },
  { file: "004.md", ... },
  { file: "003.md", ... }
];
```

首页就显示：

```text
005
004
003
```

JavaScript 不再额外自动排序，让维护结果始终直观可见。

---

## 9. 修改和删除文章

### 只修改正文

直接修改：

```text
articles/003.md
```

### 修改文章标题或日期

修改 `index.html` 中对应记录：

```javascript
{
  file: "003.md",
  date: "2026-08-14",
  title: "新的文章标题"
}
```

Markdown 正文不需要同步修改 H1。

### 删除文章

例如删除 `018.md`：

1. 删除 `articles/018.md`
2. 删除 `index.html` 中对应记录

其他 Markdown 不需要重新编号。

---

## 10. JavaScript 的职责

`js/app.js` 与具体文章内容无关，正常情况下写好后长期不需要修改。

核心流程：

```text
读取 BLOG_POSTS
      ↓
生成首页文章列表
      ↓
点击文章
      ↓
fetch articles/NNN.md
      ↓
marked.parse()
      ↓
Markdown → HTML
      ↓
打开全屏 Drawer
```

当前 `app.js` 还负责：

- Drawer 从右侧全屏滑入
- 右上角关闭按钮
- `ESC` 关闭文章
- 阅读时锁定背景滚动
- 关闭后恢复原文章列表位置
- Markdown 请求减少缓存影响
- 外部链接处理
- 表格横向滚动增强
- Markdown 读取失败提示

这些都是通用逻辑，因此统一放在 `app.js` 复用，而不随着文章更新反复修改。

---

## 11. Markdown 阅读排版

文章详情页使用完整的 `.markdown-body` Typography 系统，重点适配常见 Markdown 与技术文档格式：

```text
H1 ～ H6
段落
粗体 / 斜体 / 删除线
链接 / 长 URL
无序列表 / 有序列表
多层嵌套列表
任务列表
Blockquote
行内代码
代码块
表格
分割线
图片
kbd
mark
sub / sup
details / summary
dl / dt / dd
video / audio / iframe
```

### Compact Typography

当前版本采用紧凑阅读排版，兼顾：

- 长时间阅读
- 技术文档
- 代码展示
- 表格展示
- 长截图备份
- 手机端浏览

正文最大宽度：

```css
--reader-width: 820px;
```

桌面端：

```css
--body-size: 16px;
--body-line: 1.6;
```

手机端：

```css
--body-size: 16px;
--body-line: 1.65;
```

排版原则：

- 标题层级明确，但避免过大的字号
- 段落紧凑但不拥挤
- 代码块不强制换行，超宽内容横向滚动
- 表格在手机端可横向滑动
- 长链接不会撑破正文
- 引用使用轻量左边线
- 首页与文章页保持白、黑、灰为主的简洁风格
- 控制纵向留白，方便整页截图和长期归档

`articles/003.md` 可作为 Markdown Typography 测试文章。

以后如果修改 CSS，优先使用它检查各种 Markdown 格式。

---

## 12. 推荐维护方式：直接通过 GitHub 网页更新

本项目后期维护的**首选方式不是 GitHub Desktop，也不是本地构建**，而是直接通过 GitHub 仓库网页完成。

因为日常更新通常只涉及：

```text
index.html
articles/*.md
```

这两个位置都可以直接在 GitHub 网页中创建、编辑并提交。

因此，即使更换电脑或没有配置本地开发环境，也可以继续维护博客。

---

### 12.1 新增一篇文章

假设目前最后一篇是：

```text
articles/004.md
```

准备新增：

```text
articles/005.md
```

#### 第一步：在 GitHub 网页创建 Markdown

进入仓库：

```text
html-md-blog
```

打开：

```text
articles/
```

点击：

```text
Add file
→ Create new file
```

文件名填写：

```text
005.md
```

然后直接粘贴 Markdown 正文。

例如：

```markdown
这是一篇新的文章。

## 第一部分

正文内容。
```

填写 Commit 信息后提交即可。

---

### 12.2 更新 index.html 的文章索引

回到仓库根目录，打开：

```text
index.html
```

点击编辑按钮，找到：

```javascript
window.BLOG_POSTS = [
```

在数组顶部增加：

```javascript
{
  file: "005.md",
  date: "2026-08-15",
  title: "我的新文章"
},
```

然后：

```text
Commit changes
```

完成。

整个新增文章流程实际上只有：

```text
创建 articles/005.md
        +
修改 index.html
        ↓
提交 GitHub
        ↓
完成
```

不需要下载仓库，也不需要运行任何命令。

---

### 12.3 修改已有文章正文

例如需要修改：

```text
articles/018.md
```

直接在 GitHub 仓库中：

```text
articles/
→ 018.md
→ Edit
→ 修改 Markdown
→ Commit changes
```

即可。

如果只是修改正文：

> **不需要修改 `index.html`。**

---

### 12.4 修改标题或日期

如果只是修改文章：

```text
标题
日期
```

打开：

```text
index.html
```

找到对应记录：

```javascript
{
  file: "018.md",
  date: "2026-08-14",
  title: "原文章标题"
}
```

直接修改：

```javascript
{
  file: "018.md",
  date: "2026-08-15",
  title: "新的文章标题"
}
```

然后提交。

Markdown 正文可以完全不动。

---

### 12.5 删除文章

例如删除：

```text
018.md
```

需要做两件事：

```text
1. 删除 articles/018.md
2. 删除 index.html 中对应的文章记录
```

其他文章不需要重新编号。

---

### 12.6 直接上传本地写好的 Markdown

如果文章已经在电脑上写好，也可以进入：

```text
articles/
```

然后：

```text
Add file
→ Upload files
```

直接上传：

```text
019.md
```

上传后再编辑 `index.html` 增加对应记录即可。

---

## 13. GitHub 网页更新 vs 本地 / GitHub Desktop

对于本项目，**GitHub 网页维护是默认推荐方式**。

| 对比项 | GitHub 网页直接更新 | 本地 / GitHub Desktop |
|---|---|---|
| 是否需要下载仓库 | 否 | 是 |
| 是否需要安装 GitHub Desktop | 否 | 通常需要 |
| 是否需要同步 Pull / Push | 否 | 是 |
| 新增 Markdown | 很方便 | 很方便 |
| 修改 index.html | 很方便 | 很方便 |
| 少量文章更新 | **最适合** | 略显繁琐 |
| 多文件批量修改 | 一般 | **更方便** |
| CSS / JS 大规模开发 | 一般 | **更方便** |
| 本地实时预览 | 不支持 | **支持** |
| 更换电脑后的维护 | **非常方便** | 需要重新配置 |
| 学习和记忆成本 | **低** | 中 |
| 本项目推荐级别 | **★★★★★** | ★★★ |

### 推荐原则

日常内容维护：

```text
GitHub 网页
```

优先。

只有在下面这些情况时，再考虑本地或 GitHub Desktop：

```text
修改大量 CSS
修改 app.js
一次调整很多文件
需要反复使用 Live Server 调试
准备进行较大版本升级
```

也就是说：

> **内容维护用 GitHub 网页，程序开发才需要回到本地。**

---

## 14. 当前方案 vs Build / Workflow 方案

项目早期曾考虑过：

```text
Markdown
→ build.mjs
→ GitHub Actions
→ 自动生成文章列表和页面
```

最终没有采用，而是确定为现在的：

```text
Markdown 正文
+
index.html 文章数组
+
浏览器运行时加载 Markdown
```

两种方案的主要区别：

| 项目 | 当前 HTML 数组方案 | Build / Workflow 方案 |
|---|---:|---:|
| Markdown | ✅ | ✅ |
| index.html 手工维护文章索引 | ✅ | ❌ |
| 自动发现新文章 | ❌ | ✅ |
| build.mjs | ❌ | ✅ |
| Node.js | ❌ | ✅ |
| package.json | ❌ | ✅ |
| GitHub Actions | ❌ | ✅ |
| 生成 dist | ❌ | 通常需要 |
| GitHub 网页直接维护 | **非常适合** | 不够直观 |
| 本地构建命令 | **不需要** | 需要或由 Actions 执行 |
| 文章列表控制 | **数组顺序直接决定** | 依赖构建规则 |
| 架构理解成本 | **低** | 中 |
| 长期维护透明度 | **高** | 中 |
| 几十～上百篇文章 | **非常适合** | 也适合 |
| 大型自动化内容站 | 一般 | **更适合** |

### 为什么最终选择当前方案

Build 方案最大的优势是：

```text
只新增 Markdown
→ 系统自动发现
→ 自动生成文章列表
```

但对于 `html-md-blog` 来说，预计文章数量只有几十篇到上百篇。

手工在 `index.html` 增加：

```javascript
{
  file: "028.md",
  date: "2026-08-20",
  title: "文章标题"
}
```

成本非常低。

而它换来的优势是：

```text
没有构建
没有 npm
没有 workflow
没有额外索引文件
没有隐藏生成过程
GitHub 网页即可维护
```

因此本项目最终选择：

> **少一点自动化，换取更高的可理解性、更低的维护成本和更好的长期可控性。**

---

## 15. 本地预览：作为可选开发方式

日常新增或修改文章时，可以直接通过 GitHub 网页完成，不要求本地预览。

如果需要修改：

```text
css/style.css
js/app.js
index.html 页面结构
Markdown Typography
```

或者需要对页面进行较大的视觉调整，则推荐在本地使用 VS Code + Live Server。

页面需要通过 JavaScript `fetch()` 读取 Markdown，因此不建议直接双击 `index.html` 使用 `file://` 预览。

推荐：

```text
index.html
→ 右键
→ Open with Live Server
```

因为 Marked 已经本地化：

```text
js/marked.umd.js
```

所以本地预览不依赖外部 Markdown CDN。

本项目不需要：

```text
npm install
npm run build
node build.mjs
```

---

## 16. GitHub Pages

推荐仓库名：

```text
html-md-blog
```

项目本质上只是：

```text
HTML
CSS
JavaScript
Markdown
```

因此非常适合直接部署到 GitHub Pages。

`.nojekyll` 建议保留，它不需要日常维护。

GitHub Pages 部署完成后，日常通过 GitHub 网页提交：

```text
index.html
articles/*.md
```

即可持续更新博客页面。

---

## 17. 长期维护策略

项目后期应逐渐从“开发项目”转变成“内容仓库”。

### 高频修改

```text
index.html
articles/*.md
```

### 偶尔修改

```text
README.md
```

### 页面定型后尽量冻结

```text
css/style.css
js/app.js
js/marked.umd.js
.nojekyll
```

如果只是新增文章，不要顺手修改程序结构。

如果只是修改正文，不要修改 JavaScript。

如果只是修改文章标题，不要去改 Markdown 结构。

让每一种变化都只影响自己负责的文件，这样项目才能长期稳定。

---

## 18. 这套结构可以复用到其他项目

`html-md-blog` 不只是一个博客示例，它更重要的是形成了一套轻量内容项目的通用结构：

```text
HTML         = 数据入口 / 页面骨架
Markdown     = 内容
CSS          = 视觉
JavaScript   = 行为
GitHub       = 版本管理
GitHub Pages = 静态发布
```

它同样适合：

- 个人技术笔记
- 项目知识库
- 学习记录
- 教程目录
- AI 研究资料库
- Markdown 文档阅读器
- 产品资料页
- 内部说明文档
- GitHub Pages 文档站

只要项目满足：

```text
内容数量有限
主要由个人维护
正文适合 Markdown
不需要数据库
不需要复杂后台
重视长期可维护性
```

就可以优先考虑这种架构。

---

## 19. 最终操作口诀

以后新增一篇文章，只需要记住：

```text
GitHub 网页
   ↓
新增 articles/NNN.md
        +
编辑 index.html
增加 file / date / title
   ↓
Commit changes
   ↓
完成
```

本地 Live Server 主要留给 CSS / JS / 页面结构开发，并不是日常发布文章的必需步骤。

例如：

```text
articles/028.md
```

然后：

```javascript
{
  file: "028.md",
  date: "2026-08-20",
  title: "新的文章标题"
},
```

除此之外，正常情况下不需要修改其他代码。

---

## 20. 项目总结

`html-md-blog` 的重点不是做一个功能很多的博客，而是建立一种可以长期坚持的内容维护方式：

> **用最少的规则，让 HTML、Markdown、CSS 和 JavaScript 各自只负责自己最擅长的事情。**

当页面样式和交互稳定以后，后期维护博客应该主要是在持续增加 Markdown 内容，而不是持续开发博客程序。

同时，通过把 `marked.umd.js` 保存到本地，整个项目进一步减少了外部运行依赖，更适合长期保存、迁移和维护。
