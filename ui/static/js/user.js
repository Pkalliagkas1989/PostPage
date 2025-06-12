// Hide body immediately via injected style to avoid FOUC
const style = document.createElement("style");
style.innerHTML = "body { display: none !important; }";
document.head.appendChild(style);

function countReactions(reactions = []) {
  if (!Array.isArray(reactions)) reactions = [];
  return {
    likes: reactions.filter((r) => r.reaction_type === 1).length,
    dislikes: reactions.filter((r) => r.reaction_type === 2).length,
  };
}

document.addEventListener("DOMContentLoaded", () => {
  // Attach logout handler after DOM is loaded
  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const res = await fetch("http://localhost:8080/forum/api/session/logout", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Logout failed");

        // Optionally, clear CSRF token and local data
        sessionStorage.removeItem("csrf_token");

        // Redirect to login
        window.location.href = "/login";
      } catch (err) {
        console.error("Logout failed:", err);
        alert("Logout failed. Please try again.");
      }
    });
  }
  // Initialize forum only after session verification
  init();
});

async function init() {
  try {
    const res = await fetch("http://localhost:8080/forum/api/session/verify", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Not authenticated");

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("Expected JSON response");
    }
    const sessionData = await res.json();
    console.log("Welcome", sessionData.user);

    // Remove the injected style to reveal UI
    const injectedStyle = document.head.querySelector("style");
    if (injectedStyle) injectedStyle.remove();
    document.body.style.display = ""; // Show UI

    await setupForum(); // Proceed with rest of logic

  } catch (err) {
    window.location.href = "/login";
  }
}

async function setupForum() {
  async function handleReaction(
    targetId,
    targetType,
    reactionType,
    likeBtn,
    dislikeBtn
  ) {
    try {
      const res = await fetch("http://localhost:8080/forum/api/react", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": sessionStorage.getItem("csrf_token"),
        },
        body: JSON.stringify({
          target_id: targetId,
          target_type: targetType,
          reaction_type: reactionType,
        }),
      });

      if (!res.ok) throw new Error("Failed to react");

      const updatedReactions = await res.json();

      // Update the reactions inside `data`
      if (targetType === "post") {
        for (const category of data.categories) {
          const post = category.posts.find((p) => p.id === targetId);
          if (post) post.reactions = updatedReactions;
        }
      } else if (targetType === "comment") {
        for (const category of data.categories) {
          for (const post of category.posts) {
            const comment = post.comments.find((c) => c.id === targetId);
            if (comment) comment.reactions = updatedReactions;
          }
        }
      }

      // Update the counts in UI
      const { likes, dislikes } = countReactions(updatedReactions);
      likeBtn.querySelector(".like-count").textContent = likes;
      dislikeBtn.querySelector(".dislike-count").textContent = dislikes;
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  }

  const myFeedLink = document.getElementById("my-feed-link");
  let data;

  // Cache containers here so they're accessible throughout
  const forumContainer = document.getElementById("forumContainer");
  const categoryTabs = document.getElementById("category-tabs");

  function renderPost(
    post,
    commentTemplate,
    postTemplate,
    container,
    categoryName,
    refreshFn
  ) {
    const postElement = postTemplate.content.cloneNode(true);
    postElement.querySelector(
      ".post-header"
    ).textContent = `${post.username} posted in ${categoryName}`;
    postElement.querySelector(".post-title").textContent = post.title;
    postElement.querySelector(".post-content").textContent = post.content;
    postElement.querySelector(".post-time").textContent = new Date(
      post.created_at
    ).toLocaleString();

    const postContainer = postElement.querySelector(".post");
    const likeBtn = postContainer.querySelector(".like-btn");
    const dislikeBtn = postContainer.querySelector(".dislike-btn");
    const { likes, dislikes } = countReactions(post.reactions || []);
    likeBtn.querySelector(".like-count").textContent = likes;
    dislikeBtn.querySelector(".dislike-count").textContent = dislikes;
    likeBtn.replaceWith(likeBtn.cloneNode(true));
    dislikeBtn.replaceWith(dislikeBtn.cloneNode(true));
    const newLikeBtn = postContainer.querySelector(".like-btn");
    const newDislikeBtn = postContainer.querySelector(".dislike-btn");
    newLikeBtn.addEventListener("click", () =>
      handleReaction(post.id, "post", 1, newLikeBtn, newDislikeBtn)
    );
    newDislikeBtn.addEventListener("click", () =>
      handleReaction(post.id, "post", 2, newLikeBtn, newDislikeBtn)
    );

    const commentsContainer = postElement.querySelector(".post-comments");
    commentsContainer.innerHTML = "";
    (post.comments || []).forEach((comment) => {
      const commentElement = commentTemplate.content.cloneNode(true);
      const commentNode = commentElement.querySelector(".comment");
      commentNode.querySelector(".comment-user").textContent = comment.username;
      commentNode.querySelector(".comment-content").textContent =
        comment.content;
      commentNode.querySelector(".comment-time").textContent = new Date(
        comment.created_at
      ).toLocaleString();
      const commentLikeBtn = commentNode.querySelector(".like-btn");
      const commentDislikeBtn = commentNode.querySelector(".dislike-btn");
      const { likes, dislikes } = countReactions(comment.reactions || []);
      commentLikeBtn.querySelector(".like-count").textContent = likes;
      commentDislikeBtn.querySelector(".dislike-count").textContent = dislikes;
      commentLikeBtn.replaceWith(commentLikeBtn.cloneNode(true));
      commentDislikeBtn.replaceWith(commentDislikeBtn.cloneNode(true));
      const newCommentLikeBtn = commentNode.querySelector(".like-btn");
      const newCommentDislikeBtn = commentNode.querySelector(".dislike-btn");
      newCommentLikeBtn.addEventListener("click", () =>
        handleReaction(
          comment.id,
          "comment",
          1,
          newCommentLikeBtn,
          newCommentDislikeBtn
        )
      );
      newCommentDislikeBtn.addEventListener("click", () =>
        handleReaction(
          comment.id,
          "comment",
          2,
          newCommentLikeBtn,
          newCommentDislikeBtn
        )
      );
      commentsContainer.appendChild(commentElement);
    });

    const commentBtn = postContainer.querySelector(".comment-btn");
    commentBtn.addEventListener("click", () => {
      let commentInput = postContainer.querySelector(".comment-input");
      if (!commentInput) {
        commentInput = document.createElement("div");
        commentInput.classList.add("comment-input");
        const textarea = document.createElement("textarea");
        textarea.placeholder = "Write your comment...";
        textarea.rows = 3;
        textarea.style.width = "100%";
        const submitBtn = document.createElement("button");
        submitBtn.textContent = "Submit Comment";
        submitBtn.classList.add("comment-btn");
        submitBtn.addEventListener("click", async () => {
          const content = textarea.value.trim();
          if (!content) return;
          try {
            const res = await fetch(
              "http://localhost:8080/forum/api/comments",
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                  "X-CSRF-Token": sessionStorage.getItem("csrf_token"),
                },
                body: JSON.stringify({
                  post_id: post.id,
                  content: content,
                }),
              }
            );
            if (!res.ok) throw new Error("Failed to post comment");
            const newComment = await res.json();
            textarea.value = "";

            // Update the local `data` object by adding the new comment
            for (const category of data.categories) {
              const postToUpdate = category.posts.find((p) => p.id === post.id);
              if (postToUpdate) {
                if (!postToUpdate.comments) postToUpdate.comments = [];
                postToUpdate.comments.push(newComment);
                break;
              }
            }
            refreshFn();
          } catch (err) {
            console.error("Failed to submit comment:", err);
          }
        });
        commentInput.appendChild(textarea);
        commentInput.appendChild(submitBtn);
        postContainer.appendChild(commentInput);
      }
    });

    container.appendChild(postElement);
  }

  function renderAllPosts() {
    forumContainer.innerHTML = "";
    const postTemplate = document.getElementById("post-template");
    const commentTemplate = document.getElementById("comment-template");

    if (!data || !Array.isArray(data.categories)) {
      console.error("No valid categories to render");
      return;
    }

     const map = new Map();
      data.categories.forEach((category) => {
      (category.posts || []).forEach((post) => {
      if (map.has(post.id)) {
      map.get(post.id).categoryNames.push(category.name);
      } else {
      map.set(post.id, {
      ...post,
      categoryNames: [category.name],
              });
            }
          });
      });
    const allPosts = Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
);


    allPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    allPosts.forEach((post) => {
      renderPost(
        post,
        commentTemplate,
        postTemplate,
        forumContainer,
        post.categoryNames.join(", "),
        renderAllPosts
      );
    });
  }

  function renderPostsForCategory(categoryId) {
    forumContainer.innerHTML = "";
    if (!data || !data.categories) return;

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
      renderPost(
        post,
        commentTemplate,
        postTemplate,
        postsContainer,
        category.name,
        () => renderPostsForCategory(categoryId)
      );
    });

    forumContainer.appendChild(categoryElement);
  }

  if (myFeedLink) {
    myFeedLink.addEventListener("click", (e) => {
      e.preventDefault();
      document
        .querySelectorAll(".category-tabs a")
        .forEach((a) => a.classList.remove("active"));
      renderAllPosts();
    });
  }

  try {
    // 1. Fetch categories only for tabs
    const categoryRes = await fetch(
      "http://localhost:8080/forum/api/categories",
      { credentials: "include" }
    );
    if (!categoryRes.ok) throw new Error("Failed to fetch categories");
    const categories = await categoryRes.json();

    // 2. Use categories ONLY for tabs
    categoryTabs.innerHTML = "";
    categories.forEach((category) => {
      const tabItem = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = category.name;
      link.dataset.categoryId = category.id;

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

    // Use authenticated user data endpoint
    const userDataRes = await fetch("http://localhost:8080/forum/api/guest", {
      credentials: "include",
    });
    if (!userDataRes.ok) throw new Error("Failed to fetch user data");
    data = await userDataRes.json();

    // 3. Render all posts initially
    renderAllPosts();
  } catch (err) {
    console.error("Error fetching forum data:", err);
  }
}