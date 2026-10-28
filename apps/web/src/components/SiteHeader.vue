<script setup lang="ts">
import { sanitizeUrl } from "@braintree/sanitize-url";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Link, useRouter } from "@void/vue";
import { Menu, Moon, Sun, X } from "@lucide/vue";

interface SearchDocument {
  title: string;
  url: string;
  body: string;
}

const router = useRouter();
const menuOpen = ref(false);
const menuDialog = ref<HTMLDialogElement>();
const searchOpen = ref(false);
const query = ref("");
const documents = ref<SearchDocument[]>([]);
const isDark = ref(false);
const navItems = [
  { href: "/", label: "Top" },
  { href: "/blogs/", label: "Blogs" },
  { href: "/works/", label: "Works" },
  { href: "/onrepeat/", label: "On Repeat" },
  { href: "/mutuals/", label: "Mutuals" },
];

const matches = computed(() => {
  const search = query.value.trim().toLocaleLowerCase();
  if (!search) return [];
  return documents.value
    .filter((document) => `${document.title} ${document.body}`.toLocaleLowerCase().includes(search))
    .slice(0, 20);
});

const currentPath = computed(() => {
  const pathname = router.url.pathname.replace(/\/{2,}/g, "/");
  return pathname === "/" ? pathname : `${pathname.replace(/\/$/, "")}/`;
});
const isActive = (href: string) => {
  const normalizedHref = href === "/" ? href : `${href.replace(/\/$/, "")}/`;
  return (
    currentPath.value === normalizedHref ||
    (normalizedHref !== "/" && currentPath.value.startsWith(normalizedHref))
  );
};

watch(menuOpen, async (open) => {
  if (!open) return;
  await nextTick();
  menuDialog.value?.showModal();
});

const toggleTheme = () => {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  isDark.value = !isDark.value;
  root.dataset.theme = isDark.value ? "dark" : "light";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", isDark.value ? "#000000" : "#ffffff");
  localStorage.setItem("theme", isDark.value ? "dark" : "light");
  window.setTimeout(() => root.classList.remove("theme-transition"), 200);
};

onMounted(async () => {
  const savedTheme = localStorage.getItem("theme");
  isDark.value =
    savedTheme === "dark" || (!savedTheme && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = isDark.value ? "dark" : "light";

  try {
    const response = await fetch("/api/search-index");
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

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <div class="header-brand-row">
        <Link class="brand" href="/">mimifuwa.cc</Link>
      </div>
      <nav aria-label="Main navigation" class="desktop-nav">
        <Link
          v-for="item in navItems"
          :key="item.href"
          :href="sanitizeUrl(item.href)"
          :aria-current="isActive(item.href) ? 'page' : undefined"
        >
          <span>{{ item.label }}</span>
        </Link>
      </nav>
      <div class="header-theme">
        <button
          aria-label="Toggle color theme"
          class="icon-button theme-toggle"
          type="button"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" aria-hidden="true" class="icon" />
          <Moon v-else aria-hidden="true" class="icon" />
          <span class="visually-hidden">{{ isDark ? "Light theme" : "Dark theme" }}</span>
        </button>
      </div>
      <div class="mobile-actions">
        <button
          aria-label="Toggle color theme"
          class="icon-button theme-toggle"
          type="button"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" aria-hidden="true" class="icon" />
          <Moon v-else aria-hidden="true" class="icon" />
        </button>
        <button
          class="icon-button menu-toggle"
          type="button"
          :aria-expanded="menuOpen"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click="menuOpen = !menuOpen"
        >
          <X v-if="menuOpen" aria-hidden="true" class="icon" />
          <Menu v-else aria-hidden="true" class="icon" />
        </button>
      </div>
    </div>
  </header>

  <dialog
    v-if="menuOpen"
    ref="menuDialog"
    aria-label="Main menu"
    class="mobile-menu"
    @click.self="menuOpen = false"
    @cancel.prevent="menuOpen = false"
  >
    <div class="mobile-menu-inner">
      <div class="mobile-menu-header">
        <span>CONTENTS</span>
        <button
          aria-label="Close menu"
          autofocus
          class="icon-button mobile-menu-close"
          type="button"
          @click="menuOpen = false"
        >
          <X aria-hidden="true" class="icon" />
        </button>
      </div>
      <nav aria-label="Main navigation" class="mobile-menu-links">
        <Link
          v-for="item in navItems"
          :key="item.href"
          :href="sanitizeUrl(item.href)"
          :aria-current="isActive(item.href) ? 'page' : undefined"
          @click="menuOpen = false"
        >
          {{ item.label }}
        </Link>
      </nav>
      <span aria-hidden="true" class="mobile-menu-brand">mimifuwa.cc</span>
    </div>
  </dialog>

  <dialog
    v-if="searchOpen"
    aria-label="Search articles"
    class="search-dialog"
    open
    @click.self="searchOpen = false"
  >
    <div class="search-dialog-header">
      <input
        v-model="query"
        aria-label="Search articles"
        autofocus
        placeholder="Search articles"
        type="search"
      />
      <button
        aria-label="Close search"
        class="icon-button"
        type="button"
        @click="searchOpen = false"
      >
        <X aria-hidden="true" class="icon" />
      </button>
    </div>
    <div class="search-results">
      <a
        v-for="result in matches"
        :key="result.url"
        class="search-result"
        :href="sanitizeUrl(result.url)"
      >
        <strong>{{ result.title }}</strong>
        <span>{{ result.body.slice(0, 160) }}</span>
      </a>
      <p v-if="query && matches.length === 0" class="search-empty">No results.</p>
    </div>
  </dialog>
</template>
