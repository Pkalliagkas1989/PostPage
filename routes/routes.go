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

	categoryRepo := repository.NewCategoryRepository(db)
	postRepo := repository.NewPostRepository(db)
	commentRepo := repository.NewCommentRepository(db)
	reactionRepo := repository.NewReactionRepository(db)

	// Create handlers
	authHandler := handlers.NewAuthHandler(userRepo, sessionRepo)

	// Create middleware
	registerLimiter := middleware.NewRateLimiter()

	authMiddleware := middleware.NewAuthMiddleware(sessionRepo, userRepo)	

	guestHandler := handlers.NewGuestHandler(categoryRepo, postRepo, commentRepo, reactionRepo)

	// Create router (using standard net/http for simplicity)
	mux := http.NewServeMux()

	// Define auth routes
	mux.HandleFunc("/forum/api/guest", guestHandler.GetGuestData)
	mux.HandleFunc("/forum/api/register", registerLimiter.Limit(authHandler.Register))
	mux.HandleFunc("/forum/api/session/login", authHandler.Login)
	mux.HandleFunc("/forum/api/session/logout", authHandler.Logout)

	// Apply middleware to all routes
	return authMiddleware.Authenticate(mux)
}
