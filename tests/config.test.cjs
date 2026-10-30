const test = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const { readConfig, renderHtml } = require("../build.cjs");

test("environment settings update branding, every phone link, and both feedback paths", async () => {
    const config = readConfig({ SITE_NAME: 'Style & "Co"', SITE_TAGLINE: "Find your next look", PHONE_NUMBER: "+254700000000", PHONE_DISPLAY: "+254 700 000 000", FEEDBACK_EMAIL: "owner@example.com", FEEDBACK_SUBJECT: "", COPYRIGHT_YEAR: "2030" });
    const html = renderHtml(config);
    const dom = new JSDOM(html, { runScripts: "outside-only" });
    const { document } = dom.window;
    assert.equal(document.title, 'Style & "Co" — Find your next look');
    assert.equal(document.querySelector(".wordmark").textContent, 'STYLE & "CO".');
    for (const link of document.querySelectorAll('[href^="tel:"]')) assert.equal(link.getAttribute("href"), "tel:+254700000000");
    assert.equal(document.querySelector(".footer-phone").textContent, "+254 700 000 000");
    const form = document.getElementById("feedback-form");
    assert.equal(form.action, "https://formsubmit.co/owner@example.com");
    dom.window.eval(require("node:fs").readFileSync(require("node:path").join(__dirname, "../feedback-delivery.js"), "utf8"));
    let sent;
    dom.window.fetch = async (endpoint, options) => {
        sent = { endpoint, payload: JSON.parse(options.body) };
        return { ok: true, json: async () => ({ success: true }) };
    };
    dom.window.AbortController = AbortController;
    const outfit = document.getElementById("outfit");
    outfit.value = "casual";
    dom.window.FashionGallery.initFeedbackDelivery({ form, outfit, readFeedback: () => ({ name: "Visitor", outfit: "casual", comment: "Nice look" }), showStatus: () => {} });
    form.dispatchEvent(new dom.window.Event("submit", { cancelable: true }));
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(sent.endpoint, "https://formsubmit.co/ajax/owner@example.com");
    assert.equal(sent.payload._subject, 'New feedback from the Style & "Co" lookbook');
    assert.ok(document.querySelector(".footer-bottom").textContent.includes('2030 Style & "Co"'));
    assert.ok(!html.includes("{{"));
    dom.window.close();
});

test("invalid contact configuration fails the build", () => {
    assert.throws(() => readConfig({ PHONE_NUMBER: "call me" }), /PHONE_NUMBER/);
    assert.throws(() => readConfig({ FEEDBACK_EMAIL: "https://example.com" }), /FEEDBACK_EMAIL/);
});
