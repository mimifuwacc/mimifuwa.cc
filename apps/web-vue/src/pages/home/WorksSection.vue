<script setup lang="ts">
import { ArrowUpRight } from "@lucide/vue";
import { works } from "../../../../../contents/works";
import Button from "../../components/Button.vue";
import SiteSection from "../../components/SiteSection.vue";
import WorkCard from "../../components/WorkCard.vue";
</script>

<template>
  <SiteSection
    id="works-section"
    eyebrow="03 / Selected work"
    title="Works"
    subtitle="Apps, services, and tools I have made."
  >
    <template #action>
      <Button href="https://github.com/mimifuwacc" external>
        More projects <ArrowUpRight class="icon" aria-hidden="true" />
      </Button>
    </template>
    <div class="works-grid">
      <WorkCard v-for="work in works" :key="work.title" :work="work" />
    </div>
  </SiteSection>
</template>

<style scoped>
.works-grid {
  display: grid;
  gap: 1.5rem;
}
</style>
