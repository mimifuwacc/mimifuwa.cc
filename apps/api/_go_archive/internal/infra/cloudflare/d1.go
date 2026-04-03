package cloudflare

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/cloudflare/cloudflare-go/v6"
	"github.com/cloudflare/cloudflare-go/v6/option"
	"github.com/mimifuwacc/api/internal/entity"
	"github.com/mimifuwacc/api/internal/repository"
)

// D1Config represents the configuration for D1 client
type D1Config struct {
	AccountID  string
	APIToken   string
	DatabaseID string
}

// D1Client implements repository.BlogPostRepository, repository.TagRepository, and repository.TagsRepository
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

// ExecuteQuery executes a SQL query on D1
func (d *D1Client) ExecuteQuery(ctx context.Context, sql string, params []string) ([]map[string]interface{}, error) {
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
			id, slug, r2_key, title, excerpt, date, draft, content_hash, created_at, updated_at
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

// FindBySlugWithTags finds a blog post by slug with tags loaded
func (d *D1Client) FindBySlugWithTags(ctx context.Context, slug string) (*entity.BlogPost, error) {
	sql := `
		SELECT
			bp.id, bp.slug, bp.r2_key, bp.title, bp.excerpt, bp.date, bp.draft, bp.content_hash, bp.created_at, bp.updated_at
		FROM blog_posts bp
		WHERE bp.slug = ?
	`

	rows, err := d.ExecuteQuery(ctx, sql, []string{slug})
	if err != nil {
		return nil, fmt.Errorf("failed to find blog post: %w", err)
	}

	if len(rows) == 0 {
		return nil, fmt.Errorf("blog post not found: %s", slug)
	}

	post, err := d.rowToBlogPost(rows[0])
	if err != nil {
		return nil, err
	}

	// Load tags
	postID, err := d.GetIDBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}

	tags, err := d.getTagsByBlogPostID(ctx, postID)
	if err != nil {
		return nil, fmt.Errorf("failed to load tags: %w", err)
	}

	post.Tags = tags
	return post, nil
}

// FindAll finds all blog posts
func (d *D1Client) FindAll(ctx context.Context) ([]*entity.BlogPost, error) {
	sql := `
		SELECT
			id, slug, r2_key, title, excerpt, date, draft, content_hash, created_at, updated_at
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

// getTagsByBlogPostID returns tag names for a blog post
func (d *D1Client) getTagsByBlogPostID(ctx context.Context, blogPostID int64) ([]string, error) {
	sql := `
		SELECT t.name
		FROM tags t
		JOIN blog_tags bt ON bt.tag_id = t.id
		WHERE bt.blog_post_id = ?
		ORDER BY t.name
	`

	rows, err := d.ExecuteQuery(ctx, sql, []string{strconv.FormatInt(blogPostID, 10)})
	if err != nil {
		return nil, fmt.Errorf("failed to get tags: %w", err)
	}

	tags := make([]string, len(rows))
	for i, row := range rows {
		if v, ok := row["name"].(string); ok {
			tags[i] = v
		}
	}

	return tags, nil
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

	if v, ok := row["id"].(float64); ok {
		post.ID = int64(v)
	}
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
	if v, ok := row["created_at"].(float64); ok {
		post.CreatedAt = time.Unix(int64(v), 0)
	}
	if v, ok := row["updated_at"].(float64); ok {
		post.UpdatedAt = time.Unix(int64(v), 0)
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

// FindAllTags finds all tags (implements TagRepository.FindAll)
func (d *D1Client) FindAllTags(ctx context.Context, limit int) ([]*entity.Tag, error) {
	sql := `SELECT id, name FROM tags ORDER BY name ASC`

	params := []string{}
	if limit > 0 {
		sql += ` LIMIT ?`
		params = append(params, strconv.Itoa(limit))
	}

	rows, err := d.ExecuteQuery(ctx, sql, params)
	if err != nil {
		return nil, fmt.Errorf("failed to find tags: %w", err)
	}

	tags := make([]*entity.Tag, len(rows))
	for i, row := range rows {
		tag, err := d.rowToTag(row)
		if err != nil {
			return nil, fmt.Errorf("failed to parse tag row: %w", err)
		}
		tags[i] = tag
	}

	return tags, nil
}

// UpdateDraftStatus updates the draft status of a blog post
func (d *D1Client) UpdateDraftStatus(ctx context.Context, slug string, draft bool) error {
	sql := `UPDATE blog_posts SET draft = ?, updated_at = strftime('%s', 'now') WHERE slug = ?`

	draftVal := "0"
	if draft {
		draftVal = "1"
	}

	_, err := d.ExecuteQuery(ctx, sql, []string{draftVal, slug})
	if err != nil {
		return fmt.Errorf("failed to update draft status: %w", err)
	}

	return nil
}

// buildWhereClause builds a WHERE clause with parameters based on filter
func (d *D1Client) buildWhereClause(filter repository.BlogPostFilter) (string, []string) {
	var conditions []string
	var params []string

	if filter.Draft != nil {
		draftVal := "0"
		if *filter.Draft {
			draftVal = "1"
		}
		conditions = append(conditions, fmt.Sprintf("bp.draft = %s", draftVal))
	}

	if filter.DateAfter != nil {
		conditions = append(conditions, "bp.date >= ?")
		params = append(params, filter.DateAfter.Format(time.RFC3339))
	}

	if filter.DateBefore != nil {
		conditions = append(conditions, "bp.date <= ?")
		params = append(params, filter.DateBefore.Format(time.RFC3339))
	}

	if filter.SearchTerm != nil && *filter.SearchTerm != "" {
		conditions = append(conditions, "(bp.title LIKE ? OR bp.excerpt LIKE ?)")
		searchPattern := "%" + *filter.SearchTerm + "%"
		params = append(params, searchPattern, searchPattern)
	}

	if filter.TagName != nil && *filter.TagName != "" {
		conditions = append(conditions, "EXISTS (SELECT 1 FROM blog_tags bt JOIN tags t ON bt.tag_id = t.id WHERE bt.blog_post_id = bp.id AND t.name = ?)")
		params = append(params, *filter.TagName)
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + conditions[0]
		for i := 1; i < len(conditions); i++ {
			whereClause += " AND " + conditions[i]
		}
	}

	return whereClause, params
}

// FindWithPagination finds blog posts with pagination and filtering
func (d *D1Client) FindWithPagination(ctx context.Context, filter repository.BlogPostFilter, pagination repository.Pagination) ([]*entity.BlogPost, error) {
	whereClause, params := d.buildWhereClause(filter)

	sql := fmt.Sprintf(`
		SELECT
			bp.id, bp.slug, bp.r2_key, bp.title, bp.excerpt, bp.date, bp.draft, bp.content_hash, bp.created_at, bp.updated_at
		FROM blog_posts bp
		%s
		ORDER BY bp.date DESC
	`, whereClause)

	// Apply cursor pagination if provided
	if pagination.Cursor != "" {
		// Decode cursor to get (id, created_at)
		// For simplicity, we'll use offset-based pagination for now
		// TODO: Implement proper cursor-based pagination
	}

	// Apply limit
	if pagination.Limit > 0 {
		sql += fmt.Sprintf(" LIMIT %d", pagination.Limit)
	}

	// Apply offset
	if pagination.Offset > 0 {
		sql += fmt.Sprintf(" OFFSET %d", pagination.Offset)
	}

	rows, err := d.ExecuteQuery(ctx, sql, params)
	if err != nil {
		return nil, fmt.Errorf("failed to find blog posts with pagination: %w", err)
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

// Count returns the total count of blog posts matching the filter
func (d *D1Client) Count(ctx context.Context, filter repository.BlogPostFilter) (int64, error) {
	whereClause, params := d.buildWhereClause(filter)

	sql := fmt.Sprintf(`
		SELECT COUNT(*) as count
		FROM blog_posts bp
		%s
	`, whereClause)

	rows, err := d.ExecuteQuery(ctx, sql, params)
	if err != nil {
		return 0, fmt.Errorf("failed to count blog posts: %w", err)
	}

	if len(rows) == 0 {
		return 0, nil
	}

	if v, ok := rows[0]["count"].(float64); ok {
		return int64(v), nil
	}

	return 0, fmt.Errorf("failed to parse count")
}
