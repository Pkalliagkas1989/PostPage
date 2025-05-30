package middleware

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

type rateInfo struct {
	lastAttempt     time.Time
	successfulUntil time.Time
}

type RateLimiter struct {
	mu      sync.Mutex
	clients map[string]*rateInfo
}

// NewRateLimiter initializes the IP map and cleanup job.
func NewRateLimiter() *RateLimiter {
	rl := &RateLimiter{
		clients: make(map[string]*rateInfo),
	}

	// Periodic cleanup
	go func() {
		for {
			time.Sleep(10 * time.Minute)
			rl.cleanup()
		}
	}()

	return rl
}

// Middleware for registration rate limiting
func (rl *RateLimiter) Limit(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ip := getRealIP(r)
		now := time.Now()

		rl.mu.Lock()
		info, exists := rl.clients[ip]
		if !exists {
			info = &rateInfo{}
			rl.clients[ip] = info
		}

		if info.successfulUntil.After(now) {
			rl.mu.Unlock()
			http.Error(w, "Too many registrations from this IP. Please wait 10 minutes.", http.StatusTooManyRequests)
			return
		}

		if info.lastAttempt.Add(20 * time.Second).After(now) {
			rl.mu.Unlock()
			http.Error(w, "Please wait 20 seconds before trying again.", http.StatusTooManyRequests)
			return
		}

		// Update last attempt before calling handler
		info.lastAttempt = now
		rl.mu.Unlock()

		// Use a ResponseWriter wrapper to capture status code
		rr := &responseRecorder{ResponseWriter: w, statusCode: 200}
		next(rr, r)

		// On successful registration (HTTP 201), lock IP for 10 mins
		if rr.statusCode == http.StatusCreated {
			rl.mu.Lock()
			info.successfulUntil = time.Now().Add(10 * time.Minute)
			rl.mu.Unlock()
		}
	}
}

// Get client IP from headers or remote addr
func getRealIP(r *http.Request) string {
	hdr := r.Header.Get("X-Forwarded-For")
	if hdr != "" {
		parts := strings.Split(hdr, ",")
		return strings.TrimSpace(parts[0])
	}
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

// ResponseWriter wrapper to capture status code
type responseRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (rr *responseRecorder) WriteHeader(code int) {
	rr.statusCode = code
	rr.ResponseWriter.WriteHeader(code)
}

// Remove expired entries
func (rl *RateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	for ip, info := range rl.clients {
		if info.successfulUntil.Before(now.Add(-10*time.Minute)) &&
			info.lastAttempt.Before(now.Add(-10*time.Minute)) {
			delete(rl.clients, ip)
		}
	}
}
