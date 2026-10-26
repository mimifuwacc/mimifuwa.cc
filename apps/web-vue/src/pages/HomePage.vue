<script setup lang="ts">
import AboutSection from "./home/AboutSection.vue";
import BlogPreviewSection from "./home/BlogPreviewSection.vue";
import HomeHero from "./home/HomeHero.vue";
import OnRepeatSection from "./home/OnRepeatSection.vue";
import WorksSection from "./home/WorksSection.vue";

const avatar = "/mimifuwacc.png";
</script>

<template>
  <HomeHero :avatar="avatar" />
  <AboutSection :avatar="avatar" />
  <BlogPreviewSection />
  <WorksSection />
  <OnRepeatSection />
</template>
