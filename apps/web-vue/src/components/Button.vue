<script setup lang="ts">
withDefaults(
  defineProps<{
    href?: string;
    external?: boolean;
    variant?: "primary" | "outline";
    type?: "button" | "submit" | "reset";
  }>(),
  {
    variant: "primary",
    type: "button",
  },
);
</script>

<template>
  <a
    v-if="href"
    class="button"
    :class="`button--${variant}`"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
  >
    <slot />
  </a>
  <button v-else class="button" :class="`button--${variant}`" :type="type">
    <slot />
  </button>
</template>

<style scoped>
.button {
  display: inline-flex;
  min-height: 2.75rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--foreground);
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;
  transition:
    color 150ms ease,
    background-color 150ms ease;
}

.button--primary {
  color: var(--background);
  background: var(--foreground);
}

.button--primary:hover {
  color: var(--foreground);
  background: var(--background);
}

.button--outline {
  color: var(--foreground);
  background: var(--background);
}

.button--outline:hover {
  color: var(--background);
  background: var(--foreground);
}
</style>
