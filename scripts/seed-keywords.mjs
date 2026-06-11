// Remplit src/keywords.js avec les top requêtes hors marque de chaque client
// (90 derniers jours, triées par clics). Ne touche PAS aux listes déjà remplies,
// pour ne pas écraser les ajustements manuels.
//
// Usage (mêmes variables d'env que le build) :
//   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... GOOGLE_REFRESH_TOKEN_*=... node scripts/seed-keywords.mjs

import { writeFile } from 'node:fs/promises';
import { google } from 'googleapis';
import { CLIENTS, ACCOUNTS } from '../src/clients.js';
import { KEYWORDS } from '../src/keywords.js';
import { buildAuth, rangesForWindow } from '../src/gsc.js';

const TOP_N = 15;
const MIN_CLICKS = 1;

const authByAccount = {};
for (const [account, secretName] of Object.entries(ACCOUNTS)) {
  const refreshToken = process.env[secretName];
  if (refreshToken) {
    authByAccount[account] = buildAuth({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken,
    });
  }
}

const { current } = rangesForWindow(90);
const result = { ...KEYWORDS };

for (const client of CLIENTS) {
  const existing = KEYWORDS[client.domain];
  if (existing && existing.length) {
    console.log(`${client.label}: liste déjà remplie (${existing.length} mots clés), conservée`);
    continue;
  }
  const auth = authByAccount[client.account];
  if (!auth) {
    console.warn(`${client.label}: pas de refresh token pour le compte "${client.account}", ignoré`);
    continue;
  }
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  let rows = [];
  try {
    const res = await searchconsole.searchanalytics.query({
      siteUrl: client.gscProperty,
      requestBody: { ...current, dimensions: ['query'], rowLimit: 1000, dataState: 'final' },
    });
    rows = res.data.rows ?? [];
  } catch (err) {
    console.error(`${client.label}: erreur GSC: ${err.response?.data?.error?.message ?? err.message}`);
    continue;
  }
  let brandRe = null;
  if (client.brandRegex) { try { brandRe = new RegExp(client.brandRegex, 'i'); } catch {} }
  const top = rows
    .filter(r => r.keys?.[0] && (!brandRe || !brandRe.test(r.keys[0])) && (r.clicks ?? 0) >= MIN_CLICKS)
    .sort((a, b) => (b.clicks - a.clicks) || (b.impressions - a.impressions))
    .slice(0, TOP_N)
    .map(r => r.keys[0]);
  result[client.domain] = top;
  console.log(`${client.label}: ${top.length} mots clés seedés`);
}

const header = `// ============================================================================
// Mots clés suivis par client (suivi mensuel de positions)
// ============================================================================
//
// Clé = domain du client (doit matcher CLIENTS dans clients.js).
// Valeur = liste de mots clés EXACTEMENT comme ils apparaissent dans GSC
// (toujours en minuscules, GSC normalise les requêtes).
//
// Pour ajuster la liste d'un client : éditer ce fichier, commit, push.
// Le dashboard se met à jour au prochain build (quotidien, ou push immédiat).
//
// Une liste vide [] = pas encore de seed. Le workflow "Seed keywords"
// (Actions > Seed keywords > Run workflow) remplit automatiquement les listes
// vides avec les top requêtes hors marque des 90 derniers jours, sans toucher
// aux listes déjà remplies.

export const KEYWORDS = `;

const body = '{\n' + CLIENTS.map(c => {
  const list = result[c.domain] ?? [];
  const items = list.length ? '\n' + list.map(k => `    ${JSON.stringify(k)},`).join('\n') + '\n  ' : '';
  return `  '${c.domain}': [${items}],`;
}).join('\n') + '\n};\n';

await writeFile(new URL('../src/keywords.js', import.meta.url), header + body);
console.log('\nsrc/keywords.js mis à jour');
