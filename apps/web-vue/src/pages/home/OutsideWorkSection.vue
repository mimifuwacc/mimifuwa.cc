<script setup lang="ts">
import { hobbies } from "../../../../../contents/about";
import InlineTagList from "../../components/InlineTagList.vue";
import SiteSection from "../../components/SiteSection.vue";
</script>

<template>
  <SiteSection id="personal-interests-section" eyebrow="04 / Personal" title="Outside work">
    <div class="hobby-list">
      <div v-for="hobby in hobbies" :key="hobby.name" class="hobby-item">
        <h3>{{ hobby.name }}</h3>
        <InlineTagList v-if="hobby.items" :items="hobby.items" />
      </div>
    </div>
  </SiteSection>
</template>

<style scoped>
.hobby-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2.5rem;
}

.hobby-item h3 {
  margin: 0 0 0.45rem;
  font-size: 0.9rem;
}
</style>
