// Draws the original outfit boards in assets/boards/*.svg. Every shape is drawn here, so the boards
// contain no third-party photos or logos. Run: node tool/make-boards.cjs
const fs = require("node:fs");
const path = require("node:path");

const line = "rgba(0,0,0,.22)";
const shade = (hex, amount) => {
    const n = parseInt(hex.slice(1), 16);
    const c = (v) => Math.max(0, Math.min(255, Math.round(v + amount * (amount < 0 ? v : 255 - v))));
    return "#" + [n >> 16, (n >> 8) & 255, n & 255].map((v) => c(v).toString(16).padStart(2, "0")).join("");
};
const p = (d, fill, extra = "") => `<path d="${d}" fill="${fill}" stroke="${line}" stroke-width="1.5" stroke-linejoin="round" vector-effect="non-scaling-stroke" ${extra}/>`;
const detail = (d) => `<path d="${d}" fill="none" stroke="${line}" stroke-width="1.2" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;

// Each garment is drawn in a 100 x 100 box.
const garments = {
    sweater: (c) => p("M30 14 L40 9 Q50 19 60 9 L70 14 L93 42 L81 54 L72 45 L72 91 L28 91 L28 45 L19 54 L7 42 Z", c) + p("M28 82 H72 V91 H28 Z", shade(c, -0.12)) + detail("M40 9 Q50 19 60 9") + detail("M36 30 V80 M44 30 V80 M52 30 V80 M60 30 V80 M68 30 V80"),
    shirt: (c) => p("M30 14 L40 9 L50 22 L60 9 L70 14 L93 42 L81 54 L72 45 L72 91 L28 91 L28 45 L19 54 L7 42 Z", c) + p("M40 9 L50 22 L44 30 L34 16 Z", shade(c, -0.07)) + p("M60 9 L50 22 L56 30 L66 16 Z", shade(c, -0.07)) + detail("M50 22 V91") + `<circle cx="50" cy="40" r="1.4" fill="${line}"/><circle cx="50" cy="56" r="1.4" fill="${line}"/><circle cx="50" cy="72" r="1.4" fill="${line}"/>`,
    blouse: (c) => p("M30 14 L40 9 Q50 22 60 9 L70 14 L92 40 L82 50 L72 42 L72 90 L28 90 L28 42 L18 50 L8 40 Z", c) + detail("M40 9 Q50 22 60 9") + detail("M50 24 V90") + `<circle cx="50" cy="38" r="1.4" fill="${line}"/><circle cx="50" cy="54" r="1.4" fill="${line}"/>`,
    tshirt: (c) => p("M30 14 L40 9 Q50 21 60 9 L70 14 L91 30 L83 43 L72 36 L72 88 L28 88 L28 36 L17 43 L9 30 Z", c) + detail("M40 9 Q50 21 60 9"),
    jacket: (c) => p("M30 12 L40 8 L50 24 L60 8 L70 12 L94 44 L82 94 L72 94 L72 50 L50 24 L28 50 L28 94 L18 94 L6 44 Z", c) + p("M40 8 L50 24 L38 50 L28 50 L30 12 Z", shade(c, -0.14)) + p("M60 8 L50 24 L62 50 L72 50 L70 12 Z", shade(c, -0.14)) + detail("M50 24 V94") + p("M36 66 H46 V74 H36 Z", shade(c, -0.1)) + p("M54 66 H64 V74 H54 Z", shade(c, -0.1)),
    trousers: (c) => p("M28 6 H72 L77 94 H54 L50 40 L46 94 H23 Z", c) + p("M28 6 H72 V14 H28 Z", shade(c, -0.12)) + detail("M50 14 V40"),
    wide: (c) => p("M28 6 H72 L86 94 H55 L50 38 L45 94 H14 Z", c) + p("M28 6 H72 V14 H28 Z", shade(c, -0.12)) + detail("M50 14 V38"),
    cargo: (c) => p("M28 6 H72 L78 94 H54 L50 40 L46 94 H22 Z", c) + p("M28 6 H72 V14 H28 Z", shade(c, -0.12)) + p("M29 52 H44 V68 H29 Z", shade(c, -0.1)) + p("M56 52 H71 V68 H56 Z", shade(c, -0.1)) + detail("M50 14 V40"),
    shorts: (c) => p("M26 18 H74 L81 72 H54 L50 46 L46 72 H19 Z", c) + p("M26 18 H74 V26 H26 Z", shade(c, -0.12)),
    skirt: (c) => p("M32 6 H68 Q74 40 86 94 H14 Q26 40 32 6 Z", c) + p("M32 6 H68 V13 H32 Z", shade(c, -0.12)) + detail("M44 14 Q40 50 34 90 M56 14 Q60 50 66 90"),
    dress: (c) => p("M38 5 L43 5 L50 15 L57 5 L62 5 L65 38 Q88 70 90 95 H10 Q12 70 35 38 Z", c) + p("M35 38 H65 V44 H35 Z", shade(c, -0.12)) + detail("M43 5 L50 15 L57 5"),
    tie: (c) => p("M45 6 H55 L58 20 L52 25 L61 82 L50 95 L39 82 L48 25 L42 20 Z", c) + detail("M46 40 L54 40 M45 58 L55 58"),
    boots: (c) => p("M28 8 H54 V48 L80 56 Q88 60 88 72 V82 H24 Z", c) + p("M24 82 H88 V90 H24 Z", shade(c, -0.3)) + detail("M28 22 H54"),
    heels: (c) => p("M8 40 L28 38 Q36 54 60 58 Q84 62 94 74 Q96 80 88 82 L58 78 Q46 76 42 70 L38 94 L29 94 L27 72 Q10 62 8 40 Z", c),
    bag: (c) => `<path d="M30 42 Q30 8 50 8 Q70 8 70 42" fill="none" stroke="${shade(c, -0.25)}" stroke-width="5" stroke-linecap="round"/>` + p("M16 40 H84 L90 90 H10 Z", c) + p("M16 40 H84 L83 52 H17 Z", shade(c, -0.1)) + `<circle cx="50" cy="52" r="3" fill="${shade(c, 0.35)}"/>`,
    earrings: (c) => ["30", "70"].map((x) => `<line x1="${x}" y1="8" x2="${x}" y2="40" stroke="${c}" stroke-width="2.5"/><circle cx="${x}" cy="46" r="8" fill="${c}" stroke="${line}" stroke-width="1.2"/><circle cx="${x}" cy="46" r="3" fill="${shade(c, 0.4)}"/>`).join(""),
    bracelet: (c) => `<ellipse cx="50" cy="50" rx="38" ry="14" fill="none" stroke="${c}" stroke-width="9"/><ellipse cx="50" cy="50" rx="38" ry="14" fill="none" stroke="${shade(c, 0.35)}" stroke-width="2" transform="translate(0 -2)"/>`,
};

const place = (item, x, y, size) => `<g transform="translate(${x} ${y}) scale(${size / 100})">${garments[item.shape](item.color)}</g>`;
const boards = {
    casual: { label: "Beige knitwear, a collared shirt with a navy tie, and dark tailored trousers", items: [
        ["sweater", "#c4a78c", 40, 70, 280], ["shirt", "#f4f1e9", 320, 70, 250], ["tie", "#242d40", 395, 340, 100], ["trousers", "#242d40", 130, 470, 340]] },
    classy: { label: "A white top, a burgundy skirt, a matching bag and gold-tone accessories", items: [
        ["earrings", "#b28a44", 370, 40, 150], ["blouse", "#f5f2e9", 40, 150, 300], ["skirt", "#731d35", 40, 470, 330], ["bracelet", "#b28a44", 400, 360, 140], ["bag", "#731d35", 390, 500, 170]] },
    jean: { label: "A dark jacket, a gray top and relaxed cargo jeans", items: [
        ["jacket", "#303031", 30, 60, 310], ["sweater", "#797976", 340, 110, 220], ["cargo", "#808b91", 150, 450, 340]] },
    office: { label: "A light blouse, black tailored trousers and black ankle boots", items: [
        ["blouse", "#f4f2ef", 120, 50, 340], ["trousers", "#232527", 60, 400, 330], ["boots", "#232527", 390, 640, 150]] },
    official: { label: "A burgundy sweater, a white collared shirt and dark trousers", items: [
        ["sweater", "#752a34", 30, 60, 290], ["shirt", "#f3f0e9", 320, 100, 250], ["trousers", "#242424", 140, 470, 330]] },
    white: { label: "A white button-up shirt and black wide-leg trousers", items: [
        ["shirt", "#f5f3ee", 110, 60, 360], ["wide", "#242424", 90, 450, 400]] },
    date: { label: "A navy evening dress, a black bag and heels, and gold-tone jewelry", items: [
        ["dress", "#182c4c", 30, 60, 400], ["earrings", "#b68b45", 440, 70, 120], ["bracelet", "#b68b45", 420, 250, 130], ["bag", "#252324", 410, 400, 150], ["heels", "#252324", 340, 640, 190]] },
};

const dir = path.join(__dirname, "..", "assets", "boards");
fs.mkdirSync(dir, { recursive: true });
for (const [name, board] of Object.entries(boards)) {
    const body = board.items.map(([shape, color, x, y, size]) => place({ shape, color }, x, y, size)).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" role="img" aria-label="${board.label}"><rect width="600" height="900" fill="#f7f4f1"/>${body}</svg>\n`;
    fs.writeFileSync(path.join(dir, `${name}.svg`), svg);
}
console.log("Wrote", Object.keys(boards).length, "boards");
