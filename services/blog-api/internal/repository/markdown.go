package repository

import (
	"context"

	"github.com/mimifuwacc/blog-api/internal/entity"
)

// MarkdownParser handles markdown file parsing
type MarkdownParser interface {
	// Parse parses a markdown file and returns the blog post
	Parse(ctx context.Context, content []byte) (*entity.BlogPost, error)

	// ParseFile parses a markdown file from disk
	ParseFile(ctx context.Context, path string) (*entity.BlogPost, error)

	// FindMarkdownFiles finds all markdown files in the blogs directory
	FindMarkdownFiles() ([]string, error)
}
