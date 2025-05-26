package models

import "time"

type Post struct {
	ID         string     `json:"id"`
	UserID     string     `json:"user_id"`
	CategoryID int        `json:"category_id"`
	Content    string     `json:"content"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  *time.Time `json:"updated_at,omitempty"`
}
