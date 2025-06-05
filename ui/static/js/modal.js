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

  async function populateCategories() {
    try {
      const response = await fetch(
        "http://localhost:8080/forum/api/categories"
      );
      const data = await response.json();

      const select = document.getElementById("post-category");

      data.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.name.toLowerCase().replace(/\s+/g, "-");
        option.textContent = category.name;
        select.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  populateCategories();
});
