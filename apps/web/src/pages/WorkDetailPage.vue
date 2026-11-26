<script setup lang="ts">
import { computed } from "vue";
import { ArrowUpRight } from "@lucide/vue";
import ArticleActions from "@/components/ArticleActions.vue";
import SiteButton from "@/components/SiteButton.vue";
import InlineTagList from "@/components/InlineTagList.vue";
import { addTableOfContents } from "@/lib/table-of-contents";
import type { WorkItem } from "@/types/work";

const props = defineProps<{ work: WorkItem | null; hasError: boolean }>();
const tableOfContents = computed(() => addTableOfContents(props.work?.html ?? ""));

const formatDate = (date?: string) => {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(
        parsed,
      );
};
</script>

<template>
  <main class="work-detail-page container">
    <section v-if="hasError || !work" class="work-detail-message">
      <h1>{{ hasError ? "制作物を読み込めませんでした" : "制作物が見つかりません" }}</h1>
    </section>
    <template v-else>
      <header class="work-detail-header">
        <p class="section-kicker">Works</p>
        <h1>{{ work.title }}</h1>
        <time v-if="work.date" :datetime="work.date">{{ formatDate(work.date) }}</time>
        <p v-if="work.description" class="work-detail-description">{{ work.description }}</p>
        <InlineTagList
          v-if="work.technologies?.length"
          :items="work.technologies"
          variant="outlined"
        />
        <SiteButton v-if="work.externalUrl" :href="work.externalUrl" external>
          Visit project <ArrowUpRight aria-hidden="true" class="icon" />
        </SiteButton>
      </header>
      <div v-if="work.html" class="work-detail-body-layout">
        <details v-if="tableOfContents.items.length" class="work-detail-toc" open>
          <summary>目次</summary>
          <nav aria-label="目次">
            <ol>
              <li
                v-for="item in tableOfContents.items"
                :key="item.id"
                :class="{ 'is-nested': item.level === 3 }"
              >
                <a :href="`#${encodeURIComponent(item.id)}`">{{ item.label }}</a>
              </li>
            </ol>
          </nav>
        </details>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <article class="article-content work-detail-content" v-html="tableOfContents.html" />
      </div>
      <ArticleActions :title="work.title" :url="work.url" />
    </template>
  </main>
</template>

<style scoped>
.work-detail-page {
  width: min(calc(100% - 2rem), 72rem);
  padding-block: clamp(3rem, 8vw, 6rem);
}

.work-detail-body-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 14rem;
  align-items: start;
  gap: clamp(2rem, 5vw, 4rem);
}

.work-detail-toc {
  position: sticky;
  top: 1rem;
  grid-column: 2;
  grid-row: 1;
  max-height: calc(100vh - 2rem);
  overflow: auto;
  padding: 0.85rem 1rem;
  border: 1px solid color-mix(in srgb, var(--soft-border) 55%, var(--background));
  background: var(--surface);
  font-size: 0.78rem;
}

.work-detail-toc summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
  cursor: pointer;
  list-style: none;
}

.work-detail-toc summary::-webkit-details-marker {
  display: none;
}

.work-detail-toc summary::after {
  width: 0.45rem;
  height: 0.45rem;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  content: "";
  transform: rotate(45deg) translateY(-0.1rem);
  transition: transform 150ms ease;
}

.work-detail-toc[open] summary::after {
  transform: rotate(225deg) translate(-0.05rem, -0.05rem);
}

.work-detail-toc ol {
  display: grid;
  gap: 0.1rem;
  margin: 0.6rem 0 0;
  padding: 0;
  list-style: none;
}

.work-detail-toc li.is-nested {
  padding-left: 0.7rem;
}

.work-detail-toc a {
  display: block;
  padding-block: 0.2rem;
  color: var(--muted-foreground);
  line-height: 1.5;
  text-wrap: pretty;
  text-decoration: none;
}

.work-detail-toc a:hover {
  color: var(--foreground);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.work-detail-content {
  grid-column: 1;
  grid-row: 1;
}

.work-detail-header {
  display: grid;
  justify-items: start;
  gap: 1.25rem;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid color-mix(in srgb, var(--soft-border) 40%, var(--background));
}

.section-kicker {
  display: inline-block;
  margin: 0;
  padding: 0.16rem 0.45rem;
  color: var(--background);
  background: var(--foreground);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1.5;
  text-transform: uppercase;
}

.work-detail-header time {
  color: var(--muted-foreground);
  font-family: var(--font-mono);
  font-size: 0.85rem;
}

.work-detail-header h1 {
  margin: 0;
  font-size: clamp(2.25rem, 6vw, 4rem);
  letter-spacing: -0.05em;
  line-height: 1.1;
}

.work-detail-description {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 1.1rem;
  line-height: 1.7;
  word-break: auto-phrase;
}

.work-detail-content {
  font-size: 1.05rem;
  line-height: 1.75;
  overflow-wrap: anywhere;
}

.work-detail-content :deep(h2),
.work-detail-content :deep(h3) {
  margin: 2em 0 0.7em;
  line-height: 1.3;
}

.work-detail-content :deep(p),
.work-detail-content :deep(ul),
.work-detail-content :deep(ol),
.work-detail-content :deep(figure) {
  margin: 1.2em 0;
}

.work-detail-content :deep(img) {
  max-width: 100%;
}

.work-detail-message {
  display: grid;
  min-height: 45vh;
  align-content: center;
  justify-items: start;
  gap: 1.25rem;
}

.work-detail-message h1 {
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
}

@media (max-width: 72rem) {
  .work-detail-page {
    width: min(calc(100% - 2rem), 48rem);
  }

  .work-detail-body-layout {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  .work-detail-content,
  .work-detail-toc {
    width: 100%;
  }

  .work-detail-toc {
    position: static;
    order: -1;
    max-height: none;
  }
}
</style>
