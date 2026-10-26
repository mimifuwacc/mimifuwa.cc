<script setup lang="ts">
import { IconGithub, IconTwitter } from "@iconify-prerendered/vue-fa-brands";

const year = new Date().getFullYear();
</script>

<template>
  <footer class="site-footer">
    <div class="container-wide footer-inner">
      <div class="footer-identity">
        <a href="/" class="footer-brand">mimifuwa.cc</a>
        <p class="copyright">© {{ year }} mimifuwacc</p>
      </div>
      <div class="footer-links">
        <nav class="footer-nav" aria-label="Footer navigation">
          <a href="/">Home</a>
          <a href="/blogs/">Blogs</a>
          <a href="/works/">Works</a>
          <a href="/onrepeat/">OnRepeat</a>
          <a href="/mutuals/">Mutuals</a>
        </nav>
        <nav class="social-links" aria-label="Social links">
          <a
            href="https://github.com/mimifuwacc"
            rel="me noopener"
            target="_blank"
            aria-label="GitHub"
            ><IconGithub aria-hidden="true"
          /></a>
          <a
            href="https://twitter.com/mimifuwacc"
            rel="me noopener"
            target="_blank"
            aria-label="Twitter"
            ><IconTwitter aria-hidden="true"
          /></a>
        </nav>
      </div>
    </div>
  </footer>
</template>
