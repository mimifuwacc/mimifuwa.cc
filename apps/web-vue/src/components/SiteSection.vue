<script setup lang="ts">
defineProps<{
  id?: string;
  title: string;
  subtitle?: string;
  headingLevel?: "h1" | "h2";
}>();
</script>

<template>
  <section :id="id" class="section container">
    <header class="section-heading">
      <div>
        <p class="section-kicker">mimifuwa.cc</p>
        <component :is="headingLevel ?? 'h2'">{{ title }}</component>
      </div>
      <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
      <slot name="action" />
    </header>
    <slot />
  </section>
</template>
