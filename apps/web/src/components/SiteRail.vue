<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { Link } from "@void/vue";
import { ArrowUp } from "@lucide/vue";
import { IconGithub, IconTwitter } from "@iconify-prerendered/vue-fa-brands";
const appVersion = __APP_VERSION__;
const showBackToTop = ref(false);

const updateBackToTop = () => {
  showBackToTop.value = window.scrollY > 480;
};

onMounted(() => {
  updateBackToTop();
  window.addEventListener("scroll", updateBackToTop, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener("scroll", updateBackToTop));
</script>

<template>
  <aside
    class="site-rail"
    :class="{ 'has-back-to-top': showBackToTop }"
    aria-label="Site shortcuts"
  >
    <Link aria-label="mimifuwa.cc home" class="site-signature" href="/">
      <span aria-hidden="true" class="site-version">{{ appVersion }}</span>
      <span aria-hidden="true" class="site-url">https://mimifuwa.cc/</span>
    </Link>
    <div class="site-rail-middle">
      <p class="site-rail-note">fa6c2a8f-27b1-4611-a0f5-19b0d6c20612</p>
      <nav aria-label="Social links" class="site-rail-socials">
        <a aria-label="GitHub" href="https://github.com/mimifuwacc" rel="noopener" target="_blank">
          <IconGithub aria-hidden="true" />
        </a>
        <a
          aria-label="Twitter"
          href="https://twitter.com/mimifuwacc"
          rel="noopener"
          target="_blank"
        >
          <IconTwitter aria-hidden="true" />
        </a>
      </nav>
    </div>
    <Transition name="rail-button">
      <a v-if="showBackToTop" aria-label="Back to top" class="back-to-top" href="#top">
        <span class="back-to-top-icon"><ArrowUp aria-hidden="true" /></span>
        <span aria-hidden="true" class="back-to-top-label">BACK TO TOP</span>
      </a>
    </Transition>
  </aside>
</template>

<style scoped>
.site-rail {
  position: fixed;
  z-index: 30;
  inset: 0 clamp(1.25rem, 3vw, 3rem) 0 auto;
  pointer-events: none;
}

.site-signature,
.site-rail-socials,
.back-to-top {
  pointer-events: auto;
}

.site-signature {
  position: absolute;
  top: 2rem;
  left: 50%;
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;
  color: var(--foreground);
  text-decoration: none;
  transform: translateX(-50%);
}

.site-version,
.site-url {
  font-family: ui-monospace, monospace;
  font-weight: 700;
  writing-mode: vertical-rl;
}

.site-version {
  padding: 0.35rem 0.2rem;
  border: 1px solid var(--foreground);
  color: var(--foreground);
  background: var(--background);
  font-size: 0.55rem;
  letter-spacing: 0.04em;
}

.site-url {
  font-size: 0.82rem;
  letter-spacing: 0.08em;
}

.site-rail-middle {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 1.5rem;
  transform: translateX(-50%);
  transition: transform 520ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.has-back-to-top .site-rail-middle {
  transform: translate(-50%, calc(50% - 50vh + 2rem));
}

.site-rail-note {
  margin: 0;
  color: var(--muted-foreground);
  font-family: ui-monospace, monospace;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  line-height: 1.7;
  white-space: nowrap;
  writing-mode: vertical-rl;
}

.site-rail-socials {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 1rem;
}

.site-rail-socials a {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  color: var(--foreground);
}

.site-rail-socials a:hover {
  color: var(--muted-foreground);
}

.site-rail-socials :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
}

.back-to-top {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 0.7rem;
  color: var(--foreground);
  text-decoration: none;
  transform: translateX(-50%);
}

.back-to-top-icon {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border: 1px solid var(--foreground);
  color: var(--foreground);
  background: var(--background);
  transition:
    color var(--ui-transition-duration) ease,
    background-color var(--ui-transition-duration) ease;
}

.back-to-top-icon :deep(svg) {
  width: 1.2rem;
  height: 1.2rem;
}

.back-to-top-label {
  font-family: ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  writing-mode: vertical-rl;
}

.back-to-top:hover .back-to-top-icon {
  color: var(--background);
  background: var(--foreground);
}

.rail-button-enter-active,
.rail-button-leave-active {
  transition:
    opacity var(--ui-transition-duration) ease,
    transform var(--ui-transition-duration) ease;
}

.rail-button-enter-from,
.rail-button-leave-to {
  opacity: 0;
  transform: translate(-50%, 0.6rem);
}

@media (max-width: 64rem) {
  .site-signature {
    display: none;
  }

  .site-rail-middle {
    display: none;
  }

  .site-rail {
    inset: auto 1rem 1rem auto;
    width: 2.75rem;
    height: 2.75rem;
  }

  .back-to-top {
    bottom: 0;
  }

  .back-to-top-label {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-rail-middle,
  .back-to-top-icon,
  .rail-button-enter-active,
  .rail-button-leave-active {
    transition: none;
  }
}
</style>
