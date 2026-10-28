<script setup lang="ts">
import type { BlogSummary } from "@/types/blog";
import type { WorkItem } from "@/types/work";
import AboutSection from "@/pages/home/AboutSection.vue";
import BlogPreviewSection from "@/pages/home/BlogPreviewSection.vue";
import HomeHero from "@/pages/home/HomeHero.vue";
import OnRepeatSection from "@/pages/home/OnRepeatSection.vue";
import WorksSection from "@/pages/home/WorksSection.vue";
import type { SiteContent } from "@/types/site-content";

const avatar = "/mimifuwacc.png";
defineProps<{
  about: SiteContent["about"];
  blogs: BlogSummary[];
  tracks: SiteContent["tracks"];
  works: WorkItem[];
}>();
</script>

<template>
  <HomeHero :avatar="avatar" />
  <AboutSection :about="about" :avatar="avatar" />
  <BlogPreviewSection :posts="blogs" />
  <WorksSection :works="works" />
  <OnRepeatSection :tracks="tracks" />
</template>
