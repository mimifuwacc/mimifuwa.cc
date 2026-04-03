package middleware

import (
	"os"
	"strings"
)

const APIKeyHeader = "X-API-Key"

// GetAPIKey returns the configured API key from environment
func GetAPIKey() string {
	return os.Getenv("API_KEY")
}

// ValidateAPIKey checks if the provided API key is valid
func ValidateAPIKey(providedKey string) bool {
	expectedKey := GetAPIKey()
	// If no API key is configured, allow all requests (dev mode)
	if expectedKey == "" {
		return true
	}
	return providedKey == expectedKey
}

// IsPublicQuery returns true if the operation is a public query (read-only)
func IsPublicQuery(query string) bool {
	// Simple check - public queries are: blogPost, blogPosts, tags
	queryLower := strings.ToLower(query)
	return strings.Contains(queryLower, "query") &&
		!strings.Contains(queryLower, "mutation")
}

// ExtractQueryFromRequest extracts the GraphQL query from request body
func ExtractQueryFromRequest(body []byte) string {
	// Simple JSON parsing to extract "query" field
	bodyStr := string(body)
	queryStart := strings.Index(bodyStr, `"query":`)
	if queryStart == -1 {
		return ""
	}
	// Find the value after "query":
	valueStart := strings.Index(bodyStr[queryStart+8:], `"`)
	if valueStart == -1 {
		return ""
	}
	valueStart += queryStart + 9
	valueEnd := strings.Index(bodyStr[valueStart:], `"`)
	if valueEnd == -1 {
		return ""
	}
	return bodyStr[valueStart : valueStart+valueEnd]
}
