import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { compileFunction } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../src/services/SessionService.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function createSessionService(fetchMock) {
  const exports = {};
  const requireMock = (name) => {
    assert.equal(name, "./api");
    return { API_BASE_URL: "https://api.example.test" };
  };
  const windowMock = { location: { origin: "https://frontend.example.test" } };
  compileFunction(compiled, ["require", "exports", "fetch", "window"])(
    requireMock, exports, fetchMock, windowMock,
  );
  return exports;
}

test("checks the session with the backend using the bearer header and abort signal", async () => {
  const signal = new AbortController().signal;
  const { validateSession } = createSessionService(async (url, options) => {
    assert.equal(url, "https://api.example.test/api/v1/users/me");
    assert.equal(options.headers.Authorization, "Bearer test-token");
    assert.equal(options.cache, "no-store");
    assert.equal(options.signal, signal);
    return Response.json({ id: 1, name: "Test User" });
  });

  assert.equal(await validateSession("test-token", signal), true);
});

test("treats unauthorized and forbidden responses as an invalid session", async () => {
  for (const status of [401, 403]) {
    const { validateSession } = createSessionService(async () => new Response(null, { status }));
    assert.equal(await validateSession("test-token", new AbortController().signal), false);
  }
});

test("does not confuse a server error or HTML fallback with an invalid token", async () => {
  for (const response of [
    new Response(null, { status: 503 }),
    new Response("<html>Starting</html>", { headers: { "Content-Type": "text/html" } }),
  ]) {
    const { validateSession } = createSessionService(async () => response);
    await assert.rejects(validateSession("test-token", new AbortController().signal), /Could not verify/);
  }
});

test("returns to the requested private page or resumes a saved wallet invitation", () => {
  const { getPostLoginPath } = createSessionService();
  assert.equal(getPostLoginPath("/transactions?wallet=1#history", null), "/transactions?wallet=1#history");
  assert.equal(getPostLoginPath(undefined, "/wallet-invitations/test-id"), "/wallet-invitations/test-id");
  assert.equal(getPostLoginPath(undefined, null), "/home");
});

test("rejects redirect destinations outside the frontend", () => {
  const { getPostLoginPath } = createSessionService();
  for (const destination of [
    "https://external.example.test",
    "//external.example.test",
    String.raw`/\external.example.test`,
    "/%2e%2e//external.example.test",
  ]) {
    assert.equal(getPostLoginPath(destination, null), "/home");
  }
});
