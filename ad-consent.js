// Ads are not shown to visitors in Europe (EEA, UK, Switzerland time zones), where Google requires a certified
// consent tool. Everyone else sees ads unless they turn them off. The choice is kept in this browser and can be
// changed from "How your data is used" or the Privacy page.
(function () {
    "use strict";
    const key = "ads-consent";
    const client = "ca-pub-4503110988198177";
    let saved = null, zone = "", loaded = false;
    try { saved = localStorage.getItem(key); } catch (error) {}
    try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (error) {}
    const europe = /^(Europe|Atlantic\/(Reykjavik|Faroe|Madeira|Canary))/.test(zone);

    const allowed = () => !europe && saved !== "denied";
    const label = () => europe ? "not shown in your region" : (saved === "denied" ? "off" : "on");

    function loadAds() {
        if (loaded) return;
        loaded = true;
        const script = document.createElement("script");
        script.async = true;
        script.crossOrigin = "anonymous";
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + client;
        document.head.appendChild(script);
    }

    function show() {
        for (const state of document.querySelectorAll(".ad-consent-state")) state.textContent = label();
    }

    function choose(value) {
        saved = value;
        try { localStorage.setItem(key, value); } catch (error) {}
        show();
        if (allowed()) loadAds();
        // Ads already on the page cannot be unloaded, so switching off applies from the next visit.
    }

    show();
    if (allowed()) loadAds();
    for (const [selector, value] of [[".ad-choice-on", "granted"], [".ad-choice-off", "denied"]]) {
        for (const button of document.querySelectorAll(selector)) button.addEventListener("click", () => choose(value));
    }
})();
