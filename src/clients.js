// ============================================================================
// Configuration des clients
// ============================================================================
//
// Chaque client = UNE propriété Search Console.
//
// gscProperty : doit matcher EXACTEMENT ce qui est enregistré dans Search Console
//   - domain property  -> 'sc-domain:exemple.com'
//   - URL prefix       -> 'https://exemple.com/'
//
// account : quel compte Google a accès à cette propriété (cf. ACCOUNTS plus bas).
//
// brandRegex : regex (insensible à la casse) qui matche les requêtes de marque.
//   Sert au bouton "Hors marque" / "Marque".
//
// /!\ domaines / type de propriété / account ci-dessous = hypothèses à confirmer
//     en se connectant aux 3 Search Console (chaque propriété sera lue exactement
//     et on saura sur quel compte se trouve chaque client).

export const CLIENTS = [
  {
    label: 'The Last Step',
    domain: 'thelaststep.fr',
    gscProperty: 'sc-domain:thelaststep.fr',
    account: 'upearly',
    brandRegex: 'the\\s?last\\s?step|thelaststep|tls',
  },
  {
    label: 'Celio',
    domain: 'celio.com',
    gscProperty: 'sc-domain:celio.com',
    account: 'pierre',
    brandRegex: 'celio',
  },
  {
    label: "Techniques de l'ingénieur",
    domain: 'techniques-ingenieur.fr',
    gscProperty: 'https://www.techniques-ingenieur.fr/',
    account: 'pierre',
    brandRegex: 'techniques?[\\s-]?(de[\\s-]?l.?)?ing[ée]nieur',
  },
  {
    label: 'Strap-on-me',
    domain: 'strap-on-me.com',
    gscProperty: 'sc-domain:strap-on-me.com',
    account: 'upearly',
    brandRegex: 'strap[\\s-]?on[\\s-]?me|straponme',
  },
  {
    label: '1969 Store',
    domain: '1969store.com',
    gscProperty: 'sc-domain:1969store.com',
    account: 'upearly',
    brandRegex: '1969\\s?store|\\b1969\\b',
  },
  {
    label: 'Faguo',
    domain: 'faguo-store.com',
    gscProperty: 'sc-domain:faguo-store.com',
    account: 'upearly',
    brandRegex: 'faguo',
  },
  {
    label: 'AMV',
    domain: 'amv.fr',
    gscProperty: 'https://www.amv.fr/',
    account: 'datashake',
    brandRegex: '\\bamv\\b|assurance\\s?moto\\s?verte',
  },
  {
    label: 'COEO',
    domain: 'coeo-design.com',
    gscProperty: 'https://www.coeo-design.com/',
    account: 'datashake',
    brandRegex: '\\bcoeo\\b',
  },
  {
    label: 'Quitoque',
    domain: 'quitoque.fr',
    gscProperty: 'https://www.quitoque.fr/',
    account: 'upearly',
    brandRegex: 'quito\\??que|quitoc|kitoque',
  },
];

// ============================================================================
// Comptes Google -> nom du secret GitHub contenant le refresh token
// ============================================================================
//
// Un seul OAuth client (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) peut générer
// un refresh token par compte Google. On lance `npm run get-refresh-token` une
// fois par compte (en se loguant avec le bon compte), puis on stocke chaque
// token dans le secret GitHub correspondant.

export const ACCOUNTS = {
  // clé interne -> nom du secret GitHub (et, en commentaire, le compte Google réel)
  pierre: 'GOOGLE_REFRESH_TOKEN_PIERRE',          // pierre@datashake.fr
  datashake: 'GOOGLE_REFRESH_TOKEN_DATASHAKE',    // analytics@datashake.fr
  upearly: 'GOOGLE_REFRESH_TOKEN_UPEARLY',        // analytics@upearly.fr
};
