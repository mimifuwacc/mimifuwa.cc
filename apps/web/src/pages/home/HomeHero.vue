<template>
  <section class="hero">
    <div class="hero-inner container-wide">
      <h1>mimifuwa.cc</h1>
      <p class="hero-intro">Web App Developer / ヰ組</p>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  min-height: clamp(22rem, 48vh, 30rem);
  align-items: center;
  color: var(--foreground);
  background: var(--background);
}

.hero-inner {
  padding-block: 3rem;
  text-align: center;
}

h1 {
  margin: 0;
  font-size: clamp(3.25rem, 9vw, 7rem);
  line-height: 1.05;
  letter-spacing: -0.065em;
}

.hero-intro {
  max-width: 34rem;
  margin: 1.25rem auto 0;
  color: var(--muted-foreground);
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  line-height: 1.6;
}

@media (max-width: 48rem) {
  .hero {
    min-height: 18rem;
  }
}
</style>
