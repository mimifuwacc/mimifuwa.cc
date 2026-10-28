<script setup lang="ts">
import { ref } from "vue";
import { Check, Copy } from "@lucide/vue";
import SiteButton from "@/components/SiteButton.vue";

const uuid = "fa6c2a8f-27b1-4611-a0f5-19b0d6c20612";
const copied = ref(false);

const copyUuid = async () => {
  await navigator.clipboard.writeText(uuid);
  copied.value = true;
  window.setTimeout(() => (copied.value = false), 2000);
};
</script>

<template>
  <div class="profile-uuid">
    <span class="uuid-label">UUID</span>
    <code>{{ uuid }}</code>
    <SiteButton
      class="uuid-copy"
      variant="outline"
      :aria-label="copied ? 'UUID copied' : 'Copy UUID'"
      @click="copyUuid"
    >
      <Check v-if="copied" class="icon" />
      <Copy v-else class="icon" />
    </SiteButton>
    <span aria-live="polite" class="visually-hidden">{{ copied ? "UUID copied" : "" }}</span>
  </div>
</template>

<style scoped>
.profile-uuid {
  display: flex;
  max-width: 100%;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.35rem;
}

.uuid-label {
  color: var(--muted-foreground);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.profile-uuid code {
  color: var(--muted-foreground);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.68rem;
  overflow-wrap: anywhere;
}

.profile-uuid :deep(.uuid-copy) {
  width: 1.5rem;
  min-height: 1.5rem;
  padding: 0.2rem;
  border-color: transparent;
  color: var(--muted-foreground);
}

.profile-uuid :deep(.uuid-copy:hover) {
  color: var(--background);
}

.profile-uuid :deep(.uuid-copy .icon) {
  width: 0.85rem;
  height: 0.85rem;
}

@media (max-width: 32rem) {
  .profile-uuid code {
    font-size: 0.62rem;
  }
}
</style>
