<template>
  <div id="top" class="site-shell">
    <SiteHeader />
    <main><slot /></main>
    <SiteFooter />
    <SiteRail />
  </div>
</template>

<script setup lang="ts">
import SiteFooter from "./SiteFooter.vue";
import SiteHeader from "./SiteHeader.vue";
import SiteRail from "./SiteRail.vue";
</script>
