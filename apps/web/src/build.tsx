import { cp, mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";

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
import highlightStyles from "highlight.js/styles/github.css?raw";

const styles = `${globalStyles.replace('@import "highlight.js/styles/github.css";', "")}\n${highlightStyles}\n${blogStyles}`;

const outputRoot = resolve(process.env.MIMIFUWACC_WEB_OUTPUT_ROOT ?? "dist");
const uuid = "fa6c2a8f-27b1-4611-a0f5-19b0d6c20612";

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
        </nav>
      </div>
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
        <button className="session-copy" data-copy-uuid type="button">
          <span data-uuid>{uuid}</span>
        </button>
      </div>
      <div className="footer-links">
        <nav aria-label="フッターナビゲーション">
          <a href="/">Home</a>
          <a href="/blogs">Blog</a>
          <a href="/links">Links</a>
        </nav>
        <div className="social-links">
          <a href="https://github.com/mimifuwacc" rel="me noopener noreferrer" target="_blank">
            GitHub
          </a>
          <a href="https://twitter.com/mimifuwacc" rel="me noopener noreferrer" target="_blank">
            Twitter
          </a>
          <a href="mailto:mail@mimifuwa.cc">Mail</a>
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
          __html: `document.querySelectorAll('[data-copy-uuid]').forEach((b)=>b.addEventListener('click',()=>navigator.clipboard?.writeText('${uuid}')));`,
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
    <div className="blog-card-image" />
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
        <time>{textOf(article.frontmatter.date)}</time>
      </div>
    </div>
  </a>
);

const Home = ({ articles }: { articles: ArticleSource[] }) => (
  <>
    <section className="hero">
      <div className="hero-inner">
        <h1>
          <span>mimifuwa.cc</span>
        </h1>
        <button className="session-copy hero-session" data-copy-uuid type="button">
          {uuid}
        </button>
      </div>
    </section>
    <div className="home-sheet">
      <Section title="About Me" subtitle="mimifuwacc について...">
        <div className="about-grid">
          <div className="card-stack">
            <article className="card content-card profile-card">
              <h2>mimifuwacc</h2>
              <p>電気通信大学 情報理工学域 コンピュータサイエンスプログラム</p>
              <p>Webアプリケーションエンジニア．大学ではアセンブリの形式検証に取り組んでいます．</p>
            </article>
            <article className="card content-card">
              <h2>Certifications</h2>
              <ul className="plain-list">
                {certifications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="card content-card">
              <h2>Skills</h2>
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
              <h2>Hobby</h2>
              <div className="hobbies">
                {hobbies.map((hobby) => (
                  <div key={hobby.name}>
                    <h3>{hobby.name}</h3>
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
            <h2>Timeline</h2>
            <div className="timeline">
              {timelineData.map((event) => (
                <div className="timeline-event" key={`${event.date}-${event.title}`}>
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
        <div className="works-grid">
          {works.map((work) => (
            <a
              className="card work-card"
              href={work.url}
              target="_blank"
              rel="noopener noreferrer"
              key={work.title}
            >
              <div>
                <h2>{work.title}</h2>
                <p>{work.description}</p>
              </div>
            </a>
          ))}
        </div>
      </Section>
      <Section title="Blogs" subtitle="主に趣味について書いています">
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
};

const main = async () => {
  const articles = await loadArticles({ visibility: "published" });
  for (const article of await loadArticles()) assertArticleStatus(article);
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
    await writePage(
      articleSlug(article),
      html(
        <Layout path={`/${articleSlug(article)}`} title={`${titleOf(article)} | mimifuwa.cc`}>
          <Article article={article} html={rendered.html} headings={rendered.headings} />
        </Layout>,
      ),
    );
  }
};

await main();
