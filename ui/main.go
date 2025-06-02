package main

import (
	"log"
	"net/http"
)

func main() {
	// Serve index.html at root
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./ui/templates/index.html")
	})

	// Serve static files
	fs := http.FileServer(http.Dir("./ui"))
	http.Handle("/ui/", http.StripPrefix("/ui/", fs))

	// Start the server
	log.Println("Serving on http://localhost:8081/")
	err := http.ListenAndServe(":8081", nil)
	if err != nil {
		log.Fatal(err)
	}
}
