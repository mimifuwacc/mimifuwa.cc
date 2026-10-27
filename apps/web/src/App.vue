<script setup lang="ts">
import SiteLayout from "./components/SiteLayout.vue";
</script>

<template>
  <SiteLayout>
    <RouterView v-slot="{ Component, route }">
      <Transition mode="out-in" name="page">
        <div :key="route.path" class="page-transition">
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>
  </SiteLayout>
</template>
