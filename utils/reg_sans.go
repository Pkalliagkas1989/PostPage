package utils

import (
	"regexp"
)


//Only allow letters, numbers, underscores
//Length: 3–50 characters
//Prevent leading/trailing whitespace

var UsernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]{3,50}$`)


//Min 8 characters
//(Optional: enforce upper/lower/digit/symbol)
//Prevent accidental whitespace

func IsStrongPassword(password string) bool {
	var hasLetter, hasDigit bool

	for _, c := range password {
		switch {
		case 'a' <= c && c <= 'z', 'A' <= c && c <= 'Z':
			hasLetter = true
		case '0' <= c && c <= '9':
			hasDigit = true
		}
	}
	return len(password) >= 8 && hasLetter && hasDigit
}

