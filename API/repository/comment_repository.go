package repository

import (
	"database/sql"
	"forum/models"
	"forum/utils"
	"time"
)

type CommentRepository struct {
	db *sql.DB
}

func NewCommentRepository(db *sql.DB) *CommentRepository {
	return &CommentRepository{db: db}
}

func (r *CommentRepository) GetAllComments() ([]models.Comment, error) {
	rows, err := r.db.Query(`
		SELECT comment_id, post_id, user_id, content, created_at, updated_at 
		FROM comments ORDER BY created_at ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []models.Comment
	for rows.Next() {
		var c models.Comment
		err := rows.Scan(&c.ID, &c.PostID, &c.UserID, &c.Content, &c.CreatedAt, &c.UpdatedAt)
		if err != nil {
			return nil, err
		}
		comments = append(comments, c)
	}

	return comments, nil
}

// Create inserts a new comment into the database
func (r *CommentRepository) Create(comment models.Comment) (*models.Comment, error) {
	comment.ID = utils.GenerateUUID()
	comment.CreatedAt = time.Now()
	_, err := r.db.Exec(`INSERT INTO comments (comment_id, post_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)`,
		comment.ID, comment.PostID, comment.UserID, comment.Content, comment.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

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
