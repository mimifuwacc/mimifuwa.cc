<script setup lang="ts">
import type { Props } from "./index.server";
import BlogListPage from "../../src/pages/BlogListPage.vue";

defineProps<Props>();
</script>

<template>
  <BlogListPage :posts="posts" :has-error="hasError" />
</template>
