document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('forumContainer');
  const catTpl = document.getElementById('category-template');
  const postTpl = document.getElementById('post-template');
  const tabs = document.getElementById('category-tabs');
  const feedLink = document.getElementById('my-feed-link');
  let allData;
  const params = new URLSearchParams(window.location.search);
  const initialCat = parseInt(params.get('cat'), 10);

  feedLink.addEventListener('click', (e) => {
    e.preventDefault();
    renderFeed();
  });

  try {
    const res = await fetch('http://localhost:8080/forum/api/allData');
    if (!res.ok) throw new Error('failed to load');
    allData = await res.json();
    populateCategories();
    if (initialCat) {
      renderCategory(initialCat);
    } else {
      renderFeed();
    }
  } catch (err) {
    container.textContent = 'Error loading posts';
  }

  function populateCategories() {
    if (!tabs) return;
    tabs.innerHTML = '';
    allData.categories.forEach((cat) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = cat.name;
      a.dataset.catId = cat.id;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        renderCategory(cat.id);
      });
      li.appendChild(a);
      tabs.appendChild(li);
    });
  }

  function renderFeed() {
    container.innerHTML = '';
    allData.categories.forEach(renderCategorySection);
  }

  function renderCategory(id) {
    container.innerHTML = '';
    const cat = allData.categories.find((c) => c.id === id);
    if (cat) {
      renderCategorySection(cat);
    }
  }

  function renderCategorySection(cat) {
    const catEl = catTpl.content.cloneNode(true);
    catEl.querySelector('.category-title').textContent = cat.name;
    const postsCont = catEl.querySelector('.category-posts');
    cat.posts.forEach((post) => {
      const postEl = createPostElement(post);
      postsCont.appendChild(postEl);
    });
    container.appendChild(catEl);
  }

  function createPostElement(post) {
    const postEl = postTpl.content.cloneNode(true);
    postEl.querySelector('.post-header').textContent = `${post.username} posted`;
    const catContainer = postEl.querySelector('.post-categories');
    if (catContainer && post.categories) {
      post.categories.forEach(c => {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = `#${c.name}`;
        link.dataset.catId = c.id;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          renderCategory(c.id);
        });
        catContainer.appendChild(link);
      });
    }
    const titleEl = postEl.querySelector('.post-title');
    titleEl.textContent = post.title;
    titleEl.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = `/post-guest?id=${post.id}`;
    });
    postEl.querySelector('.post-content').textContent = post.content;
    postEl.querySelector('.post-time').textContent = new Date(post.created_at).toLocaleString();
    const likes = (post.reactions || []).filter((r) => r.reaction_type === 1).length;
    const dislikes = (post.reactions || []).filter((r) => r.reaction_type === 2).length;
    postEl.querySelector('.like-count').textContent = likes;
    postEl.querySelector('.dislike-count').textContent = dislikes;
    return postEl;
  }
});
