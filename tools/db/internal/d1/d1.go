package d1

import (
	"context"
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"

	"github.com/mimifuwacc/db/internal/migration"
)

// ClientConfig represents the configuration for D1 client
type ClientConfig struct {
	DatabaseName string
	DatabaseID   string
	AccountID    string
	APIToken     string
	Remote       bool
}

// ExecuteQuery executes a SQL query and returns results
type ExecuteQuery func(ctx context.Context, sql string, params []string) ([]map[string]interface{}, error)

// Client represents a D1 client
type Client struct {
	config        ClientConfig
	executeQuery  ExecuteQuery
}

// NewClient creates a new D1 client
func NewClient(config ClientConfig) (*Client, error) {
	if !config.Remote {
		// Local mode: use wrangler
		return &Client{
			config:       config,
			executeQuery: executeQueryWrangler(config.DatabaseName),
		}, nil
	}

	// Remote mode: use Cloudflare API (requires cloudflare-go SDK)
	// For now, return error - this should be implemented
	return nil, fmt.Errorf("remote mode not yet implemented - please add cloudflare-go dependency")
}

// ExecuteQuery executes a SQL query
func (c *Client) ExecuteQuery(ctx context.Context, sql string, params []string) ([]map[string]interface{}, error) {
	return c.executeQuery(ctx, sql, params)
}

// AsMigrationClient returns the client as a migration.ExecutorClient
func (c *Client) AsMigrationClient() migration.ExecutorClient {
	return c
}

// executeQueryWrangler returns a function that executes queries via wrangler
func executeQueryWrangler(databaseName string) ExecuteQuery {
	return func(ctx context.Context, sql string, params []string) ([]map[string]interface{}, error) {
		// Build SQL with escaped parameters
		for _, param := range params {
			escapedParam := strings.ReplaceAll(param, "'", "''")
			sql = strings.Replace(sql, "?", "'"+escapedParam+"'", 1)
		}

		args := []string{
			"d1", "execute", databaseName,
			"--local",
			"--config", "../../apps/web/wrangler.jsonc",
			"--command", sql,
			"--json",
		}

		allArgs := append([]string{"pnpm", "exec", "wrangler"}, args...)
		output, err := exec.CommandContext(ctx, allArgs[0], allArgs[1:]...).CombinedOutput()
		if err != nil {
			return nil, fmt.Errorf("failed to execute query: %w\nOutput: %s", err, string(output))
		}

		// Parse wrangler output (JSON format)
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
}

// CreateMigrationExecutor creates a migration.Executor from the D1 client
func (c *Client) CreateMigrationExecutor() *migration.Executor {
	return migration.NewExecutor(c.AsMigrationClient())
}
