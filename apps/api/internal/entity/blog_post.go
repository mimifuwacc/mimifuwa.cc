package entity

import "time"

// BlogPost represents a blog post entity
type BlogPost struct {
	Slug        string    `json:"slug"`
	R2Key       string    `json:"r2_key"`
	Title       string    `json:"title"`
	Excerpt     string    `json:"excerpt"`
	Date        time.Time `json:"date"`
	Tags        []string  `json:"tags"`
	Draft       bool      `json:"draft"`
	ContentHash string    `json:"content_hash,omitempty"` // SHA256 hash of markdown content
	Content     string    `json:"content,omitempty"`       // Not stored in D1, only for upload
}

// TableName returns the D1 table name for blog posts
func (b *BlogPost) TableName() string {
	return "blog_posts"
}

// IsActive returns true if the post is not a draft
func (b *BlogPost) IsActive() bool {
	return !b.Draft
}
