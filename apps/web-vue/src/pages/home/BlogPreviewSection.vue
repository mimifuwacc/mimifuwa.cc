<script setup lang="ts">
import { onMounted, ref } from "vue";
import BlogCard from "../../components/BlogCard.vue";
import Button from "../../components/Button.vue";
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
  <SiteSection v-if="posts.length" id="blog-section" eyebrow="02 / Writing" title="Blog">
    <template #action>
      <Button class="blog-action-desktop" href="/blogs/">
        All articles <span aria-hidden="true">→</span>
      </Button>
    </template>
    <div class="blog-grid">
      <BlogCard v-for="post in posts" :key="post.url" :post="post" />
    </div>
    <div class="blog-actions-mobile">
      <Button href="/blogs/">All articles <span aria-hidden="true">→</span></Button>
    </div>
  </SiteSection>
</template>

<style scoped>
.blog-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2.25rem 1.5rem;
}

@media (min-width: 48.001rem) and (max-width: 70rem) {
  .blog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.blog-actions-mobile {
  display: none;
}

@media (max-width: 48rem) {
  .blog-action-desktop {
    display: none;
  }

  .blog-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 1.75rem;
  }

  .blog-actions-mobile {
    display: flex;
    justify-content: flex-end;
    margin-top: 1.75rem;
  }

  .blog-actions-mobile :deep(.button) {
    min-height: 2.25rem;
    padding: 0.45rem 0.7rem;
    font-size: 0.85rem;
  }
}
</style>
