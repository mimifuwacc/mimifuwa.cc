import fs from "node:fs";
import path from "node:path";
import parser from "@/lib/parser";

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), "src/contents");
  const filenames = await fs.promises.readdir(postsDirectory);

  return filenames
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => ({
      slug: filename.replace(/\.md$/, ""),
    }));
}

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const postPath = path.join(
    process.cwd(),
    "src/contents/",
    `${params.slug}.md`,
  );
  const fileContent = await fs.promises.readFile(postPath, "utf8");
  const parsed = await parser(fileContent);

  return (
    <div className="prose mx-auto">
      <h1 className="text-2xl font-bold text-blue-500">
        {parsed.frontmatter.title || params.slug}
      </h1>
      {parsed.content}
    </div>
  );
}
