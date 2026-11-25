<script setup lang="ts">
import { setLucideProps } from "@lucide/vue";
import SiteFooter from "@/components/SiteFooter.vue";
import SiteHeader from "@/components/SiteHeader.vue";
import SiteRail from "@/components/SiteRail.vue";

setLucideProps({});
</script>

<template>
  <div id="top" class="site-shell">
    <SiteHeader />
    <main><slot /></main>
    <SiteFooter />
    <SiteRail />
  </div>
</template>
