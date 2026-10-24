<script setup lang="ts">
import { ref } from "vue";
import { Check, Copy } from "@lucide/vue";

const uuid = "fa6c2a8f-27b1-4611-a0f5-19b0d6c20612";
const copied = ref(false);

const copyUuid = async () => {
  await navigator.clipboard.writeText(uuid);
  copied.value = true;
  window.setTimeout(() => (copied.value = false), 2000);
};
</script>

<template>
  <footer class="site-footer">
    <div class="container-wide footer-inner">
      <div class="footer-identity">
        <a href="/" class="footer-brand">mimifuwa.cc</a>
        <button class="uuid-copy" type="button" @click="copyUuid">
          <span>{{ uuid }}</span>
          <Check v-if="copied" class="icon" aria-label="Copied" />
          <Copy v-else class="icon" aria-label="Copy UUID" />
        </button>
      </div>
      <div class="footer-links">
        <nav aria-label="Footer navigation">
          <a href="/">Home</a>
          <a href="/blogs/">Blog</a>
          <a href="/links">Links</a>
        </nav>
        <nav class="social-links" aria-label="Social links">
          <a href="https://github.com/mimifuwacc" rel="me noopener" target="_blank"
            ><span>GitHub</span><span aria-hidden="true">↗</span></a
          >
          <a href="https://twitter.com/mimifuwacc" rel="me noopener" target="_blank">Twitter</a>
          <a href="mailto:mail@mimifuwa.cc">Email</a>
        </nav>
      </div>
    </div>
    <p class="container-wide copyright">© {{ new Date().getFullYear() }} mimifuwa.cc</p>
  </footer>
</template>
