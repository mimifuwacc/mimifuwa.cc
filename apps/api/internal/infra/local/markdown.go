package local

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/mimifuwacc/api/internal/entity"
	"gopkg.in/yaml.v3"
)

// Frontmatter represents the YAML frontmatter of a markdown file
type Frontmatter struct {
	Title   string   `yaml:"title"`
	Excerpt string   `yaml:"excerpt"`
	Date    string   `yaml:"date"`
	Tags    []string `yaml:"tags"`
	Draft   bool     `yaml:"draft,omitempty"`
}

// MarkdownParser implements repository.MarkdownParser
type MarkdownParser struct {
	blogsDir string
}

// NewMarkdownParser creates a new markdown parser
func NewMarkdownParser(blogsDir string) *MarkdownParser {
	return &MarkdownParser{
		blogsDir: blogsDir,
	}
}

// Parse parses a markdown file and returns the blog post
func (m *MarkdownParser) Parse(ctx context.Context, content []byte) (*entity.BlogPost, error) {
	str := string(content)

	// Split frontmatter and content
	parts := strings.SplitN(str, "---", 3)
	if len(parts) < 3 {
		return nil, fmt.Errorf("invalid markdown format: missing frontmatter")
	}

	// Parse YAML frontmatter
	var frontmatter Frontmatter
	if err := yaml.Unmarshal([]byte(parts[1]), &frontmatter); err != nil {
		return nil, fmt.Errorf("failed to parse frontmatter: %w", err)
	}

	// Parse date
	date, err := time.Parse("2006-01-02", frontmatter.Date)
	if err != nil {
		return nil, fmt.Errorf("failed to parse date: %w", err)
	}

	// Get slug from filename (will be set by ParseFile)
	return &entity.BlogPost{
		Title:   frontmatter.Title,
		Excerpt: frontmatter.Excerpt,
		Date:    date,
		Tags:    frontmatter.Tags,
		Draft:   frontmatter.Draft,
		Content: strings.TrimSpace(parts[2]),
	}, nil
}

// ParseFile parses a markdown file from disk
func (m *MarkdownParser) ParseFile(ctx context.Context, path string) (*entity.BlogPost, error) {
	// Read file
	content, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	// Parse markdown
	post, err := m.Parse(ctx, content)
	if err != nil {
		return nil, fmt.Errorf("failed to parse markdown: %w", err)
	}

	// Extract slug from file path
	slug, err := m.extractSlug(path)
	if err != nil {
		return nil, fmt.Errorf("failed to extract slug: %w", err)
	}
	post.Slug = slug

	// Generate R2 key
	post.R2Key = fmt.Sprintf("blogs/%s.md", slug)

	return post, nil
}

// extractSlug extracts the slug from the file path
func (m *MarkdownParser) extractSlug(path string) (string, error) {
	// Get relative path from blogs directory
	relPath, err := filepath.Rel(m.blogsDir, path)
	if err != nil {
		return "", fmt.Errorf("failed to get relative path: %w", err)
	}

	// Remove .md extension
	slug := strings.TrimSuffix(relPath, ".md")

	// Convert backslashes to forward slashes (for Windows)
	slug = filepath.ToSlash(slug)

	return slug, nil
}

// FindMarkdownFiles finds all markdown files in the blogs directory
func (m *MarkdownParser) FindMarkdownFiles() ([]string, error) {
	var files []string

	err := filepath.Walk(m.blogsDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories
		if info.IsDir() {
			return nil
		}

		// Only process .md files
		if filepath.Ext(path) == ".md" {
			files = append(files, path)
		}

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to walk directory: %w", err)
	}

	return files, nil
}
