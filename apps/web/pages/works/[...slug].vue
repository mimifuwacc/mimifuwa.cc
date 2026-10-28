<script setup lang="ts">
import type { Props } from "./[...slug].server";
import WorkDetailPage from "../../src/pages/WorkDetailPage.vue";

defineProps<Props>();
</script>

<template>
  <WorkDetailPage :work="work" :has-error="hasError" />
</template>
