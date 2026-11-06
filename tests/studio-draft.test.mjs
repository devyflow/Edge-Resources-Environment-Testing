import assert from "node:assert/strict";
import test from "node:test";
import { readStudioDraft, studioDraftKey, writeStudioDraft } from "../lib/studio-draft.ts";

function storage() {
  const entries = new Map();
  return {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: key => entries.delete(key)
  };
}
const draft = { profile: { name: "Test" }, projects: [], photography: { posts: [] } };

test("restores an unsaved draft after reopening the editor", () => {
  const store = storage();
  const key = studioDraftKey("admin-a");
  assert.equal(writeStudioDraft(store, key, draft), true);
  assert.deepEqual(readStudioDraft(store, key), draft);
});
test("does not restore another account's draft", () => {
  const store = storage();
  writeStudioDraft(store, studioDraftKey("admin-a"), draft);
  assert.equal(readStudioDraft(store, studioDraftKey("admin-b")), null);
});
test("ignores corrupted drafts", () => {
  const store = storage();
  store.setItem("draft", "{broken");
  assert.equal(readStudioDraft(store, "draft"), null);
  store.setItem("draft", JSON.stringify({ version: 1, data: {} }));
  assert.equal(readStudioDraft(store, "draft"), null);
});
test("reports full or unavailable device storage", () => {
  const store = { ...storage(), setItem: () => { throw new Error("Quota exceeded"); } };
  assert.equal(writeStudioDraft(store, "draft", draft), false);
});
test("cleared drafts are no longer restored", () => {
  const store = storage();
  writeStudioDraft(store, "draft", draft);
  store.removeItem("draft");
  assert.equal(readStudioDraft(store, "draft"), null);
});
