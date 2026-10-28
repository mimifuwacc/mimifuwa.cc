<script setup lang="ts">
import { ArrowLeft, ArrowUpRight } from "@lucide/vue";
import SiteButton from "../components/SiteButton.vue";
import InlineTagList from "../components/InlineTagList.vue";
import type { WorkItem } from "../types/work";

defineProps<{ work: WorkItem | null; hasError: boolean }>();
</script>

<template>
  <main class="work-detail-page container">
    <section v-if="hasError || !work" class="work-detail-message">
      <h1>{{ hasError ? "制作物を読み込めませんでした" : "制作物が見つかりません" }}</h1>
      <SiteButton href="/works/"><ArrowLeft aria-hidden="true" class="icon" /> Works に戻る</SiteButton>
    </section>
    <template v-else>
      <header class="work-detail-header">
        <p class="work-detail-kicker">Selected work</p>
        <h1>{{ work.title }}</h1>
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
      <!-- eslint-disable-next-line vue/no-v-html -->
      <article v-if="work.html" class="work-detail-content" v-html="work.html" />
      <nav aria-label="Works navigation" class="work-detail-nav">
        <SiteButton href="/works/"><ArrowLeft aria-hidden="true" class="icon" /> All works</SiteButton>
      </nav>
    </template>
  </main>
</template>

<style scoped>
.work-detail-page {
  width: min(calc(100% - 2rem), 54rem);
  padding-block: clamp(3rem, 8vw, 6rem);
}

.work-detail-header {
  display: grid;
  justify-items: start;
  gap: 1.25rem;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--soft-border);
}

.work-detail-kicker {
  margin: 0;
  color: var(--muted-foreground);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.work-detail-header h1 {
  margin: 0;
  font-size: clamp(2.25rem, 6vw, 4rem);
  letter-spacing: -0.05em;
  line-height: 1.1;
}

.work-detail-description {
  max-width: 44rem;
  margin: 0;
  color: var(--muted-foreground);
  font-size: 1.1rem;
  line-height: 1.7;
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

.work-detail-nav {
  display: flex;
  justify-content: flex-start;
  margin-top: 3rem;
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
</style>
