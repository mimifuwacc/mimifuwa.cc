<template>
  <SiteLayout>
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <div :key="route.path" class="page-transition">
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>
  </SiteLayout>
</template>

<script setup lang="ts">
import SiteLayout from "./components/SiteLayout.vue";
</script>
