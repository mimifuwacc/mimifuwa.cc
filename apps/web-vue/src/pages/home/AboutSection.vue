<script setup lang="ts">
import { ArrowUpRight } from "@lucide/vue";
import { awards, certifications, timelineData } from "../../../../../contents/about";
import ContentCard from "../../components/ContentCard.vue";
import SiteSection from "../../components/SiteSection.vue";

defineProps<{ avatar: string }>();

const technicalInterests = ["TypeScript", "React", "Vue", "Nix", "K Framework"];
</script>

<template>
  <SiteSection id="about-section" eyebrow="01 / About" title="About Me">
    <div class="about-content">
      <article class="profile-feature about-intro">
        <div class="profile-heading">
          <img :src="avatar" alt="mimifuwacc" />
          <div>
            <h3>mimifuwacc <small>ˈmiːmi</small></h3>
            <p>電気通信大学 情報理工学域 I類 コンピュータサイエンスプログラム</p>
          </div>
        </div>
        <div class="profile-socials">
          <a href="https://github.com/mimifuwacc" target="_blank" rel="noopener">
            GitHub <ArrowUpRight class="icon" aria-hidden="true" />
          </a>
          <a href="https://twitter.com/mimifuwacc" target="_blank" rel="noopener">
            Twitter <ArrowUpRight class="icon" aria-hidden="true" />
          </a>
          <a href="https://zenn.dev/mimifuwacc" target="_blank" rel="noopener">
            Zenn <ArrowUpRight class="icon" aria-hidden="true" />
          </a>
        </div>
      </article>

      <div class="about-columns">
        <div class="about-primary">
          <ContentCard title="Interests" icon="code">
            <ul class="interests-list" aria-label="Technical interests">
              <li v-for="interest in technicalInterests" :key="interest">{{ interest }}</li>
            </ul>
          </ContentCard>

          <ContentCard title="Certifications" icon="award">
            <ul class="certification-list">
              <li v-for="item in certifications" :key="item">{{ item }}</li>
            </ul>
          </ContentCard>

          <ContentCard title="Awards" icon="trophy">
            <ul class="award-list">
              <li v-for="item in awards" :key="item.date + item.title">
                <time>{{ item.date }}</time>
                <strong>{{ item.title }}</strong>
                <span>{{ item.description }}</span>
              </li>
            </ul>
          </ContentCard>
        </div>

        <div class="about-secondary">
          <ContentCard title="Timeline" icon="clock">
            <div class="timeline">
              <article
                v-for="event in timelineData"
                :key="event.date + event.title"
                class="timeline-event"
              >
                <time>{{ event.date }}</time>
                <h4>{{ event.title }}</h4>
                <p v-if="event.description">{{ event.description }}</p>
              </article>
            </div>
          </ContentCard>
        </div>
      </div>
    </div>
  </SiteSection>
</template>

<style scoped>
.about-content {
  width: 100%;
}

.about-intro {
  position: relative;
  padding-bottom: clamp(2rem, 4vw, 3rem);
}

.about-intro::after {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 3rem;
  height: 2px;
  background: var(--foreground);
  content: "";
}

.profile-heading {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.profile-heading img {
  width: 5rem;
  height: 5rem;
  flex: 0 0 auto;
  border-radius: 50% !important;
  object-fit: cover;
}

.profile-heading > div {
  min-width: 0;
}

.profile-heading h3 {
  margin: 0;
  font-size: 1.35rem;
  letter-spacing: -0.035em;
}

.profile-heading small {
  margin-left: 0.35rem;
  color: var(--muted-foreground);
  font-weight: 400;
}

.profile-heading p {
  margin: 0.25rem 0 0;
  color: var(--muted-foreground);
  font-size: 0.85rem;
  line-height: 1.5;
}

.profile-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 1.25rem;
}

.profile-socials a {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  gap: 0.4rem;
  padding-inline: 0.75rem;
  color: var(--background);
  background: var(--foreground);
  border: 1px solid var(--foreground);
  text-decoration: none;
  transition:
    color 150ms ease,
    background-color 150ms ease;
}

.profile-socials a:hover {
  color: var(--foreground);
  background: var(--background);
}

.about-columns {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: start;
  gap: clamp(3rem, 7vw, 6rem);
  padding-top: clamp(2.25rem, 4vw, 3.5rem);
}

.about-primary,
.about-secondary {
  display: grid;
  align-content: start;
  gap: clamp(2.5rem, 5vw, 4rem);
}

.interests-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.interests-list li {
  padding: 0.18rem 0.55rem;
  color: var(--foreground);
  background: var(--background);
  border: 1px solid var(--foreground);
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.5;
}

.timeline {
  display: grid;
}

.timeline-event {
  display: grid;
  grid-template-columns: minmax(8rem, 0.28fr) minmax(0, 1fr);
  gap: 0.35rem 1.5rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid color-mix(in srgb, var(--soft-border) 28%, var(--background));
}

.timeline-event:first-child {
  padding-top: 0;
}

.timeline-event time {
  color: var(--muted-foreground);
  font-size: 0.8rem;
}

.timeline-event h4 {
  margin: 0;
  font-size: 0.9rem;
}

.timeline-event p {
  grid-column: 2;
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.8rem;
}

.certification-list,
.award-list {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}

.certification-list {
  gap: 0.6rem;
}

.certification-list li {
  color: var(--muted-foreground);
  font-size: 0.85rem;
}

.award-list {
  gap: 1rem;
}

.award-list li {
  display: grid;
  gap: 0.15rem;
}

.award-list time,
.award-list span {
  color: var(--muted-foreground);
  font-size: 0.8rem;
}

.award-list strong {
  font-size: 0.9rem;
  font-weight: 600;
}

@media (max-width: 48rem) {
  .about-columns {
    grid-template-columns: minmax(0, 1fr);
    gap: 2.5rem;
  }

  .timeline-event {
    grid-template-columns: minmax(5.5rem, 0.35fr) minmax(0, 1fr);
    gap: 0.25rem 0.8rem;
  }
}
</style>
