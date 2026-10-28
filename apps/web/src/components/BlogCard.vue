<script setup lang="ts">
import { sanitizeUrl } from "@braintree/sanitize-url";
import { ArrowRight } from "@lucide/vue";
import { Link } from "@void/vue";
import InlineTagList from "@/components/InlineTagList.vue";
import type { BlogSummary } from "@/types/blog";

defineProps<{ post: BlogSummary }>();

const formatDate = (date?: string) => {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(
        parsed,
      );
};
</script>

<template>
  <Link class="blog-card square-card" :href="sanitizeUrl(post.url)">
    <div class="blog-card-body">
      <div class="blog-card-meta">
        <time v-if="post.date" :datetime="post.date">{{ formatDate(post.date) }}</time>
        <ArrowRight aria-hidden="true" class="icon" />
      </div>
      <p class="blog-card-title">{{ post.title }}</p>
      <p v-if="post.description" class="blog-card-description">
        {{ post.description }}
      </p>
      <InlineTagList v-if="post.tags?.length" :items="post.tags.slice(0, 3)" variant="outlined" />
    </div>
  </Link>
</template>

<style scoped>
.blog-card {
  display: flex;
  flex-direction: column;
  padding-top: 1.25rem;
  color: inherit;
  border-top: 1px solid color-mix(in srgb, var(--soft-border) 40%, var(--background));
  text-decoration: none;
}

.blog-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0;
}

.blog-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  color: var(--muted-foreground);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.75rem;
}

.blog-card-meta .icon {
  flex: 0 0 auto;
  transition: color var(--ui-transition-duration) ease;
}

.blog-card-meta time {
  flex: 0 0 auto;
  color: inherit;
}

.blog-card-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.blog-card-description {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.875rem;
  line-height: 1.55;
}

.blog-card:hover .blog-card-title {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.blog-card:hover .blog-card-description {
  color: inherit;
}

.blog-card:hover .blog-card-meta .icon,
.blog-card:focus-visible .blog-card-meta .icon {
  color: var(--foreground);
}

@media (prefers-reduced-motion: reduce) {
  .blog-card-meta .icon {
    transition: none;
  }
}
</style>
