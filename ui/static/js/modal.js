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
      const response = await fetch("http://localhost:8080/forum/api/categories");
      const data = await response.json();

      const container = document.getElementById("post-category");
      container.innerHTML = "";

      data.forEach((category) => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `cat-${category.name.toLowerCase().replace(/\s+/g, "-")}`;
        checkbox.name = "categories";
        checkbox.value = category.name;

        const label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.textContent = category.name;

        const wrapper = document.createElement("div");
        wrapper.classList.add("checkbox-item");
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);

        container.appendChild(wrapper);
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  populateCategories();
});
