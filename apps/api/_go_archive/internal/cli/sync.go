package cli

import (
	"context"
	"fmt"
	"os"

	"github.com/mimifuwacc/api/internal/infra/cloudflare"
	"github.com/mimifuwacc/api/internal/infra/local"
	"github.com/mimifuwacc/api/internal/repository"
	"github.com/mimifuwacc/api/internal/usecase"
	"github.com/spf13/cobra"
)

// SyncCmd represents the sync command
func SyncCmd() *cobra.Command {
	var (
		all     bool
		remote  bool
		verbose bool
	)

	cmd := &cobra.Command{
		Use:   "sync",
		Short: "Sync blog posts to Cloudflare R2/D1",
		Long:  `Sync blog posts from markdown files to Cloudflare R2 and D1.`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runSync(all, remote, verbose)
		},
	}

	cmd.Flags().BoolVarP(&all, "all", "a", false, "Sync all blog posts (not just changed ones)")
	cmd.Flags().BoolVarP(&remote, "remote", "r", false, "Sync to remote Cloudflare (production)")
	cmd.Flags().BoolVarP(&verbose, "verbose", "v", false, "Verbose output")

	return cmd
}

func runSync(all, remote, verbose bool) error {
	ctx := context.Background()

	// Load configuration
	cfg := LoadConfig()
	cfg.All = all
	cfg.Remote = remote
	cfg.Verbose = verbose

	// Validate configuration (only for remote)
	if remote {
		if err := cfg.Validate(); err != nil {
			return fmt.Errorf("configuration error: %w", err)
		}
	}

	if verbose {
		fmt.Printf("Mode: %v, All: %v\n", map[bool]string{true: "remote", false: "local"}[remote], all)
		fmt.Printf("Blogs Dir: %s\n", cfg.BlogsDir)
	}

	// Initialize repositories based on mode
	var (
		r2Client repository.StorageRepository
		blogPost repository.BlogPostRepository
		tagRepo  repository.TagRepository
	)

	if remote {
		// Remote: use Cloudflare API
		r2, err := cloudflare.NewR2Client(ctx, &cloudflare.R2Config{
			AccountID:       cfg.AccountID,
			AccessKeyID:     cfg.R2AccessKey,
			SecretAccessKey: cfg.R2SecretKey,
			BucketName:      cfg.R2BucketName,
		})
		if err != nil {
			return fmt.Errorf("failed to create R2 client: %w", err)
		}
		r2Client = r2

		d1, err := cloudflare.NewD1Client(&cloudflare.D1Config{
			AccountID:  cfg.AccountID,
			APIToken:   cfg.APIToken,
			DatabaseID: cfg.D1DatabaseID,
		})
		if err != nil {
			return fmt.Errorf("failed to create D1 client: %w", err)
		}
		blogPost = d1
		tagRepo = d1
	} else {
		// Local: use wrangler CLI (default)
		r2Client = local.NewR2Client(cfg.R2BucketName)
		d1 := local.NewD1Client("mimifuwacc-blogs")
		blogPost = d1
		tagRepo = d1
	}

	markdownParser := local.NewMarkdownParser(cfg.BlogsDir)

	// Create use case
	syncUseCase := usecase.NewSyncBlogsUseCase(
		markdownParser,
		r2Client,
		blogPost,
		tagRepo,
		cfg.BlogsDir,
	)

	// Execute sync
	result, err := syncUseCase.Execute(ctx, all, remote)
	if err != nil {
		return fmt.Errorf("sync failed: %w", err)
	}

	// Print result
	if result.Total() == 0 {
		fmt.Println("No files to sync.")
		return nil
	}

	if verbose {
		fmt.Printf("\nResults:\n")
		fmt.Printf("  Uploaded: %d\n", len(result.Uploaded))
		fmt.Printf("  Skipped: %d\n", len(result.Skipped))
		fmt.Printf("  Failed: %d\n", len(result.Failed))
	}

	if result.HasErrors() {
		os.Exit(1)
	}

	return nil
}

// InfoCmd represents the info command
func InfoCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "info",
		Short: "Show configuration and connection info",
		RunE: func(cmd *cobra.Command, args []string) error {
			return runInfo()
		},
	}

	return cmd
}

func runInfo() error {
	cfg := LoadConfig()

	fmt.Println("Blog Sync CLI Configuration")
	fmt.Println("==========================")
	fmt.Printf("R2 Bucket:      %s\n", cfg.R2BucketName)
	fmt.Printf("D1 Database:    mimifuwacc-blogs (local) or %s (remote)\n", cfg.D1DatabaseID)
	fmt.Printf("Blogs Dir:      %s\n", cfg.BlogsDir)
	fmt.Printf("Work Dir:       %s\n", cfg.WorkDir)

	return nil
}

func maskString(s string, showLast int) string {
	if s == "" {
		return "(not set)"
	}
	if len(s) <= showLast {
		return s
	}
	return "***" + s[len(s)-showLast:]
}

// ListCmd represents the list command
func ListCmd() *cobra.Command {
	var remote bool

	cmd := &cobra.Command{
		Use:   "list",
		Short: "List all blog posts in D1",
		RunE: func(cmd *cobra.Command, args []string) error {
			return runList(remote)
		},
	}

	cmd.Flags().BoolVarP(&remote, "remote", "r", false, "Use remote D1 database")

	return cmd
}

func runList(remote bool) error {
	ctx := context.Background()
	cfg := LoadConfig()

	var blogPost repository.BlogPostRepository

	if remote {
		if err := cfg.Validate(); err != nil {
			return fmt.Errorf("configuration error: %w", err)
		}

		d1Client, err := cloudflare.NewD1Client(&cloudflare.D1Config{
			AccountID:  cfg.AccountID,
			APIToken:   cfg.APIToken,
			DatabaseID: cfg.D1DatabaseID,
		})
		if err != nil {
			return fmt.Errorf("failed to create D1 client: %w", err)
		}
		blogPost = d1Client
	} else {
		blogPost = local.NewD1Client("mimifuwacc-blogs")
	}

	posts, err := blogPost.FindAll(ctx)
	if err != nil {
		return fmt.Errorf("failed to list posts: %w", err)
	}

	fmt.Printf("Found %d blog post(s) in %s:\n\n", len(posts), map[bool]string{true: "remote", false: "local"}[remote])
	for _, post := range posts {
		draft := ""
		if post.Draft {
			draft = " [DRAFT]"
		}
		fmt.Printf("  - %s%s\n", post.Slug, draft)
		fmt.Printf("    Title: %s\n", post.Title)
		fmt.Printf("    Date: %s\n", post.Date.Format("2006-01-02"))
		fmt.Println()
	}

	return nil
}

// DeleteCmd represents the delete command
func DeleteCmd() *cobra.Command {
	var remote bool

	cmd := &cobra.Command{
		Use:   "delete [slug]",
		Short: "Delete a blog post from D1",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runDelete(args[0], remote)
		},
	}

	cmd.Flags().BoolVarP(&remote, "remote", "r", false, "Use remote D1/R2")

	return cmd
}

func runDelete(slug string, remote bool) error {
	ctx := context.Background()
	cfg := LoadConfig()

	var (
		blogPost repository.BlogPostRepository
		r2Client  repository.StorageRepository
	)

	if remote {
		if err := cfg.Validate(); err != nil {
			return fmt.Errorf("configuration error: %w", err)
		}

		d1Client, err := cloudflare.NewD1Client(&cloudflare.D1Config{
			AccountID:  cfg.AccountID,
			APIToken:   cfg.APIToken,
			DatabaseID: cfg.D1DatabaseID,
		})
		if err != nil {
			return fmt.Errorf("failed to create D1 client: %w", err)
		}
		blogPost = d1Client

		r2, err := cloudflare.NewR2Client(ctx, &cloudflare.R2Config{
			AccountID:       cfg.AccountID,
			AccessKeyID:     cfg.R2AccessKey,
			SecretAccessKey: cfg.R2SecretKey,
			BucketName:      cfg.R2BucketName,
		})
		if err != nil {
			return fmt.Errorf("failed to create R2 client: %w", err)
		}
		r2Client = r2
	} else {
		blogPost = local.NewD1Client("mimifuwacc-blogs")
		r2Client = local.NewR2Client(cfg.R2BucketName)
	}

	// Find post first
	post, err := blogPost.FindBySlug(ctx, slug)
	if err != nil {
		return fmt.Errorf("blog post not found: %s", slug)
	}

	fmt.Printf("Deleting blog post: %s\n", post.Title)

	// Delete from D1
	if err := blogPost.Delete(ctx, slug); err != nil {
		return fmt.Errorf("failed to delete from D1: %w", err)
	}

	// Delete from R2
	if err := r2Client.Delete(ctx, post.R2Key); err != nil {
		fmt.Printf("Warning: failed to delete from R2: %v\n", err)
	}

	fmt.Println("✓ Blog post deleted")
	return nil
}
