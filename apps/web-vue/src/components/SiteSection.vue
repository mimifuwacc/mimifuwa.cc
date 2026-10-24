<script setup lang="ts">
defineProps<{
  id?: string;
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <section :id="id" class="section container">
    <header class="section-heading">
      <div>
        <p class="section-kicker">mimifuwa.cc</p>
        <h1>{{ title }}</h1>
      </div>
      <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
      <slot name="action" />
    </header>
    <slot />
  </section>
</template>
