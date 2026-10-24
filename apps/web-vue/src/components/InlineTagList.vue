<script setup lang="ts">
defineProps<{ items: string[]; variant?: "inline" | "outlined" }>();
</script>

<template>
  <ul class="tag-list" :class="{ 'tag-list--outlined': variant === 'outlined' }">
    <li v-for="item in items" :key="item">{{ item }}</li>
  </ul>
</template>

<style scoped>
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  color: var(--muted-foreground);
  font-size: 0.8rem;
  line-height: 1.8;
}

li + li::before {
  padding-inline: 0.5rem;
  color: var(--soft-border);
  content: "·";
}

.tag-list--outlined {
  gap: 0.5rem;
}

.tag-list--outlined li {
  padding: 0.18rem 0.55rem;
  color: var(--foreground);
  background: var(--background);
  border: 1px solid var(--foreground);
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.5;
}

.tag-list--outlined li + li::before {
  content: none;
}
</style>
