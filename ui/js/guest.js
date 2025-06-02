const isAuthenticated = false;

// Show or hide elements based on authentication
document.querySelectorAll(".auth-only").forEach((el) => {
  el.style.display = isAuthenticated ? "list-item" : "none";
});

document.querySelectorAll(".guest-only").forEach((el) => {
  el.style.display = isAuthenticated ? "none" : "list-item";
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("http://localhost:8080/forum/api/guest");
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    const forumContainer = document.getElementById("forumContainer");
    const categoryTabs = document.getElementById("category-tabs");

    // Render category tab links
    data.categories.forEach((category, index) => {
      const tabItem = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = category.name;
      link.dataset.categoryId = category.id;
      if (index === 0) link.classList.add("active");

      link.addEventListener("click", (e) => {
        e.preventDefault();
        document
          .querySelectorAll(".category-tabs a")
          .forEach((a) => a.classList.remove("active"));
        link.classList.add("active");
        renderPostsForCategory(category.id);
      });

      tabItem.appendChild(link);
      categoryTabs.appendChild(tabItem);
    });

    function renderPostsForCategory(categoryId) {
      forumContainer.innerHTML = "";
      const category = data.categories.find((c) => c.id === +categoryId);
      if (!category) return;

      const categoryTemplate = document.getElementById("category-template");
      const postTemplate = document.getElementById("post-template");
      const commentTemplate = document.getElementById("comment-template");

      const categoryElement = categoryTemplate.content.cloneNode(true);
      categoryElement.querySelector(".category-title").textContent =
        category.name;

      const postsContainer = categoryElement.querySelector(".category-posts");

      category.posts.forEach((post) => {
        const postElement = postTemplate.content.cloneNode(true);
        postElement.querySelector(
          ".post-header"
        ).textContent = `${post.username} posted in ${post.category_name}`;
        postElement.querySelector(".post-content").textContent = post.content;
        postElement.querySelector(".post-time").textContent = new Date(
          post.created_at
        ).toLocaleString();

        const commentsContainer = postElement.querySelector(".post-comments");

        post.comments.forEach((comment) => {
          const commentElement = commentTemplate.content.cloneNode(true);
          commentElement.querySelector(".comment-user").textContent =
            comment.username;
          commentElement.querySelector(".comment-content").textContent =
            comment.content;
          commentElement.querySelector(".comment-time").textContent = new Date(
            comment.created_at
          ).toLocaleString();
          commentsContainer.appendChild(commentElement);
        });

        postsContainer.appendChild(postElement);
      });

      forumContainer.appendChild(categoryElement);
    }

    // Load first category on page load
    renderPostsForCategory(data.categories[0].id);
  } catch (err) {
    console.error("Error fetching forum data:", err);
  }
});
