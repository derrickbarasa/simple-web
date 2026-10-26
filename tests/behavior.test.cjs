const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const context = vm.createContext({ document: { getElementById: () => null }, AbortController, setTimeout, clearTimeout });
for (const file of ["style-finder.js", "feedback-delivery.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context);
}
const { getStyleRecommendations, deliverFeedback } = context;
const collection = [
    { id: "office", category: "work", styles: ["tailored", "minimal"], colors: ["neutral"] },
    { id: "classy", category: "occasion", styles: ["bold", "tailored"], colors: ["berry", "neutral"] },
    { id: "casual", category: "everyday", styles: ["relaxed"], colors: ["earth", "blue"] },
    { id: "city", category: "everyday", styles: ["relaxed", "minimal"], colors: ["neutral", "blue"] },
];

test("exact recommendations honor every chosen preference without padding with mismatches", () => {
    const result = getStyleRecommendations(collection, { occasion: "work", style: "minimal", color: "neutral" });
    assert.equal(result.exact, true);
    assert.equal(result.totalExact, 1);
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].id, "office");
    assert.equal(result.items[0].matches.length, 3);
});

test("unavailable combinations return explained partial matches in preference order", () => {
    const result = getStyleRecommendations(collection, { occasion: "work", style: "relaxed", color: "blue" });
    assert.equal(result.exact, false);
    assert.equal(result.totalExact, 0);
    assert.equal(result.items[0].id, "casual");
    assert.equal(result.items[0].score, 2);
    assert.equal(result.items[1].id, "city");
    assert.equal(result.items[2].id, "office");
    assert.ok(result.items.every((item) => item.matches.length === item.score));
});

test("open preferences return at most three starting points and leave the collection intact", () => {
    const before = JSON.stringify(collection);
    const result = getStyleRecommendations(collection, { occasion: "all", style: "all", color: "all" });
    assert.equal(result.requested, 0);
    assert.equal(result.items.length, 3);
    assert.equal(JSON.stringify(collection), before);
});

test("delivery sends the captured fields once and accepts explicit service confirmation", async () => {
    let calls = 0;
    const payload = { name: "Test visitor", outfit: "Office hours", message: "A styling note" };
    await deliverFeedback("https://formsubmit.co/ajax/example", payload, async (endpoint, options) => {
        calls++;
        assert.equal(endpoint, "https://formsubmit.co/ajax/example");
        assert.equal(options.method, "POST");
        assert.deepEqual(JSON.parse(options.body), payload);
        assert.equal(options.headers.Accept, "application/json");
        return { ok: true, json: async () => ({ success: "true" }) };
    });
    assert.equal(calls, 1);
});

test("HTTP and service failures never become successful delivery", async () => {
    await assert.rejects(deliverFeedback("endpoint", {}, async () => ({ ok: false })), /not accepted/);
    await assert.rejects(deliverFeedback("endpoint", {}, async () => ({ ok: true, json: async () => ({ success: false }) })), /not confirmed/);
    await assert.rejects(deliverFeedback("endpoint", {}, async () => ({ ok: true, json: async () => ({}) })), /not confirmed/);
});

test("network errors propagate without automatic duplicate submissions", async () => {
    let calls = 0;
    await assert.rejects(deliverFeedback("endpoint", {}, async () => { calls++; throw new Error("Offline"); }), /Offline/);
    assert.equal(calls, 1);
});

test("a stalled request is aborted so the UI can recover", async () => {
    await assert.rejects(deliverFeedback("endpoint", {}, (_, { signal }) => new Promise((resolve, reject) => {
        signal.addEventListener("abort", () => reject(new Error("Timed out")), { once: true });
    }), 5), /Timed out/);
});
