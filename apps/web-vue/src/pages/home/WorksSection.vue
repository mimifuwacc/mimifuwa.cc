<script setup lang="ts">
import { ArrowUpRight } from "@lucide/vue";
import { works } from "../../../../../contents/works";
import Button from "../../components/Button.vue";
import SiteSection from "../../components/SiteSection.vue";
import WorkCard from "../../components/WorkCard.vue";
</script>

<template>
  <SiteSection id="works-section" eyebrow="03 / Selected work" title="Works">
    <template #action>
      <Button class="works-action-desktop" href="https://github.com/mimifuwacc" external>
        More projects <ArrowUpRight class="icon" aria-hidden="true" />
      </Button>
    </template>
    <div class="works-grid">
      <WorkCard v-for="work in works" :key="work.title" :work="work" />
    </div>
    <div class="works-actions-mobile">
      <Button href="https://github.com/mimifuwacc" external>
        More projects <ArrowUpRight class="icon" aria-hidden="true" />
      </Button>
    </div>
  </SiteSection>
</template>

<style scoped>
.works-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2.25rem 1.5rem;
}

@media (max-width: 56rem) {
  .works-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 1.25rem;
  }
}

.works-actions-mobile {
  display: none;
}

@media (max-width: 48rem) {
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
