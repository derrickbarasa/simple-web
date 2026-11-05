const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const { renderHtml } = require("../build.cjs");

function visit(zone, stored) {
    const dom = new JSDOM(renderHtml(), { url: "http://localhost/", runScripts: "outside-only" });
    const { window } = dom;
    window.Intl.DateTimeFormat = () => ({ resolvedOptions: () => ({ timeZone: zone }) });
    if (stored) window.localStorage.setItem("ads-consent", stored);
    window.eval(fs.readFileSync(path.join(__dirname, "..", "ad-consent.js"), "utf8"));
    const document = window.document;
    return { document, ads: () => document.head.querySelectorAll('script[src*="adsbygoogle"]').length, banner: document.getElementById("ad-consent") };
}

test("outside Europe ads load without a banner", () => {
    const page = visit("Africa/Nairobi");
    assert.equal(page.ads(), 1);
    assert.equal(page.banner.hidden, true);
});

test("in Europe ads wait for consent and load after Accept", () => {
    const page = visit("Europe/Paris");
    assert.equal(page.ads(), 0);
    assert.equal(page.banner.hidden, false);
    page.document.getElementById("ad-consent-accept").click();
    assert.equal(page.ads(), 1);
    assert.equal(page.banner.hidden, true);
});

test("a declined choice keeps ads off everywhere", () => {
    assert.equal(visit("Europe/Paris", "denied").ads(), 0);
    assert.equal(visit("Africa/Nairobi", "denied").ads(), 0);
    const page = visit("Europe/Paris");
    page.document.getElementById("ad-consent-decline").click();
    assert.equal(page.ads(), 0);
    assert.equal(page.document.getElementById("ad-consent-state").textContent, "off");
});
