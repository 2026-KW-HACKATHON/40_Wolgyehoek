import { cpSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
for (const file of [".env.local", ".env"]) {
  const path = fileURLToPath(new URL(file, root));
  if (existsSync(path)) process.loadEnvFile(path);
}
const port = process.argv.indexOf("--port");
const host = process.argv.indexOf("--hostname");
if (port >= 0) process.env.PORT = process.argv[port + 1];
if (host >= 0) process.env.HOSTNAME = process.argv[host + 1];
else process.env.HOSTNAME = "127.0.0.1";
const server = new URL(".next/standalone/server.js", root);
if (!existsSync(server)) throw new Error("먼저 pnpm build를 실행해 주세요.");
cpSync(new URL(".next/static/", root), new URL(".next/standalone/.next/static/", root), { recursive: true });
if (existsSync(new URL("public/", root))) cpSync(new URL("public/", root), new URL(".next/standalone/public/", root), { recursive: true });
await import(server.href);
