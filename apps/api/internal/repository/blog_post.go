package repository

import (
	"context"
	"time"

	"github.com/mimifuwacc/api/internal/entity"
)

// BlogPostFilter represents filter options for blog posts
type BlogPostFilter struct {
	Draft      *bool
	TagName    *string
	SearchTerm *string
	DateAfter  *time.Time
	DateBefore *time.Time
}

// Pagination represents pagination parameters
type Pagination struct {
	Limit  int
	Offset int
	Cursor string
}

// BlogPostRepository handles blog post database operations
type BlogPostRepository interface {
	// Upsert inserts or updates a blog post
	Upsert(ctx context.Context, post *entity.BlogPost) error

	// Delete deletes a blog post by slug
	Delete(ctx context.Context, slug string) error

	// FindBySlug finds a blog post by slug
	FindBySlug(ctx context.Context, slug string) (*entity.BlogPost, error)

	// FindBySlugWithTags finds a blog post by slug with tags loaded
	FindBySlugWithTags(ctx context.Context, slug string) (*entity.BlogPost, error)

	// FindAll finds all blog posts
	FindAll(ctx context.Context) ([]*entity.BlogPost, error)

	// FindWithPagination finds blog posts with pagination and filtering
	FindWithPagination(ctx context.Context, filter BlogPostFilter, pagination Pagination) ([]*entity.BlogPost, error)

	// Count returns the total count of blog posts matching the filter
	Count(ctx context.Context, filter BlogPostFilter) (int64, error)

	// UpdateDraftStatus updates the draft status of a blog post
	UpdateDraftStatus(ctx context.Context, slug string, draft bool) error

	// DeleteTags deletes all tags for a blog post
	DeleteTags(ctx context.Context, blogPostID int64) error
}
