<script setup lang="ts">
import { computed } from "vue";
import { ArrowUpRight } from "@lucide/vue";
import type { WorkItem } from "../../../../contents/works";

const props = defineProps<{ work: WorkItem }>();

const image = computed(() => {
  if (props.work.image?.startsWith("/")) {
    return `https://raw.githubusercontent.com/mimifuwacc/mimifuwa.cc/dev/apps/web/public${props.work.image}`;
  }
  if (props.work.image) return props.work.image;
  const match = props.work.url.match(/github\.com\/([^/]+)\/([^/?]+)/);
  return match ? `https://opengraph.githubassets.com/1/${match[1]}/${match[2]}` : undefined;
});
</script>

<template>
  <a
    :class="['work-card', { 'work-card--with-image': image }]"
    :href="work.url"
    target="_blank"
    rel="noopener"
  >
    <img v-if="image" :src="image" :alt="work.title" loading="lazy" />
    <div class="work-card-body">
      <h3>{{ work.title }} <ArrowUpRight class="icon" aria-hidden="true" /></h3>
      <p>{{ work.description }}</p>
    </div>
  </a>
</template>

<style scoped>
.work-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: 0 2rem;
  padding-bottom: 1.5rem;
  color: inherit;
  text-decoration: none;
}

.work-card--with-image {
  grid-template-columns: minmax(0, 16rem) minmax(0, 1fr);
}

.work-card > img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.work-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;
}

h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

p {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.9rem;
  line-height: 1.7;
}

.work-card:hover h3 {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.work-card:hover p {
  color: inherit;
}

@media (max-width: 48rem) {
  .work-card--with-image {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
  }
}
</style>
