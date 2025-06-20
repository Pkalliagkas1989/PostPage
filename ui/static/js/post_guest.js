import { fetchJSON } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('forumContainer');
  const postTpl = document.getElementById('post-template');
  const commentTpl = document.getElementById('comment-template');

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    container.textContent = 'Post not found';
    return;
  }

  const data = await fetchJSON(`http://localhost:8080/forum/api/posts/${id}`);
  if (!data) {
    container.textContent = 'Error loading post';
    return;
  }
  renderPost(data);

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
          window.location.href = `/guest?cat=${c.id}`;
        });
        catContainer.appendChild(link);
      });
    }
    postEl.querySelector('.post-title').textContent = post.title;
    postEl.querySelector('.post-content').textContent = post.content;
    postEl.querySelector('.post-time').textContent = new Date(post.created_at).toLocaleString();
    const likes = (post.reactions || []).filter(r => r.reaction_type === 1).length;
    const dislikes = (post.reactions || []).filter(r => r.reaction_type === 2).length;
    postEl.querySelector('.like-count').textContent = likes;
    postEl.querySelector('.dislike-count').textContent = dislikes;
    const commentsCont = postEl.querySelector('.post-comments');
    for (const comment of post.comments || []) {
      const cEl = commentTpl.content.cloneNode(true);
      cEl.querySelector('.comment-user').textContent = comment.username;
      cEl.querySelector('.comment-content').textContent = comment.content;
      cEl.querySelector('.comment-time').textContent = new Date(comment.created_at).toLocaleString();
      const clikes = (comment.reactions || []).filter(r => r.reaction_type === 1).length;
      const cdislikes = (comment.reactions || []).filter(r => r.reaction_type === 2).length;
      cEl.querySelector('.like-count').textContent = clikes;
      cEl.querySelector('.dislike-count').textContent = cdislikes;
      commentsCont.appendChild(cEl);
    }
    container.appendChild(postEl);
  }
});
