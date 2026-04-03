package cli

import (
	"os"
)

// Config represents the CLI configuration
type Config struct {
	// Cloudflare credentials
	AccountID     string
	APIToken      string
	R2AccessKey   string
	R2SecretKey   string
	R2BucketName  string
	D1DatabaseID  string

	// Paths
	BlogsDir string
	WorkDir  string

	// Flags
	Remote  bool
	All     bool
	Verbose bool
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	return &Config{
		AccountID:     os.Getenv("CLOUDFLARE_ACCOUNT_ID"),
		APIToken:      os.Getenv("CLOUDFLARE_API_TOKEN"),
		R2AccessKey:   os.Getenv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
		R2SecretKey:   os.Getenv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
		R2BucketName:  getEnv("CLOUDFLARE_R2_BUCKET_NAME", "mimifuwacc-blogs"),
		D1DatabaseID:  getEnv("CLOUDFLARE_D1_DATABASE_ID", "ac1c88bc-d531-49d9-a10c-dad6ff637972"),
		BlogsDir:      getEnv("BLOGS_DIR", "../../contents/blogs"),
		WorkDir:       getEnv("WORK_DIR", "../../"),
	}
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// Validate validates the configuration
func (c *Config) Validate() error {
	if c.AccountID == "" {
		return ErrMissingAccountID
	}
	if c.APIToken == "" {
		return ErrMissingAPIToken
	}
	if c.R2AccessKey == "" {
		return ErrMissingR2AccessKey
	}
	if c.R2SecretKey == "" {
		return ErrMissingR2SecretKey
	}
	return nil
}

// Errors
var (
	ErrMissingAccountID   = ConfigError("CLOUDFLARE_ACCOUNT_ID is required")
	ErrMissingAPIToken    = ConfigError("CLOUDFLARE_API_TOKEN is required")
	ErrMissingR2AccessKey = ConfigError("CLOUDFLARE_R2_ACCESS_KEY_ID is required")
	ErrMissingR2SecretKey = ConfigError("CLOUDFLARE_R2_SECRET_ACCESS_KEY is required")
)

// ConfigError represents a configuration error
type ConfigError string

func (e ConfigError) Error() string {
	return string(e)
}
