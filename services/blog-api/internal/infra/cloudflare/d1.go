package cloudflare

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/cloudflare/cloudflare-go/v6"
	"github.com/cloudflare/cloudflare-go/v6/option"
	"github.com/mimifuwacc/blog-api/internal/entity"
)

// D1Config represents the configuration for D1 client
type D1Config struct {
	AccountID  string
	APIToken   string
	DatabaseID string
}

// D1Client implements repository.BlogPostRepository and repository.TagRepository
type D1Client struct {
	client     *cloudflare.Client
	accountID  string
	databaseUUID string
}

// NewD1Client creates a new D1 client
func NewD1Client(cfg *D1Config) (*D1Client, error) {
	if cfg == nil {
		return nil, fmt.Errorf("config is required")
	}

	client := cloudflare.NewClient(
		option.WithAPIToken(cfg.APIToken),
	)

	return &D1Client{
		client:       client,
		accountID:    cfg.AccountID,
		databaseUUID: cfg.DatabaseID,
	}, nil
}

// executeQuery executes a SQL query on D1
func (d *D1Client) executeQuery(ctx context.Context, sql string, params []string) ([]map[string]interface{}, error) {
	// Build request body
	requestBody := map[string]interface{}{
		"sql":    sql,
		"params": params,
	}

	// Use client.Post to call D1 API
	var response map[string]interface{}
	err := d.client.Post(ctx, fmt.Sprintf("/accounts/%s/d1/database/%s/query", d.accountID, d.databaseUUID), requestBody, &response)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}

	// Parse response
	if responseBody, ok := response["body"].(map[string]interface{}); ok {
		if errors, ok := responseBody["errors"].([]interface{}); ok && len(errors) > 0 {
			return nil, fmt.Errorf("query errors: %v", errors)
		}
		if result, ok := responseBody["result"].([]map[string]interface{}); ok {
			return result, nil
		}
	}

	return []map[string]interface{}{}, nil
}

// Upsert inserts or updates a blog post
func (d *D1Client) Upsert(ctx context.Context, post *entity.BlogPost) error {
	sql := `
		INSERT INTO blog_posts (slug, r2_key, title, excerpt, date, draft)
		VALUES (?, ?, ?, ?, ?, ?)
		ON CONFLICT(slug) DO UPDATE SET
			r2_key = excluded.r2_key,
			title = excluded.title,
			excerpt = excluded.excerpt,
			date = excluded.date,
			draft = excluded.draft,
			updated_at = strftime('%s', 'now')
	`

	draft := "0"
	if post.Draft {
		draft = "1"
	}

	_, err := d.executeQuery(ctx, sql, []string{
		post.Slug,
		post.R2Key,
		post.Title,
		post.Excerpt,
		post.Date.Format(time.RFC3339),
		draft,
	})

	if err != nil {
		return fmt.Errorf("failed to upsert blog post: %w", err)
	}

	return nil
}

// Delete deletes a blog post by slug
func (d *D1Client) Delete(ctx context.Context, slug string) error {
	sql := `DELETE FROM blog_posts WHERE slug = ?`

	_, err := d.executeQuery(ctx, sql, []string{slug})
	if err != nil {
		return fmt.Errorf("failed to delete blog post: %w", err)
	}

	return nil
}

// FindBySlug finds a blog post by slug
func (d *D1Client) FindBySlug(ctx context.Context, slug string) (*entity.BlogPost, error) {
	sql := `
		SELECT
			id, slug, r2_key, title, excerpt, date, draft
		FROM blog_posts
		WHERE slug = ?
	`

	rows, err := d.executeQuery(ctx, sql, []string{slug})
	if err != nil {
		return nil, fmt.Errorf("failed to find blog post: %w", err)
	}

	if len(rows) == 0 {
		return nil, fmt.Errorf("blog post not found: %s", slug)
	}

	return d.rowToBlogPost(rows[0])
}

// FindAll finds all blog posts
func (d *D1Client) FindAll(ctx context.Context) ([]*entity.BlogPost, error) {
	sql := `
		SELECT
			id, slug, r2_key, title, excerpt, date, draft
		FROM blog_posts
		ORDER BY date DESC
	`

	rows, err := d.executeQuery(ctx, sql, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to find blog posts: %w", err)
	}

	posts := make([]*entity.BlogPost, len(rows))
	for i, row := range rows {
		post, err := d.rowToBlogPost(row)
		if err != nil {
			return nil, fmt.Errorf("failed to parse row: %w", err)
		}
		posts[i] = post
	}

	return posts, nil
}

// DeleteTags deletes all tags for a blog post
func (d *D1Client) DeleteTags(ctx context.Context, blogPostID int64) error {
	sql := `DELETE FROM blog_tags WHERE blog_post_id = ?`

	_, err := d.executeQuery(ctx, sql, []string{strconv.FormatInt(blogPostID, 10)})
	if err != nil {
		return fmt.Errorf("failed to delete tags: %w", err)
	}

	return nil
}

// rowToBlogPost converts a D1 row to a BlogPost entity
func (d *D1Client) rowToBlogPost(row map[string]interface{}) (*entity.BlogPost, error) {
	post := &entity.BlogPost{}

	if v, ok := row["slug"].(string); ok {
		post.Slug = v
	}
	if v, ok := row["r2_key"].(string); ok {
		post.R2Key = v
	}
	if v, ok := row["title"].(string); ok {
		post.Title = v
	}
	if v, ok := row["excerpt"].(string); ok {
		post.Excerpt = v
	}
	if v, ok := row["date"].(string); ok {
		t, err := time.Parse(time.RFC3339, v)
		if err != nil {
			return nil, fmt.Errorf("failed to parse date: %w", err)
		}
		post.Date = t
	}
	if v, ok := row["draft"].(float64); ok {
		post.Draft = v == 1
	}

	return post, nil
}

// GetIDBySlug returns the database ID for a given slug
func (d *D1Client) GetIDBySlug(ctx context.Context, slug string) (int64, error) {
	sql := `SELECT id FROM blog_posts WHERE slug = ?`

	rows, err := d.executeQuery(ctx, sql, []string{slug})
	if err != nil {
		return 0, fmt.Errorf("failed to get blog post ID: %w", err)
	}

	if len(rows) == 0 {
		return 0, fmt.Errorf("blog post not found: %s", slug)
	}

	if v, ok := rows[0]["id"].(float64); ok {
		return int64(v), nil
	}

	return 0, fmt.Errorf("failed to parse ID")
}

// FindOrCreate finds a tag by name or creates it
func (d *D1Client) FindOrCreate(ctx context.Context, name string) (*entity.Tag, error) {
	tag, err := d.FindByName(ctx, name)
	if err == nil {
		return tag, nil
	}

	// Create new tag
	tag = &entity.Tag{Name: name}
	err = d.Create(ctx, tag)
	if err != nil {
		return nil, fmt.Errorf("failed to create tag: %w", err)
	}

	return tag, nil
}

// FindByName finds a tag by name
func (d *D1Client) FindByName(ctx context.Context, name string) (*entity.Tag, error) {
	sql := `SELECT id, name FROM tags WHERE name = ?`

	rows, err := d.executeQuery(ctx, sql, []string{name})
	if err != nil {
		return nil, fmt.Errorf("failed to find tag: %w", err)
	}

	if len(rows) == 0 {
		return nil, fmt.Errorf("tag not found: %s", name)
	}

	return d.rowToTag(rows[0])
}

// Create creates a new tag
func (d *D1Client) Create(ctx context.Context, tag *entity.Tag) error {
	sql := `INSERT INTO tags (name) VALUES (?)`

	result, err := d.executeQuery(ctx, sql, []string{tag.Name})
	if err != nil {
		return fmt.Errorf("failed to create tag: %w", err)
	}

	if len(result) > 0 {
		if v, ok := result[0]["id"].(float64); ok {
			tag.ID = int64(v)
		}
	}

	return nil
}

// LinkToBlogPost links a tag to a blog post
func (d *D1Client) LinkToBlogPost(ctx context.Context, blogPostID, tagID int64) error {
	sql := `
		INSERT OR IGNORE INTO blog_tags (blog_post_id, tag_id)
		VALUES (?, ?)
	`

	_, err := d.executeQuery(ctx, sql, []string{
		strconv.FormatInt(blogPostID, 10),
		strconv.FormatInt(tagID, 10),
	})

	if err != nil {
		return fmt.Errorf("failed to link tag to blog post: %w", err)
	}

	return nil
}

// rowToTag converts a D1 row to a Tag entity
func (d *D1Client) rowToTag(row map[string]interface{}) (*entity.Tag, error) {
	tag := &entity.Tag{}

	if v, ok := row["id"].(float64); ok {
		tag.ID = int64(v)
	}
	if v, ok := row["name"].(string); ok {
		tag.Name = v
	}

	return tag, nil
}
