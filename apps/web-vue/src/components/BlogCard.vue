<script setup lang="ts">
interface BlogSummary {
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  url: string;
}

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
    <div class="blog-card-image" aria-hidden="true">{{ post.title.slice(0, 1) }}</div>
    <div class="blog-card-body">
      <p class="blog-card-title">{{ post.title }}</p>
      <p v-if="post.description" class="blog-card-description">
        {{ post.description }}
      </p>
      <div class="blog-card-meta">
        <div class="tag-list">
          <span v-for="tag in post.tags?.slice(0, 3)" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>
        <time v-if="post.date" :datetime="post.date">{{ formatDate(post.date) }}</time>
      </div>
    </div>
  </a>
</template>
