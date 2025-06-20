document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('forumContainer');
  const catTpl = document.getElementById('category-template');
  const postTpl = document.getElementById('post-template');
  const commentTpl = document.getElementById('comment-template');
  const tabs = document.getElementById('category-tabs');
  const feedLink = document.getElementById('my-feed-link');
  let allData;

  feedLink.addEventListener('click', (e) => {
    e.preventDefault();
    renderFeed();
  });

  try {
    const res = await fetch('http://localhost:8080/forum/api/allData');
    if (!res.ok) throw new Error('failed to load');
    allData = await res.json();
    populateCategories();
    renderFeed();
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
    const commentsCont = postEl.querySelector('.post-comments');
    for (const comment of post.comments || []) {
      const cEl = commentTpl.content.cloneNode(true);
      cEl.querySelector('.comment-user').textContent = comment.username;
      cEl.querySelector('.comment-content').textContent = comment.content;
      cEl.querySelector('.comment-time').textContent = new Date(comment.created_at).toLocaleString();
      const clikes = (comment.reactions || []).filter((r) => r.reaction_type === 1).length;
      const cdislikes = (comment.reactions || []).filter((r) => r.reaction_type === 2).length;
      cEl.querySelector('.like-count').textContent = clikes;
      cEl.querySelector('.dislike-count').textContent = cdislikes;
      commentsCont.appendChild(cEl);
    }
    return postEl;
  }
});
