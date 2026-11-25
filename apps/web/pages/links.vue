<script setup lang="ts">
import type { Props } from "./links.server";
import LinksPage from "@/pages/LinksPage.vue";

defineProps<Props>();
</script>

<template>
  <LinksPage :links="links" />
</template>
