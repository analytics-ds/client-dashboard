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

// Erreurs reseau transitoires (runner GitHub qui n'atteint pas googleapis.com)
// vs vraies erreurs API (permissions, quota) qu'il ne sert a rien de retenter
function isTransientError(err) {
  if (err.response?.status >= 500) return true;
  const msg = err.message ?? '';
  return /failed, reason|ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket hang up/i.test(msg);
}

async function querySite(searchconsole, siteUrl, { startDate, endDate, dimensions = [], rowLimit = 1 }) {
  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate, dimensions, rowLimit, dataState: 'final' },
      });
      return res.data.rows ?? [];
    } catch (err) {
      if (isTransientError(err) && attempt < MAX_ATTEMPTS) {
        await new Promise(r => setTimeout(r, 3000 * attempt));
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

async function fetchDailySeries(searchconsole, gscProperty, days = 90) {
  const { current } = rangesForWindow(days);
  const rows = await querySite(searchconsole, gscProperty, { ...current, dimensions: ['date'], rowLimit: days + 5 });
  if (rows.error) return { error: rows.error };
  return rows.map(r => ({
    date: r.keys?.[0],
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    position: r.position ?? 0,
    ctr: r.ctr ?? 0,
  })).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Pull metrics pour 3 fenetres (7j, 28j, 90j) + serie quotidienne sur 90j.
 * Chaque fenetre contient les totaux courants, periode precedente ET annee precedente.
 */
export async function fetchSiteWindows(auth, gscProperty) {
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  const [w7, w28, w90, daily] = await Promise.all([
    fetchWindow(searchconsole, gscProperty, 7),
    fetchWindow(searchconsole, gscProperty, 28),
    fetchWindow(searchconsole, gscProperty, 90),
    fetchDailySeries(searchconsole, gscProperty, 90),
  ]);
  return { '7': w7, '28': w28, '90': w90, daily };
}
