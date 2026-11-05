const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const { renderHtml } = require("../build.cjs");

function visit(zone, stored, file = "fashion.html") {
    const dom = new JSDOM(renderHtml(undefined, file), { url: "http://localhost/", runScripts: "outside-only" });
    const { window } = dom;
    window.Intl.DateTimeFormat = () => ({ resolvedOptions: () => ({ timeZone: zone }) });
    if (stored) window.localStorage.setItem("ads-consent", stored);
    window.eval(fs.readFileSync(path.join(__dirname, "..", "ad-consent.js"), "utf8"));
    const document = window.document;
    return { document, ads: () => document.head.querySelectorAll('script[src*="adsbygoogle"]').length, state: () => document.querySelector(".ad-consent-state").textContent };
}

test("outside Europe ads load, and turning them off is remembered", () => {
    const page = visit("Africa/Nairobi");
    assert.equal(page.ads(), 1);
    assert.equal(page.state(), "on");
    page.document.querySelector(".ad-choice-off").click();
    assert.equal(page.state(), "off");
    assert.equal(visit("Africa/Nairobi", "denied").ads(), 0);
});

test("in Europe ads never load, whatever was stored", () => {
    assert.equal(visit("Europe/Paris").ads(), 0);
    assert.equal(visit("Europe/London", "granted").ads(), 0);
    const page = visit("Europe/Paris");
    page.document.querySelector(".ad-choice-on").click();
    assert.equal(page.ads(), 0);
    assert.equal(page.state(), "not shown in your region");
});

test("the privacy page carries the ad notice, controls and contact details", () => {
    const page = visit("Africa/Nairobi", null, "privacy.html");
    assert.equal(page.ads(), 1);
    const text = page.document.body.textContent;
    for (const phrase of ["Google AdSense", "Ads Settings", "Data Protection Act", "Unsplash License", "Pexels License"]) assert.ok(text.includes(phrase), phrase);
    assert.ok(page.document.querySelector('a[href^="mailto:"]'));
    assert.ok(renderHtml().includes('href="privacy.html"'));
});
