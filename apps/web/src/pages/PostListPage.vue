<script setup lang="ts">
import { computed, ref } from "vue";
import PostCard from "@/components/PostCard.vue";
import SiteSection from "@/components/SiteSection.vue";
import type { PostSummary } from "@/types/post";

const props = defineProps<{ posts: PostSummary[]; hasError: boolean }>();
const query = ref("");
const selectedTag = ref("");
const tags = computed(() => [...new Set(props.posts.flatMap((post) => post.tags ?? []))].sort());
const filteredPosts = computed(() => {
  const search = query.value.trim().toLocaleLowerCase();
  return props.posts.filter((post) => {
    const matchesText =
      !search || `${post.title} ${post.description ?? ""}`.toLocaleLowerCase().includes(search);
    const matchesTag = !selectedTag.value || post.tags?.includes(selectedTag.value);
    return matchesText && matchesTag;
  });
});
</script>

<template>
  <SiteSection id="posts-page" heading-level="h1" title="Posts">
    <p v-if="hasError" class="empty-state" role="alert">記事を読み込めませんでした</p>
    <p v-else-if="posts.length === 0" class="empty-state">
      記事が公開され次第ここに表示されます
    </p>
    <template v-else>
      <div class="list-filters">
        <label class="search-field">
          <span class="visually-hidden">記事を検索</span>
          <input v-model="query" class="list-search-input" placeholder="検索" type="search" />
        </label>
        <div v-if="tags.length" aria-label="タグで絞り込み" class="tag-filter" role="group">
          <div class="tag-options">
            <button
              v-for="tag in tags"
              :key="tag"
              type="button"
              class="filter-tag"
              :class="{ 'is-selected': selectedTag === tag }"
              :aria-pressed="selectedTag === tag"
              @click="selectedTag = selectedTag === tag ? '' : tag"
            >
              {{ tag }}
            </button>
            <button v-if="selectedTag" type="button" class="filter-clear" @click="selectedTag = ''">
              クリア
            </button>
          </div>
        </div>
      </div>
      <div v-if="filteredPosts.length" class="post-grid">
        <PostCard v-for="post in filteredPosts" :key="post.url" :post="post" />
      </div>
      <p v-else class="empty-state">一致する記事がありません</p>
    </template>
  </SiteSection>
</template>

<style scoped>
.post-grid {
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

.filter-tag:hover,
.filter-tag.is-selected,
.filter-tag[aria-pressed="true"] {
  color: var(--background);
  background: var(--foreground);
  border-color: var(--foreground);
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

.empty-state {
  margin: 0;
}

@media (min-width: 40.001rem) and (max-width: 90rem) {
  .post-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 40rem) {
  .search-field {
    width: 100%;
  }

  .post-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }
}
</style>
