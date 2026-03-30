package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/mimifuwacc/db/internal/d1"
	"github.com/mimifuwacc/db/internal/migration"
	"github.com/spf13/cobra"
)

func main() {
	var remote bool
	var verbose bool
	var migrationsDir string
	var dbName string
	var wranglerConfig string

	rootCmd := &cobra.Command{
		Use:   "migrate [command]",
		Short: "Database migration CLI",
		RunE: func(cmd *cobra.Command, args []string) error {
			return runStatus(migrationsDir, dbName, wranglerConfig, remote, verbose)
		},
	}

	upCmd := &cobra.Command{
		Use:   "up [name]",
		Short: "Apply pending migrations",
		RunE: func(cmd *cobra.Command, args []string) error {
			return runUp(migrationsDir, dbName, wranglerConfig, remote, verbose, args)
		},
	}

	downCmd := &cobra.Command{
		Use:   "down [name]",
		Short: "Rollback migrations",
		RunE: func(cmd *cobra.Command, args []string) error {
			return runDown(migrationsDir, dbName, wranglerConfig, remote, verbose, args)
		},
	}

	redoCmd := &cobra.Command{
		Use:   "redo",
		Short: "Rollback and reapply the last migration",
		RunE: func(cmd *cobra.Command, args []string) error {
			return runRedo(migrationsDir, dbName, wranglerConfig, remote, verbose)
		},
	}

	statusCmd := &cobra.Command{
		Use:   "status",
		Short: "Show migration status",
		RunE: func(cmd *cobra.Command, args []string) error {
			return runStatus(migrationsDir, dbName, wranglerConfig, remote, verbose)
		},
	}

	createCmd := &cobra.Command{
		Use:   "create [description]",
		Short: "Create a new migration file",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runCreate(migrationsDir, args[0])
		},
	}

	// Add flags
	rootCmd.PersistentFlags().BoolVarP(&remote, "remote", "r", false, "Use remote D1 database")
	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "Verbose output")
	rootCmd.PersistentFlags().StringVar(&migrationsDir, "dir", "../../db/migrations", "Migrations directory")
	rootCmd.PersistentFlags().StringVar(&dbName, "db", "mimifuwacc-blogs", "D1 database name")
	rootCmd.PersistentFlags().StringVar(&wranglerConfig, "wrangler-config", "../../apps/web/wrangler.jsonc", "Wrangler config path")

	rootCmd.AddCommand(upCmd, downCmd, redoCmd, statusCmd, createCmd)

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}

func getExecutor(dbName, wranglerConfig string, remote bool) (*migration.Executor, error) {
	ctx := context.Background()

	config := d1.ClientConfig{
		DatabaseName:   dbName,
		Remote:         remote,
	}

	client, err := d1.NewClient(config)
	if err != nil {
		return nil, err
	}

	executor := client.CreateMigrationExecutor()
	if err := executor.EnsureMigrationsTable(ctx); err != nil {
		return nil, fmt.Errorf("failed to ensure migrations table: %w", err)
	}

	return executor, nil
}

func loadMigrations(dir string) ([]migration.Migration, error) {
	loader := migration.NewLoader(dir)
	return loader.Load()
}

func runUp(migrationsDir, dbName, wranglerConfig string, remote, verbose bool, args []string) error {
	ctx := context.Background()
	executor, err := getExecutor(dbName, wranglerConfig, remote)
	if err != nil {
		return err
	}

	migrations, err := loadMigrations(migrationsDir)
	if err != nil {
		return fmt.Errorf("failed to load migrations: %w", err)
	}

	applied, err := executor.GetAppliedMigrations(ctx)
	if err != nil {
		return fmt.Errorf("failed to get applied migrations: %w", err)
	}

	toApply, _ := migration.Plan(migrations, applied)

	// If specific migration name provided
	if len(args) > 0 {
		targetName := args[0]
		var targetIdx = -1
		for i, m := range migrations {
			if m.Name == targetName {
				targetIdx = i
				break
			}
		}
		if targetIdx == -1 {
			return fmt.Errorf("migration not found: %s", targetName)
		}

		toApply = nil
		for i := 0; i <= targetIdx; i++ {
			if !applied[migrations[i].Name] {
				toApply = append(toApply, migrations[i])
			}
		}
	}

	if len(toApply) == 0 {
		fmt.Println("No pending migrations to apply.")
		return nil
	}

	fmt.Printf("Applying %d migration(s)...\n", len(toApply))

	for _, m := range toApply {
		if verbose {
			fmt.Printf("\nApplying: %s\n", m.Name)
		} else {
			fmt.Printf("Applying: %s...\n", m.Name)
		}

		if err := executor.ExecuteMigration(ctx, m.Up); err != nil {
			return fmt.Errorf("failed to apply migration %s: %w", m.Name, err)
		}

		if err := executor.RecordMigration(ctx, m.Name); err != nil {
			return fmt.Errorf("failed to record migration %s: %w", m.Name, err)
		}

		fmt.Printf("✓ Applied: %s\n", m.Name)
	}

	fmt.Println("\nAll migrations applied!")
	return nil
}

func runDown(migrationsDir, dbName, wranglerConfig string, remote, verbose bool, args []string) error {
	ctx := context.Background()
	executor, err := getExecutor(dbName, wranglerConfig, remote)
	if err != nil {
		return err
	}

	migrations, err := loadMigrations(migrationsDir)
	if err != nil {
		return fmt.Errorf("failed to load migrations: %w", err)
	}

	applied, err := executor.GetAppliedMigrations(ctx)
	if err != nil {
		return fmt.Errorf("failed to get applied migrations: %w", err)
	}

	var targetMigration *migration.Migration

	if len(args) > 0 {
		targetName := args[0]
		for i := range migrations {
			if migrations[i].Name == targetName {
				targetMigration = &migrations[i]
				break
			}
		}
		if targetMigration == nil {
			return fmt.Errorf("migration not found: %s", targetName)
		}
		if !applied[targetMigration.Name] {
			return fmt.Errorf("migration not applied: %s", targetMigration.Name)
		}
	} else {
		targetMigration = migration.FindLastApplied(migrations, applied)
		if targetMigration == nil {
			fmt.Println("No migration to rollback.")
			return nil
		}
	}

	if targetMigration.Down == "" {
		return fmt.Errorf("cannot rollback migration %s: no down migration defined", targetMigration.Name)
	}

	fmt.Printf("Rolling back: %s...\n", targetMigration.Name)

	if err := executor.ExecuteMigration(ctx, targetMigration.Down); err != nil {
		return fmt.Errorf("failed to rollback migration %s: %w", targetMigration.Name, err)
	}

	if err := executor.RemoveMigration(ctx, targetMigration.Name); err != nil {
		return fmt.Errorf("failed to remove migration record: %w", err)
	}

	fmt.Printf("✓ Rolled back: %s\n", targetMigration.Name)
	return nil
}

func runRedo(migrationsDir, dbName, wranglerConfig string, remote, verbose bool) error {
	if err := runDown(migrationsDir, dbName, wranglerConfig, remote, verbose, nil); err != nil {
		return err
	}

	fmt.Println("\nReapplying...")
	return runUp(migrationsDir, dbName, wranglerConfig, remote, verbose, nil)
}

func runStatus(migrationsDir, dbName, wranglerConfig string, remote, verbose bool) error {
	ctx := context.Background()
	executor, err := getExecutor(dbName, wranglerConfig, remote)
	if err != nil {
		return err
	}

	migrations, err := loadMigrations(migrationsDir)
	if err != nil {
		return fmt.Errorf("failed to load migrations: %w", err)
	}

	applied, err := executor.GetAppliedMigrations(ctx)
	if err != nil {
		return fmt.Errorf("failed to get applied migrations: %w", err)
	}

	fmt.Printf("Migration Status (%s):\n\n", map[bool]string{true: "remote", false: "local"}[remote])

	for _, m := range migrations {
		status := "  "
		if _, exists := applied[m.Name]; exists {
			status = "✓"
		}
		fmt.Printf("  [%s] %s\n", status, m.Name)

		if verbose {
			if m.Up != "" {
				fmt.Printf("      Up: %d statements\n", countStatements(m.Up))
			}
			if m.Down != "" {
				fmt.Printf("      Down: %d statements\n", countStatements(m.Down))
			}
		}
	}

	fmt.Printf("\nApplied: %d/%d\n", len(applied), len(migrations))

	pending := 0
	for _, m := range migrations {
		if !applied[m.Name] {
			pending++
		}
	}
	if pending > 0 {
		fmt.Printf("Pending: %d\n", pending)
	}

	return nil
}

func runCreate(migrationsDir, description string) error {
	timestamp := time.Now().Format("20060102_150405")
	name := fmt.Sprintf("%s_%s", timestamp, description)

	upPath := fmt.Sprintf("%s/%s.up.sql", migrationsDir, name)
	downPath := fmt.Sprintf("%s/%s.down.sql", migrationsDir, name)

	if _, err := os.Stat(upPath); err == nil {
		return fmt.Errorf("migration file already exists: %s", upPath)
	}

	upContent := fmt.Sprintf("-- Migration: %s\n-- Created at: %s\n\n", name, time.Now().Format(time.RFC3339))
	if err := os.WriteFile(upPath, []byte(upContent), 0644); err != nil {
		return fmt.Errorf("failed to create %s: %w", upPath, err)
	}

	downContent := fmt.Sprintf("-- Rollback: %s\n-- Created at: %s\n\n", name, time.Now().Format(time.RFC3339))
	if err := os.WriteFile(downPath, []byte(downContent), 0644); err != nil {
		return fmt.Errorf("failed to create %s: %w", downPath, err)
	}

	fmt.Printf("Created migration files:\n")
	fmt.Printf("  %s\n", upPath)
	fmt.Printf("  %s\n", downPath)

	return nil
}

func countStatements(sql string) int {
	count := 0
	for _, c := range sql {
		if c == ';' {
			count++
		}
	}
	return count
}
