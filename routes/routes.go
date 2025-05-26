package routes

import (
	"database/sql"
	"net/http"

	"forum/handlers"
	"forum/middleware"
	"forum/repository"
)

// SetupRoutes configures all routes for the application
func SetupRoutes(db *sql.DB) http.Handler {
	// Create repositories
	userRepo := repository.NewUserRepository(db)
	sessionRepo := repository.NewSessionRepository(db)

	postRepo := repository.NewPostRepository(db)
	commentRepo := repository.NewCommentRepository(db)
	reactionRepo := repository.NewReactionRepository(db)

	// Create handlers
	authHandler := handlers.NewAuthHandler(userRepo, sessionRepo)

	// Create middleware
	authMiddleware := middleware.NewAuthMiddleware(sessionRepo, userRepo)	

	guestHandler := handlers.NewGuestHandler(postRepo, commentRepo, reactionRepo)

	// Create router (using standard net/http for simplicity)
	mux := http.NewServeMux()

	// Define auth routes
	mux.HandleFunc("/forum/api/guest", guestHandler.GuestView)
	mux.HandleFunc("/forum/api/auth/register", authHandler.Register)
	mux.HandleFunc("/forum/api/auth/login", authHandler.Login)
	mux.HandleFunc("/forum/api/auth/logout", authHandler.Logout)

	// Apply middleware to all routes
	return authMiddleware.Authenticate(mux)
}
