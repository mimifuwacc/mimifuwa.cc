<script setup lang="ts">
import { sanitizeUrl } from "@braintree/sanitize-url";
import SiteSection from "@/components/SiteSection.vue";
import { ArrowRight } from "@lucide/vue";
import SiteButton from "@/components/SiteButton.vue";
import { tracks } from "@/lib/on-repeat";
</script>

<template>
  <SiteSection id="on-repeat-section" eyebrow="My Favorite Songs" title="On Repeat">
    <template #action>
      <SiteButton class="on-repeat-action-desktop" href="/onrepeat/">
        See more <ArrowRight aria-hidden="true" class="icon" />
      </SiteButton>
    </template>
    <div class="track-grid">
      <a
        v-for="track in tracks"
        :key="track.url"
        class="track-card"
        :href="sanitizeUrl(track.url)"
        rel="noopener noreferrer"
        target="_blank"
      >
        <img
          class="track-artwork"
          :src="track.artworkUrl"
          :alt="`${track.title} — ${track.artist} のジャケット`"
          loading="lazy"
        />
        <span class="track-copy">
          <strong>{{ track.title }}</strong>
          <span>{{ track.artist }}</span>
        </span>
      </a>
    </div>
    <div class="on-repeat-actions-mobile">
      <SiteButton href="/onrepeat/"> See more <ArrowRight aria-hidden="true" class="icon" /> </SiteButton>
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

.on-repeat-actions-mobile {
  display: none;
}

@media (min-width: 40.001rem) and (max-width: 90rem) {
  .track-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .track-card:last-child:nth-child(4) {
    grid-column: 1;
  }
}

@media (max-width: 40rem) {
  .track-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem 1rem;
  }

  .on-repeat-action-desktop {
    display: none;
  }

  .on-repeat-actions-mobile {
    display: flex;
    justify-content: flex-end;
    margin-top: 1.25rem;
  }

  .on-repeat-actions-mobile :deep(.button) {
    min-height: 2.25rem;
    padding: 0.45rem 0.7rem;
    font-size: 0.85rem;
  }
}
</style>
