import fs from "node:fs/promises";
import path from "node:path";
import ChangelogClient from "./ChangelogClient";

type ChangeSection = {
  title: string;
  items: string[];
};

type Release = {
  version: string;
  date?: string;
  sections: ChangeSection[];
};

async function readChangelog(): Promise<string> {
  const repoRoot = path.resolve(process.cwd(), "..");
  const changelogPath = path.join(repoRoot, "CHANGELOG.md");
  return fs.readFile(changelogPath, "utf8");
}

function parseChangelog(markdown: string): Release[] {
  const lines = markdown.split(/\r?\n/);
  const releases: Release[] = [];

  let current: Release | null = null;
  let currentSection: ChangeSection | null = null;

  const commitLinkRegex = /\s+\([^)]+\)\s*$/; // strip (link) at end

  for (const rawLine of lines) {
    const line = rawLine.trim();
    // Release header: "# 1.0.0 (YYYY-MM-DD)" or "## [1.6.1] (YYYY-MM-DD)"
    const releaseMatch =
      line.match(/^#{1,2}\s*\[?(\d+\.\d+\.\d+)\]?(?:\s*\(([^)]+)\))?/) || null;
    if (releaseMatch) {
      if (current) {
        releases.push(current);
      }
      current = {
        version: releaseMatch[1],
        date: releaseMatch[2],
        sections: [],
      };
      currentSection = null;
      continue;
    }

    // Section header: "### Features" / "### Bug Fixes" / etc.
    const sectionMatch = line.match(/^###\s+(.+)/);
    if (sectionMatch && current) {
      currentSection = { title: sectionMatch[1], items: [] };
      current.sections.push(currentSection);
      continue;
    }

    // List item: "* something"
    if (line.startsWith("* ") && currentSection) {
      // remove trailing "(link)"
      const cleaned = line.slice(2).replace(commitLinkRegex, "").trim();
      currentSection.items.push(cleaned);
      continue;
    }
  }

  if (current) {
    releases.push(current);
  }

  return releases;
}

export default async function Home() {
  const md = await readChangelog();
  const releases = parseChangelog(md);

  return <ChangelogClient releases={releases} />;
}
