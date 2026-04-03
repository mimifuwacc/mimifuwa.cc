package graphql

import (
	"github.com/mimifuwacc/api/internal/repository"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require
// here.

type Resolver struct {
	BlogPostRepo repository.BlogPostRepository
	TagRepo      repository.TagRepository
	StorageRepo  repository.StorageRepository
}
