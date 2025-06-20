package main

import (
	"log"
	"net/http"
	"net/url"
	"strconv"
)

func renderError(w http.ResponseWriter, r *http.Request, code int, msg string) {
	q := url.Values{}
	q.Set("code", strconv.Itoa(code))
	q.Set("message", msg)
	r.URL.RawQuery = q.Encode()
	w.WriteHeader(code)
	http.ServeFile(w, r, "./static/templates/error.html")
}

func main() {
	mux := http.NewServeMux()

	// Serve static assets (css, js, images)
	fs := http.FileServer(http.Dir("./static"))
	mux.Handle("/static/", http.StripPrefix("/static/", fs))

	// Serve individual HTML pages
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			renderError(w, r, http.StatusNotFound, "Page not found")
			return
		}
		http.ServeFile(w, r, "./static/templates/index.html")
	})
	mux.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/templates/login.html")
	})
	mux.HandleFunc("/register", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/templates/register.html")
	})
	mux.HandleFunc("/guest", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/templates/guest.html")
	})
	mux.HandleFunc("/user", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/templates/user.html")
	})
	mux.HandleFunc("/post", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/templates/post.html")
	})

	mux.HandleFunc("/error", func(w http.ResponseWriter, r *http.Request) {
		codeStr := r.URL.Query().Get("code")
		code, _ := strconv.Atoi(codeStr)
		if code == 0 {
			code = http.StatusInternalServerError
		}
		msg := r.URL.Query().Get("message")
		if msg == "" {
			msg = http.StatusText(code)
		}
		renderError(w, r, code, msg)
	})

	// Start the server
	log.Println("Serving on http://localhost:8081/")
	if err := http.ListenAndServe(":8081", mux); err != nil {
		log.Fatal(err)
	}
}
