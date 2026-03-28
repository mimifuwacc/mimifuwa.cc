import { execSync } from "node:child_process";
import path from "node:path";
import { glob } from "glob";

const migrationsDir = path.resolve(process.cwd(), "db/migrations");
const isRemote = process.argv.includes("--remote");
const isAll = process.argv.includes("--all");

function getChangedFiles(): Set<string> {
  try {
    const isCI = process.env.CI === "true";

    if (isCI) {
      // CIでは origin/main...HEAD で差分を取得
      execSync("git fetch origin main --depth=1", {
        encoding: "utf-8",
        stdio: "ignore",
      });
      const result = execSync("git diff --name-only origin/main...HEAD", {
        encoding: "utf-8",
      });
      const files = result
        .trim()
        .split("\n")
        .filter((f) => f);
      return new Set(files);
    } else {
      // ローカルでは HEAD~1...HEAD
      const result = execSync("git diff --name-only HEAD~1...HEAD", {
        encoding: "utf-8",
      });
      const files = result
        .trim()
        .split("\n")
        .filter((f) => f);
      return new Set(files);
    }
  } catch {
    // エラー（初回など）は全ファイル実行
    return new Set();
  }
}

async function main() {
  const changedFiles = getChangedFiles();

  // すべてのマイグレーションファイルを取得（昇順）
  const files = await glob("*.sql", { cwd: migrationsDir });
  files.sort();

  // 変更されたファイル、または初回/--allの場合は全ファイル
  const filesToRun =
    isAll || changedFiles.size === 0
      ? files
      : files.filter((f) => changedFiles.has(`db/migrations/${f}`));

  if (filesToRun.length === 0) {
    console.log("No new migrations to run.");
    return;
  }

  console.log(
    `Running ${filesToRun.length} migration(s): ${filesToRun.join(", ")}`,
  );

  const localFlag = isRemote ? "--remote" : "--local";

  for (const file of filesToRun) {
    const filePath = path.join(migrationsDir, file);
    console.log(`Applying ${file}...`);

    try {
      execSync(
        `wrangler d1 execute mimifuwacc-blogs ${localFlag} --file="${filePath}"`,
        { encoding: "utf-8" },
      );
      console.log(`✓ ${file} applied`);
    } catch (error) {
      console.error(`✗ Failed to apply ${file}:`, error);
      process.exit(1);
    }
  }

  console.log("\nMigrations complete!");
}

main().catch((error) => {
  console.error("Error during migration:", error);
  process.exit(1);
});
