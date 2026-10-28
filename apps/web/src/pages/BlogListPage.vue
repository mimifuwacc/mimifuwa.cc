<script setup lang="ts">
import { onMounted, ref } from "vue";
import BlogCard from "../components/BlogCard.vue";
import SiteSection from "../components/SiteSection.vue";
import { getBlogList } from "../lib/blog-api";
import type { BlogSummary } from "../types/blog";

const posts = ref<BlogSummary[]>([]);
const loading = ref(true);
const hasError = ref(false);

onMounted(async () => {
  try {
    posts.value = await getBlogList();
  } catch {
    hasError.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <SiteSection id="blogs-page" heading-level="h1" title="Blogs">
    <p v-if="loading" aria-live="polite" class="empty-state">読み込み中...</p>
    <p v-else-if="hasError" class="empty-state" role="alert">記事を読み込めませんでした。</p>
    <p v-else-if="posts.length === 0" class="empty-state">
      記事が公開され次第、ここに表示されます。
    </p>
    <div v-else-if="posts.length" class="blog-grid">
      <BlogCard v-for="post in posts" :key="post.url" :post="post" />
    </div>
  </SiteSection>
</template>

<style scoped>
.blog-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2.25rem 1.5rem;
}

.empty-state {
  margin: 0;
}

@media (min-width: 40.001rem) and (max-width: 90rem) {
  .blog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 40rem) {
  .blog-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }
}
</style>
