package local

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"
)

// GitClient implements repository.GitRepository
type GitClient struct {
	workDir string
}

// NewGitClient creates a new Git client
func NewGitClient(workDir string) *GitClient {
	return &GitClient{
		workDir: workDir,
	}
}

// GetChangedFiles returns the list of changed files
func (g *GitClient) GetChangedFiles(ctx context.Context, base string) ([]string, error) {
	var cmd *exec.Cmd

	if base == "" {
		// Local: compare with HEAD~1
		cmd = exec.CommandContext(ctx, "git", "diff", "--name-only", "HEAD~1...HEAD")
	} else {
		// CI: fetch and compare with origin/main
		exec.CommandContext(ctx, "git", "fetch", "origin", "main", "--depth=1").Run()
		cmd = exec.CommandContext(ctx, "git", "diff", "--name-only", fmt.Sprintf("%s...HEAD", base))
	}

	cmd.Dir = g.workDir
	output, err := cmd.Output()
	if err != nil {
		// If git command fails (e.g., first commit), return empty slice
		if strings.Contains(err.Error(), "exit status") {
			return []string{}, nil
		}
		return nil, fmt.Errorf("failed to get changed files: %w", err)
	}

	lines := strings.Split(strings.TrimSpace(string(output)), "\n")
	files := make([]string, 0, len(lines))
	for _, line := range lines {
		if line != "" {
			files = append(files, line)
		}
	}

	return files, nil
}

// GetCurrentBranch returns the current branch name
func (g *GitClient) GetCurrentBranch(ctx context.Context) (string, error) {
	cmd := exec.CommandContext(ctx, "git", "rev-parse", "--abbrev-ref", "HEAD")
	cmd.Dir = g.workDir

	output, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("failed to get current branch: %w", err)
	}

	return strings.TrimSpace(string(output)), nil
}

// IsCI returns true if running in CI environment
func IsCI() bool {
	return os.Getenv("CI") == "true"
}

// GetWorkDir returns the current working directory
func GetWorkDir() (string, error) {
	dir, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("failed to get working directory: %w", err)
	}
	return dir, nil
}
