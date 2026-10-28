<script setup lang="ts">
import type { Props } from "./[...slug].server";
import BlogArticlePage from "../../src/pages/BlogArticlePage.vue";

defineProps<Props>();
</script>

<template>
  <BlogArticlePage :article="article" :has-error="hasError" />
</template>
