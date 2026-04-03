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
          tags
        }
      }
      pageInfo {
        totalCount
      }
    }
  }
`;

export const GET_POST = `
  query GetPost($slug: String!) {
    blogPost(slug: $slug) {
      id
      slug
      title
      excerpt
      content
      date
      draft
      tags
    }
  }
`;

export const GET_ALL_SLUGS = `
  query GetAllSlugs {
    blogPosts(filter: { draft: false }, page: { first: 1000 }) {
      edges {
        node {
          slug
        }
      }
    }
  }
`;
