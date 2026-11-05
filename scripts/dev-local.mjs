// Run HomeHunt on your own computer (Windows, macOS or Linux):
//   npx pnpm@10 run dev:local
// Loads settings from the repo-root .env, builds and starts the API on
// API_PORT (default 8080), and starts the website on WEB_PORT (default 5173)
// with /api forwarded to the API.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(root, ".env");
if (!existsSync(envFile)) {
  console.error("Missing .env — copy .env.example to .env and fill it in.");
  process.exit(1);
}
process.loadEnvFile(envFile);

for (const key of ["DATABASE_URL", "CLERK_SECRET_KEY", "VITE_CLERK_PUBLISHABLE_KEY"]) {
  const v = process.env[key] ?? "";
  if (!v || v.includes("xxx") || v.includes("PUT-YOUR-PASSWORD-HERE")) {
    console.error(`.env: ${key} is not filled in yet.`);
    process.exit(1);
  }
}

const apiPort = process.env.API_PORT || "8080";
const webPort = process.env.WEB_PORT || "5173";
const children = [];

function run(name, cmd, args, cwd, env) {
  const child = spawn(cmd, args, {
    cwd: path.join(root, cwd),
    env: { ...process.env, ...env },
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  children.push(child);
  child.on("exit", (code) => {
    if (code) console.error(`[${name}] exited with code ${code}`);
  });
  return child;
}

function stopAll() {
  for (const c of children) c.kill();
  process.exit(0);
}
process.on("SIGINT", stopAll);
process.on("SIGTERM", stopAll);

const build = run("api build", "node", ["./build.mjs"], "artifacts/api-server", {});
build.on("exit", (code) => {
  if (code) process.exit(code);
  run("api", "node", ["--enable-source-maps", "./dist/index.mjs"], "artifacts/api-server", {
    NODE_ENV: "development",
    PORT: apiPort,
  });
  run("web", "npx", ["vite", "--config", "vite.config.ts", "--host", "localhost"], "artifacts/homehunt", {
    PORT: webPort,
    BASE_PATH: "/",
    API_PORT: apiPort,
  });
  console.log(`\nHomeHunt: http://localhost:${webPort}  (API on port ${apiPort})\n`);
});
