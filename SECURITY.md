# Sicherheitshinweise (Security Policy)

Die Sicherheit der Website **ManuFAKTUR Schenk** und der Schutz der Daten von Besuchern und Kunden haben höchste Priorität.

## Sicherheitsarchitektur

1. **Content Security Policy (CSP):**
   - Strenge CSP mit Nonce- und SHA-256-Hashes für alle Inline-Skripte.
   - Verbot von unsicheren Inline-Styles und Inline-Event-Handlern (`unsafe-inline`, `unsafe-eval`).
   - Automatische Hash-Berechnung über `npm run csp:update` in `vercel.json` und `.htaccess`.

2. **DSGVO & Datenschutz:**
   - Keine externen Google Fonts oder CDNs; alle Webfonts und Icons werden lokal ausgeliefert.
   - Cookiefreies, anonymisiertes Tracking über Vercel Web Analytics.
   - Drittanbieter (z. B. Google Maps) werden ausschließlich nach aktiver Nutzerinteraktion (Opt-in) geladen.

3. **Geheimnisse & Umgebungsvariablen:**
   - Vertrauliche Tokens und Zugangsdaten verbleiben in `.env` / `.env.local` und werden durch `.gitignore` und `.claudeignore` strikt vor Versionsverwaltung geschützt.
   - Das Projekt stellt eine anonymisierte Vorlage `.env.example` bereit.
   - **Automatisierter Pre-Commit Hook:** Über `.githooks/pre-commit` und `scripts/check-secrets.js` wird vor jedem Commit und in der GitHub Actions CI geprüft, dass keine `.env`-Dateien, Private Keys oder API-Tokens gestagt werden.

4. **Formular- und Eingabesicherheit:**
   - Bot-Schutz über unsichtbare Honeypot-Felder (`botcheck`) und Mindestverweildauer.
   - URL-Parameter werden ausschließlich als Textknoten (`textContent`), niemals als ungesichertes HTML (`innerHTML`) gerendert (Schutz vor Reflected XSS).

## Sicherheitslücken melden

Solltest du eine Sicherheitslücke oder Schwachstelle in diesem Projekt entdecken, melde diese bitte vertraulich per E-Mail an:

📧 **manufaktur-malerei@web.de**

Bitte verzichte auf die Veröffentlichung von Schwachstellen in öffentlichen GitHub Issues, bis ein entsprechender Fix bereitgestellt werden konnte.
