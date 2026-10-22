import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { compileFunction } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../src/services/WalletRealtimeService.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

// Executa o service real com os imports de rede/storage simulados, sem navegador ou API.
function createHarness(initialToken = "test-token") {
  let token = initialToken;
  const calls = [];
  const exports = {};
  const requireMock = (name) => {
    if (name === "@microsoft/fetch-event-source") {
      return {
        fetchEventSource(url, options) {
          calls.push({ url, options });
          return Promise.resolve();
        },
      };
    }
    if (name === "./api") {
      return { API_BASE_URL: "http://localhost:8081", getStoredToken: () => token };
    }
    throw new Error(`Unexpected import: ${name}`);
  };
  compileFunction(compiled, ["require", "exports", "AbortController"])(requireMock, exports, AbortController);
  return {
    subscribe: exports.subscribeToWalletUpdates,
    calls,
    setToken(value) { token = value; },
  };
}

test("does not open a connection without a token", () => {
  const harness = createHarness(null);
  const cleanup = harness.subscribe(() => assert.fail("No event expected"));
  assert.equal(harness.calls.length, 0);
  cleanup();
});

test("opens HTTP SSE with a bearer header and no token in the URL", async () => {
  const harness = createHarness();
  const cleanup = harness.subscribe(() => {});
  const { url, options } = harness.calls[0];
  assert.equal(url, "http://localhost:8081/api/v1/users/me/events");
  assert.equal(options.headers.Authorization, "Bearer test-token");
  assert.equal(options.openWhenHidden, true);
  await options.onopen(new Response(null, {
    status: 200, headers: { "Content-Type": "text/event-stream" },
  }));
  cleanup();
  assert.equal(options.signal.aborted, true);
});

test("refreshes on updates and reconnection, not on heartbeats or the initial connection", () => {
  const harness = createHarness();
  let refreshes = 0;
  const cleanup = harness.subscribe(() => refreshes++);
  const { options } = harness.calls[0];
  options.onmessage({ event: "connected", data: "ready" });
  options.onmessage({ event: "heartbeat", data: "keep-alive" });
  assert.equal(refreshes, 0);
  options.onmessage({ event: "wallet-update", data: '{"walletId":1,"changeType":"CREATED"}' });
  assert.equal(refreshes, 1);
  options.onmessage({ event: "connected", data: "ready" });
  assert.equal(refreshes, 2);
  cleanup();
});

test("does not reconnect after HTTP 401 or 403", async () => {
  for (const status of [401, 403]) {
    const harness = createHarness();
    const cleanup = harness.subscribe(() => {});
    const { options } = harness.calls[0];
    let error;
    await assert.rejects(options.onopen(new Response(null, { status })), (received) => {
      error = received;
      return true;
    });
    assert.throws(() => options.onerror(error), /Sign in again/);
    cleanup();
  }
});

test("retries network failures and unexpected stream closure after five seconds", () => {
  const harness = createHarness();
  const cleanup = harness.subscribe(() => {});
  const { options } = harness.calls[0];
  assert.equal(options.onerror(new Error("Network unavailable")), 5000);
  assert.throws(() => options.onclose(), /connection was closed/);
  cleanup();
});

test("rejects JSON and server-error responses instead of treating them as SSE", async () => {
  const harness = createHarness();
  const cleanup = harness.subscribe(() => {});
  const { options } = harness.calls[0];
  await assert.rejects(options.onopen(new Response("{}", {
    status: 200, headers: { "Content-Type": "application/json" },
  })), /temporarily unavailable/);
  await assert.rejects(options.onopen(new Response(null, { status: 503 })), /temporarily unavailable/);
  cleanup();
});

test("ignores events after unmount and closes the stream when the token changes", () => {
  const harness = createHarness();
  const cleanup = harness.subscribe(() => assert.fail("No event expected"));
  const { options } = harness.calls[0];
  harness.setToken(null);
  options.onmessage({ event: "wallet-update", data: "{}" });
  assert.equal(options.signal.aborted, true);
  assert.throws(() => options.onerror(new Error("Disconnected")), /Disconnected/);
  cleanup();

  const mounted = createHarness();
  const unmount = mounted.subscribe(() => assert.fail("No event expected after cleanup"));
  unmount();
  mounted.calls[0].options.onmessage({ event: "wallet-update", data: "{}" });
});
