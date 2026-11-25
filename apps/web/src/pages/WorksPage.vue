<script setup lang="ts">
import { computed, ref } from "vue";
import SiteSection from "@/components/SiteSection.vue";
import WorkCard from "@/components/WorkCard.vue";
import type { WorkItem } from "@/types/work";

const props = defineProps<{ works: WorkItem[]; hasError: boolean }>();
const query = ref("");
const selectedTechnology = ref("");
const technologies = computed(() =>
  [...new Set(props.works.flatMap((work) => work.technologies ?? []))].sort(),
);
const filteredWorks = computed(() => {
  const search = query.value.trim().toLocaleLowerCase();
  return props.works.filter((work) => {
    const matchesText =
      !search || `${work.title} ${work.description ?? ""}`.toLocaleLowerCase().includes(search);
    const matchesTechnology =
      !selectedTechnology.value || work.technologies?.includes(selectedTechnology.value);
    return matchesText && matchesTechnology;
  });
});
</script>

<template>
  <SiteSection id="works-page" heading-level="h1" title="Works">
    <p v-if="hasError" class="works-message" role="alert">制作物を読み込めませんでした</p>
    <p v-else-if="works.length === 0" class="works-message">制作物はまだありません</p>
    <template v-else>
      <div class="list-filters">
        <label class="search-field">
          <span class="visually-hidden">制作物を検索</span>
          <input v-model="query" class="list-search-input" placeholder="検索" type="search" />
        </label>
        <div
          v-if="technologies.length"
          aria-label="技術タグで絞り込み"
          class="tag-filter"
          role="group"
        >
          <div class="tag-options">
            <button
              v-for="technology in technologies"
              :key="technology"
              class="filter-tag"
              type="button"
              :class="{ 'is-selected': selectedTechnology === technology }"
              :aria-pressed="selectedTechnology === technology"
              @click="selectedTechnology = selectedTechnology === technology ? '' : technology"
            >
              {{ technology }}
            </button>
            <button
              v-if="selectedTechnology"
              class="filter-clear"
              type="button"
              @click="selectedTechnology = ''"
            >
              クリア
            </button>
          </div>
        </div>
      </div>
      <div v-if="filteredWorks.length" class="works-grid">
        <WorkCard v-for="work in filteredWorks" :key="work.title" :work="work" />
      </div>
      <p v-else class="works-message">一致する制作物がありません</p>
    </template>
  </SiteSection>
</template>

<style scoped>
.works-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2.25rem 1.5rem;
}

.list-filters {
  display: grid;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.search-field {
  display: block;
  width: min(100%, 26rem);
}

.search-field input {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.55rem 0.75rem;
  color: var(--foreground);
  background: var(--background);
  border: 1px solid color-mix(in srgb, var(--soft-border) 40%, var(--background));
  font: inherit;
}

.search-field input::placeholder {
  color: var(--muted-foreground);
}

.filter-tag:focus-visible {
  outline: 2px solid var(--foreground);
  outline-offset: 2px;
}

.tag-filter,
.tag-options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.filter-tag {
  min-height: 2rem;
  padding: 0.18rem 0.55rem;
  color: var(--foreground);
  background: var(--background);
  border: 1px solid var(--foreground);
  cursor: pointer;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  transition:
    color var(--ui-transition-duration) ease,
    background-color var(--ui-transition-duration) ease,
    border-color var(--ui-transition-duration) ease;
}

.filter-clear {
  min-height: 2rem;
  padding: 0.25rem 0.4rem;
  color: var(--muted-foreground);
  background: transparent;
  border: 0;
  cursor: pointer;
  font: inherit;
  font-size: 0.8rem;
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.filter-clear:disabled {
  cursor: default;
  opacity: 0.45;
  text-decoration: none;
}

.filter-clear:not(:disabled):hover {
  color: var(--foreground);
}

.filter-clear:focus-visible {
  outline: 2px solid var(--foreground);
  outline-offset: 2px;
}

.filter-tag:hover,
.filter-tag.is-selected,
.filter-tag[aria-pressed="true"] {
  color: var(--background);
  background: var(--foreground);
  border-color: var(--foreground);
}

.works-message {
  margin: 0;
}

@media (min-width: 40.001rem) and (max-width: 90rem) {
  .works-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 40rem) {
  .search-field {
    width: 100%;
  }

  .works-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }
}
</style>
