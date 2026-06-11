import { google } from 'googleapis';

function dayMinus(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

// GSC retard 2-3 jours: on demarre toujours a J-2
const GSC_DELAY_DAYS = 2;
// Decalage "annee precedente" : 364 jours = 52 semaines pile, garde l'alignement
// des jours de la semaine (lundi vs lundi) => comparaison SEO plus juste que 365.
const YEAR_SHIFT_DAYS = 364;

export function rangesForWindow(days) {
  const curStart = GSC_DELAY_DAYS + days - 1;
  const curEnd = GSC_DELAY_DAYS;
  return {
    current: { startDate: dayMinus(curStart), endDate: dayMinus(curEnd) },
    previous: { startDate: dayMinus(curStart + days), endDate: dayMinus(curEnd + days) },
    yearAgo: { startDate: dayMinus(curStart + YEAR_SHIFT_DAYS), endDate: dayMinus(curEnd + YEAR_SHIFT_DAYS) },
  };
}

export function buildAuth({ clientId, clientSecret, refreshToken }) {
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

// Erreurs transitoires qu'on retente :
// - reseau (runner GitHub qui n'atteint pas googleapis.com)
// - 5xx cote Google
// - 429 / "load quota exceeded" : bridage de debit court terme (rafale de requetes),
//   se resorbe en quelques secondes => retry avec backoff plus long.
function isTransientError(err) {
  const status = err.response?.status ?? err.code;
  if (status >= 500 || status === 429) return true;
  const msg = (err.response?.data?.error?.message ?? err.message ?? '');
  if (/quota exceeded|rate limit|user rate/i.test(msg)) return true;
  return /failed, reason|ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket hang up/i.test(msg);
}

async function querySite(searchconsole, siteUrl, { startDate, endDate, dimensions = [], rowLimit = 1, dimensionFilterGroups }) {
  const MAX_ATTEMPTS = 6;
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate, dimensions, rowLimit, dataState: 'final', ...(dimensionFilterGroups ? { dimensionFilterGroups } : {}) },
      });
      return res.data.rows ?? [];
    } catch (err) {
      if (isTransientError(err) && attempt < MAX_ATTEMPTS) {
        // backoff exponentiel + jitter : ~2s, 4s, 8s, 16s, 32s
        const delay = 1000 * 2 ** attempt + Math.floor(Math.random() * 1000);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      const msg = err.response?.data?.error?.message ?? err.message;
      return { error: msg };
    }
  }
}

function rowsToTotals(rows) {
  if (rows.error) return { error: rows.error };
  if (!rows.length) return { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const r = rows[0];
  return {
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  };
}

async function fetchWindow(searchconsole, gscProperty, days) {
  const { current, previous, yearAgo } = rangesForWindow(days);
  const [
    currTotalsRaw, prevTotalsRaw, yearTotalsRaw,
    currPagesRaw, prevPagesRaw, yearPagesRaw,
    currQueriesRaw, prevQueriesRaw, yearQueriesRaw,
    currDeviceRaw, currCountryRaw,
  ] = await Promise.all([
    querySite(searchconsole, gscProperty, { ...current, rowLimit: 1 }),
    querySite(searchconsole, gscProperty, { ...previous, rowLimit: 1 }),
    querySite(searchconsole, gscProperty, { ...yearAgo, rowLimit: 1 }),
    querySite(searchconsole, gscProperty, { ...current, dimensions: ['page', 'country'], rowLimit: 2000 }),
    querySite(searchconsole, gscProperty, { ...previous, dimensions: ['page', 'country'], rowLimit: 2000 }),
    querySite(searchconsole, gscProperty, { ...yearAgo, dimensions: ['page', 'country'], rowLimit: 2000 }),
    querySite(searchconsole, gscProperty, { ...current, dimensions: ['query', 'country'], rowLimit: 2000 }),
    querySite(searchconsole, gscProperty, { ...previous, dimensions: ['query', 'country'], rowLimit: 2000 }),
    querySite(searchconsole, gscProperty, { ...yearAgo, dimensions: ['query', 'country'], rowLimit: 2000 }),
    querySite(searchconsole, gscProperty, { ...current, dimensions: ['device'], rowLimit: 5 }),
    querySite(searchconsole, gscProperty, { ...current, dimensions: ['country'], rowLimit: 50 }),
  ]);

  if (currTotalsRaw.error) {
    return { error: currTotalsRaw.error, period: current };
  }

  const currTotals = rowsToTotals(currTotalsRaw);
  const prevTotals = rowsToTotals(prevTotalsRaw);
  const yearTotals = rowsToTotals(yearTotalsRaw);

  // Filtre URLs avec hashtag ou parametres
  const isCleanUrl = (u) => !u.includes('#') && !u.includes('?');

  // ---- Pages avec dimension country: une row par (page, country)
  const rowsToPageCountry = (rows) => {
    if (rows.error) return [];
    return rows.map(r => ({
      url: r.keys?.[0] ?? '',
      country: (r.keys?.[1] ?? '').toLowerCase(),
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      position: r.position ?? 0,
    }));
  };
  const currPagesCC = rowsToPageCountry(currPagesRaw).filter(p => isCleanUrl(p.url));
  const prevPagesCC = rowsToPageCountry(prevPagesRaw).filter(p => isCleanUrl(p.url));
  const yearPagesCC = rowsToPageCountry(yearPagesRaw).filter(p => isCleanUrl(p.url));
  const prevPageMap = new Map(prevPagesCC.map(p => [p.url + '|' + p.country, p]));
  const yearPageMap = new Map(yearPagesCC.map(p => [p.url + '|' + p.country, p]));
  const pagesByCountry = currPagesCC.map(p => {
    const prev = prevPageMap.get(p.url + '|' + p.country);
    const year = yearPageMap.get(p.url + '|' + p.country);
    return {
      ...p,
      prevClicks: prev?.clicks ?? 0, prevImpressions: prev?.impressions ?? 0, prevPosition: prev?.position ?? null,
      yearClicks: year?.clicks ?? 0, yearImpressions: year?.impressions ?? 0, yearPosition: year?.position ?? null,
    };
  });
  // Pages presentes l'an dernier ou la periode precedente mais disparues maintenant
  // (trafic perdu a 100%) : on les rajoute pour que les "top baisses" les voient.
  const seenNow = new Set(currPagesCC.map(p => p.url + '|' + p.country));
  for (const [key, prev] of prevPageMap) {
    if (seenNow.has(key)) continue;
    const year = yearPageMap.get(key);
    pagesByCountry.push({
      url: prev.url, country: prev.country, clicks: 0, impressions: 0, position: null,
      prevClicks: prev.clicks, prevImpressions: prev.impressions, prevPosition: prev.position,
      yearClicks: year?.clicks ?? 0, yearImpressions: year?.impressions ?? 0, yearPosition: year?.position ?? null,
    });
  }

  // ---- Queries avec dimension country
  const rowsToQueryCountry = (rows) => {
    if (rows.error) return [];
    return rows.map(r => ({
      query: r.keys?.[0] ?? '',
      country: (r.keys?.[1] ?? '').toLowerCase(),
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      position: r.position ?? 0,
      ctr: r.ctr ?? 0,
    }));
  };
  const currQueriesCC = rowsToQueryCountry(currQueriesRaw);
  const prevQueriesCC = rowsToQueryCountry(prevQueriesRaw);
  const yearQueriesCC = rowsToQueryCountry(yearQueriesRaw);
  const prevQueryMap = new Map(prevQueriesCC.map(q => [q.query + '|' + q.country, q]));
  const yearQueryMap = new Map(yearQueriesCC.map(q => [q.query + '|' + q.country, q]));
  const queriesByCountry = currQueriesCC.map(q => {
    const prev = prevQueryMap.get(q.query + '|' + q.country);
    const year = yearQueryMap.get(q.query + '|' + q.country);
    return {
      ...q,
      prevClicks: prev?.clicks ?? 0, prevImpressions: prev?.impressions ?? 0, prevPosition: prev?.position ?? null,
      yearClicks: year?.clicks ?? 0, yearImpressions: year?.impressions ?? 0, yearPosition: year?.position ?? null,
    };
  });
  const seenQNow = new Set(currQueriesCC.map(q => q.query + '|' + q.country));
  for (const [key, prev] of prevQueryMap) {
    if (seenQNow.has(key)) continue;
    const year = yearQueryMap.get(key);
    queriesByCountry.push({
      query: prev.query, country: prev.country, clicks: 0, impressions: 0, position: null, ctr: 0,
      prevClicks: prev.clicks, prevImpressions: prev.impressions, prevPosition: prev.position,
      yearClicks: year?.clicks ?? 0, yearImpressions: year?.impressions ?? 0, yearPosition: year?.position ?? null,
    });
  }

  // ---- Device breakdown
  const devices = {};
  if (!currDeviceRaw.error) {
    for (const r of currDeviceRaw) {
      const dev = (r.keys?.[0] ?? '').toLowerCase();
      if (!dev) continue;
      devices[dev] = { clicks: r.clicks ?? 0, impressions: r.impressions ?? 0, position: r.position ?? 0, ctr: r.ctr ?? 0 };
    }
  }

  // ---- Country breakdown (codes ISO 3166-1 alpha-3: fra, usa, ...)
  const countries = {};
  if (!currCountryRaw.error) {
    for (const r of currCountryRaw) {
      const c = (r.keys?.[0] ?? '').toLowerCase();
      if (!c) continue;
      countries[c] = { clicks: r.clicks ?? 0, impressions: r.impressions ?? 0, position: r.position ?? 0, ctr: r.ctr ?? 0 };
    }
  }

  return {
    period: current,
    previousPeriod: previous,
    yearAgoPeriod: yearAgo,
    current: currTotals,
    previous: prevTotals,
    yearAgo: yearTotals,
    pagesByCountry,
    queriesByCountry,
    devices,
    countries,
  };
}

async function fetchDailySeries(searchconsole, gscProperty, days = 90, dimensionFilterGroups) {
  const { current } = rangesForWindow(days);
  const rows = await querySite(searchconsole, gscProperty, { ...current, dimensions: ['date'], rowLimit: days + 5, dimensionFilterGroups });
  if (rows.error) return { error: rows.error };
  return rows.map(r => ({
    date: r.keys?.[0],
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    position: r.position ?? 0,
    ctr: r.ctr ?? 0,
  })).sort((a, b) => a.date.localeCompare(b.date));
}

// ---- Suivi mensuel des mots clés ----
// GSC garde 16 mois d'historique : on peut reconstruire 13 mois de positions
// à chaque build, sans stocker d'état entre les runs.

// Les 13 derniers mois calendaires (du plus ancien au plus récent), bornés à J-2.
export function monthRanges(count = 13) {
  const maxEnd = dayMinus(GSC_DELAY_DAYS);
  const now = new Date();
  const months = [];
  for (let i = count - 1; i >= 0; i--) {
    const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0));
    const startDate = first.toISOString().slice(0, 10);
    const fullEnd = last.toISOString().slice(0, 10);
    const endDate = fullEnd > maxEnd ? maxEnd : fullEnd;
    if (endDate < startDate) continue;
    months.push({ key: startDate.slice(0, 7), startDate, endDate, partial: endDate !== fullEnd });
  }
  return months;
}

const escapeRe2 = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Position/clics/impressions mois par mois pour une liste de mots clés suivis.
 * Une requête GSC par mois, filtrée par regex exacte sur les mots clés.
 * null pour un mois = aucune impression (ou requête anonymisée par GSC).
 */
export async function fetchMonthlyKeywords(auth, gscProperty, keywords) {
  if (!keywords || !keywords.length) return null;
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  const months = monthRanges(13);
  const expression = '^(' + keywords.map(escapeRe2).join('|') + ')$';
  const results = await Promise.all(months.map(m => querySite(searchconsole, gscProperty, {
    startDate: m.startDate,
    endDate: m.endDate,
    dimensions: ['query'],
    rowLimit: Math.min(Math.max(keywords.length * 2, 50), 1000),
    dimensionFilterGroups: [{ filters: [{ dimension: 'query', operator: 'includingRegex', expression }] }],
  })));
  if (results.every(r => r.error)) return { error: results[0].error };
  const rows = keywords.map(kw => ({
    keyword: kw,
    data: months.map((m, i) => {
      const res = results[i];
      if (res.error) return null;
      const row = res.find(r => (r.keys?.[0] ?? '') === kw);
      if (!row) return null;
      return { clicks: row.clicks ?? 0, impressions: row.impressions ?? 0, position: row.position ?? 0 };
    }),
  }));
  return { months: months.map(m => ({ key: m.key, partial: m.partial })), rows };
}

/**
 * Pull metrics pour 3 fenetres (7j, 28j, 90j) + serie quotidienne sur 90j.
 * Chaque fenetre contient les totaux courants, periode precedente ET annee precedente.
 */
export async function fetchSiteWindows(auth, gscProperty, brandRegex) {
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  // Series quotidiennes marque / hors marque via filtre regex GSC, pour que les
  // courbes suivent le bouton Tout/Hors marque/Marque (comme les KPI).
  // Limite GSC : les requetes anonymisees sont exclues => marque + hors marque < total.
  const mkFilter = (operator) => [{ filters: [{ dimension: 'query', operator, expression: '(?i)' + brandRegex }] }];
  const [w7, w28, w90, daily, dailyBrand, dailyNonbrand] = await Promise.all([
    fetchWindow(searchconsole, gscProperty, 7),
    fetchWindow(searchconsole, gscProperty, 28),
    fetchWindow(searchconsole, gscProperty, 90),
    fetchDailySeries(searchconsole, gscProperty, 90),
    brandRegex ? fetchDailySeries(searchconsole, gscProperty, 90, mkFilter('includingRegex')) : null,
    brandRegex ? fetchDailySeries(searchconsole, gscProperty, 90, mkFilter('excludingRegex')) : null,
  ]);
  return { '7': w7, '28': w28, '90': w90, daily, dailyBrand, dailyNonbrand };
}
