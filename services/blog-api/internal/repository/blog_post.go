package repository

import (
	"context"

	"github.com/mimifuwacc/blog-api/internal/entity"
)

// BlogPostRepository handles blog post database operations
type BlogPostRepository interface {
	// Upsert inserts or updates a blog post
	Upsert(ctx context.Context, post *entity.BlogPost) error

	// Delete deletes a blog post by slug
	Delete(ctx context.Context, slug string) error

	// FindBySlug finds a blog post by slug
	FindBySlug(ctx context.Context, slug string) (*entity.BlogPost, error)

	// FindAll finds all blog posts
	FindAll(ctx context.Context) ([]*entity.BlogPost, error)

	// DeleteTags deletes all tags for a blog post
	DeleteTags(ctx context.Context, blogPostID int64) error
}
