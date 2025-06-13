import { AuthGuard } from './user-auth-guard.js';
import { ConfigManager } from './user-config-manager.js';
import { DataManager } from './user-data-manager.js';
import { ReactionHandler } from './user-reaction-handler.js';
import { CommentHandler } from './user-comment-handler.js';
import { PostRenderer } from './user-post-renderer.js';
import { ForumRenderer } from './user-forum-renderer.js';
import { NavigationHandler } from './user-navigation-handler.js';

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize all components
  const authGuard = new AuthGuard();
  const configManager = new ConfigManager();
  const dataManager = new DataManager();
  const reactionHandler = new ReactionHandler(configManager, dataManager);
  const commentHandler = new CommentHandler(configManager, dataManager);
  const postRenderer = new PostRenderer(reactionHandler, commentHandler);
  const forumRenderer = new ForumRenderer(postRenderer, dataManager);
  const navigationHandler = new NavigationHandler(forumRenderer, configManager);

  try {
    // Load configuration and check authentication
    await configManager.loadConfig();
    const isAuthenticated = await authGuard.checkAuthentication(configManager.getConfig());
    
    if (!isAuthenticated) {
      return; // Stop further execution if not authenticated
    }

    // Setup navigation
    navigationHandler.setupMyFeedLink();
    navigationHandler.setupLogoutLink();

    // Fetch data
    const API_CONFIG = configManager.getConfig();
    
    // 1. Fetch categories only for tabs
    const categoryRes = await fetch(API_CONFIG.CategoriesURI);
    if (!categoryRes.ok) throw new Error("Failed to fetch categories");
    const categories = await categoryRes.json();

    // 2. Fetch guest data with posts and comments
    const guestRes = await fetch(API_CONFIG.DataURI);
    if (!guestRes.ok) throw new Error("Failed to fetch guest data");
    const guestData = await guestRes.json();

    // 3. Use categories ONLY for tabs
    navigationHandler.setupCategoryTabs(categories);

    // 4. Use guestData as your data source for categories + posts
    dataManager.setData(guestData);

    // 5. Render all posts initially
    forumRenderer.renderAllPosts();
  } catch (err) {
    console.error("Error fetching forum data:", err);
  }
});