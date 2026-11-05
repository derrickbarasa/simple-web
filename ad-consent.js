// Ads load only after consent in Europe (EEA, UK, Switzerland time zones) and straight away elsewhere.
// The choice is kept in this browser and can be changed from "How your data is used".
(function () {
    "use strict";
    const key = "ads-consent";
    const client = "ca-pub-4503110988198177";
    const box = document.getElementById("ad-consent");
    const state = document.getElementById("ad-consent-state");
    let saved = null, zone = "", loaded = false;
    try { saved = localStorage.getItem(key); } catch (error) {}
    try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (error) {}
    const europe = /^(Europe|Atlantic\/(Reykjavik|Faroe|Madeira|Canary))/.test(zone);

    const allowed = () => saved === "granted" || (saved !== "denied" && !europe);
    const label = () => allowed() ? "on" : (saved === "denied" ? "off" : "off until you accept");

    function loadAds() {
        if (loaded) return;
        loaded = true;
        const script = document.createElement("script");
        script.async = true;
        script.crossOrigin = "anonymous";
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + client;
        document.head.appendChild(script);
    }

    function choose(value) {
        saved = value;
        try { localStorage.setItem(key, value); } catch (error) {}
        if (box) box.hidden = true;
        if (state) state.textContent = label();
        if (value === "granted") loadAds();
        // Ads already on the page cannot be unloaded, so switching off applies from the next visit.
    }

    if (state) state.textContent = label();
    if (box && !saved && europe) box.hidden = false;
    if (allowed()) loadAds();
    for (const [id, value] of [["ad-consent-accept", "granted"], ["ad-consent-decline", "denied"], ["ad-choice-on", "granted"], ["ad-choice-off", "denied"]]) {
        const button = document.getElementById(id);
        if (button) button.addEventListener("click", () => choose(value));
    }
})();
