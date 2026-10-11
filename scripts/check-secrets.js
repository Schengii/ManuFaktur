/**
 * scripts/check-secrets.js
 *
 * Pre-Commit Sicherheitsprüfung für ManuFAKTUR Schenk:
 * 1. Blockiert das Staging und Committen von .env-Dateien (.env, .env.local etc., außer .env.example).
 * 2. Scannt geänderte Zeilen (git diff --cached) nach sensiblen Tokens,
 *    Private Keys, Cloud-Credentials und Vercel-Tokens.
 *
 * Aufruf:
 *   node scripts/check-secrets.js --staged   (Pre-Commit Hook)
 *   node scripts/check-secrets.js --all      (Vollständiger Projekt-Scan)
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Dateinamen-Muster, die unter keinen Umständen versioniert werden dürfen
const BLOCKED_FILE_PATTERNS = [
  /^\.env$/i,
  /^\.env\..+$/i,
  /^.*\.env$/i,
  /^.*\.pem$/i,
  /^.*\.key$/i,
  /^id_rsa$/i,
  /^id_ed25519$/i
];

// Ausnahmen für sichere Vorlagendateien
const ALLOWED_FILES = new Set([
  '.env.example'
]);

// Bekannte Token- und Secret-Muster für Inhalte
const SECRET_SIGNATURES = [
  {
    name: 'Private Key (PEM/SSH)',
    regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/
  },
  {
    name: 'Vercel Token / OIDC JWT in Konfiguration',
    regex: /(?:VERCEL_TOKEN|VERCEL_OIDC_TOKEN)\s*=\s*["']?[A-Za-z0-9_\-.]+/i
  },
  {
    name: 'JWT Signatur (eyJ...) in Zuweisung',
    regex: /(?:token|secret|auth|bearer)\s*[:=]\s*["']eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/i
  },
  {
    name: 'GitHub Personal Access Token (Classic / Fine-grained)',
    regex: /(?:ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{50,82})/
  },
  {
    name: 'OpenAI / Anthropic API Key',
    regex: /(?:sk-ant-api[0-9]{2}-[A-Za-z0-9_-]{80,}|sk-[A-Za-z0-9]{40,})/
  },
  {
    name: 'AWS Access Key ID / Secret Access Key',
    regex: /(?:AKIA[0-9A-Z]{16}|aws_secret_access_key\s*=\s*["'][A-Za-z0-9/+=]{40}["'])/
  },
  {
    name: 'Google API Key',
    regex: /AIza[0-9A-Za-z\-_]{35}/
  },
  {
    name: 'Slack Token',
    regex: /xox[baprs]-[0-9]{10,}-[A-Za-z0-9]{20,}/
  }
];

function getStagedFiles() {
  try {
    const stdout = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      cwd: ROOT,
      encoding: 'utf8'
    });
    return stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  } catch (err) {
    console.error('Fehler beim Auslesen gestagter Git-Dateien:', err.message);
    return [];
  }
}

function getStagedDiffForFile(file) {
  try {
    return execSync(`git diff --cached -U0 -- "${file}"`, {
      cwd: ROOT,
      encoding: 'utf8'
    });
  } catch {
    return '';
  }
}

function checkFilename(filePath) {
  const base = path.basename(filePath);
  if (ALLOWED_FILES.has(base)) {
    return null;
  }
  for (const pattern of BLOCKED_FILE_PATTERNS) {
    if (pattern.test(base)) {
      return `Dateiname blockiert: '${filePath}' (Umgebungs- oder Schlüsseldatei)`;
    }
  }
  return null;
}

function checkContent(file, addedLines) {
  // .env.example darf Platzhalter enthalten
  if (path.basename(file) === '.env.example') {
    return [];
  }

  const findings = [];
  for (const { lineNum, text } of addedLines) {
    for (const sig of SECRET_SIGNATURES) {
      if (sig.regex.test(text)) {
        findings.push({
          file,
          lineNum,
          name: sig.name,
          snippet: text.trim().substring(0, 80)
        });
      }
    }
  }
  return findings;
}

function parseAddedLinesFromDiff(diffText) {
  const lines = diffText.split(/\r?\n/);
  const added = [];
  let currentLine = 0;

  for (const line of lines) {
    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) {
      currentLine = parseInt(hunkMatch[1], 10);
      continue;
    }
    if (line.startsWith('+') && !line.startsWith('+++')) {
      added.push({
        lineNum: currentLine,
        text: line.substring(1)
      });
      currentLine++;
    } else if (!line.startsWith('-')) {
      currentLine++;
    }
  }
  return added;
}

function getTrackedFiles() {
  try {
    const stdout = execSync('git ls-files', {
      cwd: ROOT,
      encoding: 'utf8'
    });
    return stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  } catch (err) {
    console.error('Fehler beim Auslesen getrackter Git-Dateien:', err.message);
    return [];
  }
}

function run() {
  const isAllMode = process.argv.includes('--all');
  const filesToCheck = isAllMode ? getTrackedFiles() : getStagedFiles();

  if (filesToCheck.length === 0) {
    console.log(`✔ Pre-Commit Secrets-Check: Keine ${isAllMode ? 'getrackten' : 'gestagten'} Dateien zu prüfen.`);
    process.exit(0);
  }

  const fileErrors = [];
  const contentErrors = [];

  for (const file of filesToCheck) {
    const fileError = checkFilename(file);
    if (fileError) {
      fileErrors.push(fileError);
      continue;
    }

    if (!isAllMode) {
      const diff = getStagedDiffForFile(file);
      if (diff) {
        const addedLines = parseAddedLinesFromDiff(diff);
        const matches = checkContent(file, addedLines);
        contentErrors.push(...matches);
      }
    } else {
      // Im --all Modus (z. B. CI) den gesamten Dateiinhalt von Textdateien prüfen
      const filePath = path.join(ROOT, file);
      if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          // Ignoriere Binärdateien
          if (!content.includes('\0')) {
            const lines = content.split(/\r?\n/).map((text, i) => ({ lineNum: i + 1, text }));
            const matches = checkContent(file, lines);
            contentErrors.push(...matches);
          }
        } catch {
          // Ignoriere unlesbare/Binär-Dateien
        }
      }
    }
  }

  if (fileErrors.length > 0 || contentErrors.length > 0) {
    console.error('\n🚨 ==============================================================');
    console.error('   GIT PRE-COMMIT ABGEBROCHEN: Sensible Daten erkannt!');
    console.error('==============================================================\n');

    if (fileErrors.length > 0) {
      console.error('Folgende gesperrte Dateien dürfen NICHT committet werden:');
      for (const err of fileErrors) {
        console.error(`  ✖ ${err}`);
      }
      console.error('\n💡 Tipp: Entferne die Datei aus dem Git-Index mit:');
      console.error('   git reset HEAD <datei>  (bzw. git rm --cached <datei>)');
      console.error('   Passe ggf. .gitignore an.\n');
    }

    if (contentErrors.length > 0) {
      console.error('Folgende verdächtige Schlüssel / Secrets wurden im Diff gefunden:');
      for (const item of contentErrors) {
        console.error(`  ✖ [${item.name}] in ${item.file}:${item.lineNum}`);
        console.error(`    Inhalt: ${item.snippet} ...`);
      }
      console.error('\n💡 Tipp: Verwende Platzhalter oder lagere Keys in .env aus.');
    }

    console.error('==============================================================\n');
    process.exit(1);
  }

  console.log('✔ Pre-Commit Secrets-Check erfolgreich: Keine .env-Dateien oder sensiblen API-Keys im Commit.');
  process.exit(0);
}

run();
