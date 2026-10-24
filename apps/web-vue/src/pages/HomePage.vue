<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ArrowUpRight } from "@lucide/vue";
import { certifications, hobbies, timelineData } from "../../../../contents/about";
import { allSkills } from "../../../../contents/skills";
import { works } from "../../../../contents/works";
import BlogCard from "../components/BlogCard.vue";
import ContentCard from "../components/ContentCard.vue";
import SiteSection from "../components/SiteSection.vue";

interface BlogSummary {
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  url: string;
}

const posts = ref<BlogSummary[]>([]);
const avatar =
  "https://raw.githubusercontent.com/mimifuwacc/mimifuwa.cc/dev/apps/web/public/mimifuwacc.png";

const workImage = (url: string, image?: string) => {
  if (image?.startsWith("/")) {
    return `https://raw.githubusercontent.com/mimifuwacc/mimifuwa.cc/dev/apps/web/public${image}`;
  }
  if (image) return image;
  const match = url.match(/github\.com\/([^/]+)\/([^/?]+)/);
  return match ? `https://opengraph.githubassets.com/1/${match[1]}/${match[2]}` : undefined;
};

onMounted(async () => {
  try {
    const response = await fetch("/blog-list.json");
    if (!response.ok) return;
    posts.value = ((await response.json()) as BlogSummary[]).slice(0, 6);
  } catch {
    posts.value = [];
  }
});
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

  <div class="home-content">
    <SiteSection id="about-section" eyebrow="01 / About" title="About Me">
      <div class="about-content">
        <article class="profile-feature about-intro">
          <div class="profile-heading">
            <img :src="avatar" alt="mimifuwacc" />
            <div>
              <h3>mimifuwacc <small>ˈmiːmi</small></h3>
              <p>University of Electro-Communications · Computer Science</p>
            </div>
          </div>
          <p class="profile-bio">
            Web application engineer. I work on formal verification of assembly languages at
            university, and enjoy music and light novels.
          </p>
          <div class="button-row">
            <a
              class="profile-social"
              href="https://github.com/mimifuwacc"
              target="_blank"
              rel="noopener"
              >GitHub <ArrowUpRight class="icon" aria-hidden="true"
            /></a>
            <a
              class="profile-social"
              href="https://twitter.com/mimifuwacc"
              target="_blank"
              rel="noopener"
              >Twitter <ArrowUpRight class="icon" aria-hidden="true"
            /></a>
            <a
              class="profile-social"
              href="https://zenn.dev/mimifuwacc"
              target="_blank"
              rel="noopener"
              >Zenn <ArrowUpRight class="icon" aria-hidden="true"
            /></a>
          </div>
        </article>

        <div class="about-columns">
          <div class="about-primary">
            <ContentCard title="Skills" icon="wrench">
              <ul class="skills-list" aria-label="Skills">
                <li v-for="skill in allSkills" :key="skill.name">{{ skill.name }}</li>
              </ul>
            </ContentCard>

            <ContentCard title="Interests" icon="smile">
              <div class="hobby-list">
                <div v-for="hobby in hobbies" :key="hobby.name" class="hobby-item">
                  <h4>{{ hobby.name }}</h4>
                  <div v-if="hobby.items" class="tag-list">
                    <span v-for="item in hobby.items" :key="item" class="tag">{{ item }}</span>
                  </div>
                </div>
              </div>
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

            <ContentCard title="Certifications" icon="award">
              <ul class="certification-list">
                <li v-for="item in certifications" :key="item">{{ item }}</li>
              </ul>
            </ContentCard>
          </div>
        </div>
      </div>
    </SiteSection>

    <SiteSection
      id="works-section"
      eyebrow="02 / Selected work"
      title="Works"
      subtitle="Apps, services, and tools I have made."
    >
      <template #action>
        <a class="section-link" href="https://github.com/mimifuwacc" target="_blank" rel="noopener">
          More projects <ArrowUpRight class="icon" aria-hidden="true" />
        </a>
      </template>
      <div class="works-grid">
        <a
          v-for="work in works"
          :key="work.title"
          class="work-card square-card"
          :href="work.url"
          target="_blank"
          rel="noopener"
        >
          <img
            v-if="workImage(work.url, work.image)"
            :src="workImage(work.url, work.image)"
            :alt="work.title"
            loading="lazy"
          />
          <div class="work-card-body">
            <h3>{{ work.title }} <ArrowUpRight class="icon" aria-hidden="true" /></h3>
            <p>{{ work.description }}</p>
          </div>
        </a>
      </div>
    </SiteSection>

    <SiteSection
      v-if="posts.length"
      id="blog-section"
      eyebrow="03 / Writing"
      title="Blog"
      subtitle="Notes on software, projects, and everyday things."
    >
      <template #action>
        <a class="section-link" href="/blogs/">All articles <span aria-hidden="true">→</span></a>
      </template>
      <div class="blog-grid">
        <BlogCard v-for="post in posts" :key="post.url" :post="post" />
      </div>
    </SiteSection>
  </div>
</template>
