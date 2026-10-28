<script setup lang="ts">
import type { Props } from "./index.server";
import HomePage from "@/pages/HomePage.vue";

defineProps<Props>();
</script>

<template>
  <HomePage :blogs="blogs" :works="works" />
</template>
