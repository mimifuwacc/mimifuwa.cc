<script setup lang="ts">
import SiteSection from "../components/SiteSection.vue";
import WorkCard from "../components/WorkCard.vue";
import type { WorkItem } from "../types/work";

defineProps<{ works: WorkItem[]; hasError: boolean }>();
</script>

<template>
  <SiteSection id="works-page" heading-level="h1" title="Works">
    <p v-if="hasError" class="works-message" role="alert">制作物を読み込めませんでした。</p>
    <p v-else-if="works.length === 0" class="works-message">制作物はまだありません。</p>
    <div v-else class="works-grid">
      <WorkCard v-for="work in works" :key="work.title" :work="work" />
    </div>
  </SiteSection>
</template>

<style scoped>
.works-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2.25rem 1.5rem;
}

.works-message {
  margin: 0;
}

@media (min-width: 40.001rem) and (max-width: 90rem) {
  .works-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 40rem) {
  .works-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }
}
</style>
