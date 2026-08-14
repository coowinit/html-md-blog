(() => {
  'use strict';

  const posts = Array.isArray(window.BLOG_POSTS) ? window.BLOG_POSTS : [];

  const siteShell = document.getElementById('site-shell');
  const articleList = document.getElementById('article-list');
  const articleCount = document.getElementById('article-count');

  const reader = document.getElementById('reader');
  const readerClose = document.getElementById('reader-close');
  const readerScroll = document.getElementById('reader-scroll');
  const readerMeta = document.getElementById('reader-meta');
  const readerTitle = document.getElementById('reader-title');
  const readerStatus = document.getElementById('reader-status');
  const readerBody = document.getElementById('reader-body');

  let lastTrigger = null;
  let closeTimer = null;
  let activeRequest = null;

  function getArticleId(file = '') {
    return String(file).replace(/\.md$/i, '').trim();
  }

  function isValidPost(post) {
    return post && post.file && post.date && post.title;
  }

  function renderArticleList() {
    const validPosts = posts.filter(isValidPost);
    articleCount.textContent = `${validPosts.length} 篇`;
    articleList.replaceChildren();

    if (!validPosts.length) {
      const empty = document.createElement('p');
      empty.className = 'article-empty';
      empty.textContent = '暂无文章。';
      articleList.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();

    validPosts.forEach((post, index) => {
      const id = getArticleId(post.file);

      const item = document.createElement('div');
      item.className = 'article-item';

      const button = document.createElement('button');
      button.className = 'article-open';
      button.type = 'button';
      button.dataset.postIndex = String(posts.indexOf(post));
      button.setAttribute('aria-label', `阅读：${post.title}`);

      const number = document.createElement('span');
      number.className = 'article-number';
      number.textContent = id || String(index + 1).padStart(3, '0');

      const date = document.createElement('span');
      date.className = 'article-date';
      date.textContent = post.date;

      const name = document.createElement('span');
      name.className = 'article-name';
      name.textContent = post.title;

      const arrow = document.createElement('span');
      arrow.className = 'article-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';

      button.append(number, date, name, arrow);
      item.appendChild(button);
      fragment.appendChild(item);
    });

    articleList.appendChild(fragment);
  }

  function setReaderStatus(message = '', type = '') {
    readerStatus.textContent = message;
    readerStatus.className = 'reader-status';

    if (message) {
      readerStatus.classList.add('is-visible');
    }

    if (type === 'error') {
      readerStatus.classList.add('is-error');
    }
  }

  function enhanceMarkdown(root) {
    root.querySelectorAll('table').forEach((table) => {
      if (table.parentElement?.classList.contains('table-scroll')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'table-scroll';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });

    root.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
      } catch {
        // 非标准链接保持 Markdown 渲染器的原始结果。
      }
    });

    root.querySelectorAll('img').forEach((image) => {
      image.loading = 'lazy';
      image.decoding = 'async';
    });

    root.querySelectorAll('iframe').forEach((frame) => {
      frame.loading = 'lazy';
    });
  }

  function markdownToHtml(markdown) {
    if (!window.marked || typeof window.marked.parse !== 'function') {
      throw new Error('Markdown 渲染器未能加载，请检查网络连接后刷新页面。');
    }

    window.marked.setOptions({
      gfm: true,
      breaks: false
    });

    const cleanMarkdown = String(markdown).replace(
      /^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/,
      ''
    );

    return window.marked.parse(cleanMarkdown);
  }

  async function loadMarkdown(post) {
    if (activeRequest) {
      activeRequest.abort();
    }

    const controller = new AbortController();
    activeRequest = controller;

    const separator = post.file.includes('?') ? '&' : '?';
    const url = `articles/${post.file}${separator}v=${Date.now()}`;

    try {
      const response = await fetch(url, {
        cache: 'no-store',
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`文章读取失败（HTTP ${response.status}）：articles/${post.file}`);
      }

      return await response.text();
    } finally {
      if (activeRequest === controller) {
        activeRequest = null;
      }
    }
  }

  async function openReader(button, post) {
    if (!post) return;

    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }

    lastTrigger = button;

    const id = getArticleId(post.file);
    readerMeta.textContent = `ARTICLE ${id} · ${post.date}`;
    readerTitle.textContent = post.title;
    readerBody.replaceChildren();
    setReaderStatus('正在载入文章…');
    readerScroll.scrollTop = 0;

    reader.setAttribute('aria-hidden', 'false');
    document.body.classList.add('reader-open');
    if (siteShell) siteShell.inert = true;

    window.requestAnimationFrame(() => {
      reader.classList.add('is-open');
      readerClose.focus({ preventScroll: true });
    });

    try {
      const markdown = await loadMarkdown(post);
      const html = markdownToHtml(markdown);

      readerBody.innerHTML = html;
      enhanceMarkdown(readerBody);
      setReaderStatus('');
    } catch (error) {
      if (error?.name === 'AbortError') return;

      readerBody.replaceChildren();
      setReaderStatus(
        error?.message || '文章读取失败，请稍后刷新页面重试。',
        'error'
      );
    }
  }

  function closeReader() {
    if (!reader.classList.contains('is-open')) return;

    if (activeRequest) {
      activeRequest.abort();
      activeRequest = null;
    }

    reader.classList.remove('is-open');
    document.body.classList.remove('reader-open');
    if (siteShell) siteShell.inert = false;

    closeTimer = window.setTimeout(() => {
      reader.setAttribute('aria-hidden', 'true');
      readerBody.replaceChildren();
      readerTitle.textContent = '';
      readerMeta.textContent = '';
      setReaderStatus('');
      lastTrigger?.focus({ preventScroll: true });
      closeTimer = null;
    }, 390);
  }

  articleList.addEventListener('click', (event) => {
    const button = event.target.closest('.article-open');
    if (!button) return;

    const postIndex = Number(button.dataset.postIndex);
    openReader(button, posts[postIndex]);
  });

  readerClose.addEventListener('click', closeReader);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeReader();
    }
  });

  renderArticleList();
})();
