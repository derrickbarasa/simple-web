const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "fashion.html"), "utf8").replace(/<script\b[^>]*><\/script>/g, "");

// Fresh page per test; scripts run in page order against an http origin so localStorage works.
function loadPage() {
    const dom = new JSDOM(html, { url: "http://localhost/", runScripts: "outside-only", pretendToBeVisual: true });
    for (const file of ["style-finder.js", "feedback-delivery.js", "script.js"]) {
        dom.window.eval(fs.readFileSync(path.join(root, file), "utf8"));
    }
    const { document } = dom.window;
    return {
        dom, document, window: dom.window,
        visible: () => Array.from(document.querySelectorAll(".look")).filter((look) => !look.hidden)
            .map((look) => look.querySelector("[data-outfit]").dataset.outfit),
        click: (selector) => document.querySelector(selector).click(),
    };
}

test("all looks show by default and the category filter narrows them", () => {
    const page = loadPage();
    assert.equal(page.visible().length, 9);
    page.click('[data-filter="work"]');
    assert.deepEqual(page.visible().sort(), ["expressive", "office", "official"]);
    page.click("#reset-filters");
    assert.equal(page.visible().length, 9);
});

test("style filter combines with category", () => {
    const page = loadPage();
    page.click('[data-filter="everyday"]');
    page.document.getElementById("style-filter").value = "minimal";
    page.document.getElementById("style-filter").dispatchEvent(new page.window.Event("change"));
    assert.deepEqual(page.visible().sort(), ["city", "white"]);
});

test("search matches every term and shows the empty state when nothing matches", () => {
    const page = loadPage();
    const search = page.document.getElementById("look-search");
    search.value = "navy dress";
    search.dispatchEvent(new page.window.Event("input"));
    assert.deepEqual(page.visible(), ["date"]);
    search.value = "zzzz";
    search.dispatchEvent(new page.window.Event("input"));
    assert.equal(page.visible().length, 0);
    assert.equal(page.document.getElementById("empty-results").hidden, false);
    page.click("#clear-search");
    assert.equal(page.visible().length, 9);
});

test("favorites persist to localStorage and drive the Favorites filter", () => {
    const page = loadPage();
    page.click('[data-favorite="date"]');
    assert.deepEqual(JSON.parse(page.window.localStorage.getItem("fashion-gallery-favorites")), ["date"]);
    assert.equal(page.document.getElementById("favorites-count").textContent, "(1)");
    page.click('[data-filter="favorites"]');
    assert.deepEqual(page.visible(), ["date"]);
    page.click('[data-favorite="date"]');
    assert.equal(page.document.getElementById("empty-favorites").hidden, false);
});

test("saved favorites are restored and unknown ids are ignored", () => {
    const dom = new JSDOM(html, { url: "http://localhost/", runScripts: "outside-only", pretendToBeVisual: true });
    dom.window.localStorage.setItem("fashion-gallery-favorites", JSON.stringify(["jean", "nope", 5]));
    for (const file of ["style-finder.js", "feedback-delivery.js", "script.js"]) {
        dom.window.eval(fs.readFileSync(path.join(root, file), "utf8"));
    }
    assert.equal(dom.window.document.getElementById("favorites-count").textContent, "(1)");
});

test("comparison holds at most two looks and can be cleared", () => {
    const page = loadPage();
    const buttons = () => page.document.querySelectorAll(".compare-button");
    buttons()[0].click();
    buttons()[1].click();
    assert.equal(page.document.getElementById("look-comparison").hidden, false);
    assert.equal(page.document.querySelectorAll(".comparison-look").length, 2);
    assert.ok(buttons()[2].disabled);
    page.click("#clear-comparison");
    assert.equal(page.document.getElementById("look-comparison").hidden, true);
});

test("selecting a look syncs the dropdown and selecting it again unselects", () => {
    const page = loadPage();
    page.click('[data-outfit="office"]');
    assert.equal(page.document.getElementById("outfit").value, "office");
    assert.equal(page.document.getElementById("selected-preview").hidden, false);
    page.click('[data-outfit="office"]');
    assert.equal(page.document.getElementById("outfit").value, "");
    assert.equal(page.document.getElementById("selected-preview").hidden, true);
});

test("private save stores one entry and clear removes it", () => {
    const page = loadPage();
    const { document, window } = page;
    document.getElementById("name").value = "Sam";
    document.getElementById("comment").value = "Love the layers";
    document.getElementById("outfit").value = "office";
    page.click("#save-feedback");
    const saved = JSON.parse(window.localStorage.getItem("fashion-gallery-feedback"));
    assert.deepEqual(saved, { name: "Sam", outfit: "office", comment: "Love the layers" });
    page.click("#clear-feedback");
    assert.equal(window.localStorage.getItem("fashion-gallery-feedback"), null);
    assert.equal(document.getElementById("comment").value, "");
});

test("the style finder lists suggestions and Explore resets filters", () => {
    const page = loadPage();
    page.click('[data-filter="work"]');
    page.document.getElementById("finder-occasion").value = "occasion";
    page.document.getElementById("style-me-form").dispatchEvent(new page.window.Event("submit", { cancelable: true }));
    assert.equal(page.document.querySelectorAll("#finder-results article").length, 2);
    page.click("#finder-results a");
    assert.equal(page.visible().length, 9);
});
