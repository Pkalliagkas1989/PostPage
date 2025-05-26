package handlers

import (
	"encoding/json"
	"forum/repository"
	"net/http"
)

type GuestHandler struct {
	postRepo     *repository.PostRepository
	commentRepo  *repository.CommentRepository
	reactionRepo *repository.ReactionRepository
}

func NewGuestHandler(postRepo *repository.PostRepository, commentRepo *repository.CommentRepository, reactionRepo *repository.ReactionRepository) *GuestHandler {
	return &GuestHandler{
		postRepo:     postRepo,
		commentRepo:  commentRepo,
		reactionRepo: reactionRepo,
	}
}

func (h *GuestHandler) GuestView(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	posts, err := h.postRepo.GetAllPosts()
	if err != nil {
		http.Error(w, "Failed to fetch posts", http.StatusInternalServerError)
		return
	}

	comments, err := h.commentRepo.GetAllComments()
	if err != nil {
		http.Error(w, "Failed to fetch comments", http.StatusInternalServerError)
		return
	}

	reactions, err := h.reactionRepo.GetAllReactions()
	if err != nil {
		http.Error(w, "Failed to fetch reactions", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"posts":     posts,
		"comments":  comments,
		"reactions": reactions,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
