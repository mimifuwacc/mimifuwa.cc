<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import InlineTagList from "../components/InlineTagList.vue";
import { getBlogArticle, type BlogArticle } from "../lib/blog-api";

const route = useRoute();
const article = ref<BlogArticle | null>(null);
const loading = ref(true);
const hasError = ref(false);

const formatDate = (date?: string) => {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(
        parsed,
      );
};

watch(
  article,
  (current) => {
    if (current) document.title = `${current.title} | mimifuwa.cc`;
  },
  { immediate: true },
);

watch(
  () => route.path,
  async (path) => {
    loading.value = true;
    hasError.value = false;
    article.value = null;
    try {
      article.value = await getBlogArticle(path);
    } catch {
      hasError.value = true;
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="article-page container">
    <p v-if="loading" class="article-message" aria-live="polite">読み込み中...</p>
    <section v-else-if="hasError || !article" class="article-message">
      <h1>{{ hasError ? "記事を読み込めませんでした" : "記事が見つかりません" }}</h1>
      <a class="square-button" href="/blogs/">Blogs に戻る</a>
    </section>
    <template v-else>
      <header class="article-header">
        <p class="section-kicker">02 / Writing</p>
        <h1>{{ article.title }}</h1>
        <time v-if="article.date" :datetime="article.date">{{ formatDate(article.date) }}</time>
        <InlineTagList v-if="article.tags?.length" :items="article.tags" variant="outlined" />
      </header>
      <article class="article-content" v-html="article.html" />
    </template>
  </div>
</template>

<style scoped>
.article-page {
  width: min(calc(100% - 2rem), 54rem);
  padding-block: clamp(3rem, 8vw, 6rem);
}

.article-header {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--soft-border);
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
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.85rem;
}

.section-kicker {
  display: inline-block;
  margin: 0 0 1rem;
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
  margin: 2.25em 0 0.75em;
  line-height: 1.3;
}

.article-content :deep(h1) {
  font-size: 2rem;
}

.article-content :deep(h2) {
  padding-bottom: 0.35em;
  border-bottom: 1px solid var(--soft-border);
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

.article-content :deep(pre) {
  overflow: auto;
  padding: 1rem;
  color: #fff;
  background: #000;
  line-height: 1.6;
}

.article-content :deep(pre code),
.article-content :deep(pre span) {
  color: #fff;
  background: transparent;
}

.article-content :deep(:not(pre) > code) {
  padding: 0.08em 0.3em;
  background: var(--muted);
  font-size: 0.9em;
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
