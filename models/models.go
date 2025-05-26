package models

import (
	"time"
)

// User represents a forum user
type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

// UserAuth contains user authentication information
type UserAuth struct {
	UserID       string `json:"-"`
	PasswordHash string `json:"-"`
}

// UserRegistration is used for registration requests
type UserRegistration struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// UserLogin is used for login requests
type UserLogin struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Session represents a user session
type Session struct {
	UserID     string    `json:"user_id"`
	SessionID  string    `json:"session_id"`
	IPAddress  string    `json:"ip_address"`
	CreatedAt  time.Time `json:"created_at"`
	ExpiresAt  time.Time `json:"expires_at"`
}

// LoginResponse is the response after successful login
type LoginResponse struct {
	User      User   `json:"user"`
	SessionID string `json:"session_id"`
}

// Category represents a discussion category
type Category struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// PostWithUser is a post along with the username of its author
type PostWithUser struct {
	ID         string    `json:"id"`
	UserID     string    `json:"user_id"`
	Username   string    `json:"username"`
	CategoryID int       `json:"category_id"`
	Content    string    `json:"content"`
	CreatedAt  time.Time `json:"created_at"`
}

// CommentWithUser is a comment along with the username of its author
type CommentWithUser struct {
	ID        string    `json:"id"`
	PostID    string    `json:"post_id"`
	UserID    string    `json:"user_id"`
	Username  string    `json:"username"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

// ReactionWithUser is a reaction along with the username of the user who reacted
type ReactionWithUser struct {
	UserID       string    `json:"user_id"`
	Username     string    `json:"username"`
	ReactionType int       `json:"reaction_type"`
	PostID       *string   `json:"post_id,omitempty"`
	CommentID    *string   `json:"comment_id,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}