package handlers

import (
	"net/http"
	"strconv"

	"forum/utils"
)

// ErrorHandler returns a JSON error response based on query parameters
func ErrorHandler(w http.ResponseWriter, r *http.Request) {
	codeStr := r.URL.Query().Get("code")
	code, _ := strconv.Atoi(codeStr)
	if code == 0 {
		code = http.StatusInternalServerError
	}

	msg := r.URL.Query().Get("message")
	if msg == "" {
		msg = http.StatusText(code)
	}

	utils.ErrorResponse(w, msg, code)
}
