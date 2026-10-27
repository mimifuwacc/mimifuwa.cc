<script setup lang="ts">
import { IconGithub, IconTwitter } from "@iconify-prerendered/vue-fa-brands";

const year = new Date().getFullYear();
</script>

<template>
  <footer class="site-footer">
    <div class="container-wide footer-inner">
      <div class="footer-identity">
        <a class="footer-brand" href="/">mimifuwa.cc</a>
        <p class="copyright">© {{ year }} mimifuwacc</p>
      </div>
      <div class="footer-links">
        <nav aria-label="Footer navigation" class="footer-nav">
          <a href="/">Home</a>
          <a href="/blogs/">Blogs</a>
          <a href="/works/">Works</a>
          <a href="/onrepeat/">OnRepeat</a>
          <a href="/mutuals/">Mutuals</a>
        </nav>
        <nav aria-label="Social links" class="social-links">
          <a
            aria-label="GitHub"
            href="https://github.com/mimifuwacc"
            rel="me noopener"
            target="_blank"
          ><IconGithub aria-hidden="true" /></a>
          <a
            aria-label="Twitter"
            href="https://twitter.com/mimifuwacc"
            rel="me noopener"
            target="_blank"
          ><IconTwitter aria-hidden="true" /></a>
        </nav>
      </div>
    </div>
  </footer>
</template>
