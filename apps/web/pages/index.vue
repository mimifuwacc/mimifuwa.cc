<script setup lang="ts">
import type { Props } from "./index.server";
import HomePage from "@/pages/HomePage.vue";

defineProps<Props>();
</script>

<template>
  <HomePage :about="about" :blogs="blogs" :tracks="tracks" :works="works" />
</template>
