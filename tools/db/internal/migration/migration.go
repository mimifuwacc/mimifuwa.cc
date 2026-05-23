package migration

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// Migration represents a single database migration
type Migration struct {
	Name      string    // e.g., "20250331_120000_init"
	Timestamp time.Time // Parsed timestamp for sorting
	Up        string    // SQL for applying the migration
	Down      string    // SQL for rolling back the migration
}

// Loader loads migration files from a directory
type Loader struct {
	migrationsDir string
}

// NewLoader creates a new migration loader
func NewLoader(migrationsDir string) *Loader {
	return &Loader{
		migrationsDir: migrationsDir,
	}
}

// Load loads all migrations from the directory
func (l *Loader) Load() ([]Migration, error) {
	entries, err := os.ReadDir(l.migrationsDir)
	if err != nil {
		return nil, fmt.Errorf("failed to read migrations directory: %w", err)
	}

	// Group files by migration name
	filesByName := make(map[string][]string)
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		name := entry.Name()
		if !strings.HasSuffix(name, ".sql") {
			continue
		}

		// Extract migration name (e.g., "20250331_120000_init" from "20250331_120000_init.up.sql")
		baseName := strings.TrimSuffix(name, ".up.sql")
		baseName = strings.TrimSuffix(baseName, ".down.sql")

		filesByName[baseName] = append(filesByName[baseName], name)
	}

	// Build migrations
	var migrations []Migration
	for baseName, files := range filesByName {
		migration := Migration{Name: baseName}

		// Parse timestamp
		ts, err := parseTimestamp(baseName)
		if err != nil {
			return nil, fmt.Errorf("failed to parse timestamp from %s: %w", baseName, err)
		}
		migration.Timestamp = ts

		// Load up and down files
		for _, file := range files {
			fullPath := filepath.Join(l.migrationsDir, file)
			content, err := os.ReadFile(fullPath)
			if err != nil {
				return nil, fmt.Errorf("failed to read %s: %w", file, err)
			}

			if strings.HasSuffix(file, ".up.sql") {
				migration.Up = string(content)
			} else if strings.HasSuffix(file, ".down.sql") {
				migration.Down = string(content)
			}
		}

		migrations = append(migrations, migration)
	}

	// Sort by timestamp
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Timestamp.Before(migrations[j].Timestamp)
	})

	return migrations, nil
}

// parseTimestamp extracts timestamp from migration name
func parseTimestamp(name string) (time.Time, error) {
	// Extract first 15 characters: "YYYYMMDD_HHMMSS"
	if len(name) < 15 {
		return time.Time{}, fmt.Errorf("invalid migration name format: %s", name)
	}

	tsStr := name[:15]
	// Parse as "20060102 150405"
	return time.Parse("20060102 150405", strings.Replace(tsStr, "_", " ", 1))
}

// Executor executes migrations
type Executor struct {
	client ExecutorClient
}

// ExecutorClient is the interface for executing SQL queries
type ExecutorClient interface {
	ExecuteQuery(ctx context.Context, sql string, params []string) ([]map[string]interface{}, error)
}

// NewExecutor creates a new migration executor
func NewExecutor(client ExecutorClient) *Executor {
	return &Executor{
		client: client,
	}
}

// EnsureMigrationsTable creates the schema_migrations table if it doesn't exist
func (e *Executor) EnsureMigrationsTable(ctx context.Context) error {
	sql := `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			name TEXT PRIMARY KEY,
			applied_at INTEGER DEFAULT (strftime('%s', 'now'))
		);
	`
	_, err := e.client.ExecuteQuery(ctx, sql, nil)
	return err
}

// GetAppliedMigrations returns a set of applied migration names
func (e *Executor) GetAppliedMigrations(ctx context.Context) (map[string]bool, error) {
	sql := `SELECT name FROM schema_migrations ORDER BY applied_at ASC`
	rows, err := e.client.ExecuteQuery(ctx, sql, nil)
	if err != nil {
		return nil, err
	}

	applied := make(map[string]bool)
	for _, row := range rows {
		if name, ok := row["name"].(string); ok {
			applied[name] = true
		}
	}
	return applied, nil
}

// RecordMigration records a migration as applied
func (e *Executor) RecordMigration(ctx context.Context, name string) error {
	sql := `INSERT INTO schema_migrations (name) VALUES (?)`
	_, err := e.client.ExecuteQuery(ctx, sql, []string{name})
	return err
}

// RemoveMigration removes a migration record
func (e *Executor) RemoveMigration(ctx context.Context, name string) error {
	sql := `DELETE FROM schema_migrations WHERE name = ?`
	_, err := e.client.ExecuteQuery(ctx, sql, []string{name})
	return err
}

// ExecuteMigration executes a migration SQL (may contain multiple statements)
func (e *Executor) ExecuteMigration(ctx context.Context, sql string) error {
	statements := splitSQL(sql)
	for _, stmt := range statements {
		stmt = strings.TrimSpace(stmt)
		if stmt == "" || strings.HasPrefix(stmt, "--") {
			continue
		}
		if _, err := e.client.ExecuteQuery(ctx, stmt, nil); err != nil {
			return fmt.Errorf("failed to execute statement: %w\nStatement: %s", err, stmt)
		}
	}
	return nil
}

// splitSQL splits SQL into individual statements
func splitSQL(sql string) []string {
	// Simple split by semicolon
	parts := strings.Split(sql, ";")
	result := make([]string, 0, len(parts))

	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

// Plan calculates which migrations need to be applied
func Plan(migrations []Migration, applied map[string]bool) (toApply, toRollback []Migration) {
	for _, m := range migrations {
		if !applied[m.Name] {
			toApply = append(toApply, m)
		}
	}
	return toApply, toRollback
}

// FindLastApplied finds the last applied migration
func FindLastApplied(migrations []Migration, applied map[string]bool) *Migration {
	for i := len(migrations) - 1; i >= 0; i-- {
		if applied[migrations[i].Name] {
			return &migrations[i]
		}
	}
	return nil
}
