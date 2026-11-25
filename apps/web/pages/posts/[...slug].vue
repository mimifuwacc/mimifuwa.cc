<script setup lang="ts">
import type { Props } from "./[...slug].server";
import PostArticlePage from "@/pages/PostArticlePage.vue";

defineProps<Props>();
</script>

<template>
  <PostArticlePage :article="article" :has-error="hasError" />
</template>
