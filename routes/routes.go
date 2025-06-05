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
	corsMiddleware := middleware.NewCORSMiddleware("http://localhost:8081")

	// Create router (using standard net/http for simplicity)
	mux := http.NewServeMux()

	// Define auth routes
	mux.Handle("/forum/api/guest", corsMiddleware.Handler(http.HandlerFunc(guestHandler.GetGuestData)))
	mux.Handle("/forum/api/register", corsMiddleware.Handler(http.HandlerFunc(registerLimiter.Limit(authHandler.Register))))
	mux.Handle("/forum/api/session/login", corsMiddleware.Handler(http.HandlerFunc(authHandler.Login)))
	mux.HandleFunc("/forum/api/session/logout", authHandler.Logout)
	mux.Handle("/forum/api/session/verify", corsMiddleware.Handler(http.HandlerFunc(authHandler.VerifySession)))

	// Apply middleware to all routes
	return authMiddleware.Authenticate(mux)
}
