package entity

// Tag represents a tag entity
type Tag struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

// TableName returns the D1 table name for tags
func (t *Tag) TableName() string {
	return "tags"
}

// BlogTag represents the junction table between blog posts and tags
type BlogTag struct {
	BlogPostID int64 `json:"blog_post_id"`
	TagID      int64 `json:"tag_id"`
}

// TableName returns the D1 table name for blog tags junction
func (bt *BlogTag) TableName() string {
	return "blog_tags"
}
