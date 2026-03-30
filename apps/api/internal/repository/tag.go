package repository

import (
	"context"

	"github.com/mimifuwacc/api/internal/entity"
)

// TagRepository handles tag database operations
type TagRepository interface {
	// FindOrCreate finds a tag by name or creates it
	FindOrCreate(ctx context.Context, name string) (*entity.Tag, error)

	// FindByName finds a tag by name
	FindByName(ctx context.Context, name string) (*entity.Tag, error)

	// Create creates a new tag
	Create(ctx context.Context, tag *entity.Tag) error

	// LinkToBlogPost links a tag to a blog post
	LinkToBlogPost(ctx context.Context, blogPostID, tagID int64) error
}
