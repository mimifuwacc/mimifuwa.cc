<script setup lang="ts"></script>

<template>
  <footer class="site-footer">
    <div class="container-wide footer-inner">
      <div class="footer-identity">
        <a href="/" class="footer-brand">mimifuwa.cc</a>
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
