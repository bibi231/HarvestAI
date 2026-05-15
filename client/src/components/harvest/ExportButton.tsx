import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import type { HarvestMode } from '../../types/index.js';

type Format = 'csv' | 'json' | 'xlsx' | 'markdown';

interface Props {
  data: Record<string, unknown>[];
  mode: HarvestMode | string;
  jobId: string | null;
}

export function ExportButton({ data, mode, jobId }: Props) {
  const [format, setFormat] = useState<Format>('csv');
  const [copied, setCopied] = useState(false);

  function exportData() {
    const filename = `harvestai-${mode}-${(jobId || 'export').slice(0, 8)}`;
    switch (format) {
      case 'csv': exportCsv(data, filename); break;
      case 'json': exportJson(data, filename); break;
      case 'xlsx': exportXlsx(data, filename); break;
      case 'markdown': copyMarkdown(data); break;
    }
  }

  function exportCsv(rows: Record<string, unknown>[], name: string) {
    if (!rows.length) return;
    const cols = Object.keys(rows[0]);
    const lines = [
      cols.join(','),
      ...rows.map(r => cols.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(',')),
    ];
    download(new Blob([lines.join('\n')], { type: 'text/csv' }), `${name}.csv`);
  }

  function exportJson(rows: Record<string, unknown>[], name: string) {
    download(new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' }), `${name}.json`);
  }

  function exportXlsx(rows: Record<string, unknown>[], name: string) {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'HarvestAI Results');
    // Auto-width columns
    const cols = Object.keys(rows[0] ?? {});
    ws['!cols'] = cols.map(col => ({
      wch: Math.max(col.length, ...rows.map(r => String(r[col] ?? '').length).slice(0, 20)),
    }));
    XLSX.writeFile(wb, `${name}.xlsx`);
  }

  function copyMarkdown(rows: Record<string, unknown>[]) {
    if (!rows.length) return;
    const cols = Object.keys(rows[0]);
    const header = `| ${cols.join(' | ')} |`;
    const divider = `| ${cols.map(() => '---').join(' | ')} |`;
    const body = rows.map(r => `| ${cols.map(c => String(r[c] ?? '').replace(/\|/g, '\\|')).join(' | ')} |`).join('\n');
    const md = `${header}\n${divider}\n${body}`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  const FORMATS: { id: Format; label: string; icon: string }[] = [
    { id: 'csv',      label: 'CSV',      icon: '📄' },
    { id: 'xlsx',     label: 'Excel',    icon: '📊' },
    { id: 'json',     label: 'JSON',     icon: '{}' },
    { id: 'markdown', label: 'Markdown', icon: 'MD' },
  ];

  return (
    <div className="export-row">
      <div className="export-toggle">
        {FORMATS.map(f => (
          <button
            key={f.id}
            className={`export-fmt${format === f.id ? ' on' : ''}`}
            onClick={() => setFormat(f.id)}
            title={f.label}
          >
            <span style={{ fontFamily: f.id === 'json' ? 'var(--font-m)' : 'inherit' }}>{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>
      <button className="btn btn-primary btn-sm" onClick={exportData}>
        {format === 'markdown' && copied ? '✓ Copied' : `Export ${FORMATS.find(f => f.id === format)?.label}`}
      </button>
    </div>
  );
}
