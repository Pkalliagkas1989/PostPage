package repository

import (
	"database/sql"
	"time"

	"forum/models"
	"forum/utils"
)

type PostRepository struct {
	db *sql.DB
}

// checks if the legacy category_id column exists on the posts table
func (r *PostRepository) hasLegacyCategoryColumn() bool {
	rows, err := r.db.Query(`PRAGMA table_info(posts)`)
	if err != nil {
		return false
	}
	defer rows.Close()
	for rows.Next() {
		var cid int
		var name, ctype string
		var notnull int
		var dflt interface{}
		var pk int
		if err := rows.Scan(&cid, &name, &ctype, &notnull, &dflt, &pk); err == nil {
			if name == "category_id" {
				return true
			}
		}
	}
	return false
}

func NewPostRepository(db *sql.DB) *PostRepository {
	return &PostRepository{db: db}
}

func (r *PostRepository) GetAllPosts() ([]models.Post, error) {
	rows, err := r.db.Query(`
		SELECT post_id, user_id, title, content, created_at, updated_at
                FROM posts ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var post models.Post
		//err := rows.Scan(&post.ID, &post.UserID, &post.CategoryID, &post.Title, &post.Content, &post.CreatedAt, &post.UpdatedAt)
		err := rows.Scan(&post.ID, &post.UserID, &post.Title, &post.Content, &post.CreatedAt, &post.UpdatedAt)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}

	return posts, nil
}

// Create inserts a new post into the database
//func (r *PostRepository) Create(post models.Post) (*models.Post, error) {
func (r *PostRepository) Create(post models.Post, categoryIDs []int) (*models.Post, error) {
	post.ID = utils.GenerateUUID()
	post.CreatedAt = time.Now()
	// _, err := r.db.Exec(`INSERT INTO posts (post_id, user_id, category_id, title, content, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
	// 	post.ID, post.UserID, post.CategoryID, post.Title, post.Content, post.CreatedAt)

	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}

	var insertPost string
	var args []interface{}
	if r.hasLegacyCategoryColumn() {
		if len(categoryIDs) == 0 {
			tx.Rollback()
			return nil, sql.ErrNoRows
		}
		insertPost = `INSERT INTO posts (post_id, user_id, category_id, title, content, created_at) VALUES (?, ?, ?, ?, ?, ?)`
		args = []interface{}{post.ID, post.UserID, categoryIDs[0], post.Title, post.Content, post.CreatedAt}
	} else {
		insertPost = `INSERT INTO posts (post_id, user_id, title, content, created_at) VALUES (?, ?, ?, ?, ?)`
		args = []interface{}{post.ID, post.UserID, post.Title, post.Content, post.CreatedAt}
	}

	_, err = tx.Exec(insertPost, args...)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	stmt, err := tx.Prepare(`INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)`)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	defer stmt.Close()

	for _, cid := range categoryIDs {
		if _, err := stmt.Exec(post.ID, cid); err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &post, nil
}