package cloudflare

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/aws/smithy-go"
)

// R2Config represents the configuration for R2 client
type R2Config struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	BucketName      string
}

// R2Client implements repository.StorageRepository for Cloudflare R2
type R2Client struct {
	client     *s3.Client
	bucketName string
}

// NewR2Client creates a new R2 client
func NewR2Client(ctx context.Context, cfg *R2Config) (*R2Client, error) {
	if cfg == nil {
		return nil, fmt.Errorf("config is required")
	}

	// Create AWS config for R2 (S3-compatible)
	awsCfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("auto"),
		config.WithCredentialsProvider(aws.CredentialsProviderFunc(func(ctx context.Context) (aws.Credentials, error) {
			return aws.Credentials{
				AccessKeyID:     cfg.AccessKeyID,
				SecretAccessKey: cfg.SecretAccessKey,
			}, nil
		})),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	// Create S3 client with R2 endpoint
	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.AccountID))
	})

	return &R2Client{
		client:     client,
		bucketName: cfg.BucketName,
	}, nil
}

// Upload uploads a file to R2
func (r *R2Client) Upload(ctx context.Context, key string, data []byte, contentType string) error {
	if key == "" {
		return fmt.Errorf("key is required")
	}

	_, err := r.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(r.bucketName),
		Key:         aws.String(key),
		Body:        bytes.NewReader(data),
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return fmt.Errorf("failed to upload %s: %w", key, err)
	}

	return nil
}

// Delete deletes a file from R2
func (r *R2Client) Delete(ctx context.Context, key string) error {
	if key == "" {
		return fmt.Errorf("key is required")
	}

	_, err := r.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(r.bucketName),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("failed to delete %s: %w", key, err)
	}

	return nil
}

// Exists checks if a file exists in R2
func (r *R2Client) Exists(ctx context.Context, key string) (bool, error) {
	if key == "" {
		return false, fmt.Errorf("key is required")
	}

	_, err := r.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(r.bucketName),
		Key:    aws.String(key),
	})

	if err != nil {
		var smithErr *smithy.APIError
		if errors.As(err, &smithErr) {
			// NotFound error means the object doesn't exist
			return false, nil
		}
		return false, fmt.Errorf("failed to check existence of %s: %w", key, err)
	}

	return true, nil
}

// Download downloads a file from R2
func (r *R2Client) Download(ctx context.Context, key string) ([]byte, string, error) {
	if key == "" {
		return nil, "", fmt.Errorf("key is required")
	}

	resp, err := r.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(r.bucketName),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, "", fmt.Errorf("failed to download %s: %w", key, err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", fmt.Errorf("failed to read body: %w", err)
	}

	contentType := ""
	if resp.ContentType != nil {
		contentType = *resp.ContentType
	}

	return data, contentType, nil
}

// ListFiles lists files in R2 with a given prefix
func (r *R2Client) ListFiles(ctx context.Context, prefix string) ([]string, error) {
	var files []string

	paginator := s3.NewListObjectsV2Paginator(r.client, &s3.ListObjectsV2Input{
		Bucket: aws.String(r.bucketName),
		Prefix: aws.String(prefix),
	})

	for paginator.HasMorePages() {
		page, err := paginator.NextPage(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to list objects: %w", err)
		}

		for _, obj := range page.Contents {
			if obj.Key != nil {
				files = append(files, *obj.Key)
			}
		}
	}

	return files, nil
}

// DeleteByPrefix deletes all files with a given prefix
func (r *R2Client) DeleteByPrefix(ctx context.Context, prefix string) error {
	files, err := r.ListFiles(ctx, prefix)
	if err != nil {
		return err
	}

	if len(files) == 0 {
		return nil
	}

	// Batch delete (max 1000 objects per request)
	for i := 0; i < len(files); i += 1000 {
		end := i + 1000
		if end > len(files) {
			end = len(files)
		}

		batch := files[i:end]
		objs := make([]types.ObjectIdentifier, len(batch))
		for j, key := range batch {
			objs[j] = types.ObjectIdentifier{Key: aws.String(key)}
		}

		_, err := r.client.DeleteObjects(ctx, &s3.DeleteObjectsInput{
			Bucket: aws.String(r.bucketName),
			Delete: &types.Delete{
				Objects: objs,
			},
		})
		if err != nil {
			return fmt.Errorf("failed to delete objects: %w", err)
		}
	}

	return nil
}

// NormalizeKey ensures the key doesn't start with a slash
func NormalizeKey(key string) string {
	return strings.TrimPrefix(key, "/")
}
