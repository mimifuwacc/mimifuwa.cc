<script setup lang="ts">
defineProps<{ avatar: string }>();
</script>

<template>
  <section class="hero">
    <div class="hero-inner container-wide">
      <img class="hero-avatar" :src="avatar" alt="mimifuwacc" />
      <div>
        <p class="hero-kicker">Personal website</p>
        <h1>mimifuwa.cc</h1>
        <p class="hero-intro">Making things. Writing things down.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  min-height: 22rem;
  align-items: center;
  color: var(--background);
  background: var(--foreground);
}

.hero-inner {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-block: 3rem;
}

.hero-avatar {
  width: 8rem;
  height: 8rem;
  border-radius: 50% !important;
  object-fit: cover;
}

.hero-kicker {
  margin: 0 0 0.5rem;
  color: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.68;
}

h1 {
  margin: 0;
  font-size: clamp(2.5rem, 8vw, 5rem);
  line-height: 1.05;
  letter-spacing: -0.06em;
}

.hero-intro {
  margin: 1rem 0 0;
  font-size: 1.1rem;
  opacity: 0.82;
}

@media (max-width: 48rem) {
  .hero {
    min-height: 18rem;
  }

  .hero-inner {
    gap: 1rem;
  }

  .hero-avatar {
    width: 5rem;
    height: 5rem;
  }
}
</style>
