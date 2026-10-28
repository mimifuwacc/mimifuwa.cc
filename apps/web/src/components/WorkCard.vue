<script setup lang="ts">
import { ArrowRight } from "@lucide/vue";
import { Link } from "@void/vue";
import { sanitizeUrl } from "@braintree/sanitize-url";
import type { WorkItem } from "../types/work";
import InlineTagList from "./InlineTagList.vue";

defineProps<{ work: WorkItem }>();
</script>

<template>
  <Link class="work-card" :href="sanitizeUrl(work.url)">
    <div class="work-card-heading">
      <h3>{{ work.title }}</h3>
      <ArrowRight aria-hidden="true" class="icon" />
    </div>
    <p>{{ work.description }}</p>
    <InlineTagList
      v-if="work.technologies?.length"
      class="work-card-tags"
      :items="work.technologies"
      variant="outlined"
    />
  </Link>
</template>

<style scoped>
.work-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding-top: 1.25rem;
  color: inherit;
  border-top: 1px solid color-mix(in srgb, var(--soft-border) 40%, var(--background));
  text-decoration: none;
}

.work-card-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.4;
}

.work-card-heading .icon {
  flex: 0 0 auto;
  transition: color var(--ui-transition-duration) ease;
}

p {
  margin: 0.6rem 0 0;
  color: var(--muted-foreground);
  font-size: 0.875rem;
  line-height: 1.6;
}

.work-card-tags {
  margin-top: 0.75rem;
}

.work-card:hover h3 {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.work-card:hover p {
  color: inherit;
}

.work-card:hover .work-card-heading .icon,
.work-card:focus-visible .work-card-heading .icon {
  color: var(--foreground);
}

.work-card:focus-visible {
  outline: 2px solid var(--foreground);
  outline-offset: 0.3rem;
}

@media (prefers-reduced-motion: reduce) {
  .work-card-heading .icon {
    transition: none;
  }
}
</style>
