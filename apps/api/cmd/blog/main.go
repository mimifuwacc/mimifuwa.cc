package main

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/mimifuwacc/api/internal/cli"
	"github.com/spf13/cobra"
)

func main() {
	// Load .env file from project root
	if err := godotenv.Load("../../.env"); err != nil {
		// .env is optional for local mode, only log if verbose
		_ = err
	}

	rootCmd := &cobra.Command{
		Use:   "blog",
		Short: "Blog sync CLI for Cloudflare R2/D1",
		Long: `A CLI tool to sync blog posts from markdown files to Cloudflare R2 and D1.

Environment Variables:
  CLOUDFLARE_ACCOUNT_ID           Cloudflare Account ID
  CLOUDFLARE_API_TOKEN            Cloudflare API Token
  CLOUDFLARE_R2_ACCESS_KEY_ID     R2 Access Key ID
  CLOUDFLARE_R2_SECRET_ACCESS_KEY R2 Secret Access Key
  CLOUDFLARE_R2_BUCKET_NAME       R2 Bucket Name (default: mimifuwacc-blogs)
  CLOUDFLARE_D1_DATABASE_ID       D1 Database ID

Examples:
  # Sync changed files to local (wrangler)
  blog sync

  # Sync all files to remote (production)
  blog sync --all --remote

  # List all blog posts
  blog list

  # Show configuration
  blog info`,
	}

	// Add subcommands
	rootCmd.AddCommand(cli.SyncCmd())
	rootCmd.AddCommand(cli.ListCmd())
	rootCmd.AddCommand(cli.DeleteCmd())
	rootCmd.AddCommand(cli.InfoCmd())

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
