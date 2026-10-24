<script setup lang="ts">
import { ArrowUpRight } from "@lucide/vue";
import InlineTagList from "./InlineTagList.vue";
import type { BlogSummary } from "../types/blog";

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
  <a class="blog-card square-card" :href="post.url">
    <div class="blog-card-body">
      <div class="blog-card-meta">
        <time v-if="post.date" :datetime="post.date">{{ formatDate(post.date) }}</time>
        <ArrowUpRight class="icon" aria-hidden="true" />
      </div>
      <p class="blog-card-title">{{ post.title }}</p>
      <p v-if="post.description" class="blog-card-description">
        {{ post.description }}
      </p>
      <InlineTagList v-if="post.tags?.length" :items="post.tags.slice(0, 3)" />
    </div>
  </a>
</template>

<style scoped>
.blog-card {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  padding-top: 1rem;
  color: inherit;
  border-top: 1px solid color-mix(in srgb, var(--soft-border) 40%, var(--background));
  text-decoration: none;
}

.blog-card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;
}

.blog-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  color: var(--muted-foreground);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.72rem;
}

.blog-card-meta time {
  flex: 0 0 auto;
  color: inherit;
}

.blog-card-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.blog-card-description {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.82rem;
  line-height: 1.55;
}

.blog-card:hover .blog-card-title {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.blog-card:hover .blog-card-description {
  color: inherit;
}
</style>
