<script setup lang="ts">
defineProps<{
  id?: string;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  headingLevel?: "h1" | "h2";
}>();
</script>

<template>
  <section :id="id" class="section container">
    <header class="section-heading">
      <div>
        <p v-if="eyebrow" class="section-kicker">{{ eyebrow }}</p>
        <component :is="headingLevel ?? 'h2'">{{ title }}</component>
      </div>
      <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
      <slot name="action" />
    </header>
    <slot />
  </section>
</template>

<style scoped>
.section {
  padding-block: clamp(4rem, 8vw, 7rem);
  border-bottom: 1px solid color-mix(in srgb, var(--soft-border) 35%, var(--background));
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.section-heading h1,
.section-heading h2 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.section-subtitle {
  max-width: 28rem;
  margin: 0 0 0.2rem;
  color: var(--muted-foreground);
  line-height: 1.6;
}

.section-kicker {
  display: inline-block;
  margin: 0 0 0.75rem;
  padding: 0.16rem 0.45rem;
  color: var(--background);
  background: var(--foreground);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1.5;
  text-transform: uppercase;
}

@media (max-width: 48rem) {
  .section {
    padding-block: 3rem;
  }

  .section-heading {
    align-items: start;
    flex-direction: column;
    gap: 0.75rem;
  }

  .section-subtitle {
    margin-top: 0;
  }
}
</style>
