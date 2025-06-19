import { AuthGuard } from "./user-auth-guard.js";
import { ConfigManager } from "./user-config-manager.js";
import { DataManager } from "./user-data-manager.js";
import { ReactionHandler } from "./user-reaction-handler.js";
import { CommentHandler } from "./user-comment-handler.js";
import { PostRenderer } from "./user-post-renderer.js";
import { ForumRenderer } from "./user-forum-renderer.js";

(async () => {
  const authGuard = new AuthGuard();
  const configManager = new ConfigManager();

  history.replaceState(null, "", location.href);
  history.pushState(null, "", location.href);
  window.addEventListener("popstate", () => {
    history.pushState(null, "", location.href);
  });

  try {
    await configManager.loadConfig();
    const isAuth = await authGuard.checkAuthentication(configManager.getConfig());
    if (!isAuth) return;

    const dataManager = new DataManager();
    const reactionHandler = new ReactionHandler(configManager, dataManager);
    const commentHandler = new CommentHandler(configManager, dataManager);
    const postRenderer = new PostRenderer(reactionHandler, commentHandler);
    const forumRenderer = new ForumRenderer(postRenderer, dataManager);

    const API_CONFIG = configManager.getConfig();
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("id");
    if (!postId) {
      window.location.href = "/user";
      return;
    }

    const res = await fetch(API_CONFIG.PostURI + postId);
    if (!res.ok) throw new Error("Failed to fetch post data");
    const post = await res.json();

    const data = {
      categories: post.categories.map((c) => ({
        id: c.id,
        name: c.name,
        posts: [
          {
            id: post.id,
            user_id: post.user_id,
            username: post.username,
            title: post.title,
            content: post.content,
            created_at: post.created_at,
            comments: post.comments,
            reactions: post.reactions,
          },
        ],
      })),
    };

    dataManager.setData(data);
    forumRenderer.renderSinglePost(postId);
  } catch (err) {
    console.error("Error loading post:", err);
  }
})();
