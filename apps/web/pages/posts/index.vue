<script setup lang="ts">
import type { Props } from "./index.server";
import PostListPage from "@/pages/PostListPage.vue";

defineProps<Props>();
</script>

<template>
  <PostListPage :posts="posts" :has-error="hasError" />
</template>
