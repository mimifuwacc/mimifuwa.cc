package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/joho/godotenv"
	"github.com/mimifuwacc/api/internal/graphql"
	"github.com/mimifuwacc/api/internal/infra/cloudflare"
	"github.com/mimifuwacc/api/internal/infra/local"
	"github.com/mimifuwacc/api/internal/repository"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	ctx := context.Background()

	// Get environment variables
	env := getEnv("ENVIRONMENT", "development")
	remote := env == "production"

	// Initialize repositories
	var (
		blogPostRepo repository.BlogPostRepository
		tagRepo      repository.TagRepository
		storageRepo  repository.StorageRepository
	)

	if remote {
		// Production: use Cloudflare API
		accountID := getEnv("CLOUDFLARE_ACCOUNT_ID", "")
		apiToken := getEnv("CLOUDFLARE_API_TOKEN", "")
		databaseID := getEnv("CLOUDFLARE_D1_DATABASE_ID", "")
		r2AccessKey := getEnv("CLOUDFLARE_R2_ACCESS_KEY_ID", "")
		r2SecretKey := getEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY", "")
		r2Bucket := getEnv("CLOUDFLARE_R2_BUCKET_NAME", "")

		if accountID == "" || apiToken == "" || databaseID == "" {
			log.Fatal("Missing required Cloudflare credentials for production mode")
		}

		// Create D1 client
		d1, err := cloudflare.NewD1Client(&cloudflare.D1Config{
			AccountID:  accountID,
			APIToken:   apiToken,
			DatabaseID: databaseID,
		})
		if err != nil {
			log.Fatalf("Failed to create D1 client: %v", err)
		}
		blogPostRepo = d1
		tagRepo = d1

		// Create R2 client
		if r2AccessKey != "" && r2SecretKey != "" && r2Bucket != "" {
			r2, err := cloudflare.NewR2Client(ctx, &cloudflare.R2Config{
				AccountID:       accountID,
				AccessKeyID:     r2AccessKey,
				SecretAccessKey: r2SecretKey,
				BucketName:      r2Bucket,
			})
			if err != nil {
				log.Fatalf("Failed to create R2 client: %v", err)
			}
			storageRepo = r2
		}
	} else {
		// Development: use local wrangler and filesystem
		d1 := local.NewD1Client("mimifuwacc-blogs")
		blogPostRepo = d1
		tagRepo = d1

		r2Bucket := getEnv("CLOUDFLARE_R2_BUCKET_NAME", "mimifuwacc-blogs")
		storageRepo = local.NewR2Client(r2Bucket)
	}

	// Create GraphQL resolver
	graphQLResolver := &graphql.Resolver{
		BlogPostRepo: blogPostRepo,
		TagRepo:      tagRepo,
		StorageRepo:  storageRepo,
	}

	// Create GraphQL handler
	cfg := graphql.Config{Resolvers: graphQLResolver}
	srv := handler.NewDefaultServer(graphql.NewExecutableSchema(cfg))

	// Create HTTP server
	mux := http.NewServeMux()

	// GraphQL endpoint
	mux.Handle("/query", graphql.AuthMiddleware(srv, graphQLResolver))

	// GraphQL Playground (only in development)
	if env == "development" {
		mux.Handle("/", playground.Handler("GraphQL Playground", "/query"))
	}

	// Start server
	port := getEnv("PORT", "8080")
	addr := ":" + port

	log.Printf("Starting GraphQL server on %s (mode: %s)", addr, env)
	if env == "development" {
		log.Printf("GraphQL Playground available at http://localhost%s", addr)
	}

	server := &http.Server{
		Addr:         addr,
		Handler:      mux,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed: %v", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
