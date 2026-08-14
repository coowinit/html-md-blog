# HTML MD Blog

一个面向个人长期维护的极简单页博客。

项目采用 **HTML 管理文章索引、Markdown 保存正文、CSS 负责阅读排版、JavaScript 负责页面行为** 的结构，不使用数据库、不使用后台、不使用 Node.js 构建流程，也不依赖 GitHub Actions 自动生成页面。

> 核心目标不是“功能越多越好”，而是让一个几十篇到上百篇文章的个人博客，在几年以后重新打开仓库时，仍然能一眼看懂、马上会改。

当前版本：`v1.0.0`

---

## 1. 最终架构

整个项目只保留四个明确职责：

```text
HTML       → 文章索引 / 页面骨架
Markdown   → 文章正文
CSS        → 页面样式 / Markdown 阅读体验
JavaScript → 列表渲染 / Markdown 加载 / Drawer 交互
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
```

都应该尽量保持不变。

这也是本项目最重要的维护原则：

> **内容变化只改内容；与内容无关的逻辑统一放到外部 CSS / JavaScript 中。**

---

## 2. 为什么不用构建流程

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

这些方案都能实现更多自动化，但对于几十篇到上百篇文章的个人博客来说，会增加额外概念和维护步骤。

本项目选择更直接的流程：

```text
index.html 维护文章索引
        ↓
点击文章
        ↓
app.js 读取对应 Markdown
        ↓
Marked：Markdown → HTML
        ↓
全屏 Drawer 展示正文
```

这种方式牺牲了一点“自动发现文章”的能力，但换来了更重要的优势：

- 不需要构建。
- 不需要记命令。
- 不需要安装 Node.js 依赖。
- 不需要维护 JSON。
- 不需要理解 workflow。
- 打开 `index.html` 就能看到文章数据。
- 很久以后重新维护，也容易快速恢复思路。

对于这种个人长期项目，**可理解性、透明度和维护稳定性优先于自动化程度。**

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
    └── app.js
```

### 文件职责

| 文件 | 日常修改 | 作用 |
|---|---:|---|
| `index.html` | 是 | 维护文章文件名、日期、标题，以及页面基础结构 |
| `articles/*.md` | 是 | 保存文章正文 |
| `css/style.css` | 通常否 | 首页、Drawer、Markdown Typography、响应式 |
| `js/app.js` | 通常否 | 生成列表、读取 Markdown、打开/关闭 Drawer |
| `.nojekyll` | 否 | GitHub Pages 按普通静态文件发布 |
| `README.md` | 偶尔 | 项目说明和维护规范 |

`.gitignore` 不是必须文件。如果不需要忽略 `.vscode/`、`Thumbs.db` 等本地文件，可以不保留。

---

## 4. 文章索引：只在 index.html 维护

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

### 为什么数组放在 HTML，而不是 app.js

文章数组属于“日常内容配置”，不是程序逻辑。

把它放在 `index.html` 有几个实际好处：

- 打开首页文件就能看到所有文章记录。
- 新增文章只需要复制一条对象。
- 不必进入复杂 JavaScript 文件寻找配置。
- `app.js` 可以长期冻结。
- 更容易理解和记住维护位置。

因此本项目固定采用：

> **文章数据写在 HTML，程序逻辑写在外部 JavaScript。**

---

## 5. Markdown 文件规则

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

## 6. Markdown 正文没有结构限制

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

普通正文：

```markdown
这里直接开始正文。

## 第一部分

正文内容。
```

H1 开头：

```markdown
# 正文中的一级标题

正文内容。
```

H2 开头：

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

## 7. 新增文章：最终维护流程

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

## 8. 修改和删除文章

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

1. 删除 `articles/018.md`。
2. 删除 `index.html` 中对应记录。

其他 Markdown 不需要重新编号。

---

## 9. JavaScript 的职责

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
Marked：Markdown → HTML
      ↓
增强表格 / 外部链接 / 图片
      ↓
打开全屏 Drawer
```

当前 `app.js` 还负责：

- Drawer 从右侧全屏滑入。
- 右上角关闭按钮。
- `ESC` 关闭文章。
- 阅读时锁定背景滚动。
- 关闭后恢复原文章列表位置。
- Markdown 请求使用 `no-store`。
- Markdown URL 增加时间参数，减少旧正文缓存。
- 外部链接自动新窗口打开。
- 图片和 iframe 延迟加载。
- 表格自动增加横向滚动容器。
- Markdown 读取失败时显示错误信息。

这些都是通用逻辑，因此统一放在 `app.js` 复用，而不随着文章更新反复修改。

---

## 10. Markdown 渲染与阅读 CSS

项目使用 Marked 在浏览器端把 Markdown 转换成 HTML：

```html
<script src="https://cdn.jsdelivr.net/npm/marked@18.0.9/lib/marked.umd.js"></script>
```

固定版本可以减少第三方库升级带来的不确定性。

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

当前版本采用紧凑阅读排版，兼顾长时间阅读、技术文档和长截图备份。

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

- 标题层级明确，但避免过大的字号。
- 段落紧凑但不拥挤。
- 代码块不强制换行，超宽内容横向滚动。
- 表格在手机端可横向滑动。
- 长链接不会撑破正文。
- 引用使用轻量左边线。
- 首页与文章页保持白、黑、灰为主的简洁风格。
- 控制纵向留白，方便整页截图和长期归档。

`articles/003.md` 可作为 Markdown Typography 测试文章。以后如果调整 CSS，优先使用它检查各种格式。

---

## 11. 本地预览

页面需要通过 JavaScript `fetch()` 读取 Markdown，因此不建议直接双击 `index.html` 使用 `file://` 预览。

推荐使用 VS Code 的 **Live Server**：

```text
index.html
→ 右键
→ Open with Live Server
```

以后修改：

```text
index.html
articles/*.md
```

保存后刷新浏览器即可。

不需要：

```text
npm install
npm run build
node build.mjs
```

---

## 12. GitHub Pages

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

---

## 13. 长期维护策略

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
.nojekyll
```

如果只是新增文章，不要顺手修改程序结构。

如果只是修改正文，不要修改 JavaScript。

如果只是修改文章标题，不要去改 Markdown 结构。

让每一种变化都只影响自己负责的文件，这样项目才能长期稳定。

---

## 14. 这套结构可以复用到其他项目

`html-md-blog` 不只是一个博客示例，它更重要的是形成了一套轻量内容项目的通用结构：

```text
HTML       = 数据入口 / 页面骨架
Markdown   = 内容
CSS        = 视觉
JavaScript = 行为
GitHub     = 版本管理
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

## 15. 最终操作口诀

以后新增一篇文章，只需要记住：

```text
新增 articles/NNN.md
        +
index.html 增加 file / date / title
        ↓
Live Server 检查
        ↓
提交 GitHub
        ↓
完成
```

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

## 16. 项目总结

`html-md-blog` 的重点不是做一个功能很多的博客，而是建立一种可以长期坚持的内容维护方式：

> **用最少的规则，让 HTML、Markdown、CSS 和 JavaScript 各自只负责自己最擅长的事情。**

当页面样式和交互稳定以后，后期维护博客应该主要是在持续增加 Markdown 内容，而不是持续开发博客程序。
