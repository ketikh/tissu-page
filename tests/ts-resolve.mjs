// Registers a tiny resolver so Node's built-in test runner can import the
// project's TypeScript sources (extension-less relative imports → .ts).
// Usage: node --import ./tests/ts-resolve.mjs --test tests/
import { register } from "node:module";

register(new URL("./ts-resolve-hooks.mjs", import.meta.url));
