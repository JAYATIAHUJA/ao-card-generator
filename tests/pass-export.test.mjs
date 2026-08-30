import assert from "node:assert/strict";
import test from "node:test";

import { downloadBlob } from "../src/lib/pass-export.ts";

test("downloaded passes use the Syndicate event name", () => {
  let clicked = false;
  const link = {
    href: "",
    download: "",
    click() {
      clicked = true;
    },
  };

  const originalDocument = globalThis.document;
  const originalUrl = globalThis.URL;
  globalThis.document = { createElement: () => link };
  globalThis.URL = {
    createObjectURL: () => "blob:syndicate-pass",
    revokeObjectURL: () => {},
  };

  try {
    downloadBlob(new Blob(["pass"]), "@participant");
    assert.equal(link.download, "syndicate-pass-participant.png");
    assert.equal(clicked, true);
  } finally {
    globalThis.document = originalDocument;
    globalThis.URL = originalUrl;
  }
});
