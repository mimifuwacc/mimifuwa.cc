<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { Menu, Moon, Search, Sun, X } from "@lucide/vue";

interface SearchDocument {
  title: string;
  url: string;
  body: string;
}

const route = useRoute();
const menuOpen = ref(false);
const searchOpen = ref(false);
const query = ref("");
const documents = ref<SearchDocument[]>([]);
const isDark = ref(false);
const navItems = [
  { href: "/", label: "Home" },
  { href: "/blogs/", label: "Blog" },
  { href: "/links", label: "Links" },
];

const matches = computed(() => {
  const search = query.value.trim().toLocaleLowerCase();
  if (!search) return [];
  return documents.value
    .filter((document) => `${document.title} ${document.body}`.toLocaleLowerCase().includes(search))
    .slice(0, 20);
});

const isActive = (href: string) =>
  route.path === href || (href !== "/" && route.path.startsWith(href));

const syncTheme = () => {
  isDark.value = document.documentElement.dataset.theme === "dark";
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.dataset.theme = isDark.value ? "dark" : "light";
  localStorage.setItem("theme", isDark.value ? "dark" : "light");
};

onMounted(async () => {
  const savedTheme = localStorage.getItem("theme");
  isDark.value =
    savedTheme === "dark" || (!savedTheme && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = isDark.value ? "dark" : "light";

  try {
    const response = await fetch("/search-index.json");
    if (response.ok) {
      const index = (await response.json()) as { documents?: SearchDocument[] };
      documents.value = index.documents ?? [];
    }
  } catch {
    documents.value = [];
  }

  window.addEventListener("keydown", onKeydown);
});

const onKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchOpen.value = true;
  }
  if (event.key === "Escape") {
    searchOpen.value = false;
    menuOpen.value = false;
  }
};

onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <header class="site-header">
    <div class="header-inner container-wide">
      <a class="brand" href="/">mimifuwa.cc</a>
      <nav class="desktop-nav" aria-label="Main navigation">
        <a
          v-for="item in navItems"
          :key="item.href"
          :href="item.href"
          :aria-current="isActive(item.href) ? 'page' : undefined"
        >
          {{ item.label }}
        </a>
        <button
          class="icon-button search-trigger"
          type="button"
          aria-label="Search articles"
          @click="searchOpen = true"
        >
          <Search class="icon" aria-hidden="true" />
          <span>Search</span>
          <kbd>⌘K</kbd>
        </button>
        <button
          class="icon-button theme-toggle"
          type="button"
          aria-label="Toggle color theme"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" class="icon" aria-hidden="true" />
          <Moon v-else class="icon" aria-hidden="true" />
          <span class="visually-hidden">{{ isDark ? "Light theme" : "Dark theme" }}</span>
        </button>
      </nav>
      <div class="mobile-actions">
        <button
          class="icon-button search-trigger"
          type="button"
          aria-label="Search articles"
          @click="searchOpen = true"
        >
          <Search class="icon" aria-hidden="true" />
          <span class="visually-hidden">Search</span>
        </button>
        <button
          class="icon-button theme-toggle"
          type="button"
          aria-label="Toggle color theme"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" class="icon" aria-hidden="true" />
          <Moon v-else class="icon" aria-hidden="true" />
        </button>
        <button
          class="icon-button menu-toggle"
          type="button"
          :aria-expanded="menuOpen"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click="menuOpen = !menuOpen"
        >
          <X v-if="menuOpen" class="icon" aria-hidden="true" />
          <Menu v-else class="icon" aria-hidden="true" />
        </button>
      </div>
    </div>
    <nav v-if="menuOpen" class="mobile-nav container-wide" aria-label="Mobile navigation">
      <a
        v-for="item in navItems"
        :key="item.href"
        :href="item.href"
        :aria-current="isActive(item.href) ? 'page' : undefined"
        @click="menuOpen = false"
      >
        {{ item.label }}
      </a>
    </nav>
  </header>

  <dialog
    v-if="searchOpen"
    class="search-dialog"
    open
    aria-label="Search articles"
    @click.self="searchOpen = false"
  >
    <div class="search-dialog-header">
      <input
        v-model="query"
        type="search"
        placeholder="Search articles"
        aria-label="Search articles"
        autofocus
      />
      <button
        class="icon-button"
        type="button"
        aria-label="Close search"
        @click="searchOpen = false"
      >
        <X class="icon" aria-hidden="true" />
      </button>
    </div>
    <div class="search-results">
      <a v-for="result in matches" :key="result.url" class="search-result" :href="result.url">
        <strong>{{ result.title }}</strong>
        <span>{{ result.body.slice(0, 160) }}</span>
      </a>
      <p v-if="query && matches.length === 0" class="search-empty">No results.</p>
    </div>
  </dialog>
</template>
