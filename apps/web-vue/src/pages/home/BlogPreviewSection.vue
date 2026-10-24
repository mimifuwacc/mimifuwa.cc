<script setup lang="ts">
import { onMounted, ref } from "vue";
import BlogCard from "../../components/BlogCard.vue";
import SiteSection from "../../components/SiteSection.vue";
import type { BlogSummary } from "../../types/blog";

const posts = ref<BlogSummary[]>([]);

onMounted(async () => {
  try {
    const response = await fetch("/blog-list.json");
    if (!response.ok) return;
    posts.value = ((await response.json()) as BlogSummary[]).slice(0, 6);
  } catch {
    posts.value = [];
  }
});
</script>

<template>
  <SiteSection
    v-if="posts.length"
    id="blog-section"
    eyebrow="02 / Writing"
    title="Blog"
    subtitle="Notes on software, projects, and everyday things."
  >
    <template #action>
      <a class="section-link" href="/blogs/">All articles <span aria-hidden="true">→</span></a>
    </template>
    <div class="blog-grid">
      <BlogCard v-for="post in posts" :key="post.url" :post="post" />
    </div>
  </SiteSection>
</template>

<style scoped>
.blog-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2.75rem 1.5rem;
}

@media (min-width: 48.001rem) and (max-width: 70rem) {
  .blog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 48rem) {
  .blog-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
