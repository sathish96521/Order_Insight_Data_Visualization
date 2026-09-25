import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { BarChart, Download, Search, TableChart } from '@mui/icons-material';
import {
  DataGridPremium,
  GridColDef,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid-premium';
import { colorTokens } from '../../theme/tokens';
import { parseCsv, slaAdminReports } from '../../data/slaAdminReports';
import ReportVisualization from './ReportVisualization';

type SlaAdminReportProps = { reportId: string };

type GridRow = Record<string, unknown> & { id: number };

function toField(header: string, index: number) {
  const base = header.trim().replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return base ? `${base}_${index}` : `col_${index}`;
}

function widthFor(header: string) {
  const len = header.length;
  if (len <= 10) return 130;
  if (len <= 18) return 170;
  if (len <= 26) return 210;
  return 250;
}

function statusColor(v: string) {
  const t = v.toLowerCase();
  if (/cancel|fail|reject|error/.test(t)) return '#d32f2f';
  if (/complete|billed|active|closed|success/.test(t)) return '#2e7d32';
  if (/backlog|wip|progress|pending|open/.test(t)) return '#0277bd';
  if (/hold|delay|jeopardy/.test(t)) return '#ed6c02';
  return '#546e7a';
}

function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1, gap: 1, borderBottom: `1px solid ${colorTokens.borderSoft}` }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
    </GridToolbarContainer>
  );
}

export default function SlaAdminReport({ reportId }: SlaAdminReportProps) {
  const config = slaAdminReports[reportId];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [rows, setRows] = useState<GridRow[]>([]);
  const [search, setSearch] = useState('');
  const [showCharts, setShowCharts] = useState(false);
  const [drill, setDrill] = useState<{ label: string; ids: Set<unknown> } | null>(null);

  useEffect(() => {
    if (!config) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSearch('');
    setDrill(null);

    fetch(config.file)
      .then((res) => {
        if (!res.ok) throw new Error(`Unable to load report data (${res.status})`);
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        const { headers, rows: dataRows } = parseCsv(text);
        const fields = headers.map(toField);
        setColumns(
          headers.map((header, index) => {
            const name = header.trim();
            const isStatus = /status|phase/i.test(name);
            const isId = !/name|date|reason|segment|channel/i.test(name) && /(number|\bid\b|acct|account)/i.test(name);
            return {
              field: fields[index],
              headerName: name,
              width: widthFor(name),
              sortable: true,
              renderCell: (p: { value?: unknown }) => {
                const v = String(p.value ?? '').trim();
                if (!v) return <span style={{ color: colorTokens.textMuted }}>—</span>;
                if (isStatus) {
                  const s = statusColor(v);
                  return (
                    <Chip
                      size="small"
                      label={v.toUpperCase()}
                      sx={{ fontWeight: 700, fontSize: 11, height: 22, color: s, bgcolor: alpha(s, 0.12), border: `1px solid ${alpha(s, 0.35)}` }}
                    />
                  );
                }
                if (isId) return <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: colorTokens.primaryMain }}>{v}</span>;
                return v;
              },
            };
          }),
        );
        setRows(
          dataRows.map((cells, rowIndex) => {
            const row: GridRow = { id: rowIndex + 1 };
            fields.forEach((field, colIndex) => {
              row[field] = cells[colIndex] ?? '';
            });
            return row;
          }),
        );
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [config]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const base = drill ? rows.filter((r) => drill.ids.has(r.id)) : rows;
    if (!term) return base;
    return base.filter((row) =>
      Object.entries(row).some(([key, value]) =>
        key === 'id' ? false : String(value ?? '').toLowerCase().includes(term),
      ),
    );
  }, [rows, search, drill]);

  const downloadCsv = () => {
    if (!config) return;
    const a = document.createElement('a');
    a.href = config.file;
    a.download = `${config.title.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (!config) {
    return <Alert severity="warning">Unknown report: {reportId}</Alert>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${colorTokens.borderSoft}`, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: colorTokens.textStrong }}>
              {config.title}
            </Typography>
            <Typography sx={{ color: colorTokens.textMuted, fontSize: 13 }}>{config.subtitle}</Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Search all columns"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 260 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: colorTokens.textMuted }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant={showCharts ? 'contained' : 'outlined'}
            size="small"
            startIcon={showCharts ? <TableChart /> : <BarChart />}
            onClick={() => setShowCharts((v) => !v)}
          >
            {showCharts ? 'Table View' : 'Visualize'}
          </Button>
          <Button variant="outlined" size="small" startIcon={<Download />} onClick={downloadCsv}>
            Download CSV
          </Button>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <Chip
            size="small"
            color="info"
            label={loading ? 'Loading records…' : `${filteredRows.length.toLocaleString()} of ${rows.length.toLocaleString()} records`}
          />
          <Chip size="small" color="warning" label="Local data file (backend offline)" />
          {drill && <Chip size="small" color="primary" label={`Filtered: ${drill.label}`} onDelete={() => setDrill(null)} />}
        </Stack>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      {showCharts && !loading ? (
        <ReportVisualization rows={filteredRows} columns={columns} title={`${config.title} — Data Visualization`}
          onOpenInTable={(sel, label) => { setDrill({ label, ids: new Set(sel.map((r) => r.id)) }); setShowCharts(false); }}
        />
      ) : (
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minHeight: 520,
            border: `1px solid ${colorTokens.borderSoft}`,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataGridPremium
              rows={filteredRows}
              columns={columns}
              pagination
              pageSizeOptions={[25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              disableRowSelectionOnClick
              slots={{ toolbar: CustomToolbar }}
              showToolbar
              density="standard"
              headerFilters
              headerFilterHeight={48}
              getRowClassName={(p) => (p.indexRelativeToCurrentPage % 2 ? 'odd' : '')}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeader:not(.MuiDataGrid-columnHeader--filter)': { bgcolor: colorTokens.primaryMain, color: '#fff' },
                '& .MuiDataGrid-columnHeader:not(.MuiDataGrid-columnHeader--filter) .MuiSvgIcon-root': { color: '#fff' },
                '& .MuiDataGrid-columnHeader .MuiDataGrid-iconButtonContainer': { visibility: 'visible', width: 'auto' },
                '& .MuiDataGrid-columnHeader .MuiDataGrid-sortIcon': { opacity: '0.6 !important' },
                '& .MuiDataGrid-columnHeader--sorted .MuiDataGrid-sortIcon': { opacity: '1 !important' },
                '& .MuiDataGrid-columnHeader .MuiDataGrid-menuIcon': { visibility: 'visible', width: 'auto' },
                '& .MuiDataGrid-columnSeparator': { color: 'rgba(255,255,255,0.35)' },
                '& .MuiDataGrid-columnHeader--filter': { bgcolor: colorTokens.whiteSoft },
                '& .MuiDataGrid-row.odd': { bgcolor: '#f7f9fc' },
                '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.02em' },
                '& .MuiDataGrid-cell': { fontSize: 13 },
                '& .MuiDataGrid-row:hover': { bgcolor: alpha(colorTokens.primaryMain, 0.04) },
              }}
            />
          )}
        </Paper>
      )}
    </Box>
  );
}
