# Fashion lookbook design

## Purpose and content

An inclusive outfit inspiration gallery for browsing looks, exploring styling notes, collecting favorites, and saving personal feedback locally. Discovery uses occasion and aesthetic rather than gender. All seven original image assets and the existing contact number are retained.

The supplied five-page fashion_design_flow_all_genders.pdf informs the visual direction and visitor journey. It is a design specification rather than screenshot authority. The user delegated the font decision after supplying it.

## Typography

- Display: locally hosted Playfair Display variable, normal 400-900, usually 500 for headlines.
- Body and controls: locally hosted Outfit variable, normal 100-900, usually 400-600.
- Use font-display: swap. Both font licenses ship under assets/fonts/.
- Headline maximum: 5.25rem; fluid scaling on smaller screens. Body text: 16px with 1.6 line-height.

## Color tokens

| Token | Value | Role |
|---|---|---|
| --background | #FAF7F4 | Warm ivory page |
| --paper | #FFFFFF | Controls and images |
| --text | #282027 | Primary ink |
| --muted | #6B5C65 | Supporting text, darkened from the reference for legibility |
| --border | #D9CED4 | Subtle dividers |
| --accent | #B61655 | Berry actions and selections |
| --accent-dark | #8E1042 | Action hover |
| --tint | #F4E6E9 | Soft rose surfaces |
| --highlight | #F43F83 | Small decorative accents |
| --footer | #291722 | Footer background |

## Layout

Maximum content width 1240px. Three gallery columns above 1000px; two columns through tablet and phone sizes; one column at 380px and below. The intro and feedback stack below 700px. The gallery's closing style note spans the full grid width, with text arranged side by side on desktop and stacked on phones.

Keep gallery controls compact enough for the clothing imagery to enter the first desktop viewport. Footer navigation has distinct Explore outfits and Your collection landmarks, a real telephone link, local-storage disclosure, and back-to-top navigation.

## Interaction rules

- A card selects one outfit for feedback; activating it again deselects. Selecting another replaces it. Clearing selection preserves written text.
- Favorites are a separate multi-select collection persisted locally. Feedback clearing never removes favorites.
- Category/favorites and aesthetic style filters combine with AND. Show the active context and visible count. Provide reset and empty-state recovery. All looks and footer category shortcuts reset the style constraint.
- Keep the empty-favorites state distinct from favorites that exist but do not match a chosen style.
- Styling notes are native details disclosures that work without JavaScript.
- Image inspection uses a native modal dialog, explicit close control, Escape, keyboard browsing, zoom and scrolling. Browsing is limited to visible results when opening from the gallery. Restore focus on close.
- Feedback is local-only and must never claim delivery to the site owner.
- Storage failures keep the current collection and entered text intact, with an actionable message.

## Accessibility and motion

Visible focus, meaningful image descriptions, labeled native controls, live result/selection statuses, 44px controls, and reduced-motion support. Browser pinch zoom remains enabled. Native dialog behavior contains focus; zoomed-image arrow keys remain available for scrolling. Font and palette choices must be checked with real content and contrast calculations.

## Verification notes

The original implementation was checked with the seven supplied local assets, keyboard image browsing, visible filter combinations, reset and empty-result recovery, and narrow responsive layouts. JavaScript syntax, internal links, font files/licenses, local references, and text contrast checks passed. Storage failure and malformed-data behavior were exercised in isolated checks. These are implementation checks, not a full screen-reader or physical-device audit.

The generic design detector flags the warm ivory background as a common palette. It is intentional here: #FAF7F4 is explicitly specified by the user's design-flow reference and is balanced with the berry accent and original imagery.

## Editorial content expansion

The collection now has nine selectable looks: the original seven collages plus City ease and Expressive tailoring. A photographic split intro features a real collection look. Four sourced photographs are stored locally with provenance in assets/editorial/sources.json, linked in CREDITS.md, and credited in the page.

Each look has a concise description, suggested color swatches with readable color names, neutral style tags, and expandable occasion/proportion/swap guidance. These are editorial interpretations, not claims about brands, prices, or fiber composition. Gallery images use contain so garments remain visible.

The style journal has three original, expandable articles with photography. Their Explore links apply a matching style filter to the gallery. A separate native-disclosure styling guide covers silhouette, color, practical context, and personal details. Use lazy loading below the hero and reuse the same image files across hero, gallery, viewer, and journal.

Editorial-pass verification: nine-look registration, dropdown options, palettes, added notes, filters, selection toggling, favorites restore, feedback independence, storage errors, story links, local assets, and JavaScript syntax passed checks. The new desktop photo-led introduction was visually inspected and the new-look and story interactions were exercised in the browser. The browser connector then became unavailable (no enabled browser surfaces), so the final mobile and journal screenshot pass remains pending.
### Collection exploration refinement

Search uses the existing Outfit typography and form styling. It combines all typed words with the active occasion and style filters; query text is rendered as text, never HTML. Clear search preserves other filters. All looks, reset actions, footer shortcuts, and journal style links clear the query to make their destination predictable.

Comparison is an inline section revealed only after a visitor chooses a look. It reuses the card's image, named palette, pieces, and styling facts so content stays consistent. Up to two looks can be compared; remaining compare controls disable at the limit and a live status explains how to change the pair. Comparison is temporary and independent of feedback and favorites. Two columns become one on narrow phones, with focus returned to an available control when a look is removed.

Search/comparison verification: browser checks covered case-insensitive color search, combined occasion filtering, no-match recovery, two-look limit, filter-independent comparison, removal focus, image dialog, and clearing. No browser console errors were recorded. Layout geometry showed no horizontal overflow at actual CSS viewport widths of 355, 433, 853, and 1422 pixels; the narrowest comparison used a single column. Desktop was visually reviewed and captured in `.impeccable/review/search-comparison-desktop.png`. Mobile screenshot capture was clipped by the browser connector, so narrow-screen verification relies on DOM geometry rather than a complete screenshot. JavaScript syntax and diff checks passed. The only design-detector finding was the already documented intentional cream palette.
