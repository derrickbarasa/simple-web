const form = document.getElementById("feedback-form");
const outfit = document.getElementById("outfit");
const galleryButtons = document.querySelectorAll("[data-outfit]");
const status = document.getElementById("feedback-status");
const storageKey = "fashion-gallery-feedback";
const preview = document.getElementById("selected-preview");
const comment = document.getElementById("comment");
const clearButton = document.getElementById("clear-feedback");
const clearSelectionButton = document.getElementById("clear-selection");
const selectionStatus = document.getElementById("gallery-help");
const favoriteButtons = document.querySelectorAll("[data-favorite]");
const favoritesStatus = document.getElementById("favorites-status");
const favoritesKey = "fashion-gallery-favorites";
let favorites = new Set();
let currentFilter = "all";
let currentStyle = "all";
const styleFilter = document.getElementById("style-filter");
const searchInput = document.getElementById("look-search");
const clearSearch = document.getElementById("clear-search");
const looks = Array.from(document.querySelectorAll(".look"));
const searchText = new Map(looks.map((look) => [look,
    Array.from(look.querySelectorAll("strong, .look-category, .look-description, .look-palette, .style-tags, .details-body"),
        (part) => part.textContent).join(" ").toLocaleLowerCase()
]));

function clearQuery() {
    searchInput.value = "";
}

try {
    const savedFavorites = JSON.parse(localStorage.getItem(favoritesKey));
    const validOutfits = new Set(Array.from(galleryButtons, (button) => button.dataset.outfit));
    if (Array.isArray(savedFavorites)) {
        favorites = new Set(savedFavorites.filter((id) => typeof id === "string" && validOutfits.has(id)));
    }
} catch {
    // A blocked browser store or invalid saved data must not prevent browsing.
}


function showStatus(message, state = "info") {
    status.textContent = message;
    status.dataset.state = state;
}

function updateCount() {
    document.getElementById("comment-count").textContent = `${comment.value.length.toLocaleString()} / 2,000 characters`;
}

function selectOutfit(outfitName) {
    outfit.value = outfitName;
    galleryButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.outfit === outfit.value));
    });
    const selected = Array.from(galleryButtons).find((button) => button.dataset.outfit === outfit.value);
    preview.hidden = !selected;
    clearSelectionButton.disabled = !selected;
    if (selected) {
        const image = selected.querySelector("img");
        document.getElementById("selected-image").src = image.getAttribute("src");
        document.getElementById("selected-image").alt = image.alt;
        document.getElementById("selected-title").textContent = selected.querySelector("strong").textContent;
        document.getElementById("full-image").href = image.getAttribute("src");
        selectionStatus.textContent = `${selected.querySelector("strong").textContent} selected. Select it again to unselect.`;
    } else {
        document.getElementById("selected-title").textContent = "";
        document.getElementById("selected-image").alt = "";
        document.getElementById("full-image").removeAttribute("href");
        selectionStatus.textContent = "No look selected. Choose a look to add it to your feedback.";
    }
    showStatus("");
}

galleryButtons.forEach((button) => {
    button.addEventListener("click", () => {
        selectOutfit(outfit.value === button.dataset.outfit ? "" : button.dataset.outfit);
    });
});
outfit.addEventListener("change", () => selectOutfit(outfit.value));
clearSelectionButton.addEventListener("click", () => selectOutfit(""));

const filterButtons = document.querySelectorAll("[data-filter]");

function renderGallery() {
    let count = 0;
    const query = searchInput.value.trim().toLocaleLowerCase();
    const terms = query.split(/\s+/).filter(Boolean);
    document.querySelectorAll(".look").forEach((look) => {
        const id = look.querySelector("[data-outfit]").dataset.outfit;
        const matchesCategory = currentFilter === "all"
            || (currentFilter === "favorites" ? favorites.has(id) : look.dataset.category === currentFilter);
        const matchesStyle = currentStyle === "all" || look.dataset.styles.split(" ").includes(currentStyle);
        const visible = matchesCategory && matchesStyle && terms.every((term) => searchText.get(look).includes(term));
        look.hidden = !visible;
        if (visible) count += 1;
    });
    filterButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === currentFilter)));
    favoriteButtons.forEach((button) => {
        const saved = favorites.has(button.dataset.favorite);
        const name = button.getAttribute("aria-label").replace(/^Favorite /, "");
        button.setAttribute("aria-pressed", String(saved));
        button.title = saved ? `Remove ${name} from favorites` : `Save ${name} to favorites`;
    });
    document.querySelector(".style-note").hidden = currentFilter !== "all" || currentStyle !== "all" || Boolean(query);
    clearSearch.disabled = searchInput.value.length === 0;
    document.getElementById("favorites-count").textContent = `(${favorites.size})`;
    const emptyFavorites = currentFilter === "favorites" && favorites.size === 0;
    document.getElementById("empty-favorites").hidden = !emptyFavorites;
    document.getElementById("empty-results").hidden = count > 0 || emptyFavorites;
    styleFilter.value = currentStyle;
    const categoryNames = { all: "All occasions", everyday: "Everyday", work: "For work", occasion: "Going out", favorites: "Favorites" };
    const styleName = currentStyle.charAt(0).toUpperCase() + currentStyle.slice(1);
    const summary = currentFilter === "all" && currentStyle === "all"
        ? "Showing all looks"
        : `${categoryNames[currentFilter]} / ${currentStyle === "all" ? "All styles" : styleName}`;
    document.getElementById("filter-summary").textContent = summary + (query ? ` / Matching “${searchInput.value.trim()}”` : "");
    document.getElementById("reset-filters").disabled = currentFilter === "all" && currentStyle === "all" && !searchInput.value;
    document.getElementById("look-count").textContent = currentFilter === "favorites"
        ? `${count} saved ${count === 1 ? "look" : "looks"}`
        : `${count} ${count === 1 ? "look" : "looks"} to explore`;
}

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        if (currentFilter === "all") { currentStyle = "all"; clearQuery(); }
        renderGallery();
    });
});

favoriteButtons.forEach((button) => {
    button.hidden = false;
    button.addEventListener("click", () => {
        const id = button.dataset.favorite;
        const nextFavorites = new Set(favorites);
        const removing = nextFavorites.has(id);
        if (removing) nextFavorites.delete(id);
        else nextFavorites.add(id);
        try {
            localStorage.setItem(favoritesKey, JSON.stringify(Array.from(nextFavorites)));
            favorites = nextFavorites;
            renderGallery();
            const name = button.getAttribute("aria-label").replace(/^Favorite /, "");
            favoritesStatus.textContent = removing ? `${name} removed from your favorites.` : `${name} saved to your favorites in this browser.`;
            favoritesStatus.dataset.state = "success";
            if (currentFilter === "favorites" && removing) {
                document.querySelector('[data-filter="favorites"]').focus();
            }
        } catch {
            favoritesStatus.textContent = "Your browser could not save this change. Your favorites have not been changed. Check whether browser storage is allowed and try again.";
            favoritesStatus.dataset.state = "error";
        }
    });
});

document.getElementById("browse-all").addEventListener("click", () => {
    clearQuery();
    currentFilter = "all";
    currentStyle = "all";
    renderGallery();
    document.querySelector('[data-filter="all"]').focus();
});
styleFilter.addEventListener("change", () => {
    currentStyle = styleFilter.value;
    renderGallery();
});
for (const id of ["reset-filters", "reset-empty"]) {
    document.getElementById(id).addEventListener("click", () => {
        clearQuery();
        currentFilter = "all";
        currentStyle = "all";
        renderGallery();
        document.querySelector('[data-filter="all"]').focus();
    });
}
renderGallery();
document.querySelector(".filters").hidden = false;
document.querySelector(".style-discovery").hidden = false;
document.querySelector(".style-control").hidden = false;
document.querySelector(".look-search").hidden = false;
searchInput.addEventListener("input", renderGallery);
clearSearch.addEventListener("click", () => {
    clearQuery();
    renderGallery();
    searchInput.focus();
});

for (const id of ["name", "comment"]) {
    const field = document.getElementById(id);
    const validate = () => {
        field.setCustomValidity(field.value.trim() ? "" : "Please enter your " + id + ".");
        showStatus("");
    };
    field.addEventListener("input", validate);
    field.addEventListener("change", validate);
}
comment.addEventListener("input", updateCount);

function readFeedback() {
    showStatus("");
    for (const id of ["name", "comment"]) {
        const field = document.getElementById(id);
        field.value = field.value.trim();
        field.setCustomValidity(field.value ? "" : "Please enter your " + id + ".");
    }
    updateCount();
    if (!form.reportValidity()) return null;

    return {
        name: document.getElementById("name").value,
        outfit: outfit.value,
        comment: document.getElementById("comment").value,
    };
}

document.getElementById("save-feedback").addEventListener("click", () => {
    const feedback = readFeedback();
    if (!feedback) return;

    try {
        localStorage.setItem(storageKey, JSON.stringify(feedback));
        clearButton.disabled = false;
        showStatus("Saved on this device. Your feedback has not been sent to the site owner.", "success");
    } catch {
        showStatus("Your browser could not save this feedback. Your text is still here; copy it before leaving the page.", "error");
    }
});

clearButton.addEventListener("click", () => {
    try {
        localStorage.removeItem(storageKey);
        form.reset();
        for (const id of ["name", "comment"]) document.getElementById(id).setCustomValidity("");
        selectOutfit("");
        updateCount();
        clearButton.disabled = true;
        showStatus("Your saved feedback has been cleared from this browser.");
    } catch {
        showStatus("Your browser could not clear the saved feedback. Please try again.", "error");
    }
});

try {
    const raw = localStorage.getItem(storageKey);
    clearButton.disabled = raw === null;
    const saved = JSON.parse(raw);
    if (saved && typeof saved.name === "string" && saved.name.length <= 100
        && typeof saved.comment === "string" && saved.comment.length <= 2000
        && Array.from(outfit.options).some((option) => option.value === saved.outfit && option.value !== "")) {
        document.getElementById("name").value = saved.name;
        document.getElementById("comment").value = saved.comment;
        selectOutfit(saved.outfit);
        updateCount();
        showStatus("Your saved feedback is restored. It has not been sent to the site owner.");
    }
} catch {
    // Browsing and editing still work if storage is unavailable or contains invalid data.
}

document.getElementById("save-feedback").disabled = false;

// Footer shortcuts use the same filters as the gallery controls.
document.querySelectorAll("[data-gallery-filter]").forEach((link) => {
    link.addEventListener("click", () => {
        clearQuery();
        currentFilter = link.dataset.galleryFilter;
        currentStyle = "all";
        renderGallery();
    });
});
document.querySelector('a[href="#privacy"]').addEventListener("click", () => {
    document.getElementById("privacy").open = true;
});

// Native dialog provides focus containment and Escape-to-close behavior.
const viewer = document.getElementById("image-viewer");
const viewerStage = document.getElementById("viewer-stage");
const zoomButton = document.getElementById("zoom-image");
let viewerItems = [];
let viewerIndex = 0;
let viewerTrigger = null;
let viewerZoomed = false;

function setImageZoom(zoomed) {
    viewerZoomed = zoomed;
    viewerStage.classList.toggle("is-zoomed", zoomed);
    zoomButton.setAttribute("aria-pressed", String(zoomed));
    viewerStage.scrollTop = 0;
    viewerStage.scrollLeft = 0;
}

function renderViewer() {
    const button = viewerItems[viewerIndex];
    const image = button.querySelector("img");
    document.getElementById("viewer-title").textContent = button.querySelector("strong").textContent;
    document.getElementById("viewer-image").src = image.getAttribute("src");
    document.getElementById("viewer-image").alt = image.alt;
    document.getElementById("viewer-original").href = image.getAttribute("src");
    document.getElementById("viewer-counter").textContent = `Look ${viewerIndex + 1} of ${viewerItems.length}`;
    document.getElementById("previous-look").disabled = viewerItems.length < 2;
    document.getElementById("next-look").disabled = viewerItems.length < 2;
    setImageZoom(false);
}

function openImageViewer(id, trigger) {
    viewerItems = Array.from(galleryButtons).filter((button) => !button.closest(".look").hidden);
    if (!viewerItems.some((button) => button.dataset.outfit === id)) viewerItems = Array.from(galleryButtons);
    viewerIndex = viewerItems.findIndex((button) => button.dataset.outfit === id);
    if (viewerIndex < 0) return;
    viewerTrigger = trigger;
    renderViewer();
    document.body.classList.add("viewer-open");
    viewer.showModal();
}

function moveViewer(direction) {
    viewerIndex = (viewerIndex + direction + viewerItems.length) % viewerItems.length;
    renderViewer();
}

document.querySelectorAll("[data-view]").forEach((link) => {
    link.addEventListener("click", (event) => {
        if (typeof viewer.showModal !== "function") return;
        event.preventDefault();
        openImageViewer(link.dataset.view, link);
    });
});
document.getElementById("full-image").addEventListener("click", (event) => {
    if (typeof viewer.showModal !== "function" || !outfit.value) return;
    event.preventDefault();
    openImageViewer(outfit.value, event.currentTarget);
});
document.getElementById("close-viewer").addEventListener("click", () => viewer.close());
document.getElementById("previous-look").addEventListener("click", () => moveViewer(-1));
document.getElementById("next-look").addEventListener("click", () => moveViewer(1));
zoomButton.addEventListener("click", () => setImageZoom(!viewerZoomed));
viewer.addEventListener("keydown", (event) => {
    if (viewerZoomed || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        moveViewer(event.key === "ArrowLeft" ? -1 : 1);
    }
});
viewer.addEventListener("close", () => {
    document.body.classList.remove("viewer-open");
    setImageZoom(false);
    if (viewerTrigger && viewerTrigger.isConnected) viewerTrigger.focus();
});

// Journal stories lead back to a matching set of looks.
document.querySelectorAll('[data-gallery-style]').forEach((link) => {
    link.addEventListener('click', () => {
        clearQuery();
        currentFilter = 'all';
        currentStyle = link.dataset.galleryStyle;
        renderGallery();
    });
});

// Comparison is temporary and independent of feedback selection and favorites.
const comparedLooks = new Set();
const comparison = document.getElementById("look-comparison");
const comparisonGrid = document.getElementById("comparison-grid");
const comparisonStatus = document.getElementById("comparison-status");
const compareButtons = new Map();

function renderComparison() {
    comparison.hidden = comparedLooks.size === 0;
    compareButtons.forEach((button, id) => {
        const active = comparedLooks.has(id);
        button.setAttribute("aria-pressed", String(active));
        button.textContent = active ? "Remove comparison" : "Compare look";
        button.disabled = !active && comparedLooks.size === 2;
        button.nextElementSibling.hidden = !active;
    });
    comparisonGrid.replaceChildren();
    comparedLooks.forEach((id) => {
        const look = looks.find((item) => item.querySelector("[data-outfit]").dataset.outfit === id);
        const name = look.querySelector("strong").textContent;
        const column = document.createElement("article");
        column.className = "comparison-look";
        const image = look.querySelector("img").cloneNode();
        image.loading = "lazy";
        const title = document.createElement("h4");
        title.textContent = name;
        column.append(image, title, look.querySelector(".look-palette").cloneNode(true));
        const piecesTitle = document.createElement("p");
        piecesTitle.className = "detail-label";
        piecesTitle.textContent = look.classList.contains("has-breakdown") ? "Original outfit pieces" : "Key pieces";
        if (look.classList.contains("has-breakdown")) {
            const context = document.createElement("p");
            context.className = "look-photo-credit";
            context.textContent = "Photographic interpretation. Palette and notes refer to the original outfit breakdown in Styling notes.";
            column.append(context);
        }
        column.append(piecesTitle, look.querySelector(".details-body ul").cloneNode(true), look.querySelector(".outfit-facts").cloneNode(true));
        const actions = document.createElement("div");
        actions.className = "comparison-actions";
        const view = document.createElement("a");
        view.className = "text-link";
        view.href = look.querySelector("img").getAttribute("src");
        view.textContent = "View full look";
        view.setAttribute("aria-label", `View full ${name} outfit`);
        view.addEventListener("click", (event) => {
            if (typeof viewer.showModal !== "function") return;
            event.preventDefault();
            openImageViewer(id, view);
        });
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "clear-button";
        remove.textContent = "Remove";
        remove.setAttribute("aria-label", `Remove ${name} from comparison`);
        remove.addEventListener("click", () => {
            comparedLooks.delete(id);
            renderComparison();
            announceComparison();
            const cardButton = compareButtons.get(id);
            if (!look.hidden) cardButton.focus();
            else if (comparedLooks.size) comparisonGrid.querySelector("button").focus();
            else searchInput.focus();
        });
        actions.append(view, remove);
        column.append(actions);
        comparisonGrid.append(column);
    });
    if (comparedLooks.size === 1) {
        const placeholder = document.createElement("p");
        placeholder.className = "comparison-placeholder";
        placeholder.textContent = "One more perspective? Choose another look below to compare it here.";
        comparisonGrid.append(placeholder);
    }
}

function announceComparison() {
    comparisonStatus.textContent = comparedLooks.size === 2
        ? "Two looks ready to compare above. Remove one to try another."
        : comparedLooks.size === 1 ? "One look in comparison above. Choose one more look." : "Comparison cleared.";
}

looks.forEach((look) => {
    const id = look.querySelector("[data-outfit]").dataset.outfit;
    const name = look.querySelector("strong").textContent;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "compare-button";
    button.textContent = "Compare look";
    button.setAttribute("aria-label", `Compare ${name}`);
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-controls", "look-comparison");
    button.addEventListener("click", () => {
        if (comparedLooks.has(id)) comparedLooks.delete(id);
        else if (comparedLooks.size < 2) comparedLooks.add(id);
        renderComparison();
        announceComparison();
    });
    compareButtons.set(id, button);
    const jump = document.createElement("a");
    jump.href = "#look-comparison";
    jump.className = "comparison-jump text-link";
    jump.textContent = "See comparison";
    jump.hidden = true;
    look.querySelector(".preview-link").after(button, jump);
});
document.getElementById("clear-comparison").addEventListener("click", () => {
    comparedLooks.clear();
    renderComparison();
    announceComparison();
    const firstVisible = looks.find((look) => !look.hidden);
    if (firstVisible) firstVisible.querySelector(".compare-button").focus();
    else searchInput.focus();
});
