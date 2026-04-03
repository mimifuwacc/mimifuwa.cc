package repository

import "context"

// GitRepository handles git operations
type GitRepository interface {
	// GetChangedFiles returns the list of changed files
	GetChangedFiles(ctx context.Context, base string) ([]string, error)

	// GetCurrentBranch returns the current branch name
	GetCurrentBranch(ctx context.Context) (string, error)
}
