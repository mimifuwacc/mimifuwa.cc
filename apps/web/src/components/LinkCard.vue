<script setup lang="ts">
import { ArrowUpRight } from "@lucide/vue";
import type { LinkItem } from "../../../../contents/links";

defineProps<{ link: LinkItem }>();

const hostname = (url: string) => new URL(url).hostname.replace(/^www\./, "");
</script>

<template>
  <a class="link-card square-card" :href="link.url" rel="noopener" target="_blank">
    <div class="link-card-copy">
      <strong>{{ link.name }}</strong>
      <small>{{ hostname(link.url) }}</small>
      <p>{{ link.description }}</p>
    </div>
    <ArrowUpRight aria-hidden="true" class="icon" />
  </a>
</template>
