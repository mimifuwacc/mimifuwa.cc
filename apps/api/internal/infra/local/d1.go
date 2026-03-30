package local

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/mimifuwacc/api/internal/entity"
)


// D1Client handles D1 operations via wrangler CLI
type D1Client struct {
	databaseName string
}

// NewD1Client creates a new wrangler-based D1 client
func NewD1Client(databaseName string) *D1Client {
	return &D1Client{
		databaseName: databaseName,
	}
}

// ExecuteQuery executes a SQL query via wrangler
func (d *D1Client) ExecuteQuery(ctx context.Context, sql string, params []string) ([]map[string]interface{}, error) {
	// Build SQL with escaped parameters
	for _, param := range params {
		// Simple SQL escaping (replace ' with '') and wrap in quotes
		escapedParam := strings.ReplaceAll(param, "'", "''")
		sql = strings.Replace(sql, "?", "'"+escapedParam+"'", 1)
	}

	args := []string{
		"d1", "execute", d.databaseName,
		"--local",
		"--config", "../../apps/web/wrangler.jsonc",
		"--command", sql,
		"--json",
	}

	allArgs := append([]string{"pnpm", "exec", "wrangler"}, args...)
	output, err := execCommand(ctx, allArgs...).CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w\nOutput: %s", err, string(output))
	}

	// Parse wrangler output (JSON format)
	// Output can be either an array of results or a single result object
	var results []struct {
		Success bool                     `json:"success"`
		Result  []map[string]interface{} `json:"results"`
		Errors  []map[string]interface{} `json:"errors"`
	}

	if err := json.Unmarshal(output, &results); err != nil {
		return nil, fmt.Errorf("failed to parse output: %w\nOutput: %s", err, string(output))
	}

	// Combine results from all statements
	allResults := make([]map[string]interface{}, 0)
	for _, r := range results {
		if !r.Success {
			return nil, fmt.Errorf("query errors: %v", r.Errors)
		}
		allResults = append(allResults, r.Result...)
	}

	return allResults, nil
}

// Upsert inserts or updates a blog post
func (d *D1Client) Upsert(ctx context.Context, post *entity.BlogPost) error {
	sql := `
		INSERT INTO blog_posts (slug, r2_key, title, excerpt, date, draft, content_hash)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(slug) DO UPDATE SET
			r2_key = excluded.r2_key,
			title = excluded.title,
			excerpt = excluded.excerpt,
			date = excluded.date,
			draft = excluded.draft,
			content_hash = excluded.content_hash,
			updated_at = strftime('%s', 'now')
	`

	draft := "0"
	if post.Draft {
		draft = "1"
	}

	hash := ""
	if post.ContentHash != "" {
		hash = post.ContentHash
	}

	_, err := d.ExecuteQuery(ctx, sql, []string{
		post.Slug,
		post.R2Key,
		post.Title,
		post.Excerpt,
		post.Date.Format(time.RFC3339),
		draft,
		hash,
	})

	if err != nil {
		return fmt.Errorf("failed to upsert blog post: %w", err)
	}

	return nil
}

// Delete deletes a blog post by slug
func (d *D1Client) Delete(ctx context.Context, slug string) error {
	sql := `DELETE FROM blog_posts WHERE slug = ?`

	_, err := d.ExecuteQuery(ctx, sql, []string{slug})
	if err != nil {
		return fmt.Errorf("failed to delete blog post: %w", err)
	}

	return nil
}

// FindBySlug finds a blog post by slug
func (d *D1Client) FindBySlug(ctx context.Context, slug string) (*entity.BlogPost, error) {
	sql := `
		SELECT
			id, slug, r2_key, title, excerpt, date, draft, content_hash
		FROM blog_posts
		WHERE slug = ?
	`

	rows, err := d.ExecuteQuery(ctx, sql, []string{slug})
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
			id, slug, r2_key, title, excerpt, date, draft, content_hash
		FROM blog_posts
		ORDER BY date DESC
	`

	rows, err := d.ExecuteQuery(ctx, sql, nil)
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

	_, err := d.ExecuteQuery(ctx, sql, []string{strconv.FormatInt(blogPostID, 10)})
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
	if v, ok := row["content_hash"].(string); ok {
		post.ContentHash = v
	}

	return post, nil
}

// GetIDBySlug returns the database ID for a given slug
func (d *D1Client) GetIDBySlug(ctx context.Context, slug string) (int64, error) {
	sql := `SELECT id FROM blog_posts WHERE slug = ?`

	rows, err := d.ExecuteQuery(ctx, sql, []string{slug})
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

	rows, err := d.ExecuteQuery(ctx, sql, []string{name})
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

	result, err := d.ExecuteQuery(ctx, sql, []string{tag.Name})
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

	_, err := d.ExecuteQuery(ctx, sql, []string{
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
