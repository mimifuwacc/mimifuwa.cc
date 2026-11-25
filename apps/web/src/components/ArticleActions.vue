<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps<{ title: string; url: string }>();
const canNativeShare = ref(false);
const copyMessage = ref("");
const canonicalUrl = computed(() => new URL(props.url, "https://mimifuwa.cc").href);
const xShareUrl = computed(() => {
  const url = new URL("https://twitter.com/intent/tweet");
  url.searchParams.set("text", props.title);
  url.searchParams.set("url", canonicalUrl.value);
  return url.href;
});
const blueskyShareUrl = computed(() => {
  const url = new URL("https://bsky.app/intent/compose");
  url.searchParams.set("text", `${props.title}\n${canonicalUrl.value}`);
  return url.href;
});
const hatenaBookmarkUrl = computed(() => {
  const url = new URL("https://b.hatena.ne.jp/add");
  url.searchParams.set("mode", "confirm");
  url.searchParams.set("url", canonicalUrl.value);
  url.searchParams.set("title", props.title);
  return url.href;
});

let copyTimeout: ReturnType<typeof setTimeout> | undefined;

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(canonicalUrl.value);
    copyMessage.value = "コピーしました";
  } catch {
    copyMessage.value = "コピーできませんでした";
  }
  clearTimeout(copyTimeout);
  copyTimeout = setTimeout(() => {
    copyMessage.value = "";
  }, 2400);
};

const shareNative = async () => {
  try {
    await navigator.share({ title: props.title, url: canonicalUrl.value });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return;
    await copyLink();
  }
};

onMounted(() => {
  canNativeShare.value = typeof navigator.share === "function";
});

onBeforeUnmount(() => clearTimeout(copyTimeout));
</script>

<template>
  <section aria-label="記事の共有とリアクション" class="article-actions">
    <div class="share-row">
      <div class="share-links">
        <button
          v-if="canNativeShare"
          aria-label="記事を共有"
          class="share-button native-share"
          type="button"
          @click="shareNative"
        >
          <svg
            aria-hidden="true"
            class="brand-icon"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            viewBox="0 0 24 24"
          ><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle
              cx="18"
              cy="19"
              r="3"
            /><path d="m8.7 10.7 6.6-4.4m-6.6 9 6.6 4.4" /></svg>
        </button>
        <a
          class="share-button platform-share"
          :href="xShareUrl"
          aria-label="X で共有"
          rel="noopener noreferrer"
          target="_blank"
        >
          <svg aria-hidden="true" class="brand-icon" fill="currentColor" viewBox="0 0 24 24"><path
              d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.48l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.5h2.04L6.49 3.23H4.3z"
            /></svg>
        </a>
        <a
          class="share-button platform-share"
          :href="blueskyShareUrl"
          aria-label="Bluesky で共有"
          rel="noopener noreferrer"
          target="_blank"
        >
          <svg aria-hidden="true" class="brand-icon" fill="currentColor" viewBox="0 0 24 24"><path
              d="M12 10.8c-1.5-2.8-5.6-8-9.4-10C-1.1-1.1-1 1.4-.6 4.3c.4 2.4 2 5.8 4.3 7.5 2.3 1.6 6.4 2.4 8.3 2.5-1.9.1-6 .9-8.3 2.5-2.3 1.7-3.9 5.1-4.3 7.5-.4 2.9-.5 5.4 3.2 3.5 3.8-2 7.9-7.2 9.4-10 1.5 2.8 5.6 8 9.4 10 3.7 1.9 3.8-.6 3.4-3.5-.4-2.4-2-5.8-4.3-7.5-2.3-1.6-6.4-2.4-8.3-2.5 1.9-.1 6-.9 8.3-2.5 2.3-1.7 3.9-5.1 4.3-7.5.4-2.9.3-5.4-3.4-3.5-3.8 2-7.9 7.2-9.4 10Z"
              transform="translate(0 1) scale(.96)"
            /></svg>
        </a>
        <a
          class="share-button platform-share"
          :href="hatenaBookmarkUrl"
          aria-label="はてなブックマークに追加"
          rel="noopener noreferrer"
          target="_blank"
        >
          <span aria-hidden="true" class="hatena-bookmark-mark">B!</span>
        </a>
        <button
          class="share-button"
          type="button"
          :aria-label="copyMessage || 'リンクをコピー'"
          :title="copyMessage || 'リンクをコピー'"
          @click="copyLink"
        >
          <svg
            v-if="copyMessage !== 'コピーしました'"
            aria-hidden="true"
            class="brand-icon"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            viewBox="0 0 24 24"
          ><rect height="12" rx="1" width="12" x="8" y="8" /><path
              d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"
            /></svg>
          <svg
            v-else
            aria-hidden="true"
            class="brand-icon"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            viewBox="0 0 24 24"
          ><path d="m5 12 4 4L19 6" /></svg>
        </button>
      </div>
      <span aria-live="polite" class="visually-hidden">{{ copyMessage }}</span>
    </div>
  </section>
</template>

<style scoped>
.article-actions {
  display: grid;
  gap: 1.25rem;
  margin-top: 3rem;
}

.share-row,
.share-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}

.share-button {
  display: inline-flex;
  width: 2.5rem;
  height: 2.5rem;
  min-height: 2.5rem;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: var(--foreground);
  background: var(--background);
  border: 1px solid color-mix(in srgb, var(--soft-border) 40%, var(--background));
  cursor: pointer;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    color var(--ui-transition-duration) ease,
    background-color var(--ui-transition-duration) ease,
    border-color var(--ui-transition-duration) ease;
}

.brand-icon {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
}

.hatena-bookmark-mark {
  color: currentColor;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: -0.08em;
}

.share-button:hover {
  color: var(--background);
  background: var(--foreground);
  border-color: var(--foreground);
}

@media (min-width: 48.001rem) {
  .native-share {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .share-button {
    transition: none;
  }
}
</style>
