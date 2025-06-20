document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('forumContainer');
  const catTpl = document.getElementById('category-template');
  const postTpl = document.getElementById('post-template');
  const commentTpl = document.getElementById('comment-template');
  try {
    const res = await fetch('http://localhost:8080/forum/api/allData');
    if (!res.ok) throw new Error('failed to load');
    const data = await res.json();
    container.innerHTML = '';
    for (const cat of data.categories) {
      const catEl = catTpl.content.cloneNode(true);
      catEl.querySelector('.category-title').textContent = cat.name;
      const postsCont = catEl.querySelector('.category-posts');
      for (const post of cat.posts) {
        const postEl = postTpl.content.cloneNode(true);
        postEl.querySelector('.post-header').textContent = `${post.username} posted`;
        postEl.querySelector('.post-title').textContent = post.title;
        postEl.querySelector('.post-content').textContent = post.content;
        postEl.querySelector('.post-time').textContent = new Date(post.created_at).toLocaleString();
        const commentsCont = postEl.querySelector('.post-comments');
        for (const comment of post.comments || []) {
          const cEl = commentTpl.content.cloneNode(true);
          cEl.querySelector('.comment-user').textContent = comment.username;
          cEl.querySelector('.comment-content').textContent = comment.content;
          cEl.querySelector('.comment-time').textContent = new Date(comment.created_at).toLocaleString();
          commentsCont.appendChild(cEl);
        }
        postsCont.appendChild(postEl);
      }
      container.appendChild(catEl);
    }
  } catch (err) {
    container.textContent = 'Error loading posts';
  }
});
