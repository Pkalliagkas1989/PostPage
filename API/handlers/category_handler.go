package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"forum/repository"
	"forum/utils"
)

// CategoryHandler handles category related requests
type CategoryHandler struct {
	CategoryRepo *repository.CategoryRepository
	PostRepo     *repository.PostRepository
	CommentRepo  *repository.CommentRepository
	ReactionRepo *repository.ReactionRepository
}

// NewCategoryHandler creates a new CategoryHandler
func NewCategoryHandler(catRepo *repository.CategoryRepository, postRepo *repository.PostRepository, commentRepo *repository.CommentRepository, reactionRepo *repository.ReactionRepository) *CategoryHandler {
	return &CategoryHandler{
		CategoryRepo: catRepo,
		PostRepo:     postRepo,
		CommentRepo:  commentRepo,
		ReactionRepo: reactionRepo,
	}
}

// GetCategories returns all categories as JSON
func (h *CategoryHandler) GetCategories(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	categories, err := h.CategoryRepo.GetAll()
	if err != nil {
		utils.ErrorResponse(w, "Failed to load categories", http.StatusInternalServerError)
		return
	}

	utils.JSONResponse(w, categories, http.StatusOK)
}

// GetPostsByCategory returns all posts for a specific category along with
// related comments and reactions. The category ID is extracted from the URL
// path: /forum/api/categories/{id}/posts
func (h *CategoryHandler) GetPostsByCategory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/forum/api/categories/")
	parts := strings.Split(path, "/")
	if len(parts) < 2 || parts[1] != "posts" {
		utils.ErrorResponse(w, "Category ID required", http.StatusBadRequest)
		return
	}

	catID, err := strconv.Atoi(parts[0])
	if err != nil {
		utils.ErrorResponse(w, "Invalid category ID", http.StatusBadRequest)
		return
	}

	if _, err := h.CategoryRepo.GetByID(catID); err != nil {
		if err == repository.ErrCategoryNotFound {
			utils.ErrorResponse(w, "Category not found", http.StatusNotFound)
			return
		}
		utils.ErrorResponse(w, "Failed to load category", http.StatusInternalServerError)
		return
	}

	posts, err := h.PostRepo.GetPostsByCategoryWithUser(catID)
	if err != nil {
		utils.ErrorResponse(w, "Failed to load posts", http.StatusInternalServerError)
		return
	}

	var response []MyPostResponse
	for _, post := range posts {
		categories, err := h.PostRepo.GetCategoriesByPostID(post.ID)
		if err != nil {
			utils.ErrorResponse(w, "Failed to load categories", http.StatusInternalServerError)
			return
		}
		var catInfo []CategoryInfo
		for _, c := range categories {
			catInfo = append(catInfo, CategoryInfo{ID: c.ID, Name: c.Name})
		}

		comments, err := h.CommentRepo.GetCommentsByPostWithUser(post.ID)
		if err != nil {
			utils.ErrorResponse(w, "Failed to load comments", http.StatusInternalServerError)
			return
		}
		var commentResp []CommentResponse
		for _, c := range comments {
			cr := CommentResponse{
				ID:        c.ID,
				UserID:    c.UserID,
				Username:  c.Username,
				Content:   c.Content,
				CreatedAt: c.CreatedAt,
				Reactions: []ReactionResponse{},
			}
			reactions, err := h.ReactionRepo.GetReactionsByCommentWithUser(c.ID)
			if err != nil {
				utils.ErrorResponse(w, "Failed to load reactions", http.StatusInternalServerError)
				return
			}
			for _, r := range reactions {
				cr.Reactions = append(cr.Reactions, ReactionResponse{
					UserID:       r.UserID,
					Username:     r.Username,
					ReactionType: r.ReactionType,
					CreatedAt:    r.CreatedAt,
				})
			}
			commentResp = append(commentResp, cr)
		}

		reactions, err := h.ReactionRepo.GetReactionsByPostWithUser(post.ID)
		if err != nil {
			utils.ErrorResponse(w, "Failed to load reactions", http.StatusInternalServerError)
			return
		}
		var reactResp []ReactionResponse
		for _, r := range reactions {
			reactResp = append(reactResp, ReactionResponse{
				UserID:       r.UserID,
				Username:     r.Username,
				ReactionType: r.ReactionType,
				CreatedAt:    r.CreatedAt,
			})
		}

		response = append(response, MyPostResponse{
			ID:         post.ID,
			UserID:     post.UserID,
			Username:   post.Username,
			Categories: catInfo,
			Title:      post.Title,
			Content:    post.Content,
			CreatedAt:  post.CreatedAt,
			Comments:   commentResp,
			Reactions:  reactResp,
		})
	}

	utils.JSONResponse(w, response, http.StatusOK)
}
