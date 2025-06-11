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
  const categoryContainer = document.getElementById("post-category");

  // Validate category selection
  if (checkedCategories.length === 0) {
    const existingWarning = document.getElementById("category-warning");
    if (!existingWarning) {
      const warning = document.createElement("div");
      warning.id = "category-warning";
      warning.textContent = "Please select at least one category";
      warning.style.color = "red";
      warning.style.marginTop = "5px";
      categoryContainer.appendChild(warning);
    }
    return;
  } else {
    const existingWarning = document.getElementById("category-warning");
    if (existingWarning) existingWarning.remove();
  }

  // Collect selected category IDs
  const categoryIds = Array.from(checkedCategories).map(checkbox =>
    parseInt(checkbox.value, 10)
  );

  if (!title || !content || categoryIds.length === 0) return;

  // Session verification
  try {
    const res = await fetch("http://localhost:8080/forum/api/session/verify", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Not authenticated");
    const sessionData = await res.json();
    console.log("Welcome", sessionData.user);
  } catch (err) {
    window.location.href = "/login";
    return;
  }

  // Submit post
  try {
    const response = await fetch("http://localhost:8080/forum/api/posts/create", {
      method: "POST",
      headers: {
  "Content-Type": "application/json",
  "X-CSRF-Token": sessionStorage.getItem("csrf_token"),
},
      credentials: "include",
      body: JSON.stringify({
        title: title,
        content: content,
        category_ids: categoryIds // ✅ now sending an array
      })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Post created successfully:", result);

    // Cleanup
    postTitle.value = "";
    postBody.value = "";
    modal.classList.add("hidden");
    window.location.reload();
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