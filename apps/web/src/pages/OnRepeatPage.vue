<script setup lang="ts">
import SiteSection from "../components/SiteSection.vue";
import { tracks } from "../lib/on-repeat";
</script>

<template>
  <SiteSection id="on-repeat-page" heading-level="h1" title="On Repeat">
    <div class="track-grid">
      <a
        v-for="track in tracks"
        :key="track.url"
        class="track-card"
        :href="track.url"
        rel="noopener noreferrer"
        target="_blank"
      >
        <img
          class="track-artwork"
          :src="track.artworkUrl"
          :alt="`${track.title} — ${track.artist} のジャケット`"
        />
        <span class="track-copy">
          <strong>{{ track.title }}</strong>
          <span>{{ track.artist }}</span>
        </span>
      </a>
    </div>
  </SiteSection>
</template>

<style scoped>
.track-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(1rem, 2.5vw, 2rem);
}

.track-card {
  display: grid;
  min-width: 0;
  gap: 0.75rem;
  color: inherit;
  text-decoration: none;
}

.track-artwork {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background: var(--muted);
}

.track-copy {
  display: grid;
  gap: 0.15rem;
}

.track-copy strong {
  font-size: 0.95rem;
  line-height: 1.45;
}

.track-copy > span {
  color: var(--muted-foreground);
  font-size: 0.8rem;
}

.track-card:hover .track-copy strong {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

@media (min-width: 48.001rem) and (max-width: 70rem) {
  .track-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 48.001rem) and (max-width: 70rem) {
  .track-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 48rem) {
  .track-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem 1rem;
  }
}
</style>
