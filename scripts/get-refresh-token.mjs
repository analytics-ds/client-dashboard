#!/usr/bin/env node
// Obtenir un refresh_token Google OAuth par COMPTE Google.
//
// Tes acces clients sont repartis sur 3 comptes : tu lances ce script 3 fois,
// en te loguant a chaque fois avec le bon compte, et tu stockes chaque token
// dans le secret GitHub correspondant (cf. src/clients.js > ACCOUNTS) :
//
//   pierre@datashake.fr     -> secret GOOGLE_REFRESH_TOKEN_PIERRE
//   analytics@datashake.fr  -> secret GOOGLE_REFRESH_TOKEN_DATASHAKE
//   analytics@upearly.fr    -> secret GOOGLE_REFRESH_TOKEN_UPEARLY
//
// Usage:
//   1. Creer un OAuth client "Desktop app" dans Google Cloud Console
//   2. Activer l'API Search Console dans le meme projet
//   3. export GOOGLE_CLIENT_ID="..." ; export GOOGLE_CLIENT_SECRET="..."
//   4. npm run get-refresh-token
//   5. Ouvrir l'URL, se loguer avec LE compte voulu, accepter
//   6. Copier le refresh_token affiche dans le secret GitHub du compte

import { google } from 'googleapis';
import http from 'node:http';
import { URL } from 'node:url';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error('GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET requis dans l\'environnement');
  process.exit(1);
}

const PORT = 8765;
const REDIRECT = `http://localhost:${PORT}/oauth2callback`;
const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

const oauth2 = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT);
const authUrl = oauth2.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: SCOPES });

console.log('\n>>> Ouvre cette URL dans ton navigateur:\n');
console.log(authUrl);
console.log('\n>>> Connecte-toi avec LE compte voulu (pierre@datashake.fr, analytics@datashake.fr ou analytics@upearly.fr).\n');

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
    if (reqUrl.pathname !== '/oauth2callback') { res.writeHead(404).end('Not found'); return; }
    const code = reqUrl.searchParams.get('code');
    if (!code) { res.writeHead(400).end('Pas de code'); return; }
    const { tokens } = await oauth2.getToken(code);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(
      '<h1>OK</h1><p>Refresh token affiche dans le terminal. Tu peux fermer cet onglet.</p>'
    );
    console.log('\n=== TOKEN ===');
    if (!tokens.refresh_token) {
      console.log('PAS de refresh_token recu. Va sur https://myaccount.google.com/permissions, retire l\'app, et relance.');
    } else {
      console.log('\nGOOGLE_REFRESH_TOKEN=' + tokens.refresh_token + '\n');
      console.log('Colle-le dans le secret GitHub du compte correspondant (Settings > Secrets > Actions).');
    }
    setTimeout(() => server.close(() => process.exit(0)), 500);
  } catch (err) {
    console.error('Erreur:', err.message);
    res.writeHead(500).end('Erreur: ' + err.message);
    process.exit(1);
  }
});
server.listen(PORT, () => console.log(`>>> Serveur d'attente sur ${REDIRECT}\n`));
