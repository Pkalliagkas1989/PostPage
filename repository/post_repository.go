package repository

import (
	"database/sql"
	"forum/models"
	"forum/utils"
	"time"
)

type PostRepository struct {
	db *sql.DB
}

func NewPostRepository(db *sql.DB) *PostRepository {
	return &PostRepository{db: db}
}

func (r *PostRepository) GetAllPosts() ([]models.Post, error) {
	rows, err := r.db.Query(`
		SELECT post_id, user_id, category_id, title, content, created_at, updated_at 
		FROM posts ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var post models.Post
		err := rows.Scan(&post.ID, &post.UserID, &post.Title, &post.Content, &post.CreatedAt, &post.UpdatedAt)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}

	return posts, nil
}

// Create inserts a new post into the database
func (r *PostRepository) Create(post models.Post, categoryIDs []int) (*models.Post, error) {
	post.ID = utils.GenerateUUID()
	post.CreatedAt = time.Now()

	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}

	// Insert the post
	_, err = tx.Exec(`INSERT INTO posts (post_id, user_id, title, content, created_at) VALUES (?, ?, ?, ?, ?)`,
		post.ID, post.UserID, post.Title, post.Content, post.CreatedAt)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	// Insert post-category relationships
	stmt, err := tx.Prepare(`INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)`)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	defer stmt.Close()

	for _, cid := range categoryIDs {
		_, err = stmt.Exec(post.ID, cid)
		if err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	return &post, nil
}

