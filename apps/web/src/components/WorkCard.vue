<script setup lang="ts">
import { ArrowRight, Pin } from "@lucide/vue";
import { Link } from "@void/vue";
import { sanitizeUrl } from "@braintree/sanitize-url";
import type { WorkItem } from "@/types/work";
import InlineTagList from "@/components/InlineTagList.vue";

defineProps<{ work: WorkItem }>();

const formatDate = (date?: string) => {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(parsed);
};
</script>

<template>
  <Link class="work-card" :href="sanitizeUrl(work.url)">
    <div class="work-card-body">
      <div class="work-card-meta">
        <span class="work-card-meta-leading">
          <Pin v-if="work.pinned" aria-label="Pinned" class="pin-icon" />
          <time v-if="work.date" :datetime="work.date">{{ formatDate(work.date) }}</time>
        </span>
        <ArrowRight aria-hidden="true" class="icon" />
      </div>
      <h3 class="work-card-title">{{ work.title }}</h3>
      <p v-if="work.description" class="work-card-description">
        {{ work.description }}
      </p>
      <InlineTagList
        v-if="work.technologies?.length"
        class="work-card-tags"
        :items="work.technologies"
        variant="outlined"
      />
    </div>
  </Link>
</template>

<style scoped>
.work-card {
  display: flex;
  flex-direction: column;
  padding-top: 1.25rem;
  color: inherit;
  border-top: 1px solid color-mix(in srgb, var(--soft-border) 40%, var(--background));
  text-decoration: none;
}

.work-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.work-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  color: var(--muted-foreground);
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.work-card-meta-leading {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.work-card-meta .icon {
  flex: 0 0 auto;
  transition: color var(--ui-transition-duration) ease;
}

.pin-icon {
  width: 0.75rem;
  height: 0.75rem;
  transform: rotate(-45deg);
}

.work-card-meta time {
  flex: 0 0 auto;
  color: inherit;
}

.work-card-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.4;
  word-break: auto-phrase;
  text-wrap: pretty;
}

.work-card-description {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.875rem;
  line-height: 1.55;
  word-break: auto-phrase;
  text-wrap: pretty;
}

.work-card:hover .work-card-title {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.work-card:hover .work-card-description {
  color: inherit;
}

.work-card:hover .work-card-meta .icon,
.work-card:focus-visible .work-card-meta .icon {
  color: var(--foreground);
}

.work-card:focus-visible {
  outline: 2px solid var(--foreground);
  outline-offset: 0.3rem;
}

@media (prefers-reduced-motion: reduce) {
  .work-card-meta .icon {
    transition: none;
  }
}
</style>
