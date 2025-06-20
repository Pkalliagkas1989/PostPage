import { fetchJSON } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('forumContainer');
  const catTpl = document.getElementById('category-template');
  const postTpl = document.getElementById('post-template');
  const tabs = document.getElementById('category-tabs');
  const feedLink = document.getElementById('my-feed-link');
  let csrfToken = sessionStorage.getItem('csrf_token');
  let allData;
  const params = new URLSearchParams(window.location.search);
  const initialCat = parseInt(params.get('cat'), 10);
  let currentCatId = initialCat || null;
  async function verify() {
    try {
      const res = await fetch('http://localhost:8080/forum/api/session/verify', {
        credentials: 'include'
      });
      if (!res.ok) {
        return false;
      }
      const data = await res.json();
      if (data && data.csrf_token) {
        sessionStorage.setItem('csrf_token', data.csrf_token);
        csrfToken = data.csrf_token;
      }
      return true;
    } catch (_) {
      return false;
    }
  }
  if (!(await verify())) {
    window.location.href = '/login';
    return;
  }
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await fetchJSON('http://localhost:8080/forum/api/session/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      window.location.href = '/';
    });
  }
  if (feedLink) {
    feedLink.addEventListener('click', (e) => {
      e.preventDefault();
      renderFeed();
    });
  }

  async function loadData() {
    const data = await fetchJSON('http://localhost:8080/forum/api/allData', { credentials: 'include' });
    if (!data) return;
    allData = data;
    populateCategories();
    if (currentCatId) {
      renderCategory(currentCatId);
    } else {
      renderFeed();
    }
  }

  function populateCategories() {
    if (!tabs) return;
    tabs.innerHTML = '';
    allData.categories.forEach(cat => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = cat.name;
      a.dataset.catId = cat.id;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `/user?cat=${cat.id}`;
      });
      li.appendChild(a);
      tabs.appendChild(li);
    });
  }

  function renderFeed() {
    currentCatId = null;
    container.innerHTML = '';
    const postsMap = new Map();
    allData.categories.forEach(cat => {
      cat.posts.forEach(post => {
        if (!postsMap.has(post.id)) {
          postsMap.set(post.id, post);
        }
      });
    });
    const posts = Array.from(postsMap.values()).sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    );
    const catEl = catTpl.content.cloneNode(true);
    catEl.querySelector('.category-title').textContent = 'Feed';
    const postsCont = catEl.querySelector('.category-posts');
    posts.forEach(post => {
      postsCont.appendChild(createPostElement(post, true));
    });
    container.appendChild(catEl);
  }

  function renderCategorySection(cat) {
    const catEl = catTpl.content.cloneNode(true);
    catEl.querySelector('.category-title').textContent = cat.name;
    const postsCont = catEl.querySelector('.category-posts');
    for (const post of cat.posts) {
      postsCont.appendChild(createPostElement(post, false));
    }
    container.appendChild(catEl);
  }

  function createPostElement(post, showCategories = true) {
    const postEl = postTpl.content.cloneNode(true);
    postEl.querySelector('.post-header').textContent = `${post.username} posted`;
    const catContainer = postEl.querySelector('.post-categories');
    if (showCategories && catContainer && post.categories) {
      post.categories.forEach(c => {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = `#${c.name}`;
        link.dataset.catId = c.id;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = `/user?cat=${c.id}`;
        });
        catContainer.appendChild(link);
      });
    }
    const titleLink = postEl.querySelector('.post-title');
    titleLink.textContent = post.title;
    titleLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = `/post?id=${post.id}`;
    });
    postEl.querySelector('.post-content').textContent = post.content;
    postEl.querySelector('.post-time').textContent = new Date(post.created_at).toLocaleString();
    const likeBtn = postEl.querySelector('.like-btn');
    const dislikeBtn = postEl.querySelector('.dislike-btn');
    const likes = (post.reactions || []).filter(r => r.reaction_type === 1).length;
    const dislikes = (post.reactions || []).filter(r => r.reaction_type === 2).length;
    likeBtn.querySelector('.like-count').textContent = likes;
    dislikeBtn.querySelector('.dislike-count').textContent = dislikes;
    likeBtn.addEventListener('click', () => react(post.id, 'post', 1));
    dislikeBtn.addEventListener('click', () => react(post.id, 'post', 2));
    return postEl;
  }

  function renderCategory(id) {
    if (!allData) return;
    const cat = allData.categories.find(c => c.id === id);
    if (!cat) {
      window.location.href = '/error?code=404&message=Category%20not%20found';
      return;
    }
    currentCatId = id;
    container.innerHTML = '';
    renderCategorySection(cat);
  }
  async function react(id, type, rtype) {
    await fetchJSON('http://localhost:8080/forum/api/react', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ target_id: id, target_type: type, reaction_type: rtype })
    });
    loadData();
  }
  async function createComment(postId, content) {
    await fetchJSON('http://localhost:8080/forum/api/comments', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ post_id: postId, content })
    });
  }
  const createBtn = document.getElementById('create-post-btn');
  const modal = document.getElementById('post-modal');
  const closeBtn = document.querySelector('.close-btn');
  const submitBtn = document.getElementById('submit-post');
  if (createBtn) {
    createBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  }
  if (submitBtn) {
    submitBtn.addEventListener('click', createPost);
  }
  async function loadCategories() {
    const cats = await fetchJSON('http://localhost:8080/forum/api/categories');
    if (!cats) return;
    const cont = document.getElementById('post-category');
    cont.innerHTML = '';
    cats.forEach(c => {
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = c.id;
      const label = document.createElement('label');
      label.textContent = c.name;
      const wrap = document.createElement('div');
      wrap.className = 'checkbox-item';
      wrap.appendChild(cb);
      wrap.appendChild(label);
      cont.appendChild(wrap);
    });
  }
  async function createPost() {
    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('post-body').value.trim();
    const catChecks = document.querySelectorAll('#post-category input:checked');
    const ids = Array.from(catChecks).map(c => parseInt(c.value,10));
    if (!title || !content || ids.length === 0) return;
    await fetchJSON('http://localhost:8080/forum/api/posts/create', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ title, content, category_ids: ids })
    });
    modal.classList.add('hidden');
    await loadData();
  }
  loadCategories();
  loadData();
});
