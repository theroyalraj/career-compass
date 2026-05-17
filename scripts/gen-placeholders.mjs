import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(__dirname, "..", "src", "app", "(dashboard)");

const routes = [
  ["timeline", "Timeline", "🧭"],
  ["roadmap", "Roadmap", "🗺️"],
  ["routine", "Routine", "⏱️"],
  ["weekly", "Weekly review", "📅"],
  ["monthly", "Monthly review", "🗓️"],
  ["quarterly", "Quarterly review", "📊"],
  ["annual", "Annual review", "🎯"],
  ["learning", "Learning", "📚"],
  ["projects", "Projects", "🛠️"],
  ["network", "Network CRM", "🤝"],
  ["outreach", "Outreach templates", "✉️"],
  ["resume", "Resume library", "📄"],
  ["cover-letters", "Cover letters", "✍️"],
  ["interview", "Interview prep", "🎙️"],
  ["blog", "Blog pipeline", "✨"],
  ["reading", "Reading list", "📖"],
  ["events", "Events & conferences", "🎪"],
  ["analytics", "Analytics", "📈"],
  ["settings", "Settings", "⚙️"],
  ["visa", "Visa tracker", "🛂"],
  ["relocation", "Relocation", "📦"],
  ["salary", "Salary calculator", "💶"],
  ["col", "Cost of living", "🏙️"],
  ["finance/income", "Income", "⬆️"],
  ["finance/expenses", "Expenses", "⬇️"],
  ["finance/runway", "Runway", "🛬"],
  ["interview/mocks", "Mock interviews", "🗣️"],
  ["interview/system-design", "System design", "🏗️"],
  ["interview/ml", "ML drill", "🧪"],
  ["interview/audio", "Audio drill", "🎚️"],
];

for (const [route, title, emoji] of routes) {
  const dir = path.join(base, ...route.split("/"));
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "page.tsx");
  if (fs.existsSync(file)) continue;
  fs.writeFileSync(
    file,
    `import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export default function Page() {
  return <ModulePlaceholder title="${title}" emoji="${emoji}" />;
}
`,
  );
}

console.log("Generated", routes.length, "placeholder pages");
