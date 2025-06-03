function countReactions(reactions = []) {
  return {
    likes: reactions.filter((r) => r.reaction_type === 1).length,
    dislikes: reactions.filter((r) => r.reaction_type === 2).length,
  };
}

async function handleReaction(
  targetId,
  targetType,
  reactionType,
  likeBtn,
  dislikeBtn
) {
  try {
    const res = await fetch("/api/react", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target_id: targetId,
        target_type: targetType,
        reaction_type: reactionType,
      }),
    });

    if (!res.ok) throw new Error("Failed to react");

    const updatedReactions = await res.json();
    const { likes, dislikes } = countReactions(updatedReactions);
    likeBtn.querySelector(".like-count").textContent = likes;
    dislikeBtn.querySelector(".dislike-count").textContent = dislikes;
  } catch (err) {
    console.error("Reaction failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const isGuest = urlParams.get("guest") === "true";

  let isAuthenticated = false;
  if (!isGuest) {
    const authResponse = await fetch("/api/verify-session", {
      method: "GET",
      credentials: "include",
    });
    isAuthenticated = authResponse.ok;
  }

  // Show or hide auth-only and guest-only elements
  document.querySelectorAll(".auth-only").forEach((el) => {
    el.style.display = isAuthenticated ? "list-item" : "none";
  });
  document.querySelectorAll(".guest-only").forEach((el) => {
    el.style.display = isAuthenticated ? "none" : "list-item";
  });

  try {
    const response = await fetch("http://localhost:8080/forum/api/guest");
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    const forumContainer = document.getElementById("forumContainer");
    const categoryTabs = document.getElementById("category-tabs");

    // Clear tabs container (if anything exists)
    categoryTabs.innerHTML = "";

    // Render category tabs
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

        // Post reactions
        const { likes: postLikes, dislikes: postDislikes } = countReactions(
          post.reactions || []
        );
        const postContainer = postElement.querySelector(".post");
        const likeBtn = postContainer.querySelector(".like-btn");
        const dislikeBtn = postContainer.querySelector(".dislike-btn");

        likeBtn.querySelector(".like-count").textContent = postLikes;
        dislikeBtn.querySelector(".dislike-count").textContent = postDislikes;

        // Disable buttons by default for guests
        likeBtn.disabled = !isAuthenticated;
        dislikeBtn.disabled = !isAuthenticated;

        // Remove existing listeners to prevent duplicates
        likeBtn.replaceWith(likeBtn.cloneNode(true));
        dislikeBtn.replaceWith(dislikeBtn.cloneNode(true));
        const newLikeBtn = postContainer.querySelector(".like-btn");
        const newDislikeBtn = postContainer.querySelector(".dislike-btn");

        if (isAuthenticated) {
          newLikeBtn.addEventListener("click", () => {
            handleReaction(post.id, "post", 1, newLikeBtn, newDislikeBtn);
          });
          newDislikeBtn.addEventListener("click", () => {
            handleReaction(post.id, "post", 2, newLikeBtn, newDislikeBtn);
          });
        }

        // Comments
        const commentsContainer = postElement.querySelector(".post-comments");
        commentsContainer.innerHTML = ""; // Clear existing comments

        post.comments.forEach((comment) => {
          const commentElement = commentTemplate.content.cloneNode(true);
          const commentNode = commentElement.querySelector(".comment");
          commentNode.querySelector(".comment-user").textContent =
            comment.username;
          commentNode.querySelector(".comment-content").textContent =
            comment.content;
          commentNode.querySelector(".comment-time").textContent = new Date(
            comment.created_at
          ).toLocaleString();

          const { likes, dislikes } = countReactions(comment.reactions || []);
          const commentLikeBtn = commentNode.querySelector(".like-btn");
          const commentDislikeBtn = commentNode.querySelector(".dislike-btn");

          commentLikeBtn.querySelector(".like-count").textContent = likes;
          commentDislikeBtn.querySelector(".dislike-count").textContent =
            dislikes;

          commentLikeBtn.disabled = !isAuthenticated;
          commentDislikeBtn.disabled = !isAuthenticated;

          // Remove existing listeners to avoid duplicates
          commentLikeBtn.replaceWith(commentLikeBtn.cloneNode(true));
          commentDislikeBtn.replaceWith(commentDislikeBtn.cloneNode(true));
          const newCommentLikeBtn = commentNode.querySelector(".like-btn");
          const newCommentDislikeBtn =
            commentNode.querySelector(".dislike-btn");

          if (isAuthenticated) {
            newCommentLikeBtn.addEventListener("click", () => {
              handleReaction(
                comment.id,
                "comment",
                1,
                newCommentLikeBtn,
                newCommentDislikeBtn
              );
            });
            newCommentDislikeBtn.addEventListener("click", () => {
              handleReaction(
                comment.id,
                "comment",
                2,
                newCommentLikeBtn,
                newCommentDislikeBtn
              );
            });
          }

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
