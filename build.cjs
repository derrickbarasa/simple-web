const fs = require("node:fs");
const path = require("node:path");
const { parseEnv } = require("node:util");

const root = __dirname;

function readConfig(overrides = process.env) {
    const defaults = parseEnv(fs.readFileSync(path.join(root, ".env.example"), "utf8"));
    const localPath = path.join(root, ".env");
    const local = fs.existsSync(localPath) ? parseEnv(fs.readFileSync(localPath, "utf8")) : {};
    // Only explicitly supported public keys are included in the generated page.
    const config = Object.fromEntries(Object.keys(defaults).map((key) => [key, overrides[key] ?? local[key] ?? defaults[key]]));
    for (const key of ["SITE_NAME", "SITE_TAGLINE", "SITE_DESCRIPTION", "PHONE_NUMBER", "PHONE_DISPLAY", "FEEDBACK_EMAIL"]) {
        if (!config[key].trim()) throw new Error(`${key} must not be empty`);
    }
    if (!/^\+[1-9]\d{6,14}$/.test(config.PHONE_NUMBER)) throw new Error("PHONE_NUMBER must use international format, e.g. +254713486533");
    if (!/^[a-zA-Z0-9.!#$%&'*+\/= ?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(config.FEEDBACK_EMAIL) || /\s/.test(config.FEEDBACK_EMAIL)) throw new Error("FEEDBACK_EMAIL must be an email address");
    config.COPYRIGHT_YEAR ||= String(new Date().getFullYear());
    if (!/^\d{4}$/.test(config.COPYRIGHT_YEAR)) throw new Error("COPYRIGHT_YEAR must be a four-digit year");
    config.FEEDBACK_SUBJECT ||= `New feedback from the ${config.SITE_NAME} lookbook`;
    config.SITE_WORDMARK = config.SITE_NAME.toUpperCase();
    return config;
}

function renderHtml(config = readConfig()) {
    const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
    return fs.readFileSync(path.join(root, "fashion.html"), "utf8").replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
        if (!(key in config)) throw new Error(`Unknown configuration key: ${key}`);
        return escapeHtml(config[key]);
    });
}

function build() {
    const html = renderHtml();
    const output = path.join(root, "dist");
    fs.mkdirSync(output, { recursive: true });
    for (const file of ["style.css", "style-finder.js", "feedback-delivery.js", "script.js", "assets"]) {
        fs.cpSync(path.join(root, file), path.join(output, file), { recursive: true });
    }
    fs.writeFileSync(path.join(output, "fashion.html"), html);
    console.log("Built site in dist/. Open dist/fashion.html to preview.");
}

module.exports = { readConfig, renderHtml, build };
if (require.main === module) build();
