package usecase

import (
	"context"
	"fmt"
	"strings"

	"github.com/mimifuwacc/api/internal/entity"
	"github.com/mimifuwacc/api/internal/infra/local"
	"github.com/mimifuwacc/api/internal/repository"
)

// SyncBlogsUseCase handles syncing blog posts to R2/D1
type SyncBlogsUseCase struct {
	markdown repository.MarkdownParser
	storage  repository.StorageRepository
	blogPost repository.BlogPostRepository
	tag      repository.TagRepository
	blogsDir string
}

// NewSyncBlogsUseCase creates a new sync blogs use case
func NewSyncBlogsUseCase(
	markdown repository.MarkdownParser,
	storage repository.StorageRepository,
	blogPost repository.BlogPostRepository,
	tag repository.TagRepository,
	blogsDir string,
) *SyncBlogsUseCase {
	return &SyncBlogsUseCase{
		markdown: markdown,
		storage:  storage,
		blogPost: blogPost,
		tag:      tag,
		blogsDir: blogsDir,
	}
}

// Execute syncs blog posts to R2/D1
func (uc *SyncBlogsUseCase) Execute(ctx context.Context, all bool, remote bool) (*entity.SyncResult, error) {
	result := &entity.SyncResult{}

	// Get list of markdown files
	markdownFiles, err := uc.markdown.FindMarkdownFiles()
	if err != nil {
		return nil, fmt.Errorf("failed to find markdown files: %w", err)
	}

	// Filter files by checking hash
	var filesToSync []string
	if all {
		filesToSync = markdownFiles
	} else {
		// Check each file's hash against stored hash
		for _, file := range markdownFiles {
			shouldSync, err := uc.shouldSyncFile(ctx, file)
			if err != nil {
				fmt.Printf("Warning: failed to check %s, skipping: %v\n", file, err)
				continue
			}
			if shouldSync {
				filesToSync = append(filesToSync, file)
			}
		}
	}

	if len(filesToSync) == 0 {
		fmt.Println("No new blog posts to sync.")
		return result, nil
	}

	fmt.Printf("Syncing %d blog post(s)...\n", len(filesToSync))

	// Sync each file
	for _, file := range filesToSync {
		if err := uc.syncFile(ctx, file, result); err != nil {
			result.AddFailed(file)
			fmt.Printf("✗ Failed to sync %s: %v\n", file, err)
		}
	}

	fmt.Printf("\nSync complete! Uploaded: %d, Failed: %d\n", len(result.Uploaded), len(result.Failed))
	return result, nil
}

// shouldSyncFile checks if a file needs to be synced by comparing hashes
func (uc *SyncBlogsUseCase) shouldSyncFile(ctx context.Context, filePath string) (bool, error) {
	// Calculate current file hash
	currentHash, err := local.ComputeFileHash(filePath)
	if err != nil {
		return false, fmt.Errorf("failed to compute hash: %w", err)
	}

	// Parse markdown to get slug
	post, err := uc.markdown.ParseFile(ctx, filePath)
	if err != nil {
		return false, fmt.Errorf("failed to parse markdown: %w", err)
	}

	// Check if post exists in D1
	existingPost, err := uc.blogPost.FindBySlug(ctx, post.Slug)
	if err != nil {
		// Post doesn't exist, need to sync
		return true, nil
	}

	// Compare hashes
	if existingPost.ContentHash == "" {
		// Old post without hash, need to sync
		return true, nil
	}

	return existingPost.ContentHash != currentHash, nil
}

// syncFile syncs a single blog post file
func (uc *SyncBlogsUseCase) syncFile(ctx context.Context, filePath string, result *entity.SyncResult) error {
	// Parse markdown file
	post, err := uc.markdown.ParseFile(ctx, filePath)
	if err != nil {
		return fmt.Errorf("failed to parse markdown: %w", err)
	}

	// Calculate file hash
	fileHash, err := local.ComputeFileHash(filePath)
	if err != nil {
		return fmt.Errorf("failed to compute hash: %w", err)
	}
	post.ContentHash = fileHash

	fmt.Printf("Syncing: %s\n", post.Slug)

	// Upload content to R2
	if err := uc.storage.Upload(ctx, post.R2Key, []byte(post.Content), "text/markdown"); err != nil {
		return fmt.Errorf("failed to upload to R2: %w", err)
	}

	// Clear content before saving to D1 (not needed in database)
	post.Content = ""

	// Upsert blog post in D1
	if err := uc.blogPost.Upsert(ctx, post); err != nil {
		return fmt.Errorf("failed to upsert blog post: %w", err)
	}

	// Handle tags
	if len(post.Tags) > 0 {
		fmt.Printf("  Tags: %v\n", post.Tags)
	}

	result.AddUploaded(post.Slug)
	fmt.Printf("✓ Synced %s\n", post.Slug)

	return nil
}

// contains checks if a string slice contains a string
func (uc *SyncBlogsUseCase) contains(slice []string, item string) bool {
	for _, s := range slice {
		if strings.Contains(s, item) || strings.Contains(item, s) {
			return true
		}
	}
	return false
}
