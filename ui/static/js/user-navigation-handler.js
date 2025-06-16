// Navigation handling functionality with dropdown categories
class NavigationHandler {
  constructor(forumRenderer, configManager) {
    this.forumRenderer = forumRenderer;
    this.configManager = configManager;
    this.isDropdownOpen = false;
  }

  setupMyFeedLink() {
    const myFeedLink = document.getElementById("my-feed-link");
    if (myFeedLink) {
      myFeedLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.closeDropdown();
        document
          .querySelectorAll(".category-tabs a")
          .forEach((a) => a.classList.remove("active"));
        this.forumRenderer.renderAllPosts();
      });
    }
  }

  setupCategoryTabs(categories) {
    this.setupCategoryDropdown();
    this.populateCategories(categories);
  }

  setupCategoryDropdown() {
    const categoryToggle = document.querySelector('.category-toggle');
    const categoryTabs = document.getElementById("category-tabs");
    
    if (!categoryToggle || !categoryTabs) return;

    // Add dropdown arrow to the toggle (only if not already added)
    if (!categoryToggle.querySelector('.dropdown-arrow')) {
      categoryToggle.innerHTML = 'Categories <span class="dropdown-arrow">▼</span>';
      categoryToggle.classList.add('category-dropdown-toggle');
    }

    // Remove existing event listeners to avoid duplicates
    categoryToggle.replaceWith(categoryToggle.cloneNode(true));
    const newCategoryToggle = document.querySelector('.category-toggle');

    // Create dropdown functionality
    newCategoryToggle.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.side-menu')) {
        this.closeDropdown();
      }
    });
  }

  populateCategories(categories) {
    const categoryTabs = document.getElementById("category-tabs");
    if (!categoryTabs) return;

    categoryTabs.innerHTML = "";
    categoryTabs.classList.add('dropdown-content');

    if (!categories || categories.length === 0) {
      const noCategories = document.createElement("li");
      noCategories.innerHTML = '<span class="no-categories">No categories available</span>';
      categoryTabs.appendChild(noCategories);
      return;
    }

    categories.forEach((category) => {
      const tabItem = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = category.name;
      link.dataset.categoryId = category.id;
      link.classList.add('category-item');

      link.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Remove active class from all category links
        document
          .querySelectorAll(".category-tabs a")
          .forEach((a) => a.classList.remove("active"));
        
        // Add active class to clicked link
        link.classList.add("active");

        // Close dropdown 
        // this.closeDropdown();

        // Render posts for this category
        this.forumRenderer.renderPostsForCategory(category.id);
      });

      tabItem.appendChild(link);
      categoryTabs.appendChild(tabItem);
    });
  }

  toggleDropdown() {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    const categoryTabs = document.getElementById("category-tabs");
    const arrow = document.querySelector('.dropdown-arrow');
    
    if (categoryTabs && arrow) {
      categoryTabs.classList.add('open');
      arrow.style.transform = 'rotate(180deg)';
      this.isDropdownOpen = true;
    }
  }

  closeDropdown() {
    const categoryTabs = document.getElementById("category-tabs");
    const arrow = document.querySelector('.dropdown-arrow');
    
    if (categoryTabs && arrow) {
      categoryTabs.classList.remove('open');
      arrow.style.transform = 'rotate(0deg)';
      this.isDropdownOpen = false;
    }
  }

  setupLogoutLink() {
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
      logoutLink.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await this.configManager.loadConfig();
          const API_CONFIG = this.configManager.getConfig();
          
          const res = await fetch(API_CONFIG.LogoutURI, {
            method: "POST",
            credentials: "include",
          });

          if (!res.ok) throw new Error("Logout failed");

          // Optionally, clear CSRF token
          sessionStorage.removeItem("csrf_token");

          // Redirect to login
          window.location.href = "/login";
        } catch (err) {
          console.error("Logout failed:", err);
          alert("Logout failed. Please try again.");
        }
      });
    }
  }
}

export { NavigationHandler };