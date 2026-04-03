package graphql

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"
)

const APIKeyHeader = "X-API-Key"

// AuthMiddleware creates middleware for GraphQL authentication
// Queries are public, mutations require API key
func AuthMiddleware(next http.Handler, resolver *Resolver) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Read body to check if it's a mutation
		body, err := readRequestBody(r)
		if err != nil {
			http.Error(w, "Failed to read request body", http.StatusBadRequest)
			return
		}

		// Check if this is a mutation
		if isMutation(body) {
			// Require API key for mutations
			apiKey := r.Header.Get(APIKeyHeader)
			if !validateAPIKey(apiKey) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{
					"error": "Unauthorized: Valid API key required for mutations",
				})
				return
			}
		}

		next.ServeHTTP(w, r)
	})
}

// readRequestBody reads and returns the request body
func readRequestBody(r *http.Request) ([]byte, error) {
	if r.Body == nil {
		return []byte{}, nil
	}
	var body []byte
	_, err := r.Body.Read(body)
	if err != nil {
		return nil, err
	}
	return body, nil
}

// isMutation checks if the GraphQL query is a mutation
func isMutation(body []byte) bool {
	bodyStr := strings.ToLower(string(body))
	return strings.Contains(bodyStr, "mutation")
}

// validateAPIKey validates the provided API key
func validateAPIKey(apiKey string) bool {
	expectedKey := os.Getenv("API_KEY")
	// If no API key is configured, allow all requests (dev mode)
	if expectedKey == "" {
		return true
	}
	return apiKey == expectedKey
}
