export function renderDashboard({ encrypted, generatedAt }) {
  const encJson = JSON.stringify(encrypted).replace(/</g, '\\u003c');
  const updatedAt = new Date(generatedAt).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'medium', timeStyle: 'short' });

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Clients · Search Console</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%231A1A1A'/%3E%3Cpath d='M8 8v16h16M11 19l4-4 4 4 5-5' stroke='%23C2B642' stroke-width='2.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #FAFAF7; --bg-warm: #F2F0EB; --bg-card: #FFFFFF;
      --bg-olive: #C2B642; --bg-olive-light: #E8E4A0;
      --bg-black: #1A1A1A; --bg-dark: #2C2C2C;
      --border: #E5E3DE; --border-strong: #D0CEC7;
      --text: #1A1A1A; --text-secondary: #6B6B60; --text-muted: #9C9C90;
      --accent: #C2B642; --accent-dark: #9A8F30;
      --green: #2D8C5A; --green-bg: #E8F5EE;
      --red: #C94040; --red-bg: #FDE8E8;
      --blue: #4A90D9; --blue-bg: #E8F0FA;
      --purple: #7B61FF; --purple-bg: #F0EDFF;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.04); --shadow: 0 2px 12px rgba(0,0,0,0.06); --shadow-lg: 0 8px 32px rgba(0,0,0,0.08);
      --radius: 16px; --radius-sm: 10px; --radius-xs: 6px; --radius-pill: 100px;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.5; }
    a { color: inherit; text-decoration: none; }
    button { font-family: inherit; cursor: pointer; border: 0; background: transparent; padding: 0; color: inherit; }
    code { font-family: ui-monospace, monospace; font-size: 0.85em; }

    /* Password gate */
    .gate { position: fixed; inset: 0; z-index: 100; background: var(--bg); display: flex; align-items: center; justify-content: center; padding: 20px; }
    .gate-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-lg); padding: 32px; width: 100%; max-width: 380px; text-align: center; }
    .gate-logo { width: 52px; height: 52px; border-radius: 14px; background: var(--bg-black); display: inline-flex; align-items: center; justify-content: center; color: var(--accent); margin-bottom: 18px; }
    .gate-card h1 { margin: 0 0 4px; font-size: 18px; font-weight: 700; }
    .gate-card p { margin: 0 0 20px; font-size: 13px; color: var(--text-muted); }
    .gate-form { display: flex; flex-direction: column; gap: 10px; }
    .gate-form input { padding: 12px 14px; font-size: 14px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); outline: none; font-family: inherit; text-align: center; }
    .gate-form input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(194,182,66,0.15); background: var(--bg-card); }
    .gate-form button { padding: 12px 14px; font-size: 14px; font-weight: 600; background: var(--bg-black); color: var(--bg-card); border-radius: var(--radius-sm); transition: background 0.15s; }
    .gate-form button:hover { background: var(--bg-dark); }
    .gate-form button:disabled { opacity: 0.5; cursor: wait; }
    .gate-error { font-size: 12px; color: var(--red); min-height: 16px; margin-top: 4px; }

    .app { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }

    /* Sidebar */
    .sidebar { background: var(--bg-card); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow: hidden; }
    .sidebar-brand { padding: 22px 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border); }
    .brand-logo { width: 36px; height: 36px; border-radius: 10px; background: var(--bg-black); display: flex; align-items: center; justify-content: center; color: var(--accent); }
    .brand-text h1 { margin: 0; font-size: 15px; font-weight: 700; letter-spacing: -0.01em; }
    .brand-text p { margin: 0; font-size: 11px; color: var(--text-muted); }
    .sidebar-section { padding: 12px 12px 4px; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .sidebar-nav { flex: 1; overflow-y: auto; padding: 0 8px 16px; }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: var(--radius-sm); color: var(--text-secondary); font-weight: 500; font-size: 13px; transition: background 0.15s; cursor: pointer; margin-bottom: 1px; }
    .nav-item:hover { background: var(--bg-warm); color: var(--text); }
    .nav-item.active { background: var(--bg-black); color: var(--bg-card); }
    .nav-favicon { width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0; }
    .nav-icon { width: 18px; height: 18px; flex-shrink: 0; opacity: 0.7; }
    .nav-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .nav-badge { font-size: 11px; padding: 2px 7px; border-radius: var(--radius-pill); font-weight: 600; }
    .nav-badge.err { background: var(--red-bg); color: var(--red); }
    .nav-badge.down { background: var(--red-bg); color: var(--red); }
    .nav-item.active .nav-badge { background: rgba(255,255,255,0.15); color: var(--bg-card); }
    .sidebar-footer { padding: 12px 16px; border-top: 1px solid var(--border); font-size: 11px; color: var(--text-muted); }
    .sidebar-footer a { color: var(--text-secondary); }

    /* Main */
    .main { background: var(--bg); min-width: 0; }
    .topbar { background: var(--bg-card); border-bottom: 1px solid var(--border); padding: 18px 32px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 5; gap: 12px; flex-wrap: wrap; }
    .topbar h2 { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }
    .topbar-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .topbar-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

    .switch { display: flex; background: var(--bg-warm); border-radius: var(--radius-pill); padding: 3px; gap: 2px; }
    .switch button { padding: 7px 14px; border-radius: var(--radius-pill); font-size: 12px; font-weight: 600; color: var(--text-secondary); transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
    .switch button:hover { color: var(--text); }
    .switch button.active { background: var(--bg-card); color: var(--text); box-shadow: var(--shadow-sm); }
    .switch button svg { width: 14px; height: 14px; }
    .switch.brand button.active[data-brand="nonbrand"] { color: var(--green); }
    .switch.brand button.active[data-brand="marque"] { color: var(--purple); }

    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: var(--radius-pill); font-size: 12px; font-weight: 600; color: var(--text-secondary); border: 1px solid var(--border); background: var(--bg-card); cursor: pointer; transition: all 0.15s; }
    .btn:hover { background: var(--bg-warm); color: var(--text); border-color: var(--border-strong); }
    .btn svg { width: 14px; height: 14px; }
    .btn.primary { background: var(--bg-black); color: var(--bg-card); border-color: var(--bg-black); }
    .btn.primary:hover { background: var(--bg-dark); }

    .country-wrap { position: relative; display: inline-flex; align-items: center; }
    .country-wrap .country-icon { position: absolute; left: 12px; width: 14px; height: 14px; color: var(--text-muted); pointer-events: none; }
    #country-select { appearance: none; -webkit-appearance: none; padding: 8px 30px 8px 32px; font-size: 12px; font-weight: 600; color: var(--text-secondary); background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-pill); cursor: pointer; font-family: inherit; }
    #country-select:hover { color: var(--text); border-color: var(--border-strong); }
    .country-wrap::after { content: '▾'; position: absolute; right: 12px; pointer-events: none; color: var(--text-muted); font-size: 10px; }

    .content { padding: 28px 32px; max-width: 1400px; margin: 0 auto; }

    /* KPI cards */
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi-card { background: var(--bg-card); border-radius: var(--radius); padding: 20px; border: 1px solid var(--border); }
    .kpi-card .label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }
    .kpi-card .label svg { width: 14px; height: 14px; }
    .kpi-card .value { display: flex; align-items: baseline; gap: 10px; }
    .kpi-card .value .num { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; color: var(--text); font-variant-numeric: tabular-nums; }
    .kpi-card .value .sub { font-size: 16px; color: var(--text-muted); font-weight: 600; }
    .kpi-card .deltas { display: flex; gap: 14px; margin-top: 12px; }

    .badge { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: var(--radius-pill); font-variant-numeric: tabular-nums; }
    .badge svg { width: 10px; height: 10px; }
    .badge.up { background: var(--green-bg); color: var(--green); }
    .badge.down { background: var(--red-bg); color: var(--red); }
    .badge.flat { background: var(--bg-warm); color: var(--text-muted); }
    .badge-wrap { display: inline-flex; align-items: center; gap: 5px; }
    .badge-lbl { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; }

    .section-title { font-size: 13px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin: 28px 0 14px; display: flex; align-items: center; justify-content: space-between; }
    .section-title:first-child { margin-top: 0; }
    .section-title .hint { font-size: 11px; color: var(--text-muted); font-weight: 500; text-transform: none; letter-spacing: 0; }
    .note { font-size: 12px; color: var(--text-muted); background: var(--bg-warm); border-radius: var(--radius-sm); padding: 8px 12px; margin-bottom: 16px; display: flex; gap: 8px; align-items: flex-start; }
    .note svg { width: 14px; height: 14px; flex-shrink: 0; margin-top: 1px; }

    /* Trending */
    .trending-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
    .trending-card { background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; }
    .trending-card .head { padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; }
    .trending-card .head .dot { width: 8px; height: 8px; border-radius: 50%; }
    .trending-card.up .head .dot { background: var(--green); }
    .trending-card.down .head .dot { background: var(--red); }
    .trending-row { padding: 9px 18px; border-bottom: 1px solid var(--border); display: grid; grid-template-columns: 1fr auto auto; gap: 10px; align-items: center; transition: background 0.1s; }
    .trending-row:last-child { border-bottom: 0; }
    .trending-row:hover { background: var(--bg-warm); }
    .trending-url { min-width: 0; }
    .trending-url .site { font-size: 11px; color: var(--text-muted); font-weight: 500; }
    .trending-url .path { font-size: 12px; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .trending-row:hover .trending-url .path { color: var(--text); }
    .trending-row .clicks { font-weight: 600; font-size: 12px; font-variant-numeric: tabular-nums; color: var(--text); min-width: 60px; text-align: right; }
    .trending-row .clicks small { color: var(--text-muted); font-weight: 500; }
    @media (max-width: 1100px) { .trending-grid { grid-template-columns: 1fr; } }

    /* Client grid */
    .sites-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }
    .site-card { background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border); padding: 18px; cursor: pointer; transition: all 0.15s; display: flex; flex-direction: column; gap: 14px; }
    .site-card:hover { border-color: var(--border-strong); box-shadow: var(--shadow); transform: translateY(-1px); }
    .site-card.alert { border-color: #F0C9C9; }
    .site-card .head { display: flex; align-items: center; gap: 10px; }
    .site-card .head .favicon { width: 22px; height: 22px; border-radius: 5px; flex-shrink: 0; }
    .site-card .head .domain { font-weight: 600; font-size: 14px; color: var(--text); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .site-card .head .arrow { color: var(--text-muted); flex-shrink: 0; transition: transform 0.15s, color 0.15s; }
    .site-card:hover .arrow { transform: translateX(3px); color: var(--accent-dark); }
    .site-clicks { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
    .site-clicks .big { font-size: 26px; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
    .site-clicks .big-lbl { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .site-deltas { display: flex; gap: 12px; }
    .site-sparkline { height: 36px; margin: 0 -4px; position: relative; }
    .site-subkpis { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .site-kpi { display: flex; flex-direction: column; gap: 2px; }
    .site-kpi .label { font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .site-kpi .num { font-size: 16px; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; }
    .site-kpi .kpi-deltas { display: flex; flex-direction: column; gap: 3px; margin-top: 3px; }
    .site-error { background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--red); padding: 18px; cursor: not-allowed; }
    .site-error .err-tag { font-size: 11px; font-weight: 600; background: var(--red-bg); color: var(--red); padding: 3px 10px; border-radius: var(--radius-pill); }
    .site-error .err-msg { font-size: 12px; color: var(--text-secondary); margin-top: 8px; line-height: 1.45; }

    /* Detail view */
    .detail-head { background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border); padding: 22px 24px; margin-bottom: 20px; display: flex; align-items: center; gap: 16px; }
    .detail-head .favicon { width: 40px; height: 40px; border-radius: 10px; }
    .detail-head .info { flex: 1; }
    .detail-head .info h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
    .detail-head .info .links { display: flex; gap: 14px; margin-top: 4px; font-size: 12px; flex-wrap: wrap; }
    .detail-head .info .links a, .detail-head .info .links span { color: var(--text-muted); display: inline-flex; align-items: center; gap: 4px; }
    .detail-head .info .links a:hover { color: var(--accent-dark); }
    .detail-head .info .links svg { width: 13px; height: 13px; }

    .chart-card { background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border); padding: 20px; margin-bottom: 20px; }
    .chart-card h3 { margin: 0 0 4px; font-size: 14px; font-weight: 600; }
    .chart-card .chart-sub { font-size: 12px; color: var(--text-muted); margin-bottom: 16px; }
    .chart-wrap { height: 220px; position: relative; }
    .chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 1100px) { .chart-grid { grid-template-columns: 1fr; } }

    /* Data table */
    .data-table { background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; }
    .data-table .head { padding: 14px 20px; display: flex; gap: 12px; align-items: center; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
    .data-table .tabs { display: flex; gap: 4px; }
    .tab-btn { padding: 7px 14px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; color: var(--text-secondary); background: var(--bg-warm); transition: all 0.15s; }
    .tab-btn:hover { color: var(--text); }
    .tab-btn.active { background: var(--bg-black); color: var(--bg-card); }
    .data-table .count { font-size: 11px; color: var(--text-muted); font-weight: 500; }
    .data-table .search { margin-left: auto; position: relative; }
    .data-table .search input { width: 220px; padding: 7px 12px 7px 32px; font-size: 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); outline: none; font-family: inherit; }
    .data-table .search input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(194,182,66,0.15); background: var(--bg-card); }
    .data-table .search svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: var(--text-muted); pointer-events: none; }
    .data-cols, .data-row { display: grid; gap: 10px; padding: 10px 20px; align-items: center; }
    .data-cols { font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; background: var(--bg); border-bottom: 1px solid var(--border); }
    .data-cols .sortable { cursor: pointer; user-select: none; }
    .data-cols .sortable:hover { color: var(--text); }
    .data-cols .sortable.sorted { color: var(--text); }
    .data-cols .sortable .arrow { display: inline-block; margin-left: 3px; opacity: 0.5; font-size: 9px; }
    .data-cols .sortable.sorted .arrow { opacity: 1; }
    .data-cols.pages, .data-row.pages { grid-template-columns: 40px minmax(0, 1fr) 60px 60px 70px 60px 60px 60px; }
    .data-cols.queries, .data-row.queries { grid-template-columns: 40px minmax(0, 1fr) 56px 60px 60px 70px 60px 56px; }
    .data-cols .right { text-align: right; }
    .data-row { border-bottom: 1px solid var(--border); transition: background 0.1s; }
    .data-row:last-child { border-bottom: 0; }
    .data-row:hover { background: var(--bg-warm); }
    .data-row .rank { color: var(--text-muted); font-size: 12px; font-variant-numeric: tabular-nums; }
    .data-row .url, .data-row .qtext { color: var(--text-secondary); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .data-row .qtext .brand-tag { font-size: 9px; font-weight: 700; color: var(--purple); background: var(--purple-bg); padding: 1px 5px; border-radius: var(--radius-pill); margin-right: 6px; vertical-align: middle; }
    .data-row:hover .url, .data-row:hover .qtext { color: var(--text); }
    .data-row .num { font-weight: 600; font-size: 13px; font-variant-numeric: tabular-nums; text-align: right; color: var(--text); }
    .data-row .num-light { font-weight: 500; font-size: 13px; font-variant-numeric: tabular-nums; text-align: right; color: var(--text-secondary); }
    .data-row .delta-cell { text-align: right; }
    .pagination { padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); background: var(--bg); }
    .pagination .info { font-size: 12px; color: var(--text-muted); }
    .pagination .pager { display: flex; gap: 4px; align-items: center; }
    .pager-btn { min-width: 32px; height: 32px; padding: 0 10px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 500; color: var(--text-secondary); background: var(--bg-card); border: 1px solid var(--border); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
    .pager-btn:hover:not(:disabled) { background: var(--bg-warm); color: var(--text); border-color: var(--border-strong); }
    .pager-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .pager-btn.active { background: var(--bg-black); color: var(--bg-card); border-color: var(--bg-black); }
    .pager-ellipsis { padding: 0 4px; color: var(--text-muted); font-size: 12px; }
    .empty-state { padding: 40px; text-align: center; color: var(--text-muted); font-size: 13px; }

    /* Comparison view */
    .compare-table { background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; }
    .compare-table table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .compare-table th { background: var(--bg); padding: 12px 16px; text-align: left; font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); cursor: pointer; user-select: none; white-space: nowrap; }
    .compare-table th.right { text-align: right; }
    .compare-table th:hover { color: var(--text); }
    .compare-table th .sort-arrow { display: inline-block; margin-left: 4px; opacity: 0.5; }
    .compare-table th.sorted { color: var(--text); }
    .compare-table th.sorted .sort-arrow { opacity: 1; }
    .compare-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-variant-numeric: tabular-nums; }
    .compare-table tr:last-child td { border-bottom: 0; }
    .compare-table tr:hover { background: var(--bg-warm); cursor: pointer; }
    .compare-table td.right { text-align: right; font-weight: 600; }
    .compare-table .site-cell { display: flex; align-items: center; gap: 8px; min-width: 200px; }
    .compare-table .site-cell img { width: 18px; height: 18px; border-radius: 4px; }

    /* Suivi mots clés */
    .kw-client { background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border); margin-bottom: 20px; overflow: hidden; }
    .kw-client > .head { padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
    .kw-client > .head img { width: 20px; height: 20px; border-radius: 5px; }
    .kw-client > .head .name { font-weight: 600; font-size: 14px; flex: 1; }
    .kw-client > .head .meta { font-size: 11px; color: var(--text-muted); }
    .kw-scroll { overflow-x: auto; }
    .kw-table { border-collapse: collapse; width: 100%; font-size: 12px; font-variant-numeric: tabular-nums; }
    .kw-table th { background: var(--bg); padding: 8px 10px; font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid var(--border); text-align: center; white-space: nowrap; }
    .kw-table th.kw-kw, .kw-table td.kw-kw { text-align: left; position: sticky; left: 0; background: var(--bg-card); min-width: 180px; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; box-shadow: 1px 0 0 var(--border); }
    .kw-table th.kw-kw { background: var(--bg); }
    .kw-table td { padding: 7px 10px; border-bottom: 1px solid var(--border); text-align: center; }
    .kw-table tr:last-child td { border-bottom: 0; }
    .kw-table tr:hover td { background: var(--bg-warm); }
    .kw-table tr:hover td.kw-kw { background: var(--bg-warm); }
    .kw-table td.kw-kw { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
    .kw-pos { font-weight: 600; color: var(--text-secondary); }
    .kw-pos.up { color: var(--green); background: var(--green-bg); }
    .kw-pos.down { color: var(--red); background: var(--red-bg); }
    .kw-pos.none { color: var(--text-muted); font-weight: 400; }
    .kw-empty { padding: 18px; font-size: 12px; color: var(--text-muted); }

    @media (max-width: 900px) {
      .app { grid-template-columns: 1fr; }
      .sidebar { position: relative; height: auto; max-height: 50vh; }
      .content { padding: 20px 16px; }
      .topbar { padding: 14px 16px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .sites-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="gate" id="gate">
    <div class="gate-card">
      <div class="gate-logo">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
      </div>
      <h1>Dashboard clients</h1>
      <p>Accès protégé. Entre le mot de passe.</p>
      <form class="gate-form" id="gate-form">
        <input type="password" id="gate-pw" placeholder="Mot de passe" autocomplete="current-password" autofocus>
        <button type="submit" id="gate-btn">Déverrouiller</button>
        <div class="gate-error" id="gate-error"></div>
      </form>
    </div>
  </div>

  <div class="app" id="app" style="display:none">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>
        </div>
        <div class="brand-text">
          <h1>Clients SEO</h1>
          <p>Search Console &middot; ${updatedAt}</p>
        </div>
      </div>
      <div class="sidebar-section">Vues</div>
      <nav class="sidebar-nav" id="nav"></nav>
      <div class="sidebar-footer">Données finalisées GSC (J-2)</div>
    </aside>

    <main class="main">
      <div class="topbar">
        <div>
          <h2 id="page-title">Vue d'ensemble</h2>
          <div class="topbar-meta" id="page-sub"></div>
        </div>
        <div class="topbar-actions">
          <div class="switch brand" id="brand-switch" title="Trafic de marque">
            <button class="active" data-brand="all">Tout</button>
            <button data-brand="nonbrand">Hors marque</button>
            <button data-brand="marque">Marque</button>
          </div>
          <div class="switch" id="device-switch">
            <button class="active" data-device="all"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>Tous</button>
            <button data-device="desktop"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>Desktop</button>
            <button data-device="mobile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h0"/></svg>Mobile</button>
          </div>
          <div class="country-wrap">
            <svg class="country-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/></svg>
            <select id="country-select"><option value="all">Tous pays</option></select>
          </div>
          <div class="switch" id="period-switch">
            <button data-period="7">7j</button>
            <button class="active" data-period="28">28j</button>
            <button data-period="90">90j</button>
          </div>
          <div class="switch" id="basis-switch" title="Base de comparaison pour les tableaux et le classement">
            <button class="active" data-basis="prev">vs S-1</button>
            <button data-basis="year">vs N-1</button>
          </div>
          <div class="switch" id="delta-switch" title="Affichage des deltas">
            <button class="active" data-delta="pct">Δ %</button>
            <button data-delta="abs">Δ #</button>
          </div>
        </div>
      </div>
      <div class="content" id="content"></div>
    </main>
  </div>

  <script id="enc" type="application/json">${encJson}</script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.6/dist/chart.umd.min.js"></script>
  <script>
    const ENC = JSON.parse(document.getElementById('enc').textContent);
    let PAYLOAD = null;
    let CLIENTS = [];
    let currentPeriod = '28';
    let currentDevice = 'all';
    let currentCountry = 'all';
    let currentBasis = 'prev';
    let currentBrand = 'all';
    let currentDeltaMode = 'pct';
    let currentView = 'overview';
    let charts = [];

    // ===== Déchiffrement =====
    function b64ToBytes(b64) {
      const bin = atob(b64);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return arr;
    }
    async function decryptPayload(password) {
      const salt = b64ToBytes(ENC.salt);
      const iv = b64ToBytes(ENC.iv);
      const data = b64ToBytes(ENC.ciphertext);
      const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
      const key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: ENC.iterations, hash: 'SHA-256' },
        baseKey, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
      );
      const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
      return JSON.parse(new TextDecoder().decode(plain));
    }
    async function unlock(password) {
      PAYLOAD = await decryptPayload(password);
      CLIENTS = PAYLOAD.clients;
      try { sessionStorage.setItem('cd_pw', password); } catch {}
      document.getElementById('gate').style.display = 'none';
      document.getElementById('app').style.display = 'grid';
      bootApp();
    }
    const gateForm = document.getElementById('gate-form');
    const gateErr = document.getElementById('gate-error');
    const gateBtn = document.getElementById('gate-btn');
    gateForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      gateErr.textContent = '';
      gateBtn.disabled = true; gateBtn.textContent = 'Déchiffrement...';
      try {
        await unlock(document.getElementById('gate-pw').value);
      } catch (err) {
        gateErr.textContent = 'Mot de passe incorrect.';
        gateBtn.disabled = false; gateBtn.textContent = 'Déverrouiller';
        try { sessionStorage.removeItem('cd_pw'); } catch {}
      }
    });
    // Auto-deverrouillage si le mot de passe est deja en session
    (async () => {
      let saved = null;
      try { saved = sessionStorage.getItem('cd_pw'); } catch {}
      if (saved) { try { await unlock(saved); } catch {} }
    })();

    // ===== Helpers pays =====
    const COUNTRY_INFO = { fra: ['fr', 'France'], usa: ['us', 'États-Unis'], gbr: ['gb', 'Royaume-Uni'], deu: ['de', 'Allemagne'], esp: ['es', 'Espagne'], ita: ['it', 'Italie'], bel: ['be', 'Belgique'], che: ['ch', 'Suisse'], can: ['ca', 'Canada'], mar: ['ma', 'Maroc'], dza: ['dz', 'Algérie'], tun: ['tn', 'Tunisie'], sen: ['sn', 'Sénégal'], civ: ['ci', 'Côte d\\'Ivoire'], cmr: ['cm', 'Cameroun'], lux: ['lu', 'Luxembourg'], prt: ['pt', 'Portugal'], nld: ['nl', 'Pays-Bas'], aut: ['at', 'Autriche'], irl: ['ie', 'Irlande'], pol: ['pl', 'Pologne'], rou: ['ro', 'Roumanie'], tur: ['tr', 'Turquie'], rus: ['ru', 'Russie'], chn: ['cn', 'Chine'], jpn: ['jp', 'Japon'], kor: ['kr', 'Corée du Sud'], ind: ['in', 'Inde'], bra: ['br', 'Brésil'], mex: ['mx', 'Mexique'], arg: ['ar', 'Argentine'], aus: ['au', 'Australie'], mco: ['mc', 'Monaco'], mlt: ['mt', 'Malte'], dnk: ['dk', 'Danemark'], swe: ['se', 'Suède'], nor: ['no', 'Norvège'], fin: ['fi', 'Finlande'], isl: ['is', 'Islande'], cze: ['cz', 'Tchéquie'], hun: ['hu', 'Hongrie'], svk: ['sk', 'Slovaquie'], svn: ['si', 'Slovénie'], hrv: ['hr', 'Croatie'], grc: ['gr', 'Grèce'], bgr: ['bg', 'Bulgarie'], srb: ['rs', 'Serbie'], ukr: ['ua', 'Ukraine'], isr: ['il', 'Israël'], are: ['ae', 'Émirats arabes unis'], sau: ['sa', 'Arabie saoudite'], mdg: ['mg', 'Madagascar'], mus: ['mu', 'Maurice'], reu: ['re', 'La Réunion'], glp: ['gp', 'Guadeloupe'], mtq: ['mq', 'Martinique'], guf: ['gf', 'Guyane'], nca: ['nc', 'Nouvelle-Calédonie'], pyf: ['pf', 'Polynésie française'] };
    function countryName(code) { return COUNTRY_INFO[code]?.[1] || code.toUpperCase(); }
    function countryFlag(code) {
      const a2 = COUNTRY_INFO[code]?.[0];
      if (!a2) return '🌐';
      return String.fromCodePoint(...a2.toUpperCase().split('').map(c => 0x1F1E6 - 65 + c.charCodeAt(0)));
    }

    const $ = (s, el = document) => el.querySelector(s);
    const fmtNum = (n) => {
      if (n == null || Number.isNaN(n)) return '0';
      if (n >= 1000) return new Intl.NumberFormat('fr-FR').format(Math.round(n));
      return String(Math.round(n));
    };
    const fmtPos = (p) => (p == null || !isFinite(p) || p === 0) ? '-' : p.toFixed(1);
    const fmtDate = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    function escapeAttr(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function favicon(domain) { return 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=64'; }
    function pathOf(url, domain) { return url.replace('https://' + domain, '').replace('https://www.' + domain, '') || '/'; }
    const basisLabel = () => currentBasis === 'year' ? 'N-1' : 'S-1';

    // ===== Deltas =====
    function deltaPct(curr, prev) {
      const diff = Math.round((curr || 0) - (prev || 0));
      if (!prev || prev === 0) {
        if (curr > 0) {
          const lbl = currentDeltaMode === 'abs' ? '+' + fmtNum(diff) : 'new';
          return { label: lbl, sign: 'up', raw: 100 };
        }
        return null;
      }
      const pct = ((curr - prev) / prev) * 100;
      if (Math.abs(pct) < 0.5 && Math.abs(diff) < 1) return { label: currentDeltaMode === 'abs' ? '0' : '0%', sign: 'flat', raw: 0 };
      const sign = pct > 0 ? 'up' : 'down';
      if (currentDeltaMode === 'abs') return { label: (diff > 0 ? '+' : '') + fmtNum(diff), sign, raw: pct };
      return { label: (pct > 0 ? '+' : '') + pct.toFixed(0) + '%', sign, raw: pct };
    }
    function deltaPos(curr, prev) {
      if (!prev || !isFinite(prev) || !curr || !isFinite(curr)) return null;
      const diff = curr - prev;
      if (Math.abs(diff) < 0.1) return { label: '0', sign: 'flat', raw: 0 };
      return { label: (diff > 0 ? '+' : '') + diff.toFixed(1), sign: diff < 0 ? 'up' : 'down', raw: -diff };
    }
    function deltaPctRaw(curr, prev) { if (!prev) return curr > 0 ? Infinity : 0; return ((curr - prev) / prev) * 100; }
    function badge(d) {
      if (!d || !d.label) return '';
      const arrow = d.sign === 'up'
        ? '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"/></svg>'
        : d.sign === 'down' ? '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"/></svg>' : '';
      return '<span class="badge ' + d.sign + '">' + arrow + d.label + '</span>';
    }
    function labeledBadge(lbl, d) {
      if (!d) return '<span class="badge-wrap"><span class="badge-lbl">' + lbl + '</span><span class="badge flat">n/a</span></span>';
      return '<span class="badge-wrap"><span class="badge-lbl">' + lbl + '</span>' + badge(d) + '</span>';
    }

    // ===== Marque =====
    function brandRegex(client) {
      if (client._brandRe !== undefined) return client._brandRe;
      let re = null;
      if (client.brandRegex) { try { re = new RegExp(client.brandRegex, 'i'); } catch { re = null; } }
      client._brandRe = re;
      return re;
    }
    function isBrandQuery(client, q) { const re = brandRegex(client); return re ? re.test(q) : false; }

    // Split marque/hors-marque calcule depuis les requêtes (country-aware).
    // GSC plafonne les requêtes (2000 lignes, requêtes rares anonymisees) donc ces
    // sommes sont légèrement inferieures au total exact => note affichee.
    function brandTotals(client, w, side) {
      const acc = { c_clicks: 0, c_imp: 0, c_wpos: 0, p_clicks: 0, p_imp: 0, p_wpos: 0, y_clicks: 0, y_imp: 0, y_wpos: 0 };
      const list = (w.queriesByCountry || []).filter(q => currentCountry === 'all' || q.country === currentCountry);
      for (const q of list) {
        const brand = isBrandQuery(client, q.query);
        if (side === 'marque' ? !brand : brand) continue;
        acc.c_clicks += q.clicks || 0; acc.c_imp += q.impressions || 0; acc.c_wpos += (q.position || 0) * (q.impressions || 0);
        acc.p_clicks += q.prevClicks || 0; acc.p_imp += q.prevImpressions || 0; acc.p_wpos += (q.prevPosition || 0) * (q.prevImpressions || 0);
        acc.y_clicks += q.yearClicks || 0; acc.y_imp += q.yearImpressions || 0; acc.y_wpos += (q.yearPosition || 0) * (q.yearImpressions || 0);
      }
      const mk = (clicks, imp, wpos) => ({ clicks, impressions: imp, position: imp > 0 ? wpos / imp : 0, ctr: imp > 0 ? clicks / imp : 0 });
      return {
        current: mk(acc.c_clicks, acc.c_imp, acc.c_wpos),
        previous: mk(acc.p_clicks, acc.p_imp, acc.p_wpos),
        yearAgo: mk(acc.y_clicks, acc.y_imp, acc.y_wpos),
        approx: true,
      };
    }

    // ===== Accès fenetres + ajustement device/pays/marque =====
    function getClientWindow(client, period) { return client.data.windows?.[period]; }

    function adjustDeviceCountry(w) {
      if (!w || w.error) return w;
      let curr = w.current, ratio = 1;
      if (currentDevice !== 'all' && w.devices) {
        const dev = w.devices[currentDevice];
        if (!dev) return zeroWindow(w);
        curr = dev; ratio = w.current.clicks > 0 ? dev.clicks / w.current.clicks : 0;
      }
      if (currentCountry !== 'all' && w.countries) {
        const ct = w.countries[currentCountry];
        if (!ct) return zeroWindow(w);
        if (currentDevice === 'all') { curr = ct; ratio = w.current.clicks > 0 ? ct.clicks / w.current.clicks : 0; }
        else {
          const r = w.current.clicks > 0 ? ct.clicks / w.current.clicks : 0;
          curr = { clicks: Math.round(curr.clicks * r), impressions: Math.round(curr.impressions * r), position: ct.position, ctr: ct.ctr };
          ratio *= r;
        }
      }
      return {
        ...w,
        current: curr,
        previous: scaleTotals(w.previous, ratio),
        yearAgo: scaleTotals(w.yearAgo, ratio),
      };
    }
    function scaleTotals(t, ratio) {
      if (!t) return { clicks: 0, impressions: 0, position: 0, ctr: 0 };
      return { clicks: Math.round((t.clicks || 0) * ratio), impressions: Math.round((t.impressions || 0) * ratio), position: t.position, ctr: t.ctr };
    }
    function zeroWindow(w) {
      const z = { clicks: 0, impressions: 0, position: 0, ctr: 0 };
      return { ...w, current: z, previous: z, yearAgo: z };
    }

    // Fenetre effective selon brand/device/pays. Conserve pages/queriesByCountry.
    function effectiveWindow(client, period) {
      const w = getClientWindow(client, period);
      if (!w || w.error) return w;
      if (currentBrand === 'all') return adjustDeviceCountry(w);
      const t = brandTotals(client, w, currentBrand);
      return { ...w, current: t.current, previous: t.previous, yearAgo: t.yearAgo, brandApprox: true };
    }

    // ===== Agregation pages/queries par pays (pour tableaux) =====
    function getPagesForView(w) {
      if (!w?.pagesByCountry) return [];
      if (currentCountry === 'all') {
        const map = new Map();
        for (const p of w.pagesByCountry) {
          const e = map.get(p.url);
          if (e) {
            e._wPos += (p.position || 0) * (p.impressions || 0);
            e._wPosPrev += (p.prevPosition || 0) * (p.prevImpressions || 0);
            e._wPosYear += (p.yearPosition || 0) * (p.yearImpressions || 0);
            e.clicks += p.clicks; e.impressions += p.impressions;
            e.prevClicks += p.prevClicks; e.prevImpressions += p.prevImpressions;
            e.yearClicks += p.yearClicks; e.yearImpressions += p.yearImpressions;
          } else {
            map.set(p.url, {
              url: p.url, clicks: p.clicks, impressions: p.impressions, position: p.position,
              prevClicks: p.prevClicks, prevImpressions: p.prevImpressions, prevPosition: p.prevPosition,
              yearClicks: p.yearClicks, yearImpressions: p.yearImpressions, yearPosition: p.yearPosition,
              _wPos: (p.position || 0) * (p.impressions || 0),
              _wPosPrev: (p.prevPosition || 0) * (p.prevImpressions || 0),
              _wPosYear: (p.yearPosition || 0) * (p.yearImpressions || 0),
            });
          }
        }
        return [...map.values()].map(p => ({
          ...p,
          position: p.impressions > 0 ? p._wPos / p.impressions : p.position,
          prevPosition: p.prevImpressions > 0 ? p._wPosPrev / p.prevImpressions : p.prevPosition,
          yearPosition: p.yearImpressions > 0 ? p._wPosYear / p.yearImpressions : p.yearPosition,
        })).sort((a, b) => b.clicks - a.clicks);
      }
      return w.pagesByCountry.filter(p => p.country === currentCountry).sort((a, b) => b.clicks - a.clicks);
    }
    function getQueriesForView(w, client) {
      if (!w?.queriesByCountry) return [];
      let base;
      if (currentCountry === 'all') {
        const map = new Map();
        for (const q of w.queriesByCountry) {
          const e = map.get(q.query);
          if (e) {
            e._wPos += (q.position || 0) * (q.impressions || 0);
            e._wPosPrev += (q.prevPosition || 0) * (q.prevImpressions || 0);
            e._wPosYear += (q.yearPosition || 0) * (q.yearImpressions || 0);
            e.clicks += q.clicks; e.impressions += q.impressions;
            e.prevClicks += q.prevClicks; e.prevImpressions += q.prevImpressions;
            e.yearClicks += q.yearClicks; e.yearImpressions += q.yearImpressions;
          } else {
            map.set(q.query, {
              query: q.query, clicks: q.clicks, impressions: q.impressions, position: q.position, ctr: q.ctr,
              prevClicks: q.prevClicks, prevImpressions: q.prevImpressions, prevPosition: q.prevPosition,
              yearClicks: q.yearClicks, yearImpressions: q.yearImpressions, yearPosition: q.yearPosition,
              _wPos: (q.position || 0) * (q.impressions || 0),
              _wPosPrev: (q.prevPosition || 0) * (q.prevImpressions || 0),
              _wPosYear: (q.yearPosition || 0) * (q.yearImpressions || 0),
            });
          }
        }
        base = [...map.values()].map(q => ({
          ...q,
          position: q.impressions > 0 ? q._wPos / q.impressions : q.position,
          prevPosition: q.prevImpressions > 0 ? q._wPosPrev / q.prevImpressions : q.prevPosition,
          yearPosition: q.yearImpressions > 0 ? q._wPosYear / q.yearImpressions : q.yearPosition,
        })).sort((a, b) => b.clicks - a.clicks);
      } else {
        base = w.queriesByCountry.filter(q => q.country === currentCountry).sort((a, b) => b.clicks - a.clicks);
      }
      // Filtre marque
      if (currentBrand !== 'all' && client) {
        base = base.filter(q => currentBrand === 'marque' ? isBrandQuery(client, q.query) : !isBrandQuery(client, q.query));
      }
      return base;
    }

    // Selon la base de comparaison choisie (S-1 ou N-1)
    function baseClicks(row) { return currentBasis === 'year' ? row.yearClicks : row.prevClicks; }
    function baseImpr(row) { return currentBasis === 'year' ? row.yearImpressions : row.prevImpressions; }
    function basePos(row) { return currentBasis === 'year' ? row.yearPosition : row.prevPosition; }
    function totalBase(t) { return currentBasis === 'year' ? t.yearAgo : t.previous; }

    // ===== Pays select =====
    function populateCountrySelect() {
      const sel = document.getElementById('country-select');
      const counts = new Map();
      CLIENTS.forEach(s => {
        const w = getClientWindow(s, currentPeriod);
        if (!w || w.error || !w.countries) return;
        Object.entries(w.countries).forEach(([code, d]) => counts.set(code, (counts.get(code) || 0) + d.clicks));
      });
      const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
      const current = sel.value;
      sel.innerHTML = '<option value="all">🌐 Tous pays</option>' + sorted.map(([c]) => '<option value="' + c + '">' + countryFlag(c) + ' ' + countryName(c) + '</option>').join('');
      if ([...sel.options].some(o => o.value === current)) sel.value = current;
    }

    // ===== CSV =====
    function downloadCSV(filename, rows) {
      const csv = rows.map(r => r.map(c => {
        const s = String(c ?? '');
        return /[",\\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(',')).join('\\n');
      const blob = new Blob(['\\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }

    // ===== Sidebar =====
    function renderNav() {
      const items = [];
      items.push(navItem('overview', '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>', "Vue d'ensemble"));
      items.push(navItem('compare', '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18M8 17V9M13 17V5M18 17v-6"/></svg>', 'Comparaison'));
      items.push(navItem('keywords', '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><path d="M7 7h0"/></svg>', 'Mots clés suivis'));
      items.push('<div class="sidebar-section" style="padding-top:14px">Clients</div>');
      CLIENTS.forEach((s) => {
        const w = getClientWindow(s, currentPeriod);
        let badgeHtml = '';
        if (w?.error) badgeHtml = '<span class="nav-badge err">!</span>';
        else {
          const ew = effectiveWindow(s, currentPeriod);
          if (ew && !ew.error && ew.current.clicks < (ew.previous.clicks || 0)) badgeHtml = '<span class="nav-badge down">▼</span>';
        }
        items.push(
          '<div class="nav-item ' + (currentView === s.domain ? 'active' : '') + '" data-view="' + s.domain + '">' +
            '<img class="nav-favicon" src="' + favicon(s.domain) + '" alt="">' +
            '<span class="nav-label">' + escapeAttr(s.label) + '</span>' + badgeHtml +
          '</div>'
        );
      });
      $('#nav').innerHTML = items.join('');
      [...document.querySelectorAll('.nav-item')].forEach(el => el.addEventListener('click', () => setView(el.dataset.view)));
    }
    function navItem(view, icon, label) {
      return '<div class="nav-item ' + (currentView === view ? 'active' : '') + '" data-view="' + view + '">' +
        icon + '<span class="nav-label">' + label + '</span></div>';
    }

    // ===== Vue d'ensemble =====
    function renderOverview() {
      $('#page-title').textContent = "Vue d'ensemble";
      const range = PAYLOAD.periods[currentPeriod];
      $('#page-sub').textContent = 'Période ' + range.current.startDate + ' au ' + range.current.endDate + ' (' + currentPeriod + 'j) · S-1 et N-1';

      const ok = CLIENTS.filter(s => !getClientWindow(s, currentPeriod)?.error);
      const totals = ok.reduce((acc, s) => {
        const w = effectiveWindow(s, currentPeriod);
        acc.clicks += w?.current?.clicks ?? 0;
        acc.prevClicks += w?.previous?.clicks ?? 0;
        acc.yearClicks += w?.yearAgo?.clicks ?? 0;
        acc.impressions += w?.current?.impressions ?? 0;
        acc.prevImpressions += w?.previous?.impressions ?? 0;
        acc.yearImpressions += w?.yearAgo?.impressions ?? 0;
        if ((w?.current?.clicks ?? 0) < (w?.previous?.clicks ?? 0)) acc.down++;
        return acc;
      }, { clicks: 0, prevClicks: 0, yearClicks: 0, impressions: 0, prevImpressions: 0, yearImpressions: 0, down: 0 });

      const iconClick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>';
      const iconEye = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
      const iconWarn = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h0"/></svg>';
      const iconCheck = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>';

      const summary =
        '<div class="kpi-grid">' +
          kpiCardDual('Clics total', fmtNum(totals.clicks), deltaPct(totals.clicks, totals.prevClicks), deltaPct(totals.clicks, totals.yearClicks), iconClick) +
          kpiCardDual('Impressions', fmtNum(totals.impressions), deltaPct(totals.impressions, totals.prevImpressions), deltaPct(totals.impressions, totals.yearImpressions), iconEye) +
          kpiCard('Clients en baisse', totals.down + '<span class="sub">/' + ok.length + '</span>', null, iconWarn) +
          kpiCard('Clients actifs', String(ok.length) + '<span class="sub">/' + CLIENTS.length + '</span>', null, iconCheck) +
        '</div>';

      const brandNote = currentBrand !== 'all'
        ? '<div class="note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h0"/></svg>Mode <b>' + (currentBrand === 'marque' ? 'Marque' : 'Hors marque') + '</b> : chiffres calculés à partir des requêtes (GSC anonymise les requêtes rares, totaux légèrement sous-estimés). Le filtre device est ignoré dans ce mode.</div>'
        : '';

      const grid = CLIENTS.map(clientOverviewCard).join('');
      const exportBtn = '<button class="btn" id="export-global"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Export CSV</button>';

      $('#content').innerHTML = summary + brandNote +
        '<h3 class="section-title">Clients <span class="hint">Cliquer pour le détail &middot; ' + exportBtn + '</span></h3>' +
        '<div class="sites-grid">' + grid + '</div>' +
        renderTrending();

      [...document.querySelectorAll('.site-card')].forEach(el => el.addEventListener('click', () => setView(el.dataset.domain)));
      $('#export-global')?.addEventListener('click', exportGlobal);
      requestAnimationFrame(() => renderOverviewSparklines());
    }

    function kpiCard(label, valueHtml, delta, iconSvg) {
      return '<div class="kpi-card">' +
        '<div class="label">' + (iconSvg || '') + '<span>' + label + '</span></div>' +
        '<div class="value"><span class="num">' + valueHtml + '</span>' + (delta ? badge(delta) : '') + '</div>' +
      '</div>';
    }
    function kpiCardDual(label, valueHtml, dPrev, dYear, iconSvg) {
      return '<div class="kpi-card">' +
        '<div class="label">' + (iconSvg || '') + '<span>' + label + '</span></div>' +
        '<div class="value"><span class="num">' + valueHtml + '</span></div>' +
        '<div class="deltas">' + labeledBadge('S-1', dPrev) + labeledBadge('N-1', dYear) + '</div>' +
      '</div>';
    }

    function clientOverviewCard(s) {
      const raw = getClientWindow(s, currentPeriod);
      if (!raw || raw.error) {
        return '<div class="site-error" data-domain="' + s.domain + '">' +
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
            '<img src="' + favicon(s.domain) + '" style="width:22px;height:22px;border-radius:5px">' +
            '<div style="flex:1;font-weight:600">' + escapeAttr(s.label) + '</div>' +
            '<span class="err-tag">Erreur GSC</span>' +
          '</div><div class="err-msg">' + escapeAttr(raw?.error || 'Données indisponibles pour cette période') + '</div></div>';
      }
      const w = effectiveWindow(s, currentPeriod);
      const dPrev = deltaPct(w.current.clicks, w.previous.clicks);
      const dYear = deltaPct(w.current.clicks, w.yearAgo.clicks);
      const dImp = deltaPct(w.current.impressions, w.previous.impressions);
      const dImpYear = deltaPct(w.current.impressions, w.yearAgo.impressions);
      const dPos = deltaPos(w.current.position, w.previous.position);
      const dPosYear = deltaPos(w.current.position, w.yearAgo.position);
      const alert = w.current.clicks < (w.previous.clicks || 0);
      return '<div class="site-card ' + (alert ? 'alert' : '') + '" data-domain="' + s.domain + '">' +
        '<div class="head">' +
          '<img class="favicon" src="' + favicon(s.domain) + '" alt="">' +
          '<span class="domain">' + escapeAttr(s.label) + '</span>' +
          '<svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>' +
        '</div>' +
        '<div class="site-clicks"><span class="big">' + fmtNum(w.current.clicks) + '</span><span class="big-lbl">clics</span></div>' +
        '<div class="site-deltas">' + labeledBadge('S-1', dPrev) + labeledBadge('N-1', dYear) + '</div>' +
        '<div class="site-sparkline"><canvas id="spark-' + slug(s.domain) + '"></canvas></div>' +
        '<div class="site-subkpis">' +
          '<div class="site-kpi"><div class="label">Impressions</div><div class="num">' + fmtNum(w.current.impressions) + '</div><div class="kpi-deltas">' + labeledBadge('S-1', dImp) + labeledBadge('N-1', dImpYear) + '</div></div>' +
          '<div class="site-kpi"><div class="label">Position</div><div class="num">' + fmtPos(w.current.position) + '</div><div class="kpi-deltas">' + labeledBadge('S-1', dPos) + labeledBadge('N-1', dPosYear) + '</div></div>' +
        '</div>' +
      '</div>';
    }

    function renderOverviewSparklines() {
      const days = parseInt(currentPeriod, 10);
      CLIENTS.forEach(s => {
        const canvas = document.getElementById('spark-' + slug(s.domain));
        if (!canvas) return;
        const daily = s.data.windows?.daily;
        if (!Array.isArray(daily) || !daily.length) return;
        const series = daily.slice(-days);
        const data = series.map(d => d.clicks);
        const max = Math.max(...data, 1);
        const c = new Chart(canvas, {
          type: 'line',
          data: { labels: series.map(d => d.date), datasets: [{ data, borderColor: '#C2B642', backgroundColor: 'rgba(194,182,66,0.18)', borderWidth: 1.5, fill: true, tension: 0.4, pointRadius: 0 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false, min: 0, max: max * 1.1 } }, animation: false },
        });
        charts.push(c);
      });
    }

    // ===== Pages en mouvement (cross-clients) =====
    function renderTrending() {
      const all = [];
      CLIENTS.forEach(s => {
        const w = effectiveWindow(s, currentPeriod);
        if (!w || w.error) return;
        getPagesForView(w).forEach(p => {
          const base = baseClicks(p);
          const diff = (p.clicks || 0) - (base || 0);
          all.push({ label: s.label, url: p.url, path: pathOf(p.url, s.domain), clicks: p.clicks, base, diff, delta: deltaPct(p.clicks, base) });
        });
      });
      const ups = all.filter(p => p.diff > 0 && p.clicks >= 3).sort((a, b) => b.diff - a.diff).slice(0, 8);
      const downs = all.filter(p => p.diff < 0 && p.base >= 3).sort((a, b) => a.diff - b.diff).slice(0, 8);
      const rowHtml = (p) => '<a class="trending-row" href="' + p.url + '" target="_blank" rel="noopener">' +
          '<div class="trending-url"><div class="site">' + escapeAttr(p.label) + '</div><div class="path" title="' + escapeAttr(p.path) + '">' + escapeAttr(p.path) + '</div></div>' +
          '<div class="clicks">' + fmtNum(p.clicks) + ' <small>(' + (p.diff > 0 ? '+' : '') + fmtNum(p.diff) + ')</small></div>' +
          '<div>' + badge(p.delta) + '</div></a>';
      if (!ups.length && !downs.length) return '';
      return '<h3 class="section-title">Pages en mouvement <span class="hint">tous clients &middot; vs ' + basisLabel() + '</span></h3>' +
        '<div class="trending-grid">' +
          '<div class="trending-card up"><div class="head"><span class="dot"></span>Top hausses</div>' + (ups.length ? ups.map(rowHtml).join('') : '<div class="empty-state">Rien à signaler</div>') + '</div>' +
          '<div class="trending-card down"><div class="head"><span class="dot"></span>Top baisses</div>' + (downs.length ? downs.map(rowHtml).join('') : '<div class="empty-state">Rien à signaler</div>') + '</div>' +
        '</div>';
    }

    // ===== Comparaison =====
    let compareSort = { col: 'clicks', dir: 'desc' };
    function renderCompare() {
      $('#page-title').textContent = 'Comparaison clients';
      const range = PAYLOAD.periods[currentPeriod];
      $('#page-sub').textContent = 'Période ' + range.current.startDate + ' au ' + range.current.endDate + ' (' + currentPeriod + 'j)';

      const rows = CLIENTS.map(s => {
        const raw = getClientWindow(s, currentPeriod);
        if (!raw || raw.error) return { label: s.label, domain: s.domain, error: raw?.error || 'Données indisponibles' };
        const w = effectiveWindow(s, currentPeriod);
        return {
          label: s.label, domain: s.domain,
          clicks: w.current.clicks, prevClicks: w.previous.clicks, yearClicks: w.yearAgo.clicks,
          impressions: w.current.impressions, prevImpressions: w.previous.impressions,
          position: w.current.position, prevPosition: w.previous.position,
          ctr: (w.current.ctr || 0) * 100,
        };
      });

      const sortKey = compareSort.col;
      const dir = compareSort.dir === 'asc' ? 1 : -1;
      const ok = rows.filter(r => !r.error);
      ok.sort((a, b) => { const va = a[sortKey] ?? 0, vb = b[sortKey] ?? 0; return (va > vb ? 1 : va < vb ? -1 : 0) * dir; });
      const errored = rows.filter(r => r.error);

      const th = (key, label, align = 'left') => {
        const isSorted = sortKey === key;
        const arrow = isSorted ? (compareSort.dir === 'asc' ? '↑' : '↓') : '';
        return '<th class="' + (align === 'right' ? 'right ' : '') + (isSorted ? 'sorted' : '') + '" data-sort="' + key + '">' + label + ' <span class="sort-arrow">' + arrow + '</span></th>';
      };
      const exportBtn = '<button class="btn" id="export-compare" style="margin-left:auto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Export CSV</button>';

      $('#content').innerHTML =
        '<div style="display:flex;align-items:center;margin-bottom:14px"><h3 class="section-title" style="margin:0">Tableau comparatif <span class="hint">Cliquer une colonne pour trier</span></h3>' + exportBtn + '</div>' +
        '<div class="compare-table"><table><thead><tr>' +
            th('label', 'Client') +
            th('clicks', 'Clics', 'right') +
            '<th class="right">Δ S-1</th><th class="right">Δ N-1</th>' +
            th('impressions', 'Impressions', 'right') + '<th class="right">Δ S-1</th>' +
            th('position', 'Position', 'right') + '<th class="right">Δ S-1</th>' +
            th('ctr', 'CTR', 'right') +
          '</tr></thead><tbody>' +
          ok.map(r => {
            const dC = deltaPct(r.clicks, r.prevClicks);
            const dY = deltaPct(r.clicks, r.yearClicks);
            const dI = deltaPct(r.impressions, r.prevImpressions);
            const dP = deltaPos(r.position, r.prevPosition);
            return '<tr data-domain="' + r.domain + '">' +
              '<td><div class="site-cell"><img src="' + favicon(r.domain) + '" alt="">' + escapeAttr(r.label) + '</div></td>' +
              '<td class="right">' + fmtNum(r.clicks) + '</td>' +
              '<td class="right">' + badge(dC) + '</td><td class="right">' + badge(dY) + '</td>' +
              '<td class="right">' + fmtNum(r.impressions) + '</td><td class="right">' + badge(dI) + '</td>' +
              '<td class="right">' + fmtPos(r.position) + '</td><td class="right">' + badge(dP) + '</td>' +
              '<td class="right">' + r.ctr.toFixed(2) + '%</td></tr>';
          }).join('') +
          errored.map(r => '<tr><td><div class="site-cell"><img src="' + favicon(r.domain) + '" alt="">' + escapeAttr(r.label) + '</div></td><td colspan="8" class="right" style="color:var(--red);font-weight:500">' + escapeAttr(r.error) + '</td></tr>').join('') +
          '</tbody></table></div>';

      [...document.querySelectorAll('.compare-table th[data-sort]')].forEach(th2 => th2.addEventListener('click', () => {
        const k = th2.dataset.sort;
        if (compareSort.col === k) compareSort.dir = compareSort.dir === 'asc' ? 'desc' : 'asc';
        else { compareSort.col = k; compareSort.dir = 'desc'; }
        renderCompare();
      }));
      [...document.querySelectorAll('.compare-table tbody tr[data-domain]')].forEach(tr => tr.addEventListener('click', () => setView(tr.dataset.domain)));
      $('#export-compare')?.addEventListener('click', () => {
        const rows2 = [['Client', 'Clics', 'PrevClics', 'AnneeClics', 'Impressions', 'PrevImpressions', 'Position', 'PrevPosition', 'CTR%']];
        ok.forEach(r => rows2.push([r.label, r.clicks, r.prevClicks, r.yearClicks, r.impressions, r.prevImpressions, r.position?.toFixed(2), r.prevPosition?.toFixed(2), r.ctr.toFixed(2)]));
        downloadCSV('clients-comparaison-' + currentPeriod + 'j.csv', rows2);
      });
    }

    // ===== Suivi mots clés (mensuel) =====
    function monthLabel(key) {
      const [y, m] = key.split('-');
      const lbl = new Date(Date.UTC(+y, +m - 1, 1)).toLocaleDateString('fr-FR', { month: 'short' });
      return lbl.replace('.', '') + ' ' + y.slice(2);
    }
    // Couleur = évolution vs le mois précédent (vert: position gagnée, rouge: perdue)
    function kwCell(d, prev) {
      if (!d || !d.impressions) return '<td class="kw-pos none">–</td>';
      let cls = '';
      if (prev && prev.impressions) {
        const diff = d.position - prev.position;
        cls = diff < -0.1 ? 'up' : diff > 0.1 ? 'down' : '';
      } else if (prev === null) {
        cls = 'up'; // entrée dans l'index ce mois-ci
      }
      return '<td class="kw-pos ' + cls + '" title="' + fmtNum(d.clicks) + ' clics · ' + fmtNum(d.impressions) + ' impressions">' + d.position.toFixed(1) + '</td>';
    }
    function renderKeywords() {
      $('#page-title').textContent = 'Mots clés suivis';
      $('#page-sub').textContent = 'Position moyenne mensuelle (GSC) · 13 derniers mois';

      const withData = CLIENTS.filter(c => c.data.monthly && !c.data.monthly.error && c.data.monthly.rows?.length);
      if (!withData.length) {
        $('#content').innerHTML = '<div class="note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h0"/></svg>' +
          'Aucun mot clé suivi pour le moment. Lancer le workflow GitHub <b>Seed keywords</b> (Actions &gt; Seed keywords &gt; Run workflow) pour générer les listes initiales, ou éditer <code>src/keywords.js</code>.</div>';
        return;
      }

      const exportBtn = '<button class="btn" id="export-kw"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Export CSV</button>';
      const note = '<div class="note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h0"/></svg>' +
        'Données mensuelles tous pays / devices confondus : les filtres du haut ne s\\'appliquent pas ici. « – » = aucune impression ce mois-là. « * » = mois en cours, partiel. Listes éditables dans <code>src/keywords.js</code>.</div>';

      const blocks = CLIENTS.map(c => {
        const m = c.data.monthly;
        const head = '<div class="head"><img src="' + favicon(c.domain) + '" alt=""><span class="name">' + escapeAttr(c.label) + '</span>';
        if (!m) return '<div class="kw-client">' + head + '</div><div class="kw-empty">Aucun mot clé configuré pour ce client (src/keywords.js).</div></div>';
        if (m.error) return '<div class="kw-client">' + head + '<span class="err-tag" style="font-size:11px;font-weight:600;background:var(--red-bg);color:var(--red);padding:3px 10px;border-radius:100px">Erreur GSC</span></div><div class="kw-empty">' + escapeAttr(m.error) + '</div></div>';

        const months = m.months;
        const last = months.length - 1;
        const ths = months.map((mo, i) => '<th>' + monthLabel(mo.key) + (mo.partial ? '*' : '') + '</th>').join('');
        const trs = m.rows.map(r => {
          const curr = r.data[last];
          const prev = r.data[last - 1];
          const year = months.length >= 13 ? r.data[last - 12] : null;
          const dM = deltaPos(curr?.position, prev?.position);
          const dY = deltaPos(curr?.position, year?.position);
          return '<tr><td class="kw-kw" title="' + escapeAttr(r.keyword) + '">' + escapeAttr(r.keyword) + '</td>' +
            r.data.map((d, i) => kwCell(d, i > 0 ? r.data[i - 1] : undefined)).join('') +
            '<td>' + (dM ? badge(dM) : '<span class="badge flat">n/a</span>') + '</td>' +
            '<td>' + (dY ? badge(dY) : '<span class="badge flat">n/a</span>') + '</td></tr>';
        }).join('');
        return '<div class="kw-client">' + head + '<span class="meta">' + m.rows.length + ' mots clés</span></div>' +
          '<div class="kw-scroll"><table class="kw-table"><thead><tr><th class="kw-kw">Mot clé</th>' + ths + '<th>Δ M-1</th><th>Δ N-1</th></tr></thead><tbody>' + trs + '</tbody></table></div></div>';
      }).join('');

      $('#content').innerHTML =
        '<div style="display:flex;align-items:center;margin-bottom:14px"><h3 class="section-title" style="margin:0;flex:1">Suivi par client <span class="hint">position moyenne par mois · vert = mieux que le mois précédent, rouge = moins bien</span></h3>' + exportBtn + '</div>' +
        note + blocks;

      $('#export-kw')?.addEventListener('click', exportKeywords);
    }
    function exportKeywords() {
      const allMonths = CLIENTS.find(c => c.data.monthly?.months)?.data.monthly.months ?? [];
      const rows = [['Client', 'Mot clé', ...allMonths.map(mo => mo.key + (mo.partial ? '*' : ''))]];
      CLIENTS.forEach(c => {
        const m = c.data.monthly;
        if (!m || m.error) return;
        m.rows.forEach(r => rows.push([c.label, r.keyword, ...r.data.map(d => (d && d.impressions) ? d.position.toFixed(1) : '')]));
      });
      downloadCSV('suivi-mots-cles.csv', rows);
    }

    // ===== Detail client =====
    let detailState = { tab: 'pages', pages: { page: 1 }, queries: { page: 1 }, filter: '', sort: { col: 'clicks', dir: 'desc' } };
    function applySort(arr, isPages) {
      const { col, dir } = detailState.sort;
      const mult = dir === 'asc' ? 1 : -1;
      const key = (x) => {
        switch (col) {
          case 'url': return isPages ? x.url : x.query;
          case 'clicks': return x.clicks || 0;
          case 'dClicks': return deltaPctRaw(x.clicks, baseClicks(x));
          case 'impressions': return x.impressions || 0;
          case 'dImp': return deltaPctRaw(x.impressions, baseImpr(x));
          case 'position': return x.position || 999;
          case 'dPos': return (x.position || 999) - (basePos(x) || x.position || 999);
          default: return 0;
        }
      };
      return [...arr].sort((a, b) => {
        const va = key(a), vb = key(b);
        if (typeof va === 'string') return mult * va.localeCompare(vb);
        return mult * (va - vb);
      });
    }

    function renderDetail(domain) {
      const client = CLIENTS.find(s => s.domain === domain);
      if (!client) { renderOverview(); return; }
      $('#page-title').textContent = client.label;
      const raw = getClientWindow(client, currentPeriod);
      const range = PAYLOAD.periods[currentPeriod];
      $('#page-sub').textContent = 'Période ' + range.current.startDate + ' au ' + range.current.endDate;

      if (!raw || raw.error) {
        $('#content').innerHTML =
          '<div class="detail-head"><img class="favicon" src="' + favicon(client.domain) + '" alt=""><div class="info"><h1>' + escapeAttr(client.label) + '</h1></div></div>' +
          '<div class="site-error" style="margin-top:16px"><span class="err-tag">Erreur GSC</span><div class="err-msg" style="margin-top:10px">' + escapeAttr(raw?.error || 'Données indisponibles pour cette période') + '</div><div class="err-msg" style="margin-top:6px">Propriété: <code>' + escapeAttr(client.gscProperty) + '</code></div></div>';
        return;
      }

      const w = effectiveWindow(client, currentPeriod);
      const head = '<div class="detail-head">' +
          '<img class="favicon" src="' + favicon(client.domain) + '" alt="">' +
          '<div class="info"><h1>' + escapeAttr(client.label) + '</h1>' +
            '<div class="links">' +
              '<a href="https://' + client.domain + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> ' + escapeAttr(client.domain) + '</a>' +
              '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/></svg> ' + escapeAttr(client.gscProperty) + '</span>' +
            '</div>' +
          '</div>' +
          '<button class="btn primary" id="export-site"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Export CSV</button>' +
        '</div>';

      const kpis = '<div class="kpi-grid">' +
        kpiCardDual('Clics', fmtNum(w.current.clicks), deltaPct(w.current.clicks, w.previous.clicks), deltaPct(w.current.clicks, w.yearAgo.clicks)) +
        kpiCardDual('Impressions', fmtNum(w.current.impressions), deltaPct(w.current.impressions, w.previous.impressions), deltaPct(w.current.impressions, w.yearAgo.impressions)) +
        kpiCardDual('CTR', ((w.current.ctr || 0) * 100).toFixed(2) + '%', deltaPct((w.current.ctr || 0) * 100, (w.previous.ctr || 0) * 100), deltaPct((w.current.ctr || 0) * 100, (w.yearAgo.ctr || 0) * 100)) +
        kpiCardDual('Position moy.', fmtPos(w.current.position), deltaPos(w.current.position, w.previous.position), deltaPos(w.current.position, w.yearAgo.position)) +
      '</div>';

      const brandNote = currentBrand !== 'all'
        ? '<div class="note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h0"/></svg>Mode <b>' + (currentBrand === 'marque' ? 'Marque' : 'Hors marque') + '</b> : KPI calculés à partir des requêtes (légère sous-estimation GSC).</div>'
        : '';

      const charts = '<div class="chart-grid">' +
          '<div class="chart-card"><h3>Clics par jour</h3><div class="chart-sub">' + currentPeriod + ' derniers jours</div><div class="chart-wrap"><canvas id="chart-clicks"></canvas></div></div>' +
          '<div class="chart-card"><h3>Impressions par jour</h3><div class="chart-sub">' + currentPeriod + ' derniers jours</div><div class="chart-wrap"><canvas id="chart-impressions"></canvas></div></div>' +
        '</div>' +
        '<div class="chart-card"><h3>Position moyenne</h3><div class="chart-sub">Plus petit = meilleur (' + currentPeriod + ' jours)</div><div class="chart-wrap"><canvas id="chart-position"></canvas></div></div>';

      const movers = renderMovers(client, w);

      const table = '<div class="data-table" id="data-table" style="margin-top:20px">' +
          '<div class="head"><div class="tabs">' +
              '<button class="tab-btn ' + (detailState.tab === 'pages' ? 'active' : '') + '" data-tab="pages">Pages</button>' +
              '<button class="tab-btn ' + (detailState.tab === 'queries' ? 'active' : '') + '" data-tab="queries">Mots-clés</button>' +
            '</div><span class="count" id="data-count"></span>' +
            '<div class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg><input type="search" id="data-search" placeholder="Rechercher..."></div>' +
          '</div><div id="data-cols"></div><div id="data-list"></div><div class="pagination" id="data-pagination"></div></div>';

      $('#content').innerHTML = head + brandNote + kpis + charts + movers + table;

      $('#export-site').addEventListener('click', () => exportSite(client, w));
      [...document.querySelectorAll('.tab-btn')].forEach(b => b.addEventListener('click', () => {
        detailState.tab = b.dataset.tab; detailState.filter = '';
        detailState.sort = { col: 'clicks', dir: 'desc' };
        const se = $('#data-search'); if (se) se.value = '';
        [...document.querySelectorAll('.tab-btn')].forEach(x => x.classList.toggle('active', x.dataset.tab === detailState.tab));
        renderDataTable(client, w);
      }));
      $('#data-search').addEventListener('input', (e) => {
        clearTimeout(detailState.tFilter);
        detailState.tFilter = setTimeout(() => { detailState.filter = e.target.value.toLowerCase(); detailState[detailState.tab].page = 1; renderDataTable(client, w); }, 80);
      });
      renderDataTable(client, w);
      requestAnimationFrame(() => renderDetailCharts(client));
    }

    // Pages qui ont le plus perdu / gagne (vs base choisie)
    function renderMovers(client, w) {
      const pages = getPagesForView(w).map(p => {
        const base = baseClicks(p);
        return { url: p.url, path: pathOf(p.url, client.domain), clicks: p.clicks, base, diff: (p.clicks || 0) - (base || 0), delta: deltaPct(p.clicks, base) };
      });
      const gains = pages.filter(p => p.diff > 0).sort((a, b) => b.diff - a.diff).slice(0, 6);
      const losses = pages.filter(p => p.diff < 0).sort((a, b) => a.diff - b.diff).slice(0, 6);
      const rowHtml = (p) => '<a class="trending-row" href="' + p.url + '" target="_blank" rel="noopener">' +
          '<div class="trending-url"><div class="path" title="' + escapeAttr(p.path) + '">' + escapeAttr(p.path) + '</div><div class="site">' + fmtNum(p.base) + ' → ' + fmtNum(p.clicks) + ' clics</div></div>' +
          '<div class="clicks"><small>(' + (p.diff > 0 ? '+' : '') + fmtNum(p.diff) + ')</small></div>' +
          '<div>' + badge(p.delta) + '</div></a>';
      if (!gains.length && !losses.length) return '';
      return '<h3 class="section-title">Pages qui bougent <span class="hint">vs ' + basisLabel() + '</span></h3>' +
        '<div class="trending-grid" style="margin-bottom:20px">' +
          '<div class="trending-card down"><div class="head"><span class="dot"></span>Plus fortes baisses</div>' + (losses.length ? losses.map(rowHtml).join('') : '<div class="empty-state">Rien à signaler</div>') + '</div>' +
          '<div class="trending-card up"><div class="head"><span class="dot"></span>Plus fortes hausses</div>' + (gains.length ? gains.map(rowHtml).join('') : '<div class="empty-state">Rien à signaler</div>') + '</div>' +
        '</div>';
    }

    function renderDataTable(client, w) {
      const tab = detailState.tab;
      const isPages = tab === 'pages';
      const all = isPages ? getPagesForView(w) : getQueriesForView(w, client);
      const filter = detailState.filter;
      const filteredRaw = filter ? all.filter(it => (isPages ? it.url : it.query).toLowerCase().includes(filter)) : all;
      const filtered = applySort(filteredRaw, isPages);
      const state = detailState[tab];
      const perPage = 10;
      const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
      if (state.page > totalPages) state.page = totalPages;
      const start = (state.page - 1) * perPage;
      const slice = filtered.slice(start, start + perPage);

      const sortAttr = (key) => {
        const isSorted = detailState.sort.col === key;
        const arrow = isSorted ? (detailState.sort.dir === 'asc' ? '↑' : '↓') : '';
        const lbl = key === 'url' ? (isPages ? 'URL' : 'Mot-clé')
          : (key === 'dClicks' || key === 'dImp' || key === 'dPos') ? 'Δ' + basisLabel()
          : key === 'clicks' ? 'Clics' : key === 'impressions' ? 'Impr.' : 'Pos.';
        return 'sortable ' + (isSorted ? 'sorted' : '') + '" data-sort="' + key + '"><span>' + lbl + '</span><span class="arrow">' + (arrow || '↕') + '</span>';
      };
      $('#data-cols').innerHTML =
        '<div class="data-cols ' + (isPages ? 'pages' : 'queries') + '">' +
          '<div>#</div>' +
          '<div class="' + sortAttr('url') + '</div>' +
          '<div class="right ' + sortAttr('clicks') + '</div>' +
          '<div class="right ' + sortAttr('dClicks') + '</div>' +
          '<div class="right ' + sortAttr('impressions') + '</div>' +
          '<div class="right ' + sortAttr('dImp') + '</div>' +
          '<div class="right ' + sortAttr('position') + '</div>' +
          '<div class="right ' + sortAttr('dPos') + '</div>' +
        '</div>';
      [...document.querySelectorAll('#data-cols [data-sort]')].forEach(el => el.addEventListener('click', () => {
        const c = el.dataset.sort;
        if (detailState.sort.col === c) detailState.sort.dir = detailState.sort.dir === 'asc' ? 'desc' : 'asc';
        else { detailState.sort.col = c; detailState.sort.dir = (c === 'position' || c === 'url') ? 'asc' : 'desc'; }
        state.page = 1; renderDataTable(client, w);
      }));

      $('#data-count').textContent = filter ? (filtered.length + ' / ' + all.length) : (all.length + ' au total');
      $('#data-list').innerHTML = slice.length
        ? slice.map((it, i) => isPages ? renderPageRow(it, start + i, client.domain) : renderQueryRow(it, start + i, client)).join('')
        : '<div class="empty-state">Aucun résultat</div>';

      const end = Math.min(start + perPage, filtered.length);
      const info = filtered.length ? (start + 1) + '-' + end + ' sur ' + filtered.length : '0 element';
      $('#data-pagination').innerHTML = '<div class="info">' + info + '</div><div class="pager">' + buildPager(state.page, totalPages) + '</div>';
      [...$('#data-pagination').querySelectorAll('[data-goto]')].forEach(b => b.addEventListener('click', () => { state.page = parseInt(b.dataset.goto, 10); renderDataTable(client, w); }));
    }

    function renderPageRow(p, idx, domain) {
      const dC = deltaPct(p.clicks, baseClicks(p));
      const dI = deltaPct(p.impressions, baseImpr(p));
      const dP = deltaPos(p.position, basePos(p));
      return '<div class="data-row pages">' +
        '<div class="rank">' + (idx + 1) + '</div>' +
        '<a class="url" href="' + p.url + '" target="_blank" rel="noopener" title="' + escapeAttr(p.url) + '">' + escapeAttr(pathOf(p.url, domain)) + '</a>' +
        '<div class="num">' + fmtNum(p.clicks) + '</div><div class="delta-cell">' + badge(dC) + '</div>' +
        '<div class="num-light">' + fmtNum(p.impressions) + '</div><div class="delta-cell">' + badge(dI) + '</div>' +
        '<div class="num-light">' + fmtPos(p.position) + '</div><div class="delta-cell">' + badge(dP) + '</div>' +
      '</div>';
    }
    function renderQueryRow(q, idx, client) {
      const dC = deltaPct(q.clicks, baseClicks(q));
      const dI = deltaPct(q.impressions, baseImpr(q));
      const dP = deltaPos(q.position, basePos(q));
      const tag = (currentBrand === 'all' && isBrandQuery(client, q.query)) ? '<span class="brand-tag">marque</span>' : '';
      return '<div class="data-row queries">' +
        '<div class="rank">' + (idx + 1) + '</div>' +
        '<div class="qtext" title="' + escapeAttr(q.query) + '">' + tag + escapeAttr(q.query) + '</div>' +
        '<div class="num">' + fmtNum(q.clicks) + '</div><div class="delta-cell">' + badge(dC) + '</div>' +
        '<div class="num-light">' + fmtNum(q.impressions) + '</div><div class="delta-cell">' + badge(dI) + '</div>' +
        '<div class="num-light">' + fmtPos(q.position) + '</div><div class="delta-cell">' + badge(dP) + '</div>' +
      '</div>';
    }

    function buildPager(current, total) {
      if (total <= 1) return '<button class="pager-btn active">1</button>';
      const btns = [];
      btns.push('<button class="pager-btn" data-goto="' + (current - 1) + '" ' + (current === 1 ? 'disabled' : '') + '>‹</button>');
      pageWindow(current, total).forEach(p => p === '...' ? btns.push('<span class="pager-ellipsis">…</span>') : btns.push('<button class="pager-btn ' + (p === current ? 'active' : '') + '" data-goto="' + p + '">' + p + '</button>'));
      btns.push('<button class="pager-btn" data-goto="' + (current + 1) + '" ' + (current === total ? 'disabled' : '') + '>›</button>');
      return btns.join('');
    }
    function pageWindow(current, total) {
      if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
      const set = new Set([1, total, current, current - 1, current + 1]);
      if (current <= 3) [2, 3, 4].forEach(n => set.add(n));
      if (current >= total - 2) [total - 1, total - 2, total - 3].forEach(n => set.add(n));
      const arr = [...set].filter(n => n >= 1 && n <= total).sort((a, b) => a - b);
      const result = [];
      for (let i = 0; i < arr.length; i++) { result.push(arr[i]); if (i + 1 < arr.length && arr[i + 1] - arr[i] > 1) result.push('...'); }
      return result;
    }

    function destroyCharts() { charts.forEach(c => { try { c.destroy(); } catch {} }); charts = []; }
    function renderDetailCharts(client) {
      destroyCharts();
      const daily = client.data.windows?.daily;
      if (!Array.isArray(daily)) return;
      const days = parseInt(currentPeriod, 10);
      const series = daily.slice(-days);
      const labels = series.map(d => fmtDate(d.date));
      const baseOpts = {
        responsive: true, maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, backgroundColor: '#1A1A1A', titleColor: '#FFF', bodyColor: '#FFF', padding: 10, displayColors: false } },
        scales: { x: { grid: { display: false }, ticks: { color: '#9C9C90', font: { size: 10 }, maxRotation: 0, autoSkipPadding: 20 } }, y: { grid: { color: '#F2F0EB' }, border: { display: false }, ticks: { color: '#9C9C90', font: { size: 10 } }, beginAtZero: true } },
      };
      const mk = (label, data, color, bg) => ({ labels, datasets: [{ label, data, borderColor: color, backgroundColor: bg, borderWidth: 2, fill: true, tension: 0.35, pointRadius: 0, pointHoverRadius: 4, pointHoverBackgroundColor: color, pointHoverBorderColor: '#FFF', pointHoverBorderWidth: 2 }] });
      const pSeries = series.map(d => d.position > 0 ? d.position : null);
      const pD = mk('Position', pSeries, '#7B61FF', 'rgba(123,97,255,0.10)'); pD.datasets[0].spanGaps = true;
      charts.push(new Chart(document.getElementById('chart-clicks'), { type: 'line', data: mk('Clics', series.map(d => d.clicks), '#C2B642', 'rgba(194,182,66,0.12)'), options: baseOpts }));
      charts.push(new Chart(document.getElementById('chart-impressions'), { type: 'line', data: mk('Impressions', series.map(d => d.impressions), '#4A90D9', 'rgba(74,144,217,0.10)'), options: baseOpts }));
      charts.push(new Chart(document.getElementById('chart-position'), { type: 'line', data: pD, options: { ...baseOpts, scales: { ...baseOpts.scales, y: { ...baseOpts.scales.y, beginAtZero: false, ticks: { ...baseOpts.scales.y.ticks, callback: v => v.toFixed(1) } } } } }));
    }

    // ===== CSV exports =====
    function exportSite(client, w) {
      const isQueries = detailState.tab === 'queries';
      const rows = [];
      const suffix = (currentCountry === 'all' ? '' : '-' + currentCountry) + (currentBrand === 'all' ? '' : '-' + currentBrand);
      if (isQueries) {
        rows.push(['Mot-clé', 'Marque', 'Clics', 'PrevClics', 'AnneeClics', 'Impressions', 'Position', 'PrevPosition', 'AnneePosition', 'CTR%']);
        getQueriesForView(w, client).forEach(q => rows.push([q.query, isBrandQuery(client, q.query) ? 'oui' : 'non', q.clicks, q.prevClicks, q.yearClicks, q.impressions, q.position?.toFixed(2), q.prevPosition?.toFixed(2), q.yearPosition?.toFixed(2), ((q.ctr || 0) * 100).toFixed(2)]));
        downloadCSV(client.domain + '-requêtes-' + currentPeriod + 'j' + suffix + '.csv', rows);
      } else {
        rows.push(['URL', 'Clics', 'PrevClics', 'AnneeClics', 'Impressions', 'PrevImpressions', 'AnneeImpressions', 'Position', 'PrevPosition', 'AnneePosition']);
        getPagesForView(w).forEach(p => rows.push([p.url, p.clicks, p.prevClicks, p.yearClicks, p.impressions, p.prevImpressions, p.yearImpressions, p.position?.toFixed(2), p.prevPosition?.toFixed(2), p.yearPosition?.toFixed(2)]));
        downloadCSV(client.domain + '-pages-' + currentPeriod + 'j' + suffix + '.csv', rows);
      }
    }
    function exportGlobal() {
      const rows = [['Client', 'Clics', 'PrevClics', 'AnneeClics', 'Impressions', 'PrevImpressions', 'AnneeImpressions', 'Position', 'CTR%']];
      CLIENTS.forEach(s => {
        const raw = getClientWindow(s, currentPeriod);
        if (!raw || raw.error) { rows.push([s.label, 'ERREUR', raw?.error || 'Données indisponibles']); return; }
        const w = effectiveWindow(s, currentPeriod);
        rows.push([s.label, w.current.clicks, w.previous.clicks, w.yearAgo.clicks, w.current.impressions, w.previous.impressions, w.yearAgo.impressions, w.current.position?.toFixed(2), ((w.current.ctr || 0) * 100).toFixed(2)]);
      });
      downloadCSV('clients-overview-' + currentPeriod + 'j.csv', rows);
    }

    // ===== Router =====
    function setView(view) {
      currentView = view; destroyCharts();
      refreshCurrentView();
      try { history.replaceState(null, '', '#' + (view === 'overview' ? '' : encodeURIComponent(view))); } catch {}
    }
    function refreshCurrentView() {
      if (currentView === 'overview') renderOverview();
      else if (currentView === 'compare') renderCompare();
      else if (currentView === 'keywords') renderKeywords();
      else renderDetail(currentView);
      renderNav();
    }
    function bindSwitch(id, fn) {
      [...document.querySelectorAll('#' + id + ' button')].forEach(b => b.addEventListener('click', () => {
        const ds = b.dataset;
        fn(ds[Object.keys(ds)[0]]);
        [...document.querySelectorAll('#' + id + ' button')].forEach(x => x.classList.toggle('active', x === b));
        destroyCharts(); refreshCurrentView();
      }));
    }

    function bootApp() {
      bindSwitch('period-switch', v => { currentPeriod = v; populateCountrySelect(); });
      bindSwitch('device-switch', v => { currentDevice = v; });
      bindSwitch('basis-switch', v => { currentBasis = v; });
      bindSwitch('brand-switch', v => { currentBrand = v; });
      bindSwitch('delta-switch', v => { currentDeltaMode = v; });
      document.getElementById('country-select').addEventListener('change', (e) => { currentCountry = e.target.value; destroyCharts(); refreshCurrentView(); });

      populateCountrySelect();
      const hash = decodeURIComponent(location.hash.slice(1));
      if (hash === 'compare') currentView = 'compare';
      else if (hash === 'keywords') currentView = 'keywords';
      else if (hash && CLIENTS.find(s => s.domain === hash)) currentView = hash;
      renderNav();
      refreshCurrentView();
    }
  </script>
</body>
</html>
`;
}
