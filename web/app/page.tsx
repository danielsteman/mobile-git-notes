import fs from "node:fs/promises";
import path from "node:path";
import { YStack, XStack, H2, H3, Paragraph, Separator } from "tamagui";

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

function sectionColor(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("feature")) return "$green10";
  if (t.includes("fix")) return "$orange10";
  if (t.includes("chore")) return "$gray10";
  if (t.includes("perf")) return "$purple10";
  return "$blue10";
}

export default async function Home() {
  const md = await readChangelog();
  const releases = parseChangelog(md);

  return (
    <YStack padding="$6" gap="$4" backgroundColor="$color1">
      <H2 color="$color11">Changelog</H2>
      <Paragraph color="$color10">
        Visual overview of releases powered by the repository CHANGELOG.
      </Paragraph>
      <Separator marginVertical="$2" />

      <YStack
        borderLeftWidth={2}
        borderColor="$color6"
        paddingLeft="$4"
        gap="$4"
      >
        {releases.map((rel) => (
          <YStack key={rel.version} gap="$3">
            <XStack alignItems="center" gap="$3">
              <YStack
                width={10}
                height={10}
                borderRadius={999}
                backgroundColor="$blue10"
                marginLeft={-5}
              />
              <H3 color="$color11">
                v{rel.version}{" "}
                <Paragraph asChild color="$color10" display="inline">
                  <span>{rel.date ? `• ${rel.date}` : ""}</span>
                </Paragraph>
              </H3>
            </XStack>

            <YStack
              gap="$3"
              backgroundColor="$color2"
              padding="$3"
              borderRadius="$3"
            >
              {rel.sections.map((sec) => (
                <YStack key={sec.title} gap="$2">
                  <XStack
                    alignItems="center"
                    gap="$2"
                    backgroundColor={sectionColor(sec.title)}
                    color="$color1"
                    borderRadius="$2"
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    width="fit-content"
                  >
                    <Paragraph color="$color1" fontWeight="700">
                      {sec.title}
                    </Paragraph>
                  </XStack>
                  <YStack gap="$1">
                    {sec.items.map((item, idx) => (
                      <XStack key={idx} gap="$2" alignItems="flex-start">
                        <Paragraph color="$color10">•</Paragraph>
                        <Paragraph color="$color11">{item}</Paragraph>
                      </XStack>
                    ))}
                  </YStack>
                </YStack>
              ))}
            </YStack>
          </YStack>
        ))}
      </YStack>
    </YStack>
  );
}
