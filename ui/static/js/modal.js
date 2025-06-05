document.addEventListener("DOMContentLoaded", () => {
  const createBtn = document.getElementById("create-post-btn");
  const modal = document.getElementById("post-modal");
  const closeBtn = document.querySelector(".close-btn");
  const submitBtn = document.getElementById("submit-post");
  const postTitle = document.getElementById("post-title");
  const postBody = document.getElementById("post-body");
  const commentBtn = document.getElementById("comment-btn");

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

    //Add logic for POSTing to server

    postTitle.value = "";
    postBody.value = "";
    modal.classList.add("hidden");
  };
});
