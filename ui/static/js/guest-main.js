import { ConfigManager } from './user-config-manager.js';
import { DataManager } from './user-data-manager.js';
import { PostRenderer } from './user-post-renderer.js';
import { ForumRenderer } from './user-forum-renderer.js';
import { NavigationHandler } from './user-navigation-handler.js';

// No-op handlers disable interactions for guests
class DisabledReactionHandler {
  handleReaction() {}
}

class DisabledCommentHandler {
  addCommentInput() {}
}

(async () => {
  const configManager = new ConfigManager();
  await configManager.loadConfig();

  const dataManager = new DataManager();
  const reactionHandler = new DisabledReactionHandler();
  const commentHandler = new DisabledCommentHandler();
  const postRenderer = new PostRenderer(reactionHandler, commentHandler);
  const forumRenderer = new ForumRenderer(postRenderer, dataManager);
  const navigationHandler = new NavigationHandler(forumRenderer, configManager);

  navigationHandler.setupMyFeedLink();
  navigationHandler.setupCategoryTabs([]);

  try {
    const API_CONFIG = configManager.getConfig();
    const [categoryRes, guestRes] = await Promise.all([
      fetch(API_CONFIG.CategoriesURI),
      fetch(API_CONFIG.DataURI),
    ]);

    if (!categoryRes.ok || !guestRes.ok) {
      throw new Error('Failed to fetch forum data');
    }

    const [categories, guestData] = await Promise.all([
      categoryRes.json(),
      guestRes.json(),
    ]);

    navigationHandler.setupCategoryTabs(categories);
    dataManager.setData(guestData);
    forumRenderer.renderAllPosts();
  } catch (err) {
    console.error('Error fetching forum data:', err);
  }
})();