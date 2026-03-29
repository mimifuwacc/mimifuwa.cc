package repository

import "context"

// StorageRepository handles file storage operations (R2)
type StorageRepository interface {
	// Upload uploads a file to storage
	Upload(ctx context.Context, key string, data []byte, contentType string) error

	// Delete deletes a file from storage
	Delete(ctx context.Context, key string) error

	// Exists checks if a file exists in storage
	Exists(ctx context.Context, key string) (bool, error)
}
