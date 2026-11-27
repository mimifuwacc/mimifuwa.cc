<script setup lang="ts">
import { sanitizeUrl } from "@braintree/sanitize-url";
import { ArrowRight } from "@lucide/vue";
import { Link } from "@void/vue";
import InlineTagList from "@/components/InlineTagList.vue";
import type { PostSummary } from "@/types/post";

defineProps<{ post: PostSummary }>();

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
  <Link class="post-card square-card" :href="sanitizeUrl(post.url)">
    <div class="post-card-body">
      <div class="post-card-meta">
        <time v-if="post.date" :datetime="post.date">{{ formatDate(post.date) }}</time>
        <ArrowRight aria-hidden="true" class="icon" />
      </div>
      <p class="post-card-title">{{ post.title }}</p>
      <p v-if="post.description" class="post-card-description">
        {{ post.description }}
      </p>
      <InlineTagList v-if="post.tags?.length" :items="post.tags.slice(0, 3)" variant="outlined" />
    </div>
  </Link>
</template>

<style scoped>
.post-card {
  display: flex;
  flex-direction: column;
  padding-top: 1.25rem;
  color: inherit;
  border-top: 1px solid color-mix(in srgb, var(--soft-border) 40%, var(--background));
  text-decoration: none;
}

.post-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0;
}

.post-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  color: var(--muted-foreground);
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.post-card-meta .icon {
  flex: 0 0 auto;
  transition: color var(--ui-transition-duration) ease;
}

.post-card-meta time {
  flex: 0 0 auto;
  color: inherit;
}

.post-card-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  word-break: auto-phrase;
  text-wrap: pretty;
}

.post-card-description {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.875rem;
  line-height: 1.55;
  word-break: auto-phrase;
  text-wrap: pretty;
}

.post-card:hover .post-card-title {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.post-card:hover .post-card-description {
  color: inherit;
}

.post-card:hover .post-card-meta .icon,
.post-card:focus-visible .post-card-meta .icon {
  color: var(--foreground);
}

@media (prefers-reduced-motion: reduce) {
  .post-card-meta .icon {
    transition: none;
  }
}
</style>
