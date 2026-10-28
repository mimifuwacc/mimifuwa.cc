<script setup lang="ts">
import type { Props } from "./onrepeat.server";
import OnRepeatPage from "@/pages/OnRepeatPage.vue";

defineProps<Props>();
</script>

<template>
  <OnRepeatPage :tracks="tracks" />
</template>
