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
  'thelaststep.fr': [],
  'celio.com': [],
  'techniques-ingenieur.fr': [],
  'strap-on-me.com': [],
  '1969store.com': [],
  'faguo-store.com': [],
  'amv.fr': [],
  'coeo-design.com': [],
  'quitoque.fr': [],
};
