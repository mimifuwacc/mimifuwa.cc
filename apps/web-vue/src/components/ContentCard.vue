<script setup lang="ts">
import { Award, Clock, Smile, Wrench } from "@lucide/vue";

const icons = { award: Award, clock: Clock, smile: Smile, wrench: Wrench };

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
