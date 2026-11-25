<script setup lang="ts">
import type { PostSummary } from "@/types/post";
import type { WorkItem } from "@/types/work";
import AboutSection from "@/pages/home/AboutSection.vue";
import PostPreviewSection from "@/pages/home/PostPreviewSection.vue";
import HomeHero from "@/pages/home/HomeHero.vue";
import WorksSection from "@/pages/home/WorksSection.vue";
import type { SiteContent } from "@/types/site-content";

const avatar = "/mimifuwacc.png";
defineProps<{
  about: SiteContent["about"];
  posts: PostSummary[];
  works: WorkItem[];
}>();
</script>

<template>
  <HomeHero />
  <AboutSection :about="about" :avatar="avatar" />
  <PostPreviewSection :posts="posts" />
  <WorksSection :works="works" />
</template>
