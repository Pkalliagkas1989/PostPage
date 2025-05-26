package handlers

import (
	"encoding/json"
	"forum/repository"
	"net/http"
	"time"
)

type GuestHandler struct {
	categoryRepo  *repository.CategoryRepository
	postRepo      *repository.PostRepository
	commentRepo   *repository.CommentRepository
	reactionRepo  *repository.ReactionRepository
}


type ReactionResponse struct {
	UserID       string    `json:"user_id"`
	Username     string    `json:"username"`
	ReactionType int       `json:"reaction_type"`
	CreatedAt    time.Time `json:"created_at"`
}

type CommentResponse struct {
	ID        string             `json:"id"`
	UserID    string             `json:"user_id"`
	Username  string             `json:"username"`
	Content   string             `json:"content"`
	CreatedAt time.Time          `json:"created_at"`
	Reactions []ReactionResponse `json:"reactions,omitempty"`
}

type PostResponse struct {
	ID        string             `json:"id"`
	UserID    string             `json:"user_id"`
	Username  string             `json:"username"`
	Content   string             `json:"content"`
	CreatedAt time.Time          `json:"created_at"`
	Comments  []CommentResponse  `json:"comments,omitempty"`
	Reactions []ReactionResponse `json:"reactions,omitempty"`
}

type CategoryResponse struct {
	ID    int            `json:"id"`
	Name  string         `json:"name"`
	Posts []PostResponse `json:"posts"`
}

type GuestResponse struct {
	Categories []CategoryResponse `json:"categories"`
}

func NewGuestHandler(
	categoryRepo *repository.CategoryRepository,
	postRepo *repository.PostRepository,
	commentRepo *repository.CommentRepository,
	reactionRepo *repository.ReactionRepository,
) *GuestHandler {
	return &GuestHandler{
		categoryRepo: categoryRepo,
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


func (h *GuestHandler) GetGuestData(w http.ResponseWriter, r *http.Request) {
    // 1. Get all categories
    categories, err := h.categoryRepo.GetAll()
    if err != nil {
        http.Error(w, "Failed to load categories", http.StatusInternalServerError)
        return
    }

    var response GuestResponse
    for _, cat := range categories {
        catResp := CategoryResponse{
            ID:   cat.ID,
            Name: cat.Name,
        }

        // 2. Get posts for category
        posts, err := h.postRepo.GetPostsByCategoryWithUser(cat.ID)
        if err != nil {
            http.Error(w, "Failed to load posts", http.StatusInternalServerError)
            return
        }

        for _, post := range posts {
            postResp := PostResponse{
                ID:        post.ID,
                UserID:    post.UserID,
                Username:  post.Username,
                Content:   post.Content,
                CreatedAt: post.CreatedAt,
            }

            // 3. Get comments for post
            comments, err := h.commentRepo.GetCommentsByPostWithUser(post.ID)
            if err != nil {
                http.Error(w, "Failed to load comments", http.StatusInternalServerError)
                return
            }

            for _, comment := range comments {
                commentResp := CommentResponse{
                    ID:        comment.ID,
                    UserID:    comment.UserID,
                    Username:  comment.Username,
                    Content:   comment.Content,
                    CreatedAt: comment.CreatedAt,
                }

                // 4. Get reactions for comment
                reactions, err := h.reactionRepo.GetReactionsByCommentWithUser(comment.ID)
                if err != nil {
                    http.Error(w, "Failed to load reactions", http.StatusInternalServerError)
                    return
                }
                for _, reaction := range reactions {
                    commentResp.Reactions = append(commentResp.Reactions, ReactionResponse{
                        UserID:      reaction.UserID,
                        Username:    reaction.Username,
                        ReactionType: reaction.ReactionType,
                        CreatedAt:   reaction.CreatedAt,
                    })
                }

                postResp.Comments = append(postResp.Comments, commentResp)
            }

            // 5. Get reactions for post
            reactions, err := h.reactionRepo.GetReactionsByPostWithUser(post.ID)
            if err != nil {
                http.Error(w, "Failed to load reactions", http.StatusInternalServerError)
                return
            }
            for _, reaction := range reactions {
                postResp.Reactions = append(postResp.Reactions, ReactionResponse{
                    UserID:      reaction.UserID,
                    Username:    reaction.Username,
                    ReactionType: reaction.ReactionType,
                    CreatedAt:   reaction.CreatedAt,
                })
            }

            catResp.Posts = append(catResp.Posts, postResp)
        }

        response.Categories = append(response.Categories, catResp)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}
