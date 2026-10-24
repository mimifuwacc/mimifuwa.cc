<script setup lang="ts">
import { Award, Clock, CodeXml, Trophy } from "@lucide/vue";

const icons = { award: Award, clock: Clock, code: CodeXml, trophy: Trophy };

defineProps<{
  title?: string;
  label?: string;
  icon?: keyof typeof icons;
}>();
</script>

<template>
  <article class="content-card square-card">
    <header v-if="title || label" class="content-card-heading">
      <p v-if="label" class="card-label">{{ label }}</p>
      <div class="content-card-title">
        <component :is="icons[icon]" v-if="icon" class="icon" aria-hidden="true" />
        <h3 v-if="title">{{ title }}</h3>
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
  gap: 0.6rem;
}

.content-card-title > .icon {
  width: 1rem;
  height: 1rem;
  color: var(--muted-foreground);
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
