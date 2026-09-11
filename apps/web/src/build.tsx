import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";

import {
  formatTweetDate,
  formatTweetMetric,
  splitArticleHtml,
  tweetTextParts,
  type TwitterEmbed,
  visibleTweetText,
} from "@mimifuwacc/blog-ui";
import {
  articleSlug,
  assertArticleStatus,
  loadArticles,
  renderArticle,
  type ArticleSource,
} from "../../../packages/cli/src/content";
import { certifications, hobbies, timelineData } from "../../../contents/about";
import { allSkills } from "../../../contents/skills";
import { links } from "../../../contents/links";
import { works } from "../../../contents/works";
import globalStyles from "./styles/global.css?raw";
import blogStyles from "@mimifuwacc/blog-ui/styles.css?raw";
import { actionButton } from "./styles/vanilla.css";

const vanillaStyles = `.${actionButton} {
  appearance: none;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  padding: 0.35rem 0.6rem;
}
.${actionButton}:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}`;

const styles = `${globalStyles}\n${blogStyles}\n${vanillaStyles}`;

const outputRoot = resolve(process.env.MIMIFUWACC_WEB_OUTPUT_ROOT ?? "dist");
const uuid = "fa6c2a8f-27b1-4611-a0f5-19b0d6c20612";

const Icon = ({ name, className = "icon" }: { name: string; className?: string }) => {
  const paths: Record<string, ReactNode> = {
    arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
    arrowUpRight: <path d="M7 17 17 7M7 7h10v10" />,
    award: <path d="m12 15 3.5 5-3.5-1-3.5 1 3.5-5Zm5-6A5 5 0 1 1 7 9a5 5 0 0 1 10 0Z" />,
    badgeCheck: <path d="m9 12 2 2 4-4m5 2a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    copy: (
      <>
        <rect x="9" y="9" width="10" height="10" rx="1" />
        <path d="M5 15V5a1 1 0 0 1 1-1h10" />
      </>
    ),
    externalLink: (
      <>
        <path d="M14 5h5v5M19 5l-8 8" />
        <path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />,
    smile: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </>
    ),
    wrench: (
      <path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L4 17a2 2 0 1 0 3 3l5.5-5.5a4 4 0 0 0 5.2-5.2L15 11l-3-3 2.7-1.7Z" />
    ),
    x: <path d="m6 6 12 12M18 6 6 18" />,
  };
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};

const BrandIcon = ({ name }: { name: string }) => (
  <span className="brand-icon" aria-hidden="true">
    {name === "zenn" ? "Z" : name === "twitter" ? "𝕏" : "⌘"}
  </span>
);

const workImage = (url: string, image?: string) => {
  if (image?.startsWith("/")) return image;
  if (image) return image;
  const match = url.match(/github\.com\/([^/]+)\/([^/?]+)/);
  return match ? `https://opengraph.githubassets.com/1/${match[1]}/${match[2]}` : undefined;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

type OgpData = { title?: string; description?: string; image?: string };
type OgpCache = Record<string, { fetchedAt: number; data: OgpData }>;
const ogpCachePath = resolve(process.env.MIMIFUWACC_OGP_CACHE ?? ".mimifuwacc-cache/ogp.json");
const ogpCacheTtl = 7 * 24 * 60 * 60 * 1000;

const loadOgpCache = async (): Promise<OgpCache> => {
  try {
    return JSON.parse(await readFile(ogpCachePath, "utf8")) as OgpCache;
  } catch {
    return {};
  }
};

const saveOgpCache = async (cache: OgpCache) => {
  await mkdir(resolve(ogpCachePath, ".."), { recursive: true });
  await writeFile(ogpCachePath, `${JSON.stringify(cache, null, 2)}\n`);
};

const renderStaticTweet = (id: string, tweet?: TwitterEmbed) => {
  const url = tweet?.url ?? `https://x.com/i/web/status/${id}`;
  if (!tweet) {
    return `<a class="ox-tweet cached-tweet cached-tweet-missing" href="${url}" target="_blank" rel="noopener noreferrer"><strong>ポストを X で表示</strong><small>埋め込みを取得できませんでした</small></a>`;
  }
  const text = visibleTweetText(tweet);
  const textHtml = tweetTextParts(text)
    .map((part) =>
      part.href
        ? `<a href="${escapeHtml(part.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(part.value)}</a>`
        : escapeHtml(part.value),
    )
    .join("");
  const mediaHtml = tweet.media.length
    ? `<div class="cached-tweet-media cached-tweet-media-${Math.min(tweet.media.length, 4)}${tweet.media.length > 1 ? " cached-tweet-media-grid" : ""}">${tweet.media
        .slice(0, 4)
        .map(
          (media) =>
            `<img src="${escapeHtml(media.url)}" alt="${escapeHtml(media.alt)}" loading="lazy">`,
        )
        .join("")}</div>`
    : "";
  const linkHtml = tweet.linkCard
    ? `<a class="cached-tweet-link-card" href="${escapeHtml(tweet.linkCard.url)}" target="_blank" rel="noopener noreferrer">${tweet.linkCard.imageUrl ? `<img src="${escapeHtml(tweet.linkCard.imageUrl)}" alt="${escapeHtml(tweet.linkCard.imageAlt ?? "")}" loading="lazy">` : ""}<span class="cached-tweet-link-card-content">${tweet.linkCard.domain ? `<small>${escapeHtml(tweet.linkCard.domain)}</small>` : ""}<strong>${escapeHtml(tweet.linkCard.title)}</strong>${tweet.linkCard.description ? `<span>${escapeHtml(tweet.linkCard.description)}</span>` : ""}</span></a>`
    : "";
  return `<figure class="ox-tweet ox-tweet--fetched ox-tweet--full cached-tweet" data-tweet-id="${id}"><header class="cached-tweet-header">${tweet.author.avatarUrl ? `<img class="cached-tweet-avatar" src="${escapeHtml(tweet.author.avatarUrl)}" alt="" width="48" height="48" loading="lazy">` : ""}<div class="cached-tweet-author"><strong>${escapeHtml(tweet.author.name)}</strong><span>@${escapeHtml(tweet.author.username)}</span></div><a class="cached-tweet-brand" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="View on X">𝕏</a></header>${textHtml ? `<p class="cached-tweet-text">${textHtml}</p>` : ""}${linkHtml}${mediaHtml}<footer class="cached-tweet-footer"><time datetime="${tweet.createdAt ?? ""}">${tweet.createdAt ? escapeHtml(formatTweetDate(tweet.createdAt) ?? "") : ""}</time><span class="cached-tweet-metrics"><span>返信 ${formatTweetMetric(tweet.metrics.replies)}</span><span>RT ${formatTweetMetric(tweet.metrics.retweets)}</span><span>♡ ${formatTweetMetric(tweet.metrics.likes)}</span></span><a href="${url}" target="_blank" rel="noopener noreferrer">X で表示</a></footer></figure>`;
};

const hydrateLinkCards = async (html: string, cache: OgpCache) => {
  const pattern = /<a class="embedded-link-card"[^>]*data-ogp-url="([^"]+)"[^>]*>[\s\S]*?<\/a>/g;
  let result = html;
  const matches = [...html.matchAll(pattern)];
  for (const match of matches) {
    const sourceUrl = match[1];
    try {
      const cached = cache[sourceUrl];
      let ogp = cached && Date.now() - cached.fetchedAt < ogpCacheTtl ? cached.data : undefined;
      if (!ogp) {
        const response = await fetch(
          `https://api.mimifuwa.cc/ogp?url=${encodeURIComponent(sourceUrl)}`,
        );
        if (!response.ok) continue;
        ogp = (await response.json()) as OgpData;
        cache[sourceUrl] = { fetchedAt: Date.now(), data: ogp };
      }
      let card = match[0];
      if (ogp.title) {
        card = card.replace(
          /(<strong class="embedded-link-title">)[^<]*(<\/strong>)/,
          `$1${escapeHtml(ogp.title)}$2`,
        );
      }
      if (ogp.description) {
        card = card.replace(
          /<small class="embedded-link-description" hidden><\/small>/,
          `<small class="embedded-link-description">${escapeHtml(ogp.description)}</small>`,
        );
      }
      if (ogp.image) {
        card = card.replace(
          /<span class="embedded-link-image" hidden><img alt="" loading="lazy"><\/span>/,
          `<span class="embedded-link-image"><img alt="${escapeHtml(ogp.title ?? "")}" loading="lazy" src="${escapeHtml(ogp.image)}"></span>`,
        );
      }
      result = result.replace(match[0], card);
    } catch {
      // Keep the parser's hostname-only card when OGP is unavailable.
    }
  }
  return result;
};

const renderArticleBody = async (html: string, cache: OgpCache) => {
  const parts = splitArticleHtml(html);
  const tweets = new Map<string, TwitterEmbed | undefined>();
  await Promise.all(
    parts
      .filter((part): part is { kind: "twitter"; id: string } => part.kind === "twitter")
      .map(async ({ id }) => {
        try {
          const response = await fetch(`https://api.mimifuwa.cc/embeds/twitter/${id}`);
          tweets.set(id, response.ok ? ((await response.json()) as TwitterEmbed) : undefined);
        } catch {
          tweets.set(id, undefined);
        }
      }),
  );
  const body = parts
    .map((part) =>
      part.kind === "twitter" ? renderStaticTweet(part.id, tweets.get(part.id)) : part.value,
    )
    .join("");
  return hydrateLinkCards(body, cache);
};

const titleOf = (article: ArticleSource) =>
  typeof article.frontmatter.title === "string" ? article.frontmatter.title : articleSlug(article);

const textOf = (value: unknown) =>
  value === undefined || value === null
    ? ""
    : typeof value === "string" || typeof value === "number"
      ? String(value)
      : JSON.stringify(value);

const Header = ({ path }: { path: string }) => {
  const nav = [
    ["/", "Home"],
    ["/blogs", "Blog"],
    ["/links", "Links"],
  ] as const;
  return (
    <header className="site-header">
      <div className="header-inner container-wide">
        <a href="/" className="brand">
          mimifuwa.cc
        </a>
        <nav className="desktop-nav" aria-label="メインナビゲーション">
          {nav.map(([href, label]) => (
            <a
              href={href}
              aria-current={
                path === href || (href !== "/" && path.startsWith(`${href}/`)) ? "page" : undefined
              }
              key={href}
            >
              {label}
            </a>
          ))}
          <button
            className="icon-button theme-toggle"
            type="button"
            aria-label="テーマを切り替える"
          >
            <Icon name="moon" className="icon theme-moon" />
            <Icon name="sun" className="icon theme-sun" />
          </button>
        </nav>
        <div className="mobile-actions">
          <button
            className="icon-button theme-toggle"
            type="button"
            aria-label="テーマを切り替える"
          >
            <Icon name="moon" className="icon theme-moon" />
            <Icon name="sun" className="icon theme-sun" />
          </button>
          <button
            className="icon-button menu-toggle"
            type="button"
            aria-label="メニューを開く"
            aria-expanded="false"
          >
            <Icon name="menu" className="icon menu-open-icon" />
            <Icon name="x" className="icon menu-close-icon" />
          </button>
        </div>
      </div>
      <nav className="mobile-nav container-wide" aria-label="モバイルナビゲーション" hidden>
        {nav.map(([href, label]) => (
          <a
            href={href}
            aria-current={
              path === href || (href !== "/" && path.startsWith(`${href}/`)) ? "page" : undefined
            }
            key={href}
          >
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
};

const Footer = () => (
  <footer className="site-footer">
    <div className="container-wide footer-inner">
      <div>
        <a href="/" className="footer-brand">
          mimifuwa.cc
        </a>
        <button
          className={`session-copy ${actionButton}`}
          type="button"
          data-copy-uuid
          aria-label="UUID をコピー"
        >
          <span data-uuid>{uuid}</span>
          <Icon name="copy" className="icon copy-icon" />
          <Icon name="check" className="icon check-icon" />
        </button>
      </div>
      <div className="footer-links">
        <nav aria-label="フッターナビゲーション">
          <a href="/">Home</a>
          <a href="/blogs">Blog</a>
          <a href="/links">Links</a>
        </nav>
        <div className="social-links">
          <a
            href="https://github.com/mimifuwacc"
            rel="me noopener noreferrer"
            target="_blank"
            aria-label="GitHub"
          >
            <BrandIcon name="github" />
          </a>
          <a
            href="https://twitter.com/mimifuwacc"
            rel="me noopener noreferrer"
            target="_blank"
            aria-label="Twitter"
          >
            <BrandIcon name="twitter" />
          </a>
          <a href="mailto:mail@mimifuwa.cc" aria-label="Email">
            <Icon name="mail" />
          </a>
        </div>
      </div>
    </div>
    <p className="container-wide copyright">© {new Date().getFullYear()} mimifuwa.cc</p>
  </footer>
);

const Layout = ({
  title = "mimifuwa.cc",
  description = "mimifuwacc のポートフォリオとブログ",
  path,
  children,
}: {
  title?: string;
  description?: string;
  path: string;
  children: ReactNode;
}) => (
  <html lang="ja">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <title>{title}</title>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
    </head>
    <body>
      <div className="page-shell">
        <Header path={path} />
        <main>{children}</main>
        <Footer />
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `(()=>{const d=document.documentElement;const saved=localStorage.getItem('theme');if(saved==='dark'||(!saved&&matchMedia('(prefers-color-scheme: dark)').matches))d.classList.add('dark');document.querySelectorAll('.theme-toggle').forEach(b=>b.addEventListener('click',()=>{d.classList.toggle('dark');localStorage.setItem('theme',d.classList.contains('dark')?'dark':'light')}));const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.mobile-nav');menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));if(nav)nav.hidden=!open});document.querySelectorAll('[data-copy-uuid]').forEach((b)=>b.addEventListener('click',async()=>{await navigator.clipboard?.writeText('${uuid}');b.setAttribute('data-copied','true');setTimeout(()=>b.removeAttribute('data-copied'),1200)}));const p=document.querySelector('[data-parallax]');if(p&&!matchMedia('(prefers-reduced-motion: reduce)').matches)addEventListener('scroll',()=>{p.style.transform='translateY('+(-Math.min(scrollY,400)*.15)+'px)'},{passive:true});document.querySelectorAll('[data-ogp-url]').forEach(async c=>{try{const r=await fetch('https://api.mimifuwa.cc/ogp?url='+encodeURIComponent(c.dataset.ogpUrl||''));if(!r.ok)return;const o=await r.json();const t=c.querySelector('.embedded-link-title'),d=c.querySelector('.embedded-link-description'),i=c.querySelector('.embedded-link-image'),m=i?.querySelector('img');if(t&&o.title)t.textContent=o.title;if(d&&o.description){d.textContent=o.description;d.hidden=false}if(i&&m&&o.image){m.src=o.image;m.alt=o.title||'';i.hidden=false}}catch{}})})();`,
        }}
      />
    </body>
  </html>
);

const Section = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) => (
  <section className="section">
    <div className="container">
      <header className="section-heading">
        <h1>{title}</h1>
        <div className="heading-rule" />
        <p>{subtitle}</p>
      </header>
      {children}
    </div>
  </section>
);

const BlogCard = ({ article }: { article: ArticleSource }) => (
  <a href={`/${articleSlug(article)}`} className="blog-card card">
    <div className="blog-card-image">
      <img
        src={`https://api.mimifuwa.cc/og/${articleSlug(article).replace(/^blogs\//, "")}`}
        alt={titleOf(article)}
        loading="lazy"
      />
    </div>
    <div className="blog-card-body">
      <p>{textOf(article.frontmatter.excerpt)}</p>
      <div className="blog-card-meta">
        <div className="badges">
          {Array.isArray(article.frontmatter.tags) &&
            article.frontmatter.tags.slice(0, 3).map((tag) => (
              <span className="badge" key={String(tag)}>
                #{String(tag)}
              </span>
            ))}
        </div>
        <time dateTime={textOf(article.frontmatter.date)}>{textOf(article.frontmatter.date)}</time>
      </div>
    </div>
  </a>
);

const Home = ({ articles }: { articles: ArticleSource[] }) => (
  <>
    <section className="hero">
      <div className="hero-inner" data-parallax>
        <img
          className="hero-avatar"
          src="/mimifuwacc.png"
          alt="mimifuwacc"
          width="128"
          height="128"
        />
        <div>
          <h1>
            <span>mimifuwa.cc</span>
          </h1>
          <button
            className={`session-copy hero-session ${actionButton}`}
            type="button"
            data-copy-uuid
            aria-label="UUID をコピー"
          >
            <span data-uuid>{uuid}</span>
            <Icon name="copy" className="icon copy-icon" />
            <Icon name="check" className="icon check-icon" />
          </button>
        </div>
      </div>
    </section>
    <div className="home-sheet">
      <div className="sheet-handle" />
      <Section title="About Me" subtitle="mimifuwacc について...">
        <div className="about-grid">
          <div className="card-stack">
            <article className="card content-card profile-card">
              <div className="profile-heading">
                <img src="/mimifuwacc.png" alt="mimifuwacc" width="64" height="64" />
                <div>
                  <h2>
                    mimifuwacc <small>ˈmiːmi</small>
                  </h2>
                  <p>
                    電気通信大学 情報理工学域
                    <br />
                    コンピュータサイエンスプログラム
                  </p>
                </div>
              </div>
              <hr />
              <p>
                Webアプリケーションエンジニア．大学ではアセンブリの形式検証に取り組んでいます．ヰ世界情緒とラノベが好き．
              </p>
              <div className="button-row">
                <a
                  className="pill-button profile-link"
                  href="https://github.com/mimifuwacc"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BrandIcon name="github" /> GitHub
                </a>
                <a
                  className="pill-button profile-link"
                  href="https://twitter.com/mimifuwacc"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BrandIcon name="twitter" /> Twitter
                </a>
                <a
                  className="pill-button profile-link"
                  href="https://zenn.dev/mimifuwacc"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BrandIcon name="zenn" /> Zenn
                </a>
              </div>
            </article>
            <article className="card content-card">
              <h2>
                <Icon name="award" /> Certifications
              </h2>
              <hr />
              <ul className="plain-list">
                {certifications.map((item) => (
                  <li key={item}>
                    <Icon name="badgeCheck" /> {item}
                  </li>
                ))}
              </ul>
            </article>
            <article className="card content-card">
              <h2>
                <Icon name="wrench" /> Skills
              </h2>
              <hr />
              <div className="skills">
                {allSkills.map((skill) => (
                  <img
                    src={skill.image}
                    alt={skill.name}
                    title={skill.name}
                    width="28"
                    height="28"
                    loading="lazy"
                    key={skill.name}
                  />
                ))}
              </div>
            </article>
            <article className="card content-card">
              <h2>
                <Icon name="smile" /> Hobby
              </h2>
              <hr />
              <div className="hobbies">
                {hobbies.map((hobby) => (
                  <div key={hobby.name}>
                    <h3>
                      <Icon name="chevronRight" /> {hobby.name}
                    </h3>
                    {hobby.items && (
                      <div className="badges">
                        {hobby.items.map((item) => (
                          <span className="badge badge-outline" key={item}>
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </article>
          </div>
          <article className="card content-card timeline-card">
            <h2>
              <Icon name="clock" /> Timeline
            </h2>
            <hr />
            <div className="timeline">
              {timelineData.map((event) => (
                <div className="timeline-event" key={`${event.date}-${event.title}`}>
                  <span className="timeline-dot" aria-hidden="true" />
                  <span className="badge badge-outline">{event.date}</span>
                  <h3>{event.title}</h3>
                  {event.description && <p>{event.description}</p>}
                </div>
              ))}
            </div>
          </article>
        </div>
      </Section>
      <Section title="Works" subtitle="作成したアプリ・サービスなど">
        <a
          className="section-link"
          href="https://github.com/mimifuwacc"
          target="_blank"
          rel="noopener noreferrer"
        >
          <BrandIcon name="github" /> 他のプロジェクトを見る <Icon name="arrowUpRight" />
        </a>
        <div className="works-grid">
          {works.map((work) => (
            <a
              className="card work-card"
              href={work.url}
              target="_blank"
              rel="noopener noreferrer"
              key={work.title}
            >
              {workImage(work.url, work.image) && (
                <img src={workImage(work.url, work.image)} alt={work.title} loading="lazy" />
              )}
              <div>
                <h2>
                  {work.title} <Icon name="externalLink" />
                </h2>
                <p>{work.description}</p>
              </div>
            </a>
          ))}
        </div>
      </Section>
      <Section title="Blogs" subtitle="主に趣味について書いています">
        <a className="section-link" href="/blogs">
          すべての記事を見る <Icon name="arrowRight" />
        </a>
        <div className="blog-grid">
          {articles.slice(0, 6).map((article) => (
            <BlogCard article={article} key={articleSlug(article)} />
          ))}
        </div>
      </Section>
    </div>
  </>
);

const Blogs = ({ articles }: { articles: ArticleSource[] }) => (
  <Section title="Blogs" subtitle="主に趣味について書いています">
    <div className="blog-grid">
      {articles.map((article) => (
        <BlogCard article={article} key={articleSlug(article)} />
      ))}
    </div>
  </Section>
);
const Links = () => (
  <Section title="Links" subtitle="知り合いのオタクのサイトたちです">
    <div className="links-list">
      {links.map((link) => (
        <a
          className="card link-card"
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          key={link.url}
        >
          <strong>{link.name}</strong>
          <small>{new URL(link.url).hostname.replace("www.", "")}</small>
          <p>{link.description}</p>
        </a>
      ))}
    </div>
  </Section>
);

const NotFound = () => (
  <Section title="404" subtitle="お探しのページは存在しません">
    <a className="pill-button" href="/">
      ホームへ戻る
    </a>
  </Section>
);

const Article = ({
  article,
  html,
  headings,
}: {
  article: ArticleSource;
  html: string;
  headings: { id: string; text: string; level: number }[];
}) => (
  <div className="article-page container">
    <header className="article-header">
      <h1>{titleOf(article)}</h1>
      <time>{textOf(article.frontmatter.date)}</time>
      <div className="badges">
        {Array.isArray(article.frontmatter.tags) &&
          article.frontmatter.tags.map((tag) => (
            <span className="badge" key={String(tag)}>
              #{String(tag)}
            </span>
          ))}
      </div>
    </header>
    <div className="article-layout">
      <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      {headings.length > 0 && (
        <aside className="desktop-toc">
          <nav className="card" aria-label="目次">
            <strong>目次</strong>
            {headings.map((heading) => (
              <a
                href={`#${heading.id}`}
                className={heading.level === 3 ? "toc-child" : undefined}
                key={heading.id}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </aside>
      )}
    </div>
  </div>
);

const html = (node: ReactNode) => `<!doctype html>${renderToStaticMarkup(node)}`;

const writePage = async (path: string, value: string) => {
  const target = join(outputRoot, path, "index.html");
  await mkdir(resolve(target, ".."), { recursive: true });
  await writeFile(target, value);
  // Vite preview falls back to the root document for `/blogs` instead of
  // resolving `/blogs/index.html`; keep a flat alias so extensionless routes
  // behave the same locally and on a static host.
  await mkdir(resolve(outputRoot, path, ".."), { recursive: true });
  await writeFile(join(outputRoot, `${path}.html`), value);
};

const main = async () => {
  const articles = await loadArticles({ visibility: "published" });
  const ogpCache = await loadOgpCache();
  for (const article of await loadArticles()) assertArticleStatus(article);
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  await writeFile(join(outputRoot, "styles.css"), styles);
  await cp(resolve("public"), join(outputRoot, "public"), { recursive: true, force: true }).catch(
    () => undefined,
  );
  await writeFile(
    join(outputRoot, "index.html"),
    html(
      <Layout path="/">
        <Home articles={articles} />
      </Layout>,
    ),
  );
  await writeFile(
    join(outputRoot, "404.html"),
    html(
      <Layout path="/404" title="ページが見つかりません | mimifuwa.cc">
        <NotFound />
      </Layout>,
    ),
  );
  await writePage(
    "blogs",
    html(
      <Layout path="/blogs" title="Blogs | mimifuwa.cc">
        <Blogs articles={articles} />
      </Layout>,
    ),
  );
  await writePage(
    "links",
    html(
      <Layout path="/links" title="Links | mimifuwa.cc">
        <Links />
      </Layout>,
    ),
  );
  for (const article of articles) {
    const rendered = await renderArticle(article);
    const articleHtml = await renderArticleBody(rendered.html, ogpCache);
    await writePage(
      articleSlug(article),
      html(
        <Layout path={`/${articleSlug(article)}`} title={`${titleOf(article)} | mimifuwa.cc`}>
          <Article article={article} html={articleHtml} headings={rendered.headings} />
        </Layout>,
      ),
    );
  }
  await saveOgpCache(ogpCache);
};

await main();
