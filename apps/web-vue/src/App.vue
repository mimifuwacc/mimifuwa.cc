<template>
  <div class="site-shell">
    <header class="site-header">
      <RouterLink class="brand" to="/">mimifuwa.cc</RouterLink>
      <nav aria-label="Main navigation">
        <a href="/">Home</a>
        <a href="/blogs/">Blog</a>
        <a href="https://github.com/mimifuwacc">GitHub</a>
      </nav>
    </header>
    <main><RouterView /></main>
    <footer>© mimifuwa.cc</footer>
  </div>
</template>
