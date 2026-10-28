<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ArrowRight } from "@lucide/vue";
import SiteButton from "../../components/SiteButton.vue";
import SiteSection from "../../components/SiteSection.vue";
import WorkCard from "../../components/WorkCard.vue";
import { getWorks } from "../../lib/work-api";
import type { WorkItem } from "../../types/work";

const works = ref<WorkItem[]>([]);
onMounted(async () => {
  try {
    works.value = (await getWorks()).slice(0, 6);
  } catch {
    works.value = [];
  }
});
</script>

<template>
  <SiteSection v-if="works.length" id="works-section" eyebrow="Things I’ve made" title="Works">
    <template #action>
      <SiteButton class="works-action-desktop" href="/works/">
        See more <ArrowRight aria-hidden="true" class="icon" />
      </SiteButton>
    </template>
    <div class="works-grid">
      <WorkCard v-for="work in works" :key="work.title" :work="work" />
    </div>
    <div class="works-actions-mobile">
      <SiteButton href="/works/"> See more <ArrowRight aria-hidden="true" class="icon" /> </SiteButton>
    </div>
  </SiteSection>
</template>

<style scoped>
.works-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2.25rem 1.5rem;
}

@media (min-width: 48.001rem) and (max-width: 90rem) {
  .works-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.works-actions-mobile {
  display: none;
}

@media (max-width: 48rem) {
  .works-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }

  .works-action-desktop {
    display: none;
  }

  .works-actions-mobile {
    display: flex;
    justify-content: flex-end;
    margin-top: 1.25rem;
  }

  .works-actions-mobile :deep(.button) {
    min-height: 2.25rem;
    padding: 0.45rem 0.7rem;
    font-size: 0.85rem;
  }
}
</style>
