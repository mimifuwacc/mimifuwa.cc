<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import ArticleActions from "@/components/ArticleActions.vue";
import InlineTagList from "@/components/InlineTagList.vue";
import { addTableOfContents } from "@/lib/table-of-contents";
import type { PostArticle } from "@/types/post";

const props = defineProps<{ article: PostArticle | null; hasError: boolean }>();
const tableOfContents = computed(() => addTableOfContents(props.article?.html ?? ""));
const tocDetails = ref<HTMLDetailsElement | null>(null);

onMounted(() => {
  if (window.matchMedia("(max-width: 48rem)").matches && tocDetails.value) {
    tocDetails.value.open = false;
  }
});

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
  <div class="article-page container">
    <section v-if="hasError || !article" class="article-message">
      <h1>{{ hasError ? "記事を読み込めませんでした" : "記事が見つかりません" }}</h1>
      <a class="square-button" href="/posts/">Posts に戻る</a>
    </section>
    <template v-else>
      <header class="article-header">
        <p class="section-kicker">Posts</p>
        <h1>{{ article.title }}</h1>
        <time v-if="article.date" :datetime="article.date">{{ formatDate(article.date) }}</time>
        <InlineTagList v-if="article.tags?.length" :items="article.tags" variant="outlined" />
      </header>
      <div class="article-body-layout">
        <details v-if="tableOfContents.items.length" ref="tocDetails" class="article-toc" open>
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
        <article class="article-content" v-html="tableOfContents.html" />
      </div>
      <ArticleActions :title="article.title" :url="article.url" />
    </template>
  </div>
</template>

<style scoped>
.article-page {
  width: min(calc(100% - 2rem), 72rem);
  padding-block: clamp(3rem, 8vw, 6rem);
}

.article-body-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 14rem;
  align-items: start;
  gap: clamp(2rem, 5vw, 4rem);
}

.article-toc {
  grid-column: 2;
  grid-row: 1;
  position: sticky;
  top: 1rem;
  max-height: calc(100vh - 2rem);
  overflow: auto;
  padding: 0.85rem 1rem;
  border: 1px solid color-mix(in srgb, var(--soft-border) 55%, var(--background));
  background: var(--surface);
  font-size: 0.78rem;
}

.article-toc summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
  cursor: pointer;
  list-style: none;
}

.article-toc summary::-webkit-details-marker {
  display: none;
}

.article-toc summary::after {
  width: 0.45rem;
  height: 0.45rem;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  content: "";
  transform: rotate(45deg) translateY(-0.1rem);
  transition: transform 150ms ease;
}

.article-toc[open] summary::after {
  transform: rotate(225deg) translate(-0.05rem, -0.05rem);
}

.article-toc ol {
  display: grid;
  gap: 0.1rem;
  margin: 0.6rem 0 0;
  padding: 0;
  list-style: none;
}

.article-toc li.is-nested {
  padding-left: 0.7rem;
}

.article-toc a {
  display: block;
  padding-block: 0.2rem;
  color: var(--muted-foreground);
  line-height: 1.5;
  text-wrap: pretty;
  text-decoration: none;
}

.article-toc a:hover {
  color: var(--foreground);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.article-content {
  grid-column: 1;
  grid-row: 1;
}

.article-header {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid color-mix(in srgb, var(--soft-border) 40%, var(--background));
}

.article-header h1 {
  margin: 0 0 1rem;
  font-size: clamp(2rem, 5vw, 3.25rem);
  letter-spacing: -0.045em;
  line-height: 1.2;
}

.article-header time {
  display: block;
  margin-bottom: 1rem;
  color: var(--muted-foreground);
  font-family: var(--font-mono);
  font-size: 0.85rem;
}

@media (max-width: 72rem) {
  .article-page {
    width: min(calc(100% - 2rem), 48rem);
  }

  .article-body-layout {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  .article-content,
  .article-toc {
    width: 100%;
  }

  .article-toc {
    order: -1;
    position: static;
    max-height: none;
  }
}

.section-kicker {
  display: inline-block;
  margin: 0 0 1rem;
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

.article-content {
  overflow-wrap: anywhere;
  font-size: 1.05rem;
}

.article-content :deep(> :first-child) {
  margin-top: 0;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4) {
  margin: 1.75em 0 0.75em;
  line-height: 1.3;
}

.article-content :deep(h1) {
  font-size: 2rem;
}

.article-content :deep(h2) {
  padding-bottom: 0.35em;
  border-bottom: 1px solid color-mix(in srgb, var(--soft-border) 40%, var(--background));
  font-size: 1.55em;
}

.article-content :deep(h3) {
  font-size: 1.25em;
}

.article-content :deep(p),
.article-content :deep(ul),
.article-content :deep(ol),
.article-content :deep(blockquote),
.article-content :deep(table),
.article-content :deep(figure) {
  margin: 1.35em 0;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  padding-left: 1.5em;
}

.article-content :deep(blockquote) {
  padding: 0.25rem 1rem;
  border-left: 3px solid var(--foreground);
  background: var(--muted);
}

.article-content :deep(img),
.article-content :deep(video),
.article-content :deep(iframe) {
  max-width: 100%;
}

.article-content :deep(:not(pre) > code) {
  padding: 0.08em 0.28em;
  background: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.82em;
  font-variant-ligatures: none;
  font-weight: 500;
  vertical-align: 0.04em;
}

.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  border-top: 1px solid var(--soft-border);
}

.article-content :deep(th),
.article-content :deep(td) {
  padding: 0.55rem 0.7rem;
  border-bottom: 1px solid var(--soft-border);
  text-align: left;
}

.article-content :deep(th) {
  color: var(--background);
  background: var(--foreground);
}

.article-message {
  display: grid;
  min-height: 45vh;
  align-content: center;
  justify-items: start;
  gap: 1.25rem;
}

.article-message h1 {
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
}
</style>
