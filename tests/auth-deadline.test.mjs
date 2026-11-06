import assert from "node:assert/strict";
import test from "node:test";
import { withAuthDeadline } from "../lib/auth-deadline.ts";

test("returns verified results unchanged", async () => {
  const claims = { sub: "admin", aal: "aal2" };
  assert.deepEqual(await withAuthDeadline(async () => claims), { ok: true, value: claims });
});

test("fails closed for a stalled auth operation", async () => {
  assert.deepEqual(await withAuthDeadline(() => new Promise(() => {}), 20), { ok: false });
});

test("fails closed for a rejected auth operation", async () => {
  assert.deepEqual(await withAuthDeadline(async () => { throw new Error("Network unavailable"); }), { ok: false });
});

test("fails closed for a synchronous auth failure", async () => {
  assert.deepEqual(await withAuthDeadline(() => { throw new Error("Unavailable"); }), { ok: false });
});
