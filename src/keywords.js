// ============================================================================
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

export const KEYWORDS = {
  'thelaststep.fr': [
    "air max 1",
    "adidas bad bunny",
    "adidas bw army",
    "kayano 14",
    "supreme",
    "samba",
    "air max 95",
    "dunk sb",
    "nike mind 001",
    "essentials",
    "nike air max 1",
    "saucony rose",
    "air max one",
    "bw army",
    "yeezy slide",
  ],
  'celio.com': [],
  'techniques-ingenieur.fr': [
    "goutte de poix live",
    "monoxyde de dihydrogène",
    "comment pirater un wifi",
    "ami labs",
    "technique d'ingénieur",
    "la goutte de poix webcam",
    "pprn",
    "semelle filante",
    "masse volumique acier",
    "vdi 2230",
    "analyse atj",
    "platine",
    "fermentation lactique",
    "spectrophotométrie",
    "bronze",
  ],
  'strap-on-me.com': [],
  '1969store.com': [
    "bijoux bdsm",
    "harnais pegging",
    "69 site",
    "harnais bdsm",
    "69 toys",
    "bdsm toys",
    "nalone",
    "sextoys bdsm",
    "sextoy bdsm",
    "strap on me",
    "harnais strap on me",
    "bijou bdsm",
    "dildo panty",
    "sex toys 69",
    "bondage",
  ],
  'faguo-store.com': [],
  'amv.fr': [],
  'coeo-design.com': [
    "magret de canard au kamado",
    "charbon fogon",
    "kamado francais",
    "magret au kamado",
    "poulet kamado",
    "ribs kamado",
    "brasero 974",
    "poulet au kamado",
    "kamado made in france",
    "magret kamado",
    "brasero reunion",
    "charbon argentin fogon",
    "ribs au kamado",
    "accessoires brasero",
    "brasero montpellier",
  ],
  'quitoque.fr': [],
};
