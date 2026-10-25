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
  min-height: 28rem;
  align-items: center;
  color: var(--foreground);
  background: var(--background);
}

.hero-inner {
  display: grid;
  justify-items: center;
  gap: 1rem;
  padding-block: 3rem;
  text-align: center;
}

.hero-avatar {
  width: 6rem;
  height: 6rem;
  border-radius: 50% !important;
  object-fit: cover;
}

.hero-kicker {
  margin: 0 0 0.5rem;
  color: var(--muted-foreground);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(3rem, 8vw, 6rem);
  line-height: 1.05;
  letter-spacing: -0.06em;
}

.hero-intro {
  margin: 0.75rem 0 0;
  color: var(--muted-foreground);
  font-size: 1.1rem;
}

@media (max-width: 48rem) {
  .hero {
    min-height: 21rem;
  }

  .hero-inner {
    gap: 1rem;
  }

  .hero-avatar {
    width: 4.5rem;
    height: 4.5rem;
  }
}
</style>
