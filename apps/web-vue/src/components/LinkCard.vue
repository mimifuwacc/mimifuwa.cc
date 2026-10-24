<script setup lang="ts">
import type { LinkItem } from "../../../../contents/links";

defineProps<{ link: LinkItem }>();

const hostname = (url: string) => new URL(url).hostname.replace(/^www\./, "");
</script>

<template>
  <a class="link-card square-card" :href="link.url" target="_blank" rel="noopener">
    <div class="link-card-copy">
      <strong>{{ link.name }}</strong>
      <small>{{ hostname(link.url) }}</small>
      <p>{{ link.description }}</p>
    </div>
    <span aria-hidden="true">↗</span>
  </a>
</template>
