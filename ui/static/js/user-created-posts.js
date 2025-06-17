function setupCreatedPostsHandler(configManager, postRenderer) {
  const link = document.getElementById("created-posts-link");
  if (!link) return;

  link.addEventListener("click", (event) => {
    event.preventDefault();
    fetchAndRenderCreatedPosts(configManager, postRenderer);
  });
}

function fetchAndRenderCreatedPosts(configManager, postRenderer) {
  const API_CONFIG = configManager.getConfig();

  fetch(API_CONFIG.MyPostsURI, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch posts.");
      return response.json();
    })
    .then((posts) => {
      const container = document.getElementById("forumContainer");
      const postTemplate = document.getElementById("post-template");
      const commentTemplate = document.getElementById("comment-template");

      container.innerHTML = ""; // clear old posts

      posts.forEach((post) => {
        const categoryName = post.category_name || "General";
        postRenderer.renderPost(
          post,
          commentTemplate,
          postTemplate,
          container,
          categoryName,
          () => fetchAndRenderCreatedPosts(configManager, postRenderer) // REFRESH callback
        );
      });
    })
    .catch((error) => {
      console.error("Error loading created posts:", error);
    });
}

export { setupCreatedPostsHandler };
