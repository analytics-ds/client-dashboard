import { mkdir, writeFile } from 'node:fs/promises';
import crypto from 'node:crypto';
import { CLIENTS, ACCOUNTS } from './clients.js';
import { KEYWORDS } from './keywords.js';
import { buildAuth, fetchSiteWindows, fetchMonthlyKeywords, rangesForWindow } from './gsc.js';
import { renderDashboard } from './render.js';

const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'DASHBOARD_PASSWORD'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`Variables manquantes: ${missing.join(', ')}`);
  process.exit(1);
}

// Construit un objet auth par compte Google reference dans ACCOUNTS.
// Un compte sans refresh token dispo est ignore (ses clients tomberont en erreur claire).
const authByAccount = {};
for (const [account, secretName] of Object.entries(ACCOUNTS)) {
  const refreshToken = process.env[secretName];
  if (!refreshToken) {
    console.warn(`/!\\ Pas de refresh token pour le compte "${account}" (secret ${secretName} absent)`);
    continue;
  }
  authByAccount[account] = buildAuth({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken,
  });
}

console.log(`Pull GSC pour ${CLIENTS.length} clients x 3 fenetres (7/28/90, S vs S-1 et vs N-1)...`);

const errWindows = (msg) => ({ '7': { error: msg }, '28': { error: msg }, '90': { error: msg }, daily: { error: msg } });

async function pullClient(client) {
  const auth = authByAccount[client.account];
  if (!auth) {
    return { client, data: { windows: errWindows(`Compte Google "${client.account}" non configuré (refresh token manquant)`) } };
  }
  const gsc = await fetchSiteWindows(auth, client.gscProperty)
    .catch(err => errWindows(err.message));

  // Suivi mensuel des mots clés (après les fenêtres, pour lisser le débit GSC)
  const monthly = await fetchMonthlyKeywords(auth, client.gscProperty, KEYWORDS[client.domain])
    .catch(err => ({ error: err.message }));

  const w7 = gsc['7'];
  const kwCount = monthly?.rows?.length ?? 0;
  const status = w7?.error
    ? `ERR ${w7.error.slice(0, 80)}`
    : `${w7?.current?.clicks ?? 0} clics 7j (S-1 ${w7?.previous?.clicks ?? 0} | N-1 ${w7?.yearAgo?.clicks ?? 0}) | ${kwCount} KW suivis`;
  console.log(`  ${(client.label || client.domain).padEnd(24)} ${status}`);

  return { client, data: { windows: gsc, monthly } };
}

// Un client lance deja ~34 requetes en parallele. Plusieurs clients sur le MEME
// compte Google saturent le quota de debit GSC ("load quota exceeded").
// => on regroupe par compte et on traite 1 client a la fois par compte,
//    les differents comptes tournant en parallele.
const byAccount = new Map();
for (const client of CLIENTS) {
  if (!byAccount.has(client.account)) byAccount.set(client.account, []);
  byAccount.get(client.account).push(client);
}
const results = new Map();
await Promise.all([...byAccount.values()].map(async (clients) => {
  for (const client of clients) {
    results.set(client, await pullClient(client));
  }
}));
const clientsData = CLIENTS.map(client => results.get(client));

const periods = {
  '7': rangesForWindow(7),
  '28': rangesForWindow(28),
  '90': rangesForWindow(90),
};

// ---- Chiffrement du payload (AES-256-GCM, cle derivee du mot de passe via PBKDF2).
// Sans le mot de passe, le HTML ne contient que du chiffre illisible.
const payload = {
  generatedAt: new Date().toISOString(),
  periods,
  clients: clientsData.map(({ client, data }) => ({
    label: client.label || client.domain,
    domain: client.domain,
    gscProperty: client.gscProperty,
    brandRegex: client.brandRegex || '',
    data,
  })),
};

const PBKDF2_ITERATIONS = 250000;
const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(process.env.DASHBOARD_PASSWORD, salt, PBKDF2_ITERATIONS, 32, 'sha256');
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const ct = Buffer.concat([cipher.update(plaintext), cipher.final()]);
const tag = cipher.getAuthTag();

const encrypted = {
  salt: salt.toString('base64'),
  iv: iv.toString('base64'),
  iterations: PBKDF2_ITERATIONS,
  // WebCrypto AES-GCM attend ciphertext || tag concatenes
  ciphertext: Buffer.concat([ct, tag]).toString('base64'),
};

const html = renderDashboard({ encrypted, generatedAt: payload.generatedAt });

await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', html);
await writeFile('dist/.nojekyll', '');

console.log(`\nGenere: dist/index.html (${(html.length / 1024).toFixed(1)} KB, payload chiffre ${(plaintext.length / 1024).toFixed(1)} KB)`);
