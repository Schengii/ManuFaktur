## 📝 Beschreibung der Änderung

Bitte beschreibe kurz, was geändert wurde und welches Problem damit gelöst wird.

---

## 🔍 Art der Änderung

- [ ] 🐛 Fehlerbehebung (Bugfix)
- [ ] ✨ Neues Feature
- [ ] 🎨 Design- / Style-Anpassung
- [ ] ⚡ Performance-Optimierung
- [ ] 🔒 Sicherheits- / CSP-Update
- [ ] 📚 Dokumentation
- [ ] 🧹 Refactoring / Bereinigung

---

## ✅ Checkliste vor dem Merge

- [ ] **Produktions-Build ausgeführt:** `npm run build` ausgeführt und Änderungen an `style.min.css` und `Home.min.js` mit committet.
- [ ] **CSP-Hashes aktuell:** Falls Inline-Skripte verändert wurden, ist `npm run csp:update` gelaufen.
- [ ] **Tests bestanden:** `npm test` lokal erfolgreich ausgeführt (keine Konsolenfehler / CSP-Verstöße).
- [ ] **Mehrsprachigkeit geprüft:** Texte in `I18N_DICTIONARY` für Deutsch und Englisch eingepflegt.
- [ ] **Barrierefreiheit (A11y):** Tastaturbedienung und ARIA-Labels geprüft.
- [ ] **Dark & Light Mode:** In beiden Themes optisch validiert.
- [ ] **Mobil & Desktop:** Responsive Darstellung im Browser getestet.
