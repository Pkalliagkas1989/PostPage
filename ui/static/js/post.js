// Post page for authenticated users

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('forumContainer');
  const postTpl = document.getElementById('post-template');
  const commentTpl = document.getElementById('comment-template');
  const csrfToken = sessionStorage.getItem('csrf_token');

  async function verify() {
    const res = await fetch('http://localhost:8080/forum/api/session/verify', { credentials: 'include' });
    return res.ok;
  }

  if (!(await verify())) {
    window.location.href = '/login';
    return;
  }

  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await fetch('http://localhost:8080/forum/api/session/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      window.location.href = '/';
    });
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    container.textContent = 'Post not found';
    return;
  }

  async function loadPost() {
    const res = await fetch(`http://localhost:8080/forum/api/posts/${id}`, { credentials: 'include' });
    if (!res.ok) {
      container.textContent = 'Error loading post';
      return;
    }
    const data = await res.json();
    renderPost(data);
  }

  function renderPost(post) {
    container.innerHTML = '';
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
          window.location.href = `/user?cat=${c.id}`;
        });
        catContainer.appendChild(link);
      });
    }
    postEl.querySelector('.post-title').textContent = post.title;
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
    const commentsCont = postEl.querySelector('.post-comments');
    for (const comment of post.comments || []) {
      const cEl = commentTpl.content.cloneNode(true);
      cEl.querySelector('.comment-user').textContent = comment.username;
      cEl.querySelector('.comment-content').textContent = comment.content;
      cEl.querySelector('.comment-time').textContent = new Date(comment.created_at).toLocaleString();
      const clikeBtn = cEl.querySelector('.like-btn');
      const cdislikeBtn = cEl.querySelector('.dislike-btn');
      const clikes = (comment.reactions || []).filter(r => r.reaction_type === 1).length;
      const cdislikes = (comment.reactions || []).filter(r => r.reaction_type === 2).length;
      clikeBtn.querySelector('.like-count').textContent = clikes;
      cdislikeBtn.querySelector('.dislike-count').textContent = cdislikes;
      clikeBtn.addEventListener('click', () => react(comment.id, 'comment', 1));
      cdislikeBtn.addEventListener('click', () => react(comment.id, 'comment', 2));
      commentsCont.appendChild(cEl);
    }
    const commentBtn = postEl.querySelector('.comment-btn');
    commentBtn.addEventListener('click', async () => {
      const text = prompt('Comment:');
      if (text) {
        await createComment(post.id, text);
        await loadPost();
      }
    });
    container.appendChild(postEl);
  }

  async function react(targetId, type, rtype) {
    await fetch('http://localhost:8080/forum/api/react', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ target_id: targetId, target_type: type, reaction_type: rtype })
    });
    loadPost();
  }

  async function createComment(postId, content) {
    await fetch('http://localhost:8080/forum/api/comments', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ post_id: postId, content })
    });
  }

  loadPost();
});
