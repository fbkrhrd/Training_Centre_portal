import { spawnSync } from "node:child_process";
import path from "node:path";

const projectRoot = process.cwd();
const result = spawnSync(
  process.execPath,
  [
    path.join(projectRoot, "node_modules", "eslint", "bin", "eslint.js"),
    ...process.argv.slice(2),
  ],
  {
    cwd: projectRoot,
    env: {
      ...process.env,
      NODE_PATH: path.join(projectRoot, "node_modules"),
    },
    stdio: "inherit",
  },
);

process.exit(result.status ?? 1);
