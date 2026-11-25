<script setup lang="ts">
import { sanitizeUrl } from "@braintree/sanitize-url";
import { ArrowUpRight } from "@lucide/vue";
import type { SiteLink } from "@/types/site-content";

defineProps<{ link: SiteLink }>();

const hostname = (url: string) => new URL(url).hostname.replace(/^www\./, "");
</script>

<template>
  <a
    class="link-card square-card"
    :href="sanitizeUrl(link.url)"
    rel="noopener noreferrer"
    target="_blank"
  >
    <div class="link-card-body">
      <div class="link-card-meta">
        <span>{{ hostname(link.url) }}</span>
        <ArrowUpRight aria-hidden="true" class="icon" />
      </div>
      <h3 class="link-card-title">{{ link.name }}</h3>
      <p class="link-card-description">{{ link.description }}</p>
    </div>
  </a>
</template>

<style scoped>
.link-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  padding-top: 1.25rem;
  color: inherit;
  text-align: left;
  border-top: 1px solid color-mix(in srgb, var(--soft-border) 40%, var(--background));
  border-bottom: 0;
  text-decoration: none;
}

.link-card-body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.6rem;
}

.link-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  color: var(--muted-foreground);
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.link-card-meta > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-card-meta .icon {
  flex: 0 0 auto;
  transition: color var(--ui-transition-duration) ease;
}

.link-card-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.4;
}

.link-card-description {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.875rem;
  line-height: 1.55;
}

.link-card:hover .link-card-title {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.link-card:hover .link-card-description {
  color: inherit;
}

.link-card:hover .link-card-meta .icon,
.link-card:focus-visible .link-card-meta .icon {
  color: var(--foreground);
}

.link-card:focus-visible {
  outline: 2px solid var(--foreground);
  outline-offset: 0.3rem;
}

@media (prefers-reduced-motion: reduce) {
  .link-card-meta .icon {
    transition: none;
  }
}
</style>
