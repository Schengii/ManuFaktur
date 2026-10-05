/**
 * ESLint-Konfiguration (Flat Config).
 * Home.js und assets/js/*.js sind klassische Skripte ohne Module und teilen sich den
 * globalen Scope (siehe CLAUDE.md). `no-undef` fängt deshalb Tippfehler und fehlende
 * Abhängigkeiten ab; bewusst geteilte Namen stehen unten in den jeweiligen globals-Listen.
 * Neue seitenübergreifende Globals dort ergänzen, nicht per eslint-disable umgehen.
 */
const js = require('@eslint/js');
const globals = require('globals');

// In auftrag.js / artworks-data.js definiert, in Home.js benutzt.
const providedByOtherScripts = {
  state: 'readonly',
  buildSummary: 'readonly',
  saveConfig: 'readonly',
  updateProgressAria: 'readonly',
  changeSlide: 'readonly', // window.changeSlide, in Home.js selbst gesetzt
  ARTWORKS_METADATA: 'readonly',
  ARTWORKS_METADATA_EN: 'readonly',
  I18N_DICTIONARY: 'readonly' // assets/js/i18n.js, bei Bedarf nachgeladen
};

// In Home.js definiert, in auftrag.js benutzt.
const providedByHomeJs = {
  currentLang: 'readonly',
  getLanguage: 'readonly',
  prefersReducedMotion: 'readonly'
};

const scriptRules = {
  // Top-Level-Funktionen und -Variablen sind in klassischen Skripten die gemeinsame API.
  'no-unused-vars': ['warn', { vars: 'local', args: 'none', caughtErrors: 'none' }],
  // Leere catch-Blöcke sind für localStorage-Zugriffe (Private Mode) gewollt.
  'no-empty': ['error', { allowEmptyCatch: true }]
};

module.exports = [
  {
    ignores: [
      'node_modules/**', 'archive_sources/**', 'assets/imgTxt/**', 'assets/vendor/**',
      '**/*.min.js'
    ]
  },
  js.configs.recommended,
  {
    files: ['Home.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.browser, ...providedByOtherScripts }
    },
    rules: scriptRules
  },
  {
    files: ['assets/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.browser, ...providedByHomeJs }
    },
    rules: scriptRules
  },
  {
    files: ['sw.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: globals.serviceworker }
  },
  {
    files: ['scripts/**/*.js', 'eslint.config.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs', globals: globals.node }
  },
  {
    // Tests laufen in Node, werten aber Code im Browser aus (page.evaluate).
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.browser, ARTWORKS_METADATA: 'readonly', I18N_DICTIONARY: 'readonly', STATUS_TEXTS_DE: 'readonly', axe: 'readonly' }
    }
  }
];
