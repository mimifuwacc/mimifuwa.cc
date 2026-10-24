<template>
  <div class="site-shell">
    <SiteHeader />
    <main><RouterView /></main>
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import SiteFooter from "./components/SiteFooter.vue";
import SiteHeader from "./components/SiteHeader.vue";
</script>
