<script setup lang="ts">
import type { BlogSummary } from "../types/blog";
import type { WorkItem } from "../types/work";
import AboutSection from "./home/AboutSection.vue";
import BlogPreviewSection from "./home/BlogPreviewSection.vue";
import HomeHero from "./home/HomeHero.vue";
import OnRepeatSection from "./home/OnRepeatSection.vue";
import WorksSection from "./home/WorksSection.vue";

const avatar = "/mimifuwacc.png";
defineProps<{ blogs: BlogSummary[]; works: WorkItem[] }>();
</script>

<template>
  <HomeHero :avatar="avatar" />
  <AboutSection :avatar="avatar" />
  <BlogPreviewSection :posts="blogs" />
  <WorksSection :works="works" />
  <OnRepeatSection />
</template>
