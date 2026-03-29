package local

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"
)


// WranglerR2Client handles R2 operations via wrangler CLI
type WranglerR2Client struct {
	bucketName string
}

// NewWranglerR2Client creates a new wrangler-based R2 client
func NewWranglerR2Client(bucketName string) *WranglerR2Client {
	return &WranglerR2Client{
		bucketName: bucketName,
	}
}

// Upload uploads a file to R2 using wrangler
func (w *WranglerR2Client) Upload(ctx context.Context, key string, data []byte, contentType string) error {
	// Create temporary file for upload
	tmpFile := fmt.Sprintf("/tmp/r2_upload_%s", strings.ReplaceAll(key, "/", "_"))
	defer os.Remove(tmpFile)

	// Write data to temp file
	if err := os.WriteFile(tmpFile, data, 0644); err != nil {
		return fmt.Errorf("failed to write temp file: %w", err)
	}

	// Upload using wrangler (local mode by default)
	args := []string{
		"r2", "object", "put",
		w.bucketName + "/" + key,
		"--file", tmpFile,
		"--local",
		"--config", "../../apps/web/wrangler.jsonc",
	}

	if contentType != "" {
		args = append(args, "--content-type", contentType)
	}

	allArgs := append([]string{"pnpm", "exec", "wrangler"}, args...)
	output, err := exec.CommandContext(ctx, allArgs[0], allArgs[1:]...).CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to upload %s: %w\nOutput: %s", key, err, string(output))
	}

	return nil
}

// Delete deletes a file from R2 using wrangler
func (w *WranglerR2Client) Delete(ctx context.Context, key string) error {
	args := []string{
		"r2", "object", "delete",
		w.bucketName + "/" + key,
		"--local",
		"--config", "../../apps/web/wrangler.jsonc",
	}

	allArgs := append([]string{"pnpm", "exec", "wrangler"}, args...)
	output, err := exec.CommandContext(ctx, allArgs[0], allArgs[1:]...).CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to delete %s: %w\nOutput: %s", key, err, string(output))
	}

	return nil
}

// Exists checks if a file exists in R2 using wrangler
func (w *WranglerR2Client) Exists(ctx context.Context, key string) (bool, error) {
	args := []string{
		"r2", "object", "get",
		w.bucketName + "/" + key,
		"--local",
		"--config", "../../apps/web/wrangler.jsonc",
	}

	allArgs := append([]string{"pnpm", "exec", "wrangler"}, args...)
	output, err := exec.CommandContext(ctx, allArgs[0], allArgs[1:]...).CombinedOutput()
	if err != nil {
		// wrangler returns error if object doesn't exist
		if strings.Contains(string(output), "could not be found") || strings.Contains(string(output), "404") {
			return false, nil
		}
		return false, fmt.Errorf("failed to check existence: %w\nOutput: %s", err, string(output))
	}

	return true, nil
}

// Download downloads a file from R2 using wrangler
func (w *WranglerR2Client) Download(ctx context.Context, key string) ([]byte, string, error) {
	args := []string{
		"r2", "object", "get",
		w.bucketName + "/" + key,
		"--local",
		"--config", "../../apps/web/wrangler.jsonc",
	}

	output, err := execCommand(ctx, append([]string{"pnpm", "exec", "wrangler"}, args...)...).Output()
	if err != nil {
		return nil, "", fmt.Errorf("failed to download %s: %w", key, err)
	}

	return output, "", nil
}

// ListFiles lists files in R2 with a given prefix using wrangler
func (w *WranglerR2Client) ListFiles(ctx context.Context, prefix string) ([]string, error) {
	args := []string{
		"r2", "object", "list",
		w.bucketName,
		"--prefix", prefix,
		"--local",
		"--config", "../../apps/web/wrangler.jsonc",
	}

	output, err := execCommand(ctx, append([]string{"pnpm", "exec", "wrangler"}, args...)...).Output()
	if err != nil {
		return nil, fmt.Errorf("failed to list objects: %w", err)
	}

	// Parse wrangler output
	lines := strings.Split(string(output), "\n")
	files := make([]string, 0, len(lines))
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line != "" && !strings.Contains(line, "Listing objects") {
			files = append(files, line)
		}
	}

	return files, nil
}

// DeleteByPrefix deletes all files with a given prefix using wrangler
func (w *WranglerR2Client) DeleteByPrefix(ctx context.Context, prefix string) error {
	files, err := w.ListFiles(ctx, prefix)
	if err != nil {
		return err
	}

	for _, file := range files {
		// Extract key from full path (bucket/key)
		key := strings.TrimPrefix(file, w.bucketName+"/")
		if err := w.Delete(ctx, key); err != nil {
			return fmt.Errorf("failed to delete %s: %w", key, err)
		}
	}

	return nil
}
