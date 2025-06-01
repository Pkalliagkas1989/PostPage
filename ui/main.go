package main

import (
	"log"
	"net/http"
)

func main() {
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)

	// Start the server on port 8081
	log.Println("Serving on http://localhost:8081/")
	err := http.ListenAndServe(":8081", nil)
	if err != nil {
		log.Fatal(err)
	}


}

