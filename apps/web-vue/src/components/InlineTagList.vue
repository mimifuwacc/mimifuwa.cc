<script setup lang="ts">
defineProps<{ items: string[] }>();
</script>

<template>
  <ul class="tag-list">
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
</style>
