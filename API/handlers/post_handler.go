package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"forum/middleware"
	"forum/models"
	"forum/repository"
	"forum/utils"
)

// PostHandler handles post related endpoints
type PostHandler struct {
	PostRepo     *repository.PostRepository
	CommentRepo  *repository.CommentRepository
	ReactionRepo *repository.ReactionRepository
}

// NewPostHandler creates a new PostHandler
func NewPostHandler(postRepo *repository.PostRepository, commentRepo *repository.CommentRepository, reactionRepo *repository.ReactionRepository) *PostHandler {
	return &PostHandler{
		PostRepo:     postRepo,
		CommentRepo:  commentRepo,
		ReactionRepo: reactionRepo,
	}
}

// CreatePost creates a new post for the authenticated user
func (h *PostHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	user := middleware.GetCurrentUser(r)
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		CategoryIDs []int  `json:"category_ids"` // Instead of CategoryID
		Title       string `json:"title"`
		Content     string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if len(req.CategoryIDs) == 0 || req.Title == "" || req.Content == "" {
		utils.ErrorResponse(w, "At least one category, title and content are required", http.StatusBadRequest)
		return
	}

	post := models.Post{
		UserID:  user.ID,
		Title:   req.Title,
		Content: req.Content,
	}

	created, err := h.PostRepo.Create(post, req.CategoryIDs)
	if err != nil {
		utils.ErrorResponse(w, "Failed to create post", http.StatusInternalServerError)
		return
	}

	utils.JSONResponse(w, created, http.StatusCreated)
}

// GetPost loads a single post with all related data
func (h *PostHandler) GetPost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/forum/api/posts/")
	if id == "" {
		utils.ErrorResponse(w, "Post ID required", http.StatusBadRequest)
		return
	}

	post, err := h.PostRepo.GetPostByIDWithUser(id)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.ErrorResponse(w, "Post not found", http.StatusNotFound)
			return
		}
		utils.ErrorResponse(w, "Failed to load post", http.StatusInternalServerError)
		return
	}

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

	resp := MyPostResponse{
		ID:         post.ID,
		UserID:     post.UserID,
		Username:   post.Username,
		Categories: catInfo,
		Title:      post.Title,
		Content:    post.Content,
		CreatedAt:  post.CreatedAt,
		Comments:   commentResp,
		Reactions:  reactResp,
	}
	utils.JSONResponse(w, resp, http.StatusOK)
}
