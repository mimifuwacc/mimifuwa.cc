<script setup lang="ts">
import type { BlogSummary } from "@/types/blog";
import type { WorkItem } from "@/types/work";
import AboutSection from "@/pages/home/AboutSection.vue";
import BlogPreviewSection from "@/pages/home/BlogPreviewSection.vue";
import HomeHero from "@/pages/home/HomeHero.vue";
import OnRepeatSection from "@/pages/home/OnRepeatSection.vue";
import WorksSection from "@/pages/home/WorksSection.vue";

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
