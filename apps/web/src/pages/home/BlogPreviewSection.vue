<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ArrowRight } from "@lucide/vue";
import BlogCard from "../../components/BlogCard.vue";
import SiteButton from "../../components/SiteButton.vue";
import SiteSection from "../../components/SiteSection.vue";
import { getBlogList } from "../../lib/blog-api";
import type { BlogSummary } from "../../types/blog";

const posts = ref<BlogSummary[]>([]);
onMounted(async () => {
  try {
    posts.value = (await getBlogList()).slice(0, 6);
  } catch {
    posts.value = [];
  }
});
</script>

<template>
  <SiteSection v-if="posts.length" id="blog-section" eyebrow="Notes & Thoughts" title="Blogs">
    <template #action>
      <SiteButton class="blog-action-desktop" href="/blogs/">
        See more <ArrowRight aria-hidden="true" class="icon" />
      </SiteButton>
    </template>
    <div class="blog-grid">
      <BlogCard v-for="post in posts" :key="post.url" :post="post" />
    </div>
    <div class="blog-actions-mobile">
      <SiteButton href="/blogs/">See more <ArrowRight aria-hidden="true" class="icon" /></SiteButton
      >
    </div>
  </SiteSection>
</template>

<style scoped>
.blog-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2.25rem 1.5rem;
}

@media (min-width: 40.001rem) and (max-width: 90rem) {
  .blog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.blog-actions-mobile {
  display: none;
}

@media (max-width: 40rem) {
  .blog-action-desktop {
    display: none;
  }

  .blog-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }

  .blog-actions-mobile {
    display: flex;
    justify-content: flex-end;
    margin-top: 1.25rem;
  }

  .blog-actions-mobile :deep(.button) {
    min-height: 2.25rem;
    padding: 0.45rem 0.7rem;
    font-size: 0.85rem;
  }
}
</style>
