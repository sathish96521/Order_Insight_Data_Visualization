import { useMemo, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Typography } from '@mui/material';
import { DataGridPremium, GridColDef } from '@mui/x-data-grid-premium';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { alpha } from '@mui/material/styles';
import { chartPalette, colorTokens } from '../../theme/tokens';

export type VizColumn = { field: string; headerName?: string };
export type VizRow = Record<string, unknown>;

const SKIP_FIELDS = new Set(['id', '_rowId']);

function cellText(row: VizRow, field: string) {
  const v = row[field];
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function toNumber(text: string) {
  if (!text) return NaN;
  const cleaned = text.replace(/[$,%\s]/g, '').replace(/,/g, '');
  return Number(cleaned);
}

function isDateLike(text: string) {
  return /^\d{1,4}[/-]\d{1,2}[/-]\d{1,4}/.test(text);
}

function parseDate(text: string) {
  const t = Date.parse(text);
  return Number.isFinite(t) ? t : 0;
}

function countBy(rows: VizRow[], field: string) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const v = cellText(row, field) || 'Unknown';
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

function fmt(n: number) {
  if (!Number.isFinite(n)) return '0';
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function KpiCard({ label, value, accent, onClick }: { label: string; value: string; accent: string; onClick?: () => void }) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow .15s',
        '&:hover': onClick ? { boxShadow: 3 } : {},
        flex: '1 1 160px',
        minWidth: 150,
        p: 2,
        border: `1px solid ${alpha(accent, 0.25)}`,
        bgcolor: alpha(accent, 0.07),
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: colorTokens.textMuted }}>
        {label}
      </Typography>
      <Typography sx={{ mt: 0.5, fontSize: 24, fontWeight: 600, color: accent }}>{value}</Typography>
    </Paper>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ flex: '1 1 420px', minWidth: 320, p: 2, border: `1px solid ${colorTokens.borderSoft}` }}>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'baseline' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: colorTokens.textStrong }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: 12, color: colorTokens.textMuted }}>{subtitle}</Typography>}
      </Stack>
      {children}
    </Paper>
  );
}

const tooltipStyle = {
  background: colorTokens.white,
  border: `1px solid ${colorTokens.borderSoft}`,
  borderRadius: 4,
  fontSize: 12,
};

type Profile = {
  categorical: { field: string; label: string; data: { name: string; value: number }[] }[];
  numeric: { field: string; label: string; sum: number; avg: number }[];
  dateField: { field: string; label: string } | null;
};

function profileData(rows: VizRow[], columns: VizColumn[]): Profile {
  const sample = rows.slice(0, 400);
  const categorical: Profile['categorical'] = [];
  const numeric: Profile['numeric'] = [];
  let dateField: Profile['dateField'] = null;

  for (const col of columns) {
    const field = col.field;
    if (!field || SKIP_FIELDS.has(field)) continue;
    const label = col.headerName || field;

    let filled = 0;
    let numeric_ = 0;
    let dates = 0;
    const uniques = new Set<string>();
    for (const row of sample) {
      const text = cellText(row, field);
      if (!text) continue;
      filled += 1;
      uniques.add(text);
      if (Number.isFinite(toNumber(text))) numeric_ += 1;
      if (isDateLike(text)) dates += 1;
    }
    if (!filled) continue;

    if (dates / filled > 0.7 && !dateField) {
      dateField = { field, label };
      continue;
    }

    const isIdentifierLike = /(\bid\b|number|num\b|account|phone|telephone|\btn\b|zip|postal|code|circuit|ticket|order[_ ]?no|serial)/i.test(
      `${field} ${label}`,
    );

    if (numeric_ / filled > 0.85 && uniques.size > 4 && !isIdentifierLike) {
      let sum = 0;
      let n = 0;
      for (const row of rows) {
        const v = toNumber(cellText(row, field));
        if (Number.isFinite(v)) {
          sum += v;
          n += 1;
        }
      }
      if (n) numeric.push({ field, label, sum, avg: sum / n });
      continue;
    }

    if (uniques.size >= 2 && uniques.size <= 40) {
      categorical.push({ field, label, data: countBy(rows, field) });
    }
  }

  categorical.sort((a, b) => a.data.length - b.data.length);
  return { categorical, numeric, dateField };
}

export default function ReportVisualization({
  rows,
  columns,
  title = 'Data Visualization',
  onOpenInTable,
}: {
  rows: VizRow[];
  columns: VizColumn[];
  title?: string;
  onOpenInTable?: (rows: VizRow[], label: string) => void;
}) {
  const [drill, setDrill] = useState<{ label: string; rows: VizRow[] } | null>(null);
  const openDrill = (field: string, fieldLabel: string, value: unknown) => {
    if (value === undefined || value === null) return;
    const v = String(value);
    const matched = rows.filter((r) => (cellText(r, field) || 'Unknown') === v);
    setDrill({ label: `${fieldLabel} = ${v}`, rows: matched });
  };
  const nameOf = (d: any) => d?.name ?? d?.payload?.name;
  const previewCols: GridColDef[] = useMemo(
    () => columns.filter((c) => !SKIP_FIELDS.has(c.field)).map((c) => ({ field: c.field, headerName: c.headerName || c.field, width: 160 })),
    [columns],
  );
  const profile = useMemo(() => profileData(rows, columns), [rows, columns]);

  const trend = useMemo(() => {
    if (!profile.dateField) return [];
    const map = new Map<string, number>();
    for (const row of rows) {
      const v = cellText(row, profile.dateField.field);
      if (!v) continue;
      map.set(v, (map.get(v) ?? 0) + 1);
    }
    return Array.from(map, ([name, records]) => ({ name, records }))
      .sort((a, b) => parseDate(a.name) - parseDate(b.name))
      .slice(-20);
  }, [rows, profile.dateField]);

  if (!rows.length) {
    return <Alert severity="info">No records available to visualize. Load or refresh the report data first.</Alert>;
  }

  const pie = profile.categorical[0];
  const bar = profile.categorical[1] ?? profile.categorical[0];
  const secondary = profile.categorical[2];
  const topCat = [...profile.categorical].sort((a, b) => b.data.length - a.data.length)[0];
  const kpiNumeric = profile.numeric.slice(0, 3);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography sx={{ fontSize: 16, fontWeight: 600, color: colorTokens.textStrong }}>{title}</Typography>
      <Typography sx={{ fontSize: 12, color: colorTokens.textMuted, mt: -1.5 }}>Tip: click any bar, slice or point to see its records.</Typography>
      <Dialog open={!!drill} onClose={() => setDrill(null)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontSize: 16 }}>
          {drill?.label} — {drill?.rows.length.toLocaleString()} records
          {onOpenInTable && (
            <Typography sx={{ fontSize: 12, color: colorTokens.textMuted }}>Click a row to open just that record in Table View.</Typography>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ height: 440, p: 0 }}>
          {drill && (
            <DataGridPremium
              rows={drill.rows}
              columns={previewCols}
              getRowId={(r) => (r.id ?? r._rowId) as number}
              density="compact"
              pagination
              pageSizeOptions={[25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              onRowClick={(p) => {
                if (!onOpenInTable || !drill) return;
                onOpenInTable([p.row as VizRow], `${drill.label} (1 record)`);
                setDrill(null);
              }}
              sx={{ border: 'none', '& .MuiDataGrid-row': { cursor: onOpenInTable ? 'pointer' : 'default' } }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDrill(null)}>Close</Button>
          {onOpenInTable && drill && (
            <Button variant="contained" onClick={() => { onOpenInTable(drill.rows, drill.label); setDrill(null); }}>
              Open all {drill.rows.length.toLocaleString()} in Table View
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <KpiCard label="Total records" value={fmt(rows.length)} accent={chartPalette[0]} onClick={() => setDrill({ label: "All records", rows })} />
        {pie && <KpiCard label={`${pie.label} values`} value={fmt(pie.data.length)} accent={chartPalette[1]} onClick={() => setDrill({ label: `Records with ${pie.label}`, rows: rows.filter((r) => cellText(r, pie.field)) })} />}
        {kpiNumeric.map((n, i) => (
          <KpiCard key={n.field} label={`Total ${n.label}`} value={fmt(n.sum)} accent={chartPalette[(i + 2) % chartPalette.length]} onClick={() => setDrill({ label: `Records with ${n.label}`, rows: rows.filter((r) => Number.isFinite(toNumber(cellText(r, n.field)))) })} />
        ))}
        {kpiNumeric[0] && (
          <KpiCard label={`Avg ${kpiNumeric[0].label}`} value={fmt(kpiNumeric[0].avg)} accent={chartPalette[5]} onClick={() => setDrill({ label: `Records with ${kpiNumeric[0].label}`, rows: rows.filter((r) => Number.isFinite(toNumber(cellText(r, kpiNumeric[0].field)))) })} />
        )}
      </Stack>

      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {trend.length > 1 && profile.dateField && (
          <Panel title="Records over time" subtitle={`by ${profile.dateField.label}`}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend} style={{ cursor: 'pointer' }} onClick={(st: any) => st?.activeLabel && openDrill(profile.dateField!.field, profile.dateField!.label, st.activeLabel)} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colorTokens.borderSoft} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke={colorTokens.textMuted} />
                <YAxis tick={{ fontSize: 11 }} stroke={colorTokens.textMuted} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="records" stroke={chartPalette[0]} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 7, onClick: (_: any, p: any) => openDrill(profile.dateField!.field, profile.dateField!.label, p?.payload?.name) }} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        )}

        {pie && (
          <Panel title={`${pie.label} mix`}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pie.data.slice(0, 6)} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2} style={{ cursor: 'pointer' }} onClick={(d: any) => openDrill(pie.field, pie.label, nameOf(d))}>
                  {pie.data.slice(0, 6).map((_, i) => (
                    <Cell key={i} fill={chartPalette[i % chartPalette.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </Panel>
        )}

        {bar && (
          <Panel title={`Records by ${bar.label}`}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={bar.data.slice(0, 8)} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colorTokens.borderSoft} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} height={60} angle={-18} textAnchor="end" stroke={colorTokens.textMuted} />
                <YAxis tick={{ fontSize: 11 }} stroke={colorTokens.textMuted} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={chartPalette[0]} cursor="pointer" onClick={(d: any) => openDrill(bar.field, bar.label, nameOf(d))} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        )}

        {topCat && topCat !== bar && (
          <Panel title={`Top 10 ${topCat.label}`} subtitle="by record count">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topCat.data.slice(0, 10)} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colorTokens.borderSoft} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke={colorTokens.textMuted} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10 }} stroke={colorTokens.textMuted} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} fill={chartPalette[1]} cursor="pointer" onClick={(d: any) => openDrill(topCat.field, topCat.label, nameOf(d))} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        )}

        {secondary && (
          <Panel title={`${secondary.label} breakdown`}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={secondary.data.slice(0, 8)} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colorTokens.borderSoft} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke={colorTokens.textMuted} />
                <YAxis tick={{ fontSize: 11 }} stroke={colorTokens.textMuted} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} cursor="pointer" onClick={(d: any) => openDrill(secondary.field, secondary.label, nameOf(d))}>
                  {secondary.data.slice(0, 8).map((_, i) => (
                    <Cell key={i} fill={chartPalette[i % chartPalette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        )}
      </Stack>
    </Box>
  );
}
