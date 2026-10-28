<script setup lang="ts">
import LinkCard from "@/components/LinkCard.vue";
import SiteSection from "@/components/SiteSection.vue";
import type { Mutual } from "@/types/site-content";

defineProps<{ links: Mutual[] }>();
</script>

<template>
  <SiteSection
    id="mutuals-page"
    heading-level="h1"
    subtitle="Sites by friends and fellow makers."
    title="Mutuals"
  >
    <div class="links-list">
      <LinkCard v-for="link in links" :key="link.url" :link="link" />
    </div>
  </SiteSection>
</template>
