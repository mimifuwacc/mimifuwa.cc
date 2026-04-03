package graphql

import (
	"strconv"

	"github.com/mimifuwacc/api/internal/entity"
	"github.com/mimifuwacc/api/internal/graphql/models"
	"github.com/mimifuwacc/api/internal/graphql/scalar"
)

// entityToModelPost converts an entity.BlogPost to a models.BlogPost
func entityToModelPost(post *entity.BlogPost) *models.BlogPost {
	tags := make([]*models.Tag, len(post.Tags))
	for i, tagName := range post.Tags {
		tags[i] = &models.Tag{
			ID:   "", // Tags don't have IDs in the entity when loaded as strings
			Name: tagName,
		}
	}

	var contentHash *string
	if post.ContentHash != "" {
		contentHash = &post.ContentHash
	}

	return &models.BlogPost{
		ID:          strconv.FormatInt(post.ID, 10),
		Slug:        post.Slug,
		R2Key:       post.R2Key,
		Title:       post.Title,
		Excerpt:     post.Excerpt,
		Content:     post.Content,
		Date:        scalar.FromTime(post.Date),
		Tags:        tags,
		Draft:       post.Draft,
		ContentHash: contentHash,
		CreatedAt:   scalar.FromTime(post.CreatedAt),
		UpdatedAt:   scalar.FromTime(post.UpdatedAt),
	}
}
