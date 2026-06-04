# Dashboard Clients · Search Console

Vision "1 clin d'oeil" de l'evolution SEO de tes clients : clics, impressions, position, **vs semaine precedente (S-1) ET vs annee precedente (N-1)**, detail des pages qui montent / descendent, mots-cles, avec exclusion du trafic de marque.

- Genere par GitHub Actions chaque jour (cron 7h UTC), site statique sur GitHub Pages, zero serveur.
- **Acces protege par mot de passe** : les donnees clients sont chiffrees (AES-256-GCM, cle derivee du mot de passe). Sans le mot de passe, le HTML ne contient que du chiffre illisible.
- Plusieurs comptes Google supportes (un refresh token par compte).

## Fonctionnalites

- **Vue d'ensemble** : une carte par client avec clics + delta S-1 + delta N-1, sparkline, impressions, position. Compteur "clients en baisse". Pages en mouvement tous clients confondus.
- **Detail client** (clic sur un client) : KPI avec double comparaison S-1 / N-1, courbes 7/28/90j, **pages qui ont le plus perdu / le plus gagne**, tableau pages + tableau mots-cles tries/filtrables, export CSV.
- **Comparaison** : tableau trie de tous les clients cote a cote.
- **Trafic de marque** : bouton `Tout / Hors marque / Marque`. Chaque client a sa `brandRegex`. Permet d'isoler la vraie performance SEO hors notoriete.
- Filtres **periode** (7/28/90j), **device**, **pays**, base de comparaison **vs S-1 / vs N-1**, deltas en **% ou valeur absolue**.

## Setup (a faire une fois)

### 1. Google Cloud + Search Console API

1. Cree un projet : https://console.cloud.google.com/projectcreate
2. Active l'API Search Console : https://console.cloud.google.com/apis/library/searchconsole.googleapis.com
3. OAuth consent screen (User Type: External). Ajoute en **test users** les 3 comptes : `pierre@datashake.fr`, `analytics@datashake.fr`, `analytics@upearly.fr`.
4. Cree des credentials OAuth > **Desktop app**. Note `client_id` et `client_secret`.

### 2. Un refresh token PAR compte Google

```bash
git clone <repo>
cd client-dashboard
npm ci
export GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="..."
npm run get-refresh-token   # a lancer 3 fois, un compte a chaque fois
```

A chaque lancement, ouvre l'URL, connecte-toi avec le bon compte, copie le `refresh_token`.

| Compte Google | Secret GitHub |
|---|---|
| pierre@datashake.fr | `GOOGLE_REFRESH_TOKEN_PIERRE` |
| analytics@datashake.fr | `GOOGLE_REFRESH_TOKEN_DATASHAKE` |
| analytics@upearly.fr | `GOOGLE_REFRESH_TOKEN_UPEARLY` |

### 3. Secrets GitHub

Settings > Secrets and variables > Actions. Ajouter :

| Nom | Valeur |
|---|---|
| `GOOGLE_CLIENT_ID` | client ID OAuth |
| `GOOGLE_CLIENT_SECRET` | client secret OAuth |
| `GOOGLE_REFRESH_TOKEN_PIERRE` | token pierre@datashake.fr |
| `GOOGLE_REFRESH_TOKEN_DATASHAKE` | token analytics@datashake.fr |
| `GOOGLE_REFRESH_TOKEN_UPEARLY` | token analytics@upearly.fr |
| `DASHBOARD_PASSWORD` | le mot de passe d'acces au dashboard |

### 4. GitHub Pages

Settings > Pages > Source: **GitHub Actions**. (Pour des donnees clients, repo **prive** recommande ; Pages prive necessite un plan org payant. A defaut, le chiffrement protege les donnees meme sur repo/Pages public.)

### 5. Premier build

Actions > Build & Deploy Dashboard > **Run workflow**.

## Ajouter / modifier un client

Editer `src/clients.js` : ajouter un bloc dans `CLIENTS` avec `label`, `domain`, `gscProperty`, le bon `account` (compte Google qui voit sa Search Console), et sa `brandRegex`. Commit + push.

## Notes

- Donnees GSC **finalisees** (J-2). S-1 = la fenetre precedente de meme duree. N-1 = la meme fenetre decalee de 364 jours (52 semaines, garde l'alignement des jours).
- En mode Hors marque / Marque, les totaux sont calcules a partir des requetes (GSC anonymise les requetes rares) : legere sous-estimation, et le filtre device est ignore dans ce mode.
