// One-off: keep designs A and C, drop B, D, E, rename C -> B.
// Usage: node cook/archive/prune-designs.mjs <css files...>
// Dropped rules are appended to cook/archive/designs-b-d-e/removed-rules.css for reference.
import fs from "node:fs";
import postcss from "../../node_modules/.pnpm/postcss@8.5.33/node_modules/postcss/lib/postcss.js";

const DROP = /data-design(-link)?="[bde]"/;
const removed = [];

for (const file of process.argv.slice(2)) {
  const root = postcss.parse(fs.readFileSync(file, "utf8"), { from: file });
  root.walkRules((rule) => {
    if (!rule.selector.includes("data-design")) return;
    const keep = rule.selectors.filter((s) => !DROP.test(s));
    if (keep.length !== rule.selectors.length) {
      removed.push(`/* ${file} */\n${rule.toString()}`);
      if (!keep.length) {
        let parent = rule.parent;
        rule.remove();
        // Drop @media / @supports blocks left empty.
        while (parent && parent.type === "atrule" && !parent.nodes.length) {
          const up = parent.parent;
          parent.remove();
          parent = up;
        }
        return;
      }
    }
    rule.selectors = keep.map((s) => s.replace(/data-design(-link)?="c"/g, 'data-design$1="b"'));
  });
  fs.writeFileSync(file, root.toString());
}

fs.appendFileSync("cook/archive/designs-b-d-e/removed-rules.css", removed.join("\n\n") + "\n");
console.log(`removed/trimmed ${removed.length} rules`);
