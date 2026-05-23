export const GET_POSTS = `
  query GetPosts($filter: BlogPostFilter, $page: PageInput) {
    blogPosts(filter: $filter, page: $page) {
      edges {
        node {
          id
          slug
          title
          excerpt
          date
          draft
          isPublished
          tags {
            id
            name
          }
          createdAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
        totalCount
      }
    }
  }
`;

export const GET_POST = `
  query GetPost($slug: String!) {
    adminPost(slug: $slug) {
      id
      slug
      title
      excerpt
      content
      markdown
      date
      draft
      isPublished
      tags {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_TAGS = `
  query GetTags {
    tags {
      id
      name
    }
  }
`;

export const CREATE_POST = `
  mutation CreatePost($input: CreateBlogPostInput!) {
    createBlogPost(input: $input) {
      success
      message
      blogPost {
        id
        slug
        title
      }
    }
  }
`;

export const UPDATE_POST = `
  mutation UpdatePost($input: UpdateBlogPostInput!) {
    updateBlogPost(input: $input) {
      success
      message
      blogPost {
        id
        slug
        title
      }
    }
  }
`;

export const DELETE_POST = `
  mutation DeletePost($slug: String!) {
    deleteBlogPost(slug: $slug) {
      success
      message
    }
  }
`;

export const ARCHIVE_POST = `
  mutation ArchivePost($slug: String!) {
    archiveBlogPost(slug: $slug) {
      success
      message
    }
  }
`;
