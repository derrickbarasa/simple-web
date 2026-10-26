// Every suggestion comes from the existing collection and its original palette.
function getStyleRecommendations(items, preferences) {
    const requested = Object.entries(preferences).filter(([, value]) => value !== "all");
    const ranked = items.map((item) => {
        const matches = requested.filter(([key, value]) => key === "occasion"
            ? item.category === value : item[key === "style" ? "styles" : "colors"].includes(value));
        return { ...item, matches, score: matches.length };
    }).sort((a, b) => b.score - a.score);
    const exact = ranked.filter((item) => item.score === requested.length);
    const candidates = exact.length ? exact : ranked.filter((item) => item.score > 0);
    return { items: (candidates.length ? candidates : ranked).slice(0, 3), exact: exact.length > 0, requested: requested.length, totalExact: exact.length };
}

// Bind the short preference form to gallery discovery, without changing favorites.
(() => {
    const finderForm = document.getElementById("style-me-form");
    if (!finderForm) return;
    const results = document.getElementById("finder-results");
    const finderStatus = document.getElementById("finder-status");
    const colorFamilies = {
        casual: ["earth", "blue", "neutral"], classy: ["berry", "neutral"], jean: ["neutral", "blue"],
        office: ["neutral"], official: ["berry", "neutral"], white: ["neutral"], date: ["blue", "neutral"],
        city: ["blue", "neutral"], expressive: ["earth", "neutral"],
    };
    const collection = looks.map((look) => {
        const button = look.querySelector("[data-outfit]");
        look.id = `look-${button.dataset.outfit}`;
        return { id: button.dataset.outfit, title: button.querySelector("strong").textContent,
            category: look.dataset.category, styles: look.dataset.styles.split(" "), colors: colorFamilies[button.dataset.outfit], look };
    });
    const labels = { everyday: "Everyday", work: "For work", occasion: "Going out", relaxed: "Relaxed", tailored: "Tailored", minimal: "Minimal", bold: "Bold", neutral: "Neutral palette", berry: "Berry palette", blue: "Blue palette", earth: "Earth tones" };

    finderForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const preferences = Object.fromEntries(["occasion", "style", "color"].map((key) => [key, document.getElementById(`finder-${key}`).value]));
        const recommendations = getStyleRecommendations(collection, preferences);
        results.replaceChildren();
        results.hidden = false;
        finderStatus.textContent = recommendations.requested === 0
            ? "Three starting points to explore. Add a preference to make them more personal."
            : recommendations.exact
                ? `${recommendations.totalExact} ${recommendations.totalExact === 1 ? "look matches" : "looks match"} all your preferences. ${recommendations.totalExact > 3 ? "Here are three to start with." : "Explore below."}`
                : "No look matches every preference yet. These are the closest ideas; the matching details are shown below.";
        recommendations.items.forEach((item) => {
            const article = document.createElement("article");
            const image = item.look.querySelector("img").cloneNode();
            image.loading = "lazy";
            const heading = document.createElement("h3");
            heading.textContent = item.title;
            const reason = document.createElement("p");
            reason.textContent = item.matches.length ? item.matches.map(([, value]) => labels[value]).join(" / ")
                : recommendations.requested ? "A different direction to consider" : item.look.querySelector(".style-tags").textContent;
            const link = document.createElement("a");
            link.href = `#look-${item.id}`;
            link.className = "text-link";
            link.textContent = "Explore this look";
            link.setAttribute("aria-label", `Explore ${item.title}`);
            link.addEventListener("click", () => {
                currentFilter = "all";
                currentStyle = "all";
                clearQuery();
                renderGallery();
                item.look.querySelector("[data-outfit]").focus({ preventScroll: true });
            });
            article.append(image, heading, reason, link);
            results.append(article);
        });
    });
    finderForm.addEventListener("reset", () => {
        results.hidden = true;
        results.replaceChildren();
        finderStatus.textContent = "Preferences cleared. Try a new direction.";
    });
    document.getElementById("style-me").hidden = false;
    document.querySelector(".finder-entry").hidden = false;
})();
