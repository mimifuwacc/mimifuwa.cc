<script setup lang="ts">
import type { Props } from "./index.server";
import BlogListPage from "@/pages/BlogListPage.vue";

defineProps<Props>();
</script>

<template>
  <BlogListPage :posts="posts" :has-error="hasError" />
</template>
