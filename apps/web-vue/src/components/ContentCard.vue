<script setup lang="ts">
defineProps<{
  title?: string;
  label?: string;
}>();
</script>

<template>
  <article class="content-card square-card">
    <header v-if="title || label" class="content-card-heading">
      <p v-if="label" class="card-label">{{ label }}</p>
      <h3 v-if="title">{{ title }}</h3>
    </header>
    <slot />
  </article>
</template>
