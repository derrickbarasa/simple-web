# simple-web

A fashion inspiration gallery using HTML, CSS, and vanilla JavaScript. No installation, build step, local backend, or database is required. Email delivery uses the hosted FormSubmit service.

## Run locally

Open `fashion.html` directly in your browser. You can also use an existing static preview such as VS Code Live Server.

## Host on Vercel

Import `derrickbarasa/simple-web` from GitHub, keep Root Directory at `./`, and choose the Other application preset. The checked-in `vercel.json` serves the repository as static files, skips building, and maps `/` to `fashion.html`. No environment variables or local backend are required. Deploy the latest `main` commit. Email delivery still depends on the external FormSubmit service and recipient activation described below.

## Feedback delivery and private notes

Send my feedback posts the visitor's name, chosen look, and message to `https://formsubmit.co/ajax/barasaderrick499@gmail.com`. FormSubmit forwards submissions to the email address supplied by the site owner. This address is public in the static HTML and JavaScript. Delivery requires an internet connection and the recipient's one-time FormSubmit activation. Check the recipient's inbox/spam folder for an activation email after the first submission, then confirm it. A submitted response confirms service acceptance, not arrival in the inbox. The UI keeps the text, prevents concurrent sends, and recovers after a 20-second timeout without automatically retrying. No attachments, analytics, or style preferences are sent.

Save on this device stores one private entry using `localStorage`, under `fashion-gallery-feedback`. Saving replaces the previous local entry; reopening in the same browser and origin restores it. This action does not submit to FormSubmit. Clearing saved feedback deletes only this local copy, not previously sent emails. Favorites use a separate key. Avoid saving personal details on shared devices.

Some browsers restrict storage when opening local files or using private browsing. If saving fails, the page keeps the text and displays an error. JavaScript is required for gallery selection and private saving. Without JavaScript the send form uses FormSubmit's standard POST page, including its confirmation/challenge flow. Keep the provider's anti-spam defaults enabled. Use an HTTP static preview or the deployed site to test delivery; some providers reject `file://` origins.

Provider references: [AJAX integration](https://formsubmit.co/ajax-documentation), [activation help](https://formsubmit.co/help), and [form configuration](https://formsubmit.co/documentation).

## Gallery features

- Filter looks by everyday, work, or going out, and combine that with relaxed, tailored, minimal, or bold styles. The active combination is shown with a reset option and an explanation when nothing matches.
- Save multiple looks with the heart buttons and browse them with the Favorites filter. Favorites are independent of feedback selection and use the `fashion-gallery-favorites` localStorage key. Clearing feedback does not remove favorites.
- Expand each outfit's Styling notes for key pieces, colors, and suggestions. Notes also work without JavaScript.
- Select an outfit to see its preview alongside the feedback form.
- Select the same outfit again to unselect it, or use Clear selection. Only one outfit can be selected at a time; the preview and dropdown stay in sync. Clearing the selection preserves the name and comment.
- Open the full original image from the selected preview.
- Save and restore a single feedback entry locally, or clear it with the clear button.
- Keyboard focus indicators, image descriptions, reduced-motion support, and layouts for desktop and mobile.

All images, styles, scripts, and the Playfair Display and Outfit variable fonts are local. The fonts and their SIL Open Font Licenses are in `assets/fonts/`. No font service, package manager, or build tools are required.

## Design and image viewer

Playfair Display headings, Outfit body text, warm ivory surfaces, berry accents, and a responsive footer tie the gallery together. Footer category links filter the gallery, and privacy information explains local-only storage.

Each View full look link opens a native image dialog in supporting browsers, with previous/next navigation, zoom, an original-image link, Escape to close, and focus restored to the opener. Left/right arrow keys browse while unzoomed; when zoomed, use the scroll area to inspect the image. Mobile browser pinch zoom is not disabled. Images retain their original available resolution. Without JavaScript or dialog support, the links open the original images.

Research and implementation rationale are documented in `RESEARCH.md`.

The supplied inclusive design-flow reference informs the three-column desktop, two-column tablet/mobile, and single-column narrow-phone layouts. Design tokens and behavior rules are recorded in `DESIGN.md`.

## Editorial lookbook

The gallery includes nine looks, suggested color palettes, and styling notes covering occasions, silhouette balance, and simple swaps. A photo-led intro, three expandable journal stories, and a practical styling guide provide more ways to explore personal style. Journal links filter the gallery; the two added looks participate in selection, favorites, the viewer, and feedback.

Eleven sourced photographs are bundled locally and credited in the page footer and `CREDITS.md`. Source and download URLs are recorded in `assets/editorial/sources.json`. The page requires no image API or remote font service.

All nine looks now lead with photography. The seven original collages remain under Styling notes as outfit breakdowns, with full-size links. The photos interpret the combinations rather than depict the exact garments; palettes and notes preserve the original outfit choices. Selection, comparison, and the image viewer use the lead photographs. Sharp & simple uses a closer view to show the sweater-and-collar layering.

## Style me

Choose an occasion, style, and color family to see up to three collection suggestions. Exact matches appear first; when none match every choice, the page clearly labels the closest alternatives and lists their matching preferences. Colors refer to the original outfit palettes. Start over clears preferences and results. Explore this look clears gallery filters and takes you to that card. The feature uses the local collection, requires no API key, and does not store or send preferences.

## Checks

With an existing Node.js installation, run `node --test tests/behavior.test.cjs` for recommendation and delivery behavior checks. In environments that prevent child processes, use `node --test --test-isolation=none tests/behavior.test.cjs`. The tests mock network requests and do not send emails. No Node.js installation is needed to use the website.

## Search and compare

Search matches words across outfit names, colors, pieces, and styling notes, together with the occasion and style filters. Clear search keeps your other filters; Reset filters restores the full collection.

Use Compare look on up to two outfits to see their images, palettes, key pieces, and styling suggestions together. See comparison returns to the comparison section. Remove either look to try another, or clear both. Comparison stays available while filtering and resets when the page reloads; it does not change favorites or feedback selection.
