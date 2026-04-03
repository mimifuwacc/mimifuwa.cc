package local

import (
	"context"
	"os/exec"
)

// execCommand is a helper to execute commands
func execCommand(ctx context.Context, args ...string) *exec.Cmd {
	return exec.CommandContext(ctx, args[0], args[1:]...)
}
