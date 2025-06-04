// repository/category_repository.go
package repository

import (
	"database/sql"
	"forum/models"
)

type CategoryRepository struct {
	db *sql.DB
}

func NewCategoryRepository(db *sql.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) GetAll() ([]models.Category, error) {
	rows, err := r.db.Query("SELECT category_id, name FROM categories")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var cat models.Category
		if err := rows.Scan(&cat.ID, &cat.Name); err != nil {
			return nil, err
		}
		categories = append(categories, cat)
	}
	return categories, nil
}

// repository/post_repository.go
func (r *PostRepository) GetPostsByCategoryWithUser(categoryID int) ([]models.PostWithUser, error) {
	query := `SELECT p.post_id, p.user_id, u.username, p.category_id, p.title, p.content, p.created_at
			  FROM posts p JOIN user u ON p.user_id = u.user_id
			  WHERE p.category_id = ?`

	rows, err := r.db.Query(query, categoryID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []models.PostWithUser
	for rows.Next() {
		var p models.PostWithUser
		if err := rows.Scan(&p.ID, &p.UserID, &p.Username, &p.CategoryID, &p.Title, &p.Content, &p.CreatedAt); err != nil {
			return nil, err
		}
		posts = append(posts, p)
	}
	return posts, nil
}

// repository/comment_repository.go
func (r *CommentRepository) GetCommentsByPostWithUser(postID string) ([]models.CommentWithUser, error) {
	query := `SELECT c.comment_id, c.post_id, c.user_id, u.username, c.content, c.created_at
			  FROM comments c JOIN user u ON c.user_id = u.user_id
			  WHERE c.post_id = ?`

	rows, err := r.db.Query(query, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []models.CommentWithUser
	for rows.Next() {
		var c models.CommentWithUser
		if err := rows.Scan(&c.ID, &c.PostID, &c.UserID, &c.Username, &c.Content, &c.CreatedAt); err != nil {
			return nil, err
		}
		comments = append(comments, c)
	}
	return comments, nil
}

// repository/reaction_repository.go
func (r *ReactionRepository) GetReactionsByPostWithUser(postID string) ([]models.ReactionWithUser, error) {
	query := `SELECT r.user_id, u.username, r.reaction_type, r.post_id, r.created_at
			  FROM reactions r JOIN user u ON r.user_id = u.user_id
			  WHERE r.post_id = ?`

	rows, err := r.db.Query(query, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reactions []models.ReactionWithUser
	for rows.Next() {
		var r models.ReactionWithUser
		if err := rows.Scan(&r.UserID, &r.Username, &r.ReactionType, &r.PostID, &r.CreatedAt); err != nil {
			return nil, err
		}
		reactions = append(reactions, r)
	}
	return reactions, nil
}

func (r *ReactionRepository) GetReactionsByCommentWithUser(commentID string) ([]models.ReactionWithUser, error) {
	query := `SELECT r.user_id, u.username, r.reaction_type, r.comment_id, r.created_at
			  FROM reactions r JOIN user u ON r.user_id = u.user_id
			  WHERE r.comment_id = ?`

	rows, err := r.db.Query(query, commentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reactions []models.ReactionWithUser
	for rows.Next() {
		var r models.ReactionWithUser
		if err := rows.Scan(&r.UserID, &r.Username, &r.ReactionType, &r.CommentID, &r.CreatedAt); err != nil {
			return nil, err
		}
		reactions = append(reactions, r)
	}
	return reactions, nil
}
