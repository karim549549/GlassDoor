import { test } from "node:test";
import assert from "node:assert/strict";
import { serializeJsonLd } from "./json-ld";

test("escapes script-closing sequences", () => {
  const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
  assert.ok(!out.includes("</script>"));
  assert.ok(out.includes("\\u003c"));
});

test("round-trips to the same value", () => {
  const input = { name: "Cairo <Arena> & Co", n: 3 };
  assert.deepEqual(JSON.parse(serializeJsonLd(input)), input);
});
