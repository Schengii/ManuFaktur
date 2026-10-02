# 🤝 Beitragsrichtlinien für ManuFAKTUR Schenk

Vielen Dank für dein Interesse, zu **ManuFAKTUR Schenk** beizutragen!
Dieses Projekt legt höchsten Wert auf handwerkliche Code-Qualität, Barrierefreiheit (A11y), 100 % DSGVO-Datenschutz und Performance ohne Framework-Overhead.

---

## 🛠️ Entwicklungsumgebung einrichten

1. **Repository klonen:**
   ```bash
   git clone https://github.com/Schengii/ManuFaktur.git
   cd ManuFaktur
   ```

2. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

3. **Lokalen Dev-Server starten:**
   ```bash
   npm start
   # Server läuft auf http://localhost:3000
   ```

---

## ⚙️ Build- & Test-Workflow

Änderungen am Design oder an der Skriptlogik werden **immer** in den Quellquelldateien vorgenommen:
- CSS: `style.css`
- JavaScript: `Home.js`

Vor jedem Commit oder Pull Request muss der Produktions-Build ausgeführt werden:

```bash
# Kompiliert style.min.css, Home.min.js und aktualisiert Inline-Script CSP-Hashes:
npm run build

# Führt alle End-to-End- & CSP-Integritätstests aus:
npm test
```

> [!IMPORTANT]
> Bitte editiere niemals `style.min.css` oder `Home.min.js` direkt. Diese werden durch `npm run build` automatisch generiert und überschrieben.

---

## 📝 Commit-Konventionen

Wir nutzen [Conventional Commits](https://www.conventionalcommits.org/de/v1.0.0/):

- `feat:` Neue Funktion oder neues Feature (z. B. `feat: add filter for miniature paintings`)
- `fix:` Fehlerbehebung (z. B. `fix: correct modal close on escape key`)
- `docs:` Dokumentation (z. B. `docs: update CHANGELOG.md`)
- `style:` Reine Code-Formatierung (z. B. Leerzeichen, Einrückung)
- `refactor:` Code-Umstrukturierung ohne funktionale Änderung
- `perf:` Performance-Optimierung (z. B. Bildkompression, Cache-Anpassung)
- `test:` Hinzufügen oder Anpassen von Tests
- `chore:` Aktualisierung von Abhängigkeiten, Build-Skripten, etc.

---

## 🤖 Arbeiten mit KI-Assistenten (Claude & Gemini)

Dieses Repository ist für die Zusammenarbeit mit KI-Agenten optimiert:
- **Claude Code:** Richtlinien sind in [CLAUDE.md](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/ManuFaktur/CLAUDE.md) und Ignorier-Muster in [.claudeignore](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/ManuFaktur/.claudeignore) definiert.
- **Google Gemini & Antigravity:** Richtlinien sind in [GEMINI.md](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/ManuFaktur/GEMINI.md) dokumentiert.
- Beide Assistenten sind angewiesen, die Build-Pipeline einzuhalten und keine externen CDNs/Tracker einzuführen.
