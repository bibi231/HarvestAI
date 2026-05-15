import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


const cssToAppend = `
/* ─── SETTINGS PAGE ─────────────────────────────────── */
.settings-page { min-height:100vh; background:var(--bg); }
.settings-main { max-width:1060px; margin:0 auto; padding:76px 24px 60px; }
.settings-header { margin-bottom:32px; }
.settings-title { font-family:var(--font-d); font-size:28px; font-weight:900; color:var(--text-1); letter-spacing:-0.02em; }
.settings-sub { font-size:15px; color:var(--text-2); margin-top:6px; }
.settings-layout { display:grid; grid-template-columns:220px 1fr; gap:24px; align-items:start; }
.settings-tabs { display:flex; flex-direction:column; gap:2px; position:sticky; top:76px; background:var(--bg-2); border:1px solid var(--border-1); border-radius:var(--r-l); padding:6px; }
.settings-tab { display:flex; flex-direction:row; align-items:center; gap:9px; padding:10px 12px; font-size:13px; font-weight:600; color:var(--text-2); border-radius:var(--r-m); transition:all 0.13s; text-align:left; }
.settings-tab:hover { color:var(--text-1); background:var(--bg-4); }
.settings-tab.on { color:var(--text-1); background:var(--bg-4); }
.settings-tab.danger { color:var(--red); }
.settings-tab.danger.on { background:var(--red-d); }
.settings-content { display:flex; flex-direction:column; gap:0; }
.settings-section { display:flex; flex-direction:column; gap:16px; }
.settings-card { background:var(--bg-2); border:1px solid var(--border-1); border-radius:var(--r-xl); padding:24px; display:flex; flex-direction:column; gap:18px; }
.settings-card-header h2 { font-family:var(--font-d); font-size:16px; font-weight:800; color:var(--text-1); letter-spacing:-0.01em; margin-bottom:4px; }
.settings-card-header p { font-size:13px; color:var(--text-2); line-height:1.6; }
.danger-card { border-color:rgba(239,68,68,0.15); }
.profile-row { display:flex; flex-direction:row; align-items:center; gap:14px; }
.profile-avatar { width:52px; height:52px; border-radius:50%; object-fit:cover; flex-shrink:0; }
.profile-avatar-placeholder { width:52px; height:52px; border-radius:50%; background:var(--amber-d); border:1px solid var(--border-a); display:flex; align-items:center; justify-content:center; font-family:var(--font-d); font-size:20px; font-weight:900; color:var(--amber); flex-shrink:0; }
.profile-name { font-size:16px; font-weight:700; color:var(--text-1); }
.profile-email { font-size:13px; color:var(--text-2); font-family:var(--font-m); margin-top:2px; }
.settings-stat-row { display:flex; flex-direction:row; gap:24px; padding-top:16px; border-top:1px solid var(--border-1); }
.settings-stat-v { font-family:var(--font-d); font-size:22px; font-weight:900; color:var(--text-1); letter-spacing:-0.02em; }
.settings-stat-l { font-size:12px; color:var(--text-3); font-family:var(--font-m); margin-top:2px; }
.settings-radio-row { display:flex; flex-direction:row; gap:8px; }
.settings-radio-btn { padding:9px 18px; font-size:13px; font-weight:600; color:var(--text-2); background:var(--bg-3); border:1px solid var(--border-1); border-radius:var(--r-m); transition:all 0.13s; }
.settings-radio-btn.on { background:var(--amber-d); border-color:var(--border-a); color:var(--amber); }
.settings-toggle-row { display:flex; flex-direction:row; justify-content:space-between; align-items:center; gap:16px; padding:14px 0; border-bottom:1px solid var(--border-1); }
.settings-toggle-row:last-child { border-bottom:none; }
.settings-toggle-label { font-size:14px; font-weight:600; color:var(--text-1); margin-bottom:2px; }
.settings-toggle-sub { font-size:13px; color:var(--text-2); }
.settings-input-row { display:flex; flex-direction:row; gap:10px; align-items:center; }
.settings-input-row .input { flex:1; }
/* Toggle component */
.toggle { width:44px; height:24px; border-radius:12px; background:var(--bg-4); border:1px solid var(--border-2); position:relative; transition:all 0.2s; flex-shrink:0; }
.toggle.on { background:var(--amber); border-color:var(--amber); }
.toggle-knob { position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:50%; background:var(--text-2); transition:all 0.2s; }
.toggle.on .toggle-knob { left:calc(100% - 19px); background:white; }
/* API key */
.api-key-warning { display:flex; flex-direction:row; align-items:center; gap:8px; padding:10px 13px; background:rgba(245,166,35,0.08); border:1px solid rgba(245,166,35,0.2); border-radius:var(--r-m); font-size:13px; color:var(--amber); }
.api-key-box { display:flex; flex-direction:row; align-items:center; gap:10px; background:var(--bg); border:1px solid var(--border-2); border-radius:var(--r-m); padding:12px 14px; }
.api-key-value { font-family:var(--font-m); font-size:13px; color:var(--text-1); flex:1; word-break:break-all; }
.api-key-masked { font-family:var(--font-m); font-size:14px; color:var(--text-2); padding:10px 0; }
.api-key-meta { font-size:12px; color:var(--text-3); font-family:var(--font-m); }
.api-key-actions { display:flex; gap:8px; margin-top:12px; }
.api-code-block { background:var(--bg); border:1px solid var(--border-1); border-radius:var(--r-m); overflow:hidden; }
.api-code-label { padding:8px 14px; font-size:11px; font-weight:700; color:var(--text-3); font-family:var(--font-m); text-transform:uppercase; letter-spacing:0.07em; border-bottom:1px solid var(--border-1); }
.api-code { padding:14px; font-family:var(--font-m); font-size:12px; color:var(--text-2); white-space:pre-wrap; word-break:break-all; line-height:1.65; }
/* Billing */
.billing-credits-row { display:flex; flex-direction:row; gap:28px; }
.billing-credit-v { font-family:var(--font-d); font-size:30px; font-weight:900; color:var(--text-1); letter-spacing:-0.03em; }
.billing-credit-l { font-size:12px; color:var(--text-3); font-family:var(--font-m); margin-top:3px; }
.billing-history { display:flex; flex-direction:column; }
.billing-history-header { display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr 1fr; gap:12px; padding:8px 0 8px; font-size:11px; font-weight:700; color:var(--text-3); font-family:var(--font-m); text-transform:uppercase; letter-spacing:0.08em; border-bottom:1px solid var(--border-1); }
.billing-history-row { display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr 1fr; gap:12px; padding:11px 0; border-bottom:1px solid var(--border-1); font-size:13px; color:var(--text-2); }
.billing-history-row:last-child { border-bottom:none; }
/* Delete confirm */
.delete-confirm { display:flex; flex-direction:column; gap:12px; }
.delete-confirm-text { font-size:14px; color:var(--text-2); }
.delete-confirm-text strong { color:var(--text-1); font-family:var(--font-m); }
.delete-confirm-actions { display:flex; flex-direction:row; gap:8px; }
/* Activity chart */
.activity-chart { display:flex; flex-direction:row; align-items:flex-end; gap:3px; height:60px; padding:0 4px; }
.activity-bar-wrap { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; height:100%; justify-content:flex-end; }
.activity-bar { width:100%; background:var(--amber-d); border-radius:2px 2px 0 0; border:1px solid rgba(245,166,35,0.2); transition:height 0.4s ease; min-height:4px; }
.activity-bar-label { font-size:10px; color:var(--text-3); font-family:var(--font-m); }
/* Column picker */
.column-picker-popover { position:absolute; top:calc(100% + 6px); right:0; z-index:100; background:var(--bg-3); border:1px solid var(--border-2); border-radius:var(--r-l); padding:10px; min-width:180px; box-shadow:var(--shadow); display:flex; flex-direction:column; gap:2px; }
.column-picker-row { display:flex; flex-direction:row; align-items:center; gap:9px; padding:7px 10px; font-size:13px; color:var(--text-2); border-radius:var(--r-m); cursor:pointer; transition:background 0.12s; text-transform:capitalize; }
.column-picker-row:hover { background:var(--bg-4); color:var(--text-1); }
.column-picker-row input { accent-color:var(--amber); width:14px; height:14px; flex-shrink:0; }
/* Dashboard filter bar */
.dash-filters { display:flex; flex-direction:row; gap:6px; margin-bottom:14px; }
.dash-filter { padding:7px 14px; font-size:13px; font-weight:600; color:var(--text-2); background:var(--bg-3); border:1px solid var(--border-1); border-radius:var(--r-f); transition:all 0.13s; font-family:var(--font-m); }
.dash-filter:hover { color:var(--text-1); }
.dash-filter.on { background:var(--amber-d); border-color:var(--border-a); color:var(--amber); }
/* Analytics stat cards */
.analytics-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
.analytics-card { background:var(--bg-3); border:1px solid var(--border-1); border-radius:var(--r-l); padding:18px 20px; }
.analytics-card-v { font-family:var(--font-d); font-size:26px; font-weight:900; color:var(--text-1); letter-spacing:-0.03em; }
.analytics-card-v .a { color:var(--amber); }
.analytics-card-l { font-size:12px; color:var(--text-3); font-family:var(--font-m); margin-top:4px; }

@media (max-width:900px) {
  .settings-layout { grid-template-columns:1fr; }
  .settings-tabs { flex-direction:row; flex-wrap:wrap; position:relative; top:0; }
  .analytics-grid { grid-template-columns:repeat(2,1fr); }
}
@media (max-width:600px) {
  .analytics-grid { grid-template-columns:1fr 1fr; }
  .billing-history-header, .billing-history-row { grid-template-columns:1.5fr 1fr 1fr; }
  .billing-history-header span:nth-child(4), .billing-history-row span:nth-child(4),
  .billing-history-header span:nth-child(5), .billing-history-row span:nth-child(5) { display:none; }
}
`;

const cssPath = path.join(__dirname, '../client/src/index.css');
fs.appendFileSync(cssPath, cssToAppend, 'utf8');
console.log('CSS appended safely with UTF-8 encoding');
