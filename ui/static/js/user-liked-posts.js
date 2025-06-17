function setupLikedPostsHandler(configManager, postRenderer) {
  const link = document.getElementById("liked-posts-link");
  if (!link) return;

  link.addEventListener("click", (event) => {
    event.preventDefault();
    fetchAndRenderLikedPosts(configManager, postRenderer);
  });
}

function fetchAndRenderLikedPosts(configManager, postRenderer) {
  const API_CONFIG = configManager.getConfig();

  fetch(API_CONFIG.LikedPostsURI, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch liked posts.");
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
          () => fetchAndRenderLikedPosts(configManager, postRenderer) // refresh callback
        );
      });
    })
    .catch((error) => {
      console.error("Error loading liked posts:", error);
    });
}

export { setupLikedPostsHandler };
