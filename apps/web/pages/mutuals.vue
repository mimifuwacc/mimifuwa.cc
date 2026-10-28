<script setup lang="ts">
import type { Props } from "./mutuals.server";
import MutualsPage from "@/pages/MutualsPage.vue";

defineProps<Props>();
</script>

<template>
  <MutualsPage :links="links" />
</template>
