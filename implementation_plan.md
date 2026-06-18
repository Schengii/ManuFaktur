# Full Project Cleanup and Refactoring

## Goal Description

The project currently contains numerous merge conflict markers, duplicated resources, inconsistent inline styles, missing utility classes, and duplicate back‑to‑top implementations. The goal is to clean the codebase, standardize the HTML head sections, introduce reusable CSS utilities, and ensure a single, accessible back‑to‑top button that uses the `.back-to-top` class.

## User Review Required

[!IMPORTANT]
> Please confirm that the outlined changes match your expectations. If you have any additional preferences (e.g., retaining certain inline styles or specific IDs), let us know before we proceed.

## Open Questions

- Should we completely remove the old `myBtn` back‑to‑top button and replace it with the utility‑styled `.back-to-top` button, or keep both (hidden) for backward compatibility?
- Do you want the Font Awesome CSS links to be loaded **both** from CDN *and* local for GDPR compliance, as currently intended?

## Proposed Changes

### HTML Files (Home.html, Leistungen.html, Bildergalerie.html, Kontakt.html, Impressum.html, Datenschutz.html, index.html)
- Remove all `<<<<<<<`, `=======`, `>>>>>>>` merge markers.
- Consolidate the `<head>` section to include:
  - Font Awesome CDN link.
  - Local Font Awesome stylesheet for GDPR.
  - Main `style.css` link (single).
  - Google Fonts preconnects and stylesheet.
- Replace inline `style="cursor: pointer;"` with the new utility class `cursor-pointer`.
- Ensure every navigation link uses the `cursor-pointer` class where needed.
- Remove duplicate IDs for the back‑to‑top button (`myBtn`). Replace with a single `<button class="back-to-top" aria-label="Nach oben">` placed before the closing `</body>`.
- Ensure the Lightbox markup appears only once (remove duplicated sections).

### CSS (style.css)
- Add utility class `.cursor-pointer { cursor: pointer; }`.
- Refine the `.back-to-top` styling to be a fixed circular button, remove the old hidden `#myBtn` styles.
- Remove duplicate `.back-to-top` definitions and any leftover conflict markers.
- Ensure the `.back-to-top:hover` rule only adjusts opacity.
- Verify all custom utility classes (e.g., `.centered`, `.centered-section`, `.no-margin-bottom`) have proper closing braces and no stray characters.

### JavaScript (Home.js)
- Update any references from `myBtn` to the new `.back-to-top` button (e.g., `document.querySelector('.back-to-top')`).
- Ensure the `topFunction` works with the new button.

## Verification Plan

### Automated Tests
- Run `npm run lint` (if a lint config exists) to ensure no syntax errors.
- Open the homepage in a headless browser (e.g., Chrome via Puppeteer) and verify:
  - No console warnings about duplicate IDs.
  - The back‑to‑top button appears after scrolling and functions correctly.
  - All navigation links are clickable and have the correct cursor.

### Manual Verification
- Manually load each page in a browser, check responsive layout on mobile widths.
- Test the Lightbox by clicking a gallery image.
- Verify Font Awesome icons load from both CDN and local source.
- Confirm the footer legal links are styled with `.footer-legal`.

---

*Implementation will proceed after your approval.*
