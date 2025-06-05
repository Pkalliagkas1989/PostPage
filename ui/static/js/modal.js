document.addEventListener("DOMContentLoaded", () => {
  const createBtn = document.getElementById("create-post-btn");
  const modal = document.getElementById("post-modal");
  const closeBtn = document.querySelector(".close-btn");
  const submitBtn = document.getElementById("submit-post");
  const postTitle = document.getElementById("post-title");
  const postBody = document.getElementById("post-body");
  const template = document.getElementById("post-template");
  const postsContainer = document.getElementById("posts-container");

  createBtn.onclick = () => {
    modal.classList.remove("hidden");
  };

  closeBtn.onclick = () => {
    modal.classList.add("hidden");
  };

  submitBtn.onclick = () => {
    const title = postTitle.value.trim();
    const content = postBody.value.trim();

    if (!title || !content) return;

    const clone = template.content.cloneNode(true);
    clone.querySelector(".post-header").textContent = title;
    clone.querySelector(".post-content").textContent = content;
    clone.querySelector(".post-time").textContent = new Date().toLocaleString();

    postsContainer.prepend(clone); // Adds newest post at the top

    postTitle.value = "";
    postBody.value = "";
    modal.classList.add("hidden");
  };
});
