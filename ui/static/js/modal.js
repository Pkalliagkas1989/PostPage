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

  submitBtn.onclick = async () => {
    console.log("Submit button clicked");
    const title = postTitle.value.trim();
    const content = postBody.value.trim();
    const checkedCategories = document.querySelectorAll('input[name="categories"]:checked');
    if (checkedCategories.length === 0) return;
    const categoryId = parseInt(checkedCategories[0].value, 10);

    if (!title || !content || !categoryId) return;

    try {
      const res = await fetch("http://localhost:8080/forum/api/session/verify", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Not authenticated");
      const sessionData = await res.json();
      console.log("Welcome", sessionData.user);
    } catch (err) {
      window.location.href = "/login";
      return; // Stop further execution
    }

    try {
      const response = await fetch("http://localhost:8080/forum/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // sends cookies (like from cookies.txt in curl)
        body: JSON.stringify({
          category_id: categoryId,
          title: title,
          content: content
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Post created successfully:", result);

      // Reset and hide modal
      postTitle.value = "";
      postBody.value = "";
      modal.classList.add("hidden");
    } catch (error) {
      console.error("Error creating post:", error);
    }
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
        checkbox.id = `cat-${category.id}`;
        checkbox.name = "categories";
        checkbox.value = category.id;

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