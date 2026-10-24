<script setup lang="ts">
import { IconGithub, IconTwitter } from "@iconify-prerendered/vue-fa-brands";
import { awards, certifications, timelineData } from "../../../../../contents/about";
import Button from "../../components/Button.vue";
import ContentCard from "../../components/ContentCard.vue";
import SiteSection from "../../components/SiteSection.vue";

defineProps<{ avatar: string }>();

const technicalInterests = ["TypeScript", "React", "Vue", "Nix", "K Framework"];
</script>

<template>
  <SiteSection id="about-section" eyebrow="01 / About" title="About Me">
    <div class="about-content">
      <article class="profile-feature about-intro">
        <img class="profile-avatar" :src="avatar" alt="mimifuwacc" />
        <div class="profile-copy">
          <div class="profile-heading">
            <h3>mimifuwacc <small>ˈmiːmi</small></h3>
            <p>電気通信大学 情報理工学域 I類 コンピュータサイエンスプログラム</p>
          </div>
        </div>
        <div class="profile-socials">
          <Button href="https://github.com/mimifuwacc" external>
            <IconGithub class="icon" /> GitHub
          </Button>
          <Button href="https://twitter.com/mimifuwacc" external>
            <IconTwitter class="icon" /> Twitter
          </Button>
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
  padding-bottom: 0;
}

.profile-feature {
  display: grid;
  grid-template-columns: 5rem minmax(0, 1fr);
  align-items: start;
  gap: 0.75rem 1.25rem;
}

.profile-avatar {
  width: 5rem;
  height: 5rem;
  border-radius: 50% !important;
  object-fit: cover;
}

.profile-copy {
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
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.profile-socials :deep(.button) {
  width: 5.75rem;
  min-height: 2.25rem;
  gap: 0.4rem;
  padding-inline: 0.55rem;
  font-size: 0.85rem;
}

.about-columns {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: start;
  gap: clamp(2rem, 3.5vw, 3.5rem);
  padding-top: clamp(1.75rem, 3vw, 2.5rem);
}

.about-primary,
.about-secondary {
  display: grid;
  align-content: start;
  gap: 2.25rem;
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
  gap: 0.3rem 1.25rem;
  padding: 0.65rem 0;
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
  gap: 0.35rem;
}

.certification-list li {
  color: var(--muted-foreground);
  font-size: 0.85rem;
}

.award-list {
  gap: 0.75rem;
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
    gap: 2rem;
  }

  .timeline-event {
    grid-template-columns: minmax(5.5rem, 0.35fr) minmax(0, 1fr);
    gap: 0.25rem 0.8rem;
  }
}
</style>
