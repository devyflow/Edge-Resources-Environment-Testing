import assert from "node:assert/strict";
import test from "node:test";
import { passwordResetError } from "../lib/password-reset-validation.ts";

test("rejects short and oversized passwords", () => {
  assert.ok(passwordResetError("short", "short"));
  assert.ok(passwordResetError("x".repeat(129), "x".repeat(129)));
});
test("requires confirmation to match exactly", () => {
  assert.ok(passwordResetError("a-test-only-password", "a-test-only-password "));
});
test("accepts matching passwords without trimming", () => {
  assert.equal(passwordResetError("a-test-only-password", "a-test-only-password"), null);
});
