<script setup lang="ts">
import { sanitizeUrl } from "@braintree/sanitize-url";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Link, useNavigation, useRouter } from "@void/vue";
import { Menu, Moon, Sun, X } from "@lucide/vue";

const router = useRouter();
const navigation = useNavigation();
const menuOpen = ref(false);
const menuDialog = ref<HTMLDialogElement>();
const isDark = ref(false);
const isScrolled = ref(false);
const progressVisible = ref(false);
let showProgressTimeout: ReturnType<typeof setTimeout> | undefined;
let hideProgressTimeout: ReturnType<typeof setTimeout> | undefined;
let historyNavigationTimeout: ReturnType<typeof setTimeout> | undefined;
let isHistoryNavigation = false;
const navItems = [
  { href: "/", label: "Top" },
  { href: "/posts/", label: "Posts" },
  { href: "/works/", label: "Works" },
  { href: "/onrepeat/", label: "On Repeat" },
  { href: "/links/", label: "Links" },
];

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

watch(
  () => navigation.state,
  (state) => {
    clearTimeout(showProgressTimeout);
    clearTimeout(hideProgressTimeout);

    if (state === "idle") {
      isHistoryNavigation = false;
      clearTimeout(historyNavigationTimeout);
      if (progressVisible.value) {
        hideProgressTimeout = setTimeout(() => {
          progressVisible.value = false;
        }, 180);
      }
      return;
    }

    if (isHistoryNavigation) {
      clearTimeout(historyNavigationTimeout);
      return;
    }

    if (!progressVisible.value) {
      showProgressTimeout = setTimeout(() => {
        progressVisible.value = true;
      }, 120);
    }
  },
);

watch(menuOpen, async (open) => {
  if (!open) return;
  await nextTick();
  menuDialog.value?.showModal();
});

const toggleTheme = () => {
  const root = document.documentElement;
  isDark.value = !isDark.value;
  root.dataset.theme = isDark.value ? "dark" : "light";
  root.style.backgroundColor = isDark.value ? "#000000" : "#ffffff";
  root.style.color = isDark.value ? "#ffffff" : "#000000";
  root.style.colorScheme = isDark.value ? "dark" : "light";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", isDark.value ? "#000000" : "#ffffff");
  localStorage.setItem("theme", isDark.value ? "dark" : "light");
};

onMounted(() => {
  window.addEventListener("popstate", onHistoryNavigation);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const savedTheme = localStorage.getItem("theme");
  isDark.value =
    savedTheme === "dark" || (!savedTheme && matchMedia("(prefers-color-scheme: dark)").matches);
  const root = document.documentElement;
  root.dataset.theme = isDark.value ? "dark" : "light";
  root.style.backgroundColor = isDark.value ? "#000000" : "#ffffff";
  root.style.color = isDark.value ? "#ffffff" : "#000000";
  root.style.colorScheme = isDark.value ? "dark" : "light";
});

const onScroll = () => {
  isScrolled.value = window.scrollY > 0;
};

const onHistoryNavigation = () => {
  isHistoryNavigation = true;
  clearTimeout(showProgressTimeout);
  clearTimeout(hideProgressTimeout);
  progressVisible.value = false;

  clearTimeout(historyNavigationTimeout);
  historyNavigationTimeout = setTimeout(() => {
    isHistoryNavigation = false;
  }, 1500);
};

onBeforeUnmount(() => {
  window.removeEventListener("popstate", onHistoryNavigation);
  window.removeEventListener("scroll", onScroll);
  clearTimeout(showProgressTimeout);
  clearTimeout(hideProgressTimeout);
  clearTimeout(historyNavigationTimeout);
});
</script>

<template>
  <div
    aria-label="Loading page"
    class="navigation-progress"
    :class="{ 'is-active': progressVisible }"
    :aria-hidden="!progressVisible"
    role="progressbar"
  >
    <span />
  </div>
  <header class="site-header" :class="{ 'is-scrolled': isScrolled }">
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
          type="button"
          aria-label="Toggle color theme"
          class="icon-button theme-toggle"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" aria-hidden="true" class="icon" />
          <Moon v-else aria-hidden="true" class="icon" />
          <span class="visually-hidden">{{ isDark ? "Light theme" : "Dark theme" }}</span>
        </button>
      </div>
      <div class="mobile-actions">
        <button
          type="button"
          aria-label="Toggle color theme"
          class="icon-button theme-toggle"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" aria-hidden="true" class="icon" />
          <Moon v-else aria-hidden="true" class="icon" />
        </button>
        <button
          type="button"
          class="icon-button menu-toggle"
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
        <span class="mobile-menu-site-brand">mimifuwa.cc</span>
        <button
          type="button"
          aria-label="Close menu"
          autofocus
          class="icon-button mobile-menu-close"
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
    </div>
  </dialog>
</template>

<style scoped>
.mobile-menu {
  padding: env(safe-area-inset-top) max(1rem, env(safe-area-inset-right))
    max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
}

.mobile-menu-inner {
  width: 100%;
  margin-inline: 0;
}

.mobile-menu-header {
  min-height: var(--header-height);
}

.mobile-menu-site-brand {
  color: var(--background);
  font-family: "Noto Sans JP Variable", sans-serif;
  font-size: 1.4rem;
  font-weight: 850;
  letter-spacing: -0.065em;
  white-space: nowrap;
}

.mobile-menu-links {
  padding-left: 1rem;
}
</style>
