<script setup lang="ts">
import LinkCard from "@/components/LinkCard.vue";
import SiteSection from "@/components/SiteSection.vue";
import type { SiteLink } from "@/types/site-content";

defineProps<{ links: SiteLink[] }>();
</script>

<template>
  <SiteSection
    id="links-page"
    heading-level="h1"
    subtitle="Websites by friends and collaborators"
    title="Links"
  >
    <div class="links-grid">
      <LinkCard v-for="link in links" :key="link.url" :link="link" />
    </div>
  </SiteSection>
</template>

<style scoped>
.links-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2.25rem 1.5rem;
}

@media (min-width: 40.001rem) and (max-width: 90rem) {
  .links-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 40rem) {
  .links-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }
}
</style>
