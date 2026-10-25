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
      <div class="content-card-title">
        <span class="content-card-mark" aria-hidden="true">〈</span>
        <h3 v-if="title">{{ title }}</h3>
        <span class="content-card-mark" aria-hidden="true">〉</span>
      </div>
    </header>
    <slot />
  </article>
</template>

<style scoped>
.content-card {
  min-width: 0;
  padding: 0;
}

.content-card-heading {
  margin-bottom: 1rem;
}

.content-card-title {
  display: flex;
  align-items: baseline;
  gap: 0.18rem;
}

.content-card-mark {
  color: var(--muted-foreground);
  font-size: 1.05em;
  font-weight: 400;
}

.content-card-mark:first-child {
  margin-left: -0.5em;
}

.content-card-title h3 {
  margin: 0;
  font-size: 1.1rem;
  letter-spacing: -0.02em;
}

.card-label {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
</style>
