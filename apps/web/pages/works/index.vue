<script setup lang="ts">
import type { Props } from "./index.server";
import WorksPage from "../../src/pages/WorksPage.vue";

defineProps<Props>();
</script>

<template>
  <WorksPage :works="works" :has-error="hasError" />
</template>
