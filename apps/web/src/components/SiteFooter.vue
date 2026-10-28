<script setup lang="ts">
import { Link } from "@void/vue";
import { IconGithub, IconTwitter } from "@iconify-prerendered/vue-fa-brands";

const year = new Date().getFullYear();
</script>

<template>
  <footer class="site-footer">
    <div class="container-wide footer-inner">
      <div class="footer-identity">
        <Link class="footer-brand" href="/">mimifuwa.cc</Link>
        <p class="copyright">© {{ year }} mimifuwacc</p>
      </div>
      <div class="footer-links">
        <nav aria-label="Footer navigation" class="footer-nav">
          <Link href="/">Home</Link>
          <Link href="/blogs/">Blogs</Link>
          <Link href="/works/">Works</Link>
          <Link href="/onrepeat/">OnRepeat</Link>
          <Link href="/mutuals/">Mutuals</Link>
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
