// ===== KONFIGURATOR LOGIK =====
const STORAGE_KEY = 'manufaktur_konfigurator_state';

const state = {
  step: 1,
  motiv: null,
  format: null,
  technik: null,
  lieferzeit: null,
  referenz: null
};

// ── localStorage: Speichern & Laden ──────────────────────────────────────

function saveConfig() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { /* localStorage nicht verfügbar */ }
}

function loadSavedConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return (saved && typeof saved === 'object') ? saved : null;
  } catch (e) { return null; }
}

// Das Banner trägt im HTML die Klasse .hidden (display: none !important).
function setRestoreBannerVisible(visible) {
  const banner = document.getElementById('restore-banner');
  if (banner) banner.classList.toggle('hidden', !visible);
}

function restoreSavedConfig() {
  const saved = loadSavedConfig();
  if (!saved) return;

  // Zustand wiederherstellen – nur bekannte Felder und nur Werte, zu denen es eine Karte gibt
  ['motiv', 'format', 'technik'].forEach((key, i) => {
    const value = typeof saved[key] === 'string' ? saved[key] : null;
    state[key] = (value && findCardByValue(CARD_SELECTORS[i], value)) ? value : null;
  });
  state.lieferzeit = state.technik ? lieferzeitFor(state.technik) : null;
  state.referenz = typeof saved.referenz === 'string' ? saved.referenz.slice(0, 200) : null;
  setRestoreBannerVisible(false);

  // Auswahl visuell wiederherstellen
  if (state.motiv) {
    const card = findCardByValue('#panel-1 .option-card', state.motiv);
    if (card) { card.classList.add('selected'); card.setAttribute('aria-pressed', 'true'); }
    document.getElementById('next-1').disabled = false;
  }
  if (state.format) {
    const card = findCardByValue('#panel-2 .format-card', state.format);
    if (card) { card.classList.add('selected'); card.setAttribute('aria-pressed', 'true'); }
    document.getElementById('next-2').disabled = false;
  }
  if (state.technik) {
    const card = findCardByValue('#panel-3 .technique-card', state.technik);
    if (card) { card.classList.add('selected'); card.setAttribute('aria-pressed', 'true'); }
    document.getElementById('next-3').disabled = false;
  }

  // Höchstens bis zu dem Schritt springen, dessen Vorgänger vollständig ausgefüllt sind
  const maxStep = !state.motiv ? 1 : !state.format ? 2 : !state.technik ? 3 : 4;
  const targetStep = Math.min(Math.max(parseInt(saved.step, 10) || 1, 1), maxStep);
  if (targetStep === 4) buildSummary();
  goToStep(targetStep);
}

function clearSavedConfig() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* */ }
  setRestoreBannerVisible(false);
}

const CARD_SELECTORS = ['#panel-1 .option-card', '#panel-2 .format-card', '#panel-3 .technique-card'];

function lieferzeitFor(technik) {
  return technik === 'Öl' ? 'ca. 4–6 Wochen' : 'ca. 2–3 Wochen';
}

function findCardByValue(selector, value) {
  return Array.from(document.querySelectorAll(selector))
    .find(c => c.dataset.value === value) || null;
}

// ── Initialisierung: gespeicherten State prüfen ──────────────────────────
(function checkSavedState() {
  const saved = loadSavedConfig();
  if (saved && (saved.motiv || saved.format || saved.technik)) {
    setRestoreBannerVisible(true);
  }
})();

// ── Karten-Auswahl ────────────────────────────────────────────────────────

function selectOption(card, group) {
  document.querySelectorAll('#panel-1 .option-card').forEach(c => {
    c.classList.remove('selected');
    c.setAttribute('aria-pressed', 'false');
  });
  card.classList.add('selected');
  card.setAttribute('aria-pressed', 'true');
  state.motiv = card.dataset.value;
  document.getElementById('next-1').disabled = false;
  document.getElementById('hint-1').classList.remove('visible');
  saveConfig();
}

function selectFormat(card) {
  document.querySelectorAll('#panel-2 .format-card').forEach(c => {
    c.classList.remove('selected');
    c.setAttribute('aria-pressed', 'false');
  });
  card.classList.add('selected');
  card.setAttribute('aria-pressed', 'true');
  state.format = card.dataset.value;
  document.getElementById('next-2').disabled = false;
  document.getElementById('hint-2').classList.remove('visible');
  saveConfig();
}

function selectTechnique(card) {
  document.querySelectorAll('#panel-3 .technique-card').forEach(c => {
    c.classList.remove('selected');
    c.setAttribute('aria-pressed', 'false');
  });
  card.classList.add('selected');
  card.setAttribute('aria-pressed', 'true');
  state.technik = card.dataset.value;
  state.lieferzeit = lieferzeitFor(state.technik);
  document.getElementById('next-3').disabled = false;
  document.getElementById('hint-3').classList.remove('visible');
  saveConfig();
}

// ── Navigation ────────────────────────────────────────────────────────────

function nextStep(current) {
  const hintEl = document.getElementById('hint-' + current);
  if (current === 1 && !state.motiv) { hintEl.classList.add('visible'); return; }
  if (current === 2 && !state.format) { hintEl.classList.add('visible'); return; }
  if (current === 3 && !state.technik) { hintEl.classList.add('visible'); return; }

  if (current === 3) buildSummary();
  goToStep(current + 1);
}

// Kinder einer progressbar sind für Screenreader unsichtbar – der Schritt steht deshalb in aria-valuetext.
function updateProgressAria() {
  const bar = document.querySelector('.progress-bar-container');
  if (!bar) return;
  const step = state.step || 1;
  const labels = document.querySelectorAll('.progress-step .step-label');
  const label = labels[step - 1] ? labels[step - 1].textContent.trim() : '';
  const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
  bar.setAttribute('aria-valuenow', String(step));
  bar.setAttribute('aria-valuetext', isEn ? `Step ${step} of 4: ${label}` : `Schritt ${step} von 4: ${label}`);
  bar.setAttribute('aria-label', isEn ? 'Configuration progress' : 'Konfigurationsfortschritt');
}

function prevStep(current) {
  goToStep(current - 1);
}

function goToStep(step) {
  document.querySelectorAll('.config-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.progress-step').forEach((s, i) => {
    s.classList.remove('active', 'completed');
    if (i + 1 < step) s.classList.add('completed');
    if (i + 1 === step) s.classList.add('active');
  });
  document.getElementById('panel-' + step).classList.add('active');
  state.step = step;
  updateProgressAria();
  saveConfig();
  document.querySelector('.progress-bar-container').scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

// ── Zusammenfassung ───────────────────────────────────────────────────────

// Übersetzt die intern (immer auf Deutsch) gespeicherten Auswahlwerte für die Anzeige,
// damit die Zusammenfassung auch bei aktivem Englisch korrekt lokalisiert erscheint.
const VALUE_LABELS = {
  motiv: {
    'Tierportrait': { de: 'Tierportrait', en: 'Animal Portrait' },
    'Landschaft': { de: 'Landschaft', en: 'Landscape' },
    'Stillleben': { de: 'Stillleben / Pflanzen', en: 'Still Life / Plants' },
    'Sonstiges': { de: 'Sonstiges / Eigene Idee', en: 'Other / Custom Idea' }
  },
  format: {
    'Individuell': { de: 'Individuell', en: 'Custom' }
  },
  technik: {
    'Acryl': { de: 'Acrylfarben', en: 'Acrylic Paint' },
    'Öl': { de: 'Ölfarben', en: 'Oil Paint' }
  },
  lieferzeit: {
    'ca. 2–3 Wochen': { de: 'ca. 2–3 Wochen', en: 'approx. 2–3 weeks' },
    'ca. 4–6 Wochen': { de: 'ca. 4–6 Wochen', en: 'approx. 4–6 weeks' }
  }
};
function localizedLabel(map, key) {
  const entry = map[key];
  const lang = (typeof getLanguage === 'function') ? getLanguage() : 'de';
  if (!entry) return key;
  return entry[lang] || entry.de;
}

function buildSummary() {
  document.getElementById('summary-motiv').textContent = localizedLabel(VALUE_LABELS.motiv, state.motiv);
  document.getElementById('summary-format').textContent = localizedLabel(VALUE_LABELS.format, state.format);
  document.getElementById('summary-technik').textContent = localizedLabel(VALUE_LABELS.technik, state.technik);
  document.getElementById('summary-lieferzeit').textContent = localizedLabel(VALUE_LABELS.lieferzeit, state.lieferzeit);

  // Referenz-Gemälde aus Galerie/Favoriten (kann aus der URL stammen → nur als Text)
  const refRow = document.getElementById('summary-referenz-row');
  if (refRow) {
    refRow.classList.toggle('hidden', !state.referenz);
    document.getElementById('summary-referenz').textContent = state.referenz || '–';
  }

  // Prefilled Kontakt-Link mit allen Parametern für Formular-Vorausfüllung
  const params = new URLSearchParams({
    motiv: state.motiv || '',
    format: state.format || '',
    technik: state.technik || ''
  });
  if (state.referenz) params.set('ref', state.referenz);
  document.getElementById('anfrage-link').href = `Kontakt.html?${params.toString()}`;
}
window.buildSummary = buildSummary;

// ── Tastaturunterstützung für Karten ─────────────────────────────────────
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' || e.key === ' ') {
    const t = e.target;
    if (t.classList.contains('option-card')) { e.preventDefault(); t.click(); }
    if (t.classList.contains('format-card')) { e.preventDefault(); t.click(); }
    if (t.classList.contains('technique-card')) { e.preventDefault(); t.click(); }
  }
});

// ── Klick-Delegation (ersetzt vormalige inline onclick-Attribute für CSP) ──
document.addEventListener('click', function (e) {
  const optionCard = e.target.closest('#panel-1 .option-card');
  if (optionCard) { selectOption(optionCard, 'motiv'); return; }

  const formatCard = e.target.closest('#panel-2 .format-card');
  if (formatCard) { selectFormat(formatCard); return; }

  const techniqueCard = e.target.closest('#panel-3 .technique-card');
  if (techniqueCard) { selectTechnique(techniqueCard); return; }

  const nextBtn = e.target.closest('.btn-next[id^="next-"]');
  if (nextBtn) { nextStep(parseInt(nextBtn.id.replace('next-', ''), 10)); return; }

  const backBtn = e.target.closest('.btn-back[data-step]');
  if (backBtn) { prevStep(parseInt(backBtn.dataset.step, 10)); return; }

  // State nach Anfrage-Klick löschen (Navigation zu Kontakt.html läuft normal weiter)
  if (e.target.closest('#anfrage-link')) { clearSavedConfig(); return; }

  if (e.target.closest('#restore-btn')) { restoreSavedConfig(); return; }
  if (e.target.closest('#clear-btn')) { clearSavedConfig(); return; }
});
