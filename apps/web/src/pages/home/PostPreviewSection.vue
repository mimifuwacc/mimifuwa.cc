<script setup lang="ts">
import { ArrowRight } from "@lucide/vue";
import PostCard from "@/components/PostCard.vue";
import SiteButton from "@/components/SiteButton.vue";
import SiteSection from "@/components/SiteSection.vue";
import type { PostSummary } from "@/types/post";

defineProps<{ posts: PostSummary[] }>();
</script>

<template>
  <SiteSection v-if="posts.length" id="post-section" eyebrow="Notes & Thoughts" title="Posts">
    <template #action>
      <SiteButton class="post-action-desktop" href="/posts/">
        See more <ArrowRight aria-hidden="true" class="icon" />
      </SiteButton>
    </template>
    <div class="post-grid">
      <PostCard v-for="post in posts" :key="post.url" :post="post" />
    </div>
    <div class="post-actions-mobile">
      <SiteButton href="/posts/">See more <ArrowRight aria-hidden="true" class="icon" /></SiteButton
      >
    </div>
  </SiteSection>
</template>

<style scoped>
.post-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2.25rem 1.5rem;
}

@media (min-width: 40.001rem) and (max-width: 90rem) {
  .post-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.post-actions-mobile {
  display: none;
}

@media (max-width: 40rem) {
  .post-action-desktop {
    display: none;
  }

  .post-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }

  .post-actions-mobile {
    display: flex;
    justify-content: flex-end;
    margin-top: 1.25rem;
  }

  .post-actions-mobile :deep(.button) {
    min-height: 2.25rem;
    padding: 0.45rem 0.7rem;
    font-size: 0.85rem;
  }
}
</style>
