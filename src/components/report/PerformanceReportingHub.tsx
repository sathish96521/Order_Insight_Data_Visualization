import { useState, useMemo, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  FormControl,
  IconButton,
  InputLabel,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  BarChart as BarChartIcon,
  CalendarMonth,
  Check,
  TableChart,
  Close,
  DensityLarge,
  DensityMedium,
  DensitySmall,
  Download,
  FilterAlt,
  FilterAltOff,
  SearchOff,
  Search,
  TrendingDown,
  TrendingUp,
  ViewHeadline,
} from '@mui/icons-material';
import {
  DataGridPremium,
  GridColDef,
  GridDensity,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
} from '@mui/x-data-grid-premium';
import { colorTokens } from '../../theme/tokens';
import ReportVisualization from './ReportVisualization';
import { globalFilterOptions, tabConfigs, TabConfig } from '../../data/performanceHubData';
import * as XLSX from 'xlsx';

const API_BASE = import.meta.env.VITE_API_BASE || '/IsomReportingServices/api';

// ─── Global Filter State ───
interface GlobalFilters {
  businessUnit: string;
  region: string;
  category: string;
  status: string;
  priority: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

const defaultGlobalFilters: GlobalFilters = {
  businessUnit: '',
  region: '',
  category: '',
  status: '',
  priority: '',
  dateFrom: '',
  dateTo: '',
  search: '',
};

// ─── Tab Filter State ───
type TabFilters = Record<string, Record<string, string>>;

function getSessionToken(): string | null {
  try {
    const raw = sessionStorage.getItem('eisslacr_auth');
    if (!raw) return null;
    return JSON.parse(raw)?.token || null;
  } catch {
    return null;
  }
}

function downloadExcelFromApi(url: string, filename: string): Promise<boolean> {
  const token = getSessionToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return fetch(url, { headers })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.blob();
    })
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      return true;
    })
    .catch(() => false);
}

function generateExcelForTab(tab: TabConfig, rows: Record<string, unknown>[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const headers = tab.columns.map((c) => c.headerName);
  const data = rows.map((row) => tab.columns.map((c) => row[c.field] ?? ''));
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Set column widths
  ws['!cols'] = tab.columns.map((c) => ({ wch: Math.max((c.headerName?.length || 10) + 4, 14) }));
  XLSX.utils.book_append_sheet(wb, ws, tab.label.substring(0, 31));
  return wb;
}

function generateConsolidatedExcel(allTabs: TabConfig[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  for (const tab of allTabs) {
    const headers = tab.columns.map((c) => c.headerName);
    const data = tab.rows.map((row) => tab.columns.map((c) => row[c.field] ?? ''));
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    ws['!cols'] = tab.columns.map((c) => ({ wch: Math.max((c.headerName?.length || 10) + 4, 14) }));
    XLSX.utils.book_append_sheet(wb, ws, tab.label.substring(0, 31));
  }
  return wb;
}

function saveWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}

// Status keywords → color mapping for chip rendering
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'on track': { bg: alpha('#10b981', 0.12), text: '#047857' },
  'complete': { bg: alpha('#6366f1', 0.12), text: '#4338ca' },
  'resolved': { bg: alpha('#10b981', 0.12), text: '#047857' },
  'passed': { bg: alpha('#10b981', 0.12), text: '#047857' },
  'at risk': { bg: alpha('#f59e0b', 0.12), text: '#b45309' },
  'in review': { bg: alpha('#f59e0b', 0.12), text: '#b45309' },
  'in progress': { bg: alpha('#3b82f6', 0.12), text: '#1d4ed8' },
  'pending': { bg: alpha('#94a3b8', 0.15), text: '#475569' },
  'on hold': { bg: alpha('#94a3b8', 0.15), text: '#475569' },
  'delayed': { bg: alpha('#ef4444', 0.12), text: '#b91c1c' },
  'escalated': { bg: alpha('#ef4444', 0.12), text: '#b91c1c' },
  'failed': { bg: alpha('#ef4444', 0.12), text: '#b91c1c' },
  'critical': { bg: alpha('#ef4444', 0.12), text: '#b91c1c' },
  'major': { bg: alpha('#f59e0b', 0.12), text: '#b45309' },
  'minor': { bg: alpha('#3b82f6', 0.12), text: '#1d4ed8' },
  'informational': { bg: alpha('#94a3b8', 0.15), text: '#475569' },
  'planning': { bg: alpha('#8b5cf6', 0.12), text: '#6d28d9' },
  'scheduled': { bg: alpha('#8b5cf6', 0.12), text: '#6d28d9' },
};

function getStatusChipColor(value: string): { bg: string; text: string } | null {
  return STATUS_COLORS[value.toLowerCase()] || null;
}

// Fields that should render as colored chips
const CHIP_FIELDS = new Set(['status', 'impact', 'riskLevel', 'resolution', 'auditStatus']);

// ─── Summary Card Component ───
function SummaryCard({ label, value, trend, color }: { label: string; value: string; trend?: string; color: string }) {
  const isPositive = trend?.startsWith('+') || trend?.startsWith('↑');
  const isNegative = trend?.startsWith('-') || trend?.startsWith('↓');

  return (
    <Card
      elevation={0}
      sx={{
        flex: '1 1 200px',
        minWidth: 180,
        border: `1px solid ${colorTokens.borderSoft}`,
        borderRadius: 3,
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Typography variant="body2" sx={{ color: colorTokens.textMuted, fontWeight: 500, mb: 0.5 }}>
          {label}
        </Typography>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography variant="h5" sx={{ fontWeight: 700, color }}>
            {value}
          </Typography>
          {trend && (
            <Chip
              size="small"
              icon={isPositive ? <TrendingUp sx={{ fontSize: 14 }} /> : isNegative ? <TrendingDown sx={{ fontSize: 14 }} /> : undefined}
              label={trend}
              sx={{
                height: 22,
                fontSize: 11,
                fontWeight: 600,
                bgcolor: isPositive ? alpha('#10b981', 0.1) : isNegative ? alpha('#ef4444', 0.1) : alpha('#6366f1', 0.1),
                color: isPositive ? '#059669' : isNegative ? '#dc2626' : '#4f46e5',
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Tab Toolbar ───
function DensitySelector({ density, onDensityChange }: { density: GridDensity; onDensityChange: (d: GridDensity) => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const options: { value: GridDensity; label: string; icon: React.ReactNode }[] = [
    { value: 'compact', label: 'Compact', icon: <DensitySmall fontSize="small" /> },
    { value: 'standard', label: 'Standard', icon: <DensityMedium fontSize="small" /> },
    { value: 'comfortable', label: 'Comfortable', icon: <DensityLarge fontSize="small" /> },
  ];

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: '#000' }}>
        <ViewHeadline fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 160 } } }}
      >
        <Typography sx={{ px: 2, py: 0.5, fontSize: 12, fontWeight: 600, color: colorTokens.textMuted }}>Density</Typography>
        {options.map((opt) => (
          <ListItem
            key={opt.value}
            component="li"
            onClick={() => { onDensityChange(opt.value); setAnchorEl(null); }}
            sx={{ cursor: 'pointer', px: 2, py: 0.5, '&:hover': { bgcolor: alpha(colorTokens.primaryMain, 0.08) } }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>{opt.icon}</ListItemIcon>
            <ListItemText primary={opt.label} primaryTypographyProps={{ fontSize: 13 }} />
            {density === opt.value && <Check fontSize="small" sx={{ color: colorTokens.primaryMain }} />}
          </ListItem>
        ))}
      </Menu>
    </>
  );
}

function TabToolbar({ onDownload, downloading, density, onDensityChange }: { onDownload?: () => void; downloading?: boolean; density?: GridDensity; onDensityChange?: (d: GridDensity) => void }) {
  return (
    <GridToolbarContainer sx={{ justifyContent: 'flex-end', gap: 0.5, px: 1, py: 0.5 }}>
      {/* @ts-expect-error MUI X toolbar button sx */}
      <GridToolbarColumnsButton sx={{ color: '#000', fontSize: 13 }} />
      {/* @ts-expect-error MUI X toolbar button sx */}
      <GridToolbarFilterButton sx={{ color: '#000', fontSize: 13 }} />
      <Button
        size="small"
        startIcon={downloading ? <CircularProgress size={14} /> : <Download />}
        onClick={onDownload}
        disabled={downloading}
        sx={{ color: '#000', fontSize: 13 }}
      >
        {downloading ? 'Downloading…' : 'Download Report'}
      </Button>
      {density && onDensityChange && (
        <DensitySelector density={density} onDensityChange={onDensityChange} />
      )}
    </GridToolbarContainer>
  );
}

// ─── Main Component ───
function PerformanceReportingHub() {
  const [activeTab, setActiveTab] = useState(0);
  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>(defaultGlobalFilters);
  const [appliedGlobalFilters, setAppliedGlobalFilters] = useState<GlobalFilters>(defaultGlobalFilters);
  const [tabFilters, setTabFilters] = useState<TabFilters>({});
  const [globalFilterOpen, setGlobalFilterOpen] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingTab, setDownloadingTab] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' }>({ open: false, message: '', severity: 'success' });
  const [density, setDensity] = useState<GridDensity>('standard');
  const [showCharts, setShowCharts] = useState(false);
  const [drill, setDrill] = useState<{ label: string; rows: Record<string, unknown>[] } | null>(null);

  const currentTab: TabConfig = tabConfigs[activeTab];

  // Report period (current month context)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const reportPeriod = `${formatDate(monthStart)} – ${formatDate(monthEnd)}`;
  const reportDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // ─── Global Filter Handlers ───
  const handleGlobalFilterChange = (field: keyof GlobalFilters) => (e: SelectChangeEvent | React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const applyGlobalFilters = () => {
    setAppliedGlobalFilters({ ...globalFilters });
  };

  const resetGlobalFilters = () => {
    setGlobalFilters(defaultGlobalFilters);
    setAppliedGlobalFilters(defaultGlobalFilters);
  };

  // ─── Tab Filter Handlers ───
  const handleTabFilterChange = (tabId: string, field: string) => (e: SelectChangeEvent) => {
    setTabFilters((prev) => ({
      ...prev,
      [tabId]: { ...(prev[tabId] || {}), [field]: e.target.value },
    }));
  };

  const clearTabFilters = (tabId: string) => {
    setTabFilters((prev) => ({ ...prev, [tabId]: {} }));
  };

  // ─── Filtered Rows ───
  const filteredRows = useMemo(() => {
    let rows = [...currentTab.rows];

    // Apply global search filter
    if (appliedGlobalFilters.search) {
      const term = appliedGlobalFilters.search.toLowerCase();
      rows = rows.filter((row) =>
        Object.values(row).some((val) => String(val).toLowerCase().includes(term))
      );
    }

    // Apply tab-specific filters
    const currentTabFilters = tabFilters[currentTab.id] || {};
    for (const [field, value] of Object.entries(currentTabFilters)) {
      if (value) {
        rows = rows.filter((row) => String(row[field]).toLowerCase().includes(value.toLowerCase()));
      }
    }

    return rows;
  }, [currentTab, appliedGlobalFilters, tabFilters]);

  // ─── Download Handlers ───
  const handleDownloadAll = useCallback(async () => {
    setDownloadingAll(true);
    try {
      const url = `${API_BASE}/reports/performance-hub/export?type=consolidated`;
      const served = await downloadExcelFromApi(url, 'Performance Reporting Hub.xlsx');
      if (!served) {
        const wb = generateConsolidatedExcel(tabConfigs);
        saveWorkbook(wb, 'Performance Reporting Hub.xlsx');
      }
      setSnackbar({ open: true, message: 'Performance Reporting Hub.xlsx downloaded successfully', severity: 'success' });
    } finally {
      setDownloadingAll(false);
    }
  }, []);

  const handleDownloadTab = useCallback(async () => {
    setDownloadingTab(true);
    try {
      const url = `${API_BASE}/reports/performance-hub/export?type=tab&tabId=${encodeURIComponent(currentTab.id)}`;
      const served = await downloadExcelFromApi(url, `${currentTab.label}.xlsx`);
      if (!served) {
        const wb = generateExcelForTab(currentTab, filteredRows);
        saveWorkbook(wb, `${currentTab.label}.xlsx`);
      }
      setSnackbar({ open: true, message: `${currentTab.label}.xlsx downloaded successfully`, severity: 'success' });
    } finally {
      setDownloadingTab(false);
    }
  }, [currentTab, filteredRows]);

  // ─── Grid Columns (with status chip rendering) ───
  const gridColumns: GridColDef[] = useMemo(
    () =>
      currentTab.columns.map((col) => {
        const colDef: GridColDef = {
          field: col.field,
          headerName: col.headerName,
          width: col.width,
          flex: col.flex,
          sortable: true,
          filterable: true,
        };
        if (CHIP_FIELDS.has(col.field)) {
          colDef.renderCell = (params) => {
            const val = String(params.value ?? '');
            const chipColor = getStatusChipColor(val);
            if (chipColor) {
              return (
                <Chip
                  label={val}
                  size="small"
                  sx={{ fontWeight: 600, fontSize: 11, bgcolor: chipColor.bg, color: chipColor.text, border: 'none' }}
                />
              );
            }
            return val;
          };
        }
        return colDef;
      }),
    [currentTab]
  );

  // ─── Active Global Filter Chips ───
  const activeGlobalFilterEntries = useMemo(() => {
    const labels: Record<keyof GlobalFilters, string> = {
      businessUnit: 'Business Unit',
      region: 'Region',
      category: 'Category',
      status: 'Status',
      priority: 'Priority',
      dateFrom: 'From',
      dateTo: 'To',
      search: 'Search',
    };
    return Object.entries(appliedGlobalFilters)
      .filter(([, val]) => val)
      .map(([key, val]) => ({ key: key as keyof GlobalFilters, label: labels[key as keyof GlobalFilters], value: val }));
  }, [appliedGlobalFilters]);

  const activeGlobalFilterCount = Object.entries(appliedGlobalFilters).filter(
    ([key, val]) => val && key !== 'search'
  ).length;

  const removeGlobalFilter = (key: keyof GlobalFilters) => {
    setAppliedGlobalFilters((prev) => ({ ...prev, [key]: '' }));
    setGlobalFilters((prev) => ({ ...prev, [key]: '' }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* ─── Page Header ─── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          border: `1px solid ${colorTokens.borderPanel}`,
          bgcolor: colorTokens.white,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: colorTokens.textStrong }}>
              Performance Reporting Hub
            </Typography>
            <Typography variant="body2" sx={{ color: colorTokens.textMuted, mt: 0.5 }}>
              Consolidated performance analytics and operational reports
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={globalFilterOpen ? <FilterAltOff /> : <FilterAlt />}
              onClick={() => setGlobalFilterOpen(!globalFilterOpen)}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              {globalFilterOpen ? 'Hide Filters' : 'Filters'}
              {activeGlobalFilterCount > 0 && (
                <Chip size="small" label={activeGlobalFilterCount} sx={{ ml: 1, height: 20, fontSize: 11 }} />
              )}
            </Button>
            <Button
              variant={showCharts ? 'contained' : 'outlined'}
              startIcon={showCharts ? <TableChart /> : <BarChartIcon />}
              onClick={() => setShowCharts((v) => !v)}
              sx={{ textTransform: 'none', borderRadius: 2, whiteSpace: 'nowrap' }}
            >
              {showCharts ? 'Table View' : 'Visualize'}
            </Button>
            <Button
              variant="contained"
              startIcon={downloadingAll ? <CircularProgress size={16} color="inherit" /> : <Download />}
              onClick={handleDownloadAll}
              disabled={downloadingAll}
              sx={{ textTransform: 'none', borderRadius: 2, bgcolor: colorTokens.primaryMain }}
            >
              Download All Reports
            </Button>
          </Stack>
        </Stack>

        {/* Report Period Banner */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mt: 2, pt: 2, borderTop: `1px solid ${colorTokens.borderSoft}` }}
        >
          <CalendarMonth sx={{ fontSize: 18, color: colorTokens.textMuted }} />
          <Typography variant="body2" sx={{ color: colorTokens.textSecondary }}>
            <strong>Report Period:</strong> {reportPeriod}
          </Typography>
          <Typography variant="body2" sx={{ color: colorTokens.textMuted, ml: 2 }}>
            Generated: {reportDate}
          </Typography>
        </Stack>
      </Paper>

      {/* ─── Active Global Filter Chips ─── */}
      {activeGlobalFilterEntries.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ px: 0.5 }}>
          <Typography variant="body2" sx={{ color: colorTokens.textMuted, fontWeight: 500, alignSelf: 'center', mr: 0.5 }}>
            Active filters:
          </Typography>
          {activeGlobalFilterEntries.map(({ key, label, value }) => (
            <Chip
              key={key}
              label={`${label}: ${value}`}
              size="small"
              onDelete={() => removeGlobalFilter(key)}
              sx={{
                fontWeight: 500,
                fontSize: 12,
                bgcolor: alpha(colorTokens.primaryMain, 0.08),
                '& .MuiChip-deleteIcon': { fontSize: 16 },
              }}
            />
          ))}
          <Chip
            label="Clear all"
            size="small"
            variant="outlined"
            onClick={resetGlobalFilters}
            sx={{ fontWeight: 500, fontSize: 12 }}
          />
        </Stack>
      )}

      {/* ─── Global Filters Panel ─── */}
      <Collapse in={globalFilterOpen}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: `1px solid ${colorTokens.borderPanel}`,
            bgcolor: alpha(colorTokens.primaryMain, 0.02),
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colorTokens.textStrong }}>
              Global Filters
            </Typography>
            <IconButton size="small" onClick={() => setGlobalFilterOpen(false)}>
              <Close fontSize="small" />
            </IconButton>
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            <FormControl size="small" fullWidth>
              <InputLabel>Business Unit</InputLabel>
              <Select value={globalFilters.businessUnit} label="Business Unit" onChange={handleGlobalFilterChange('businessUnit')}>
                <MenuItem value="">All</MenuItem>
                {globalFilterOptions.businessUnits.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Region</InputLabel>
              <Select value={globalFilters.region} label="Region" onChange={handleGlobalFilterChange('region')}>
                <MenuItem value="">All</MenuItem>
                {globalFilterOptions.regions.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={globalFilters.category} label="Category" onChange={handleGlobalFilterChange('category')}>
                <MenuItem value="">All</MenuItem>
                {globalFilterOptions.categories.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={globalFilters.status} label="Status" onChange={handleGlobalFilterChange('status')}>
                <MenuItem value="">All</MenuItem>
                {globalFilterOptions.statuses.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select value={globalFilters.priority} label="Priority" onChange={handleGlobalFilterChange('priority')}>
                <MenuItem value="">All</MenuItem>
                {globalFilterOptions.priorities.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Date From"
              type="date"
              value={globalFilters.dateFrom}
              onChange={handleGlobalFilterChange('dateFrom') as (e: React.ChangeEvent<HTMLInputElement>) => void}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              size="small"
              label="Date To"
              type="date"
              value={globalFilters.dateTo}
              onChange={handleGlobalFilterChange('dateTo') as (e: React.ChangeEvent<HTMLInputElement>) => void}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              size="small"
              label="Search"
              placeholder="Search across all data…"
              value={globalFilters.search}
              onChange={handleGlobalFilterChange('search') as (e: React.ChangeEvent<HTMLInputElement>) => void}
              slotProps={{
                input: {
                  startAdornment: <Search sx={{ fontSize: 18, color: colorTokens.textMuted, mr: 0.5 }} />,
                },
              }}
              fullWidth
            />
          </Box>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2.5, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={resetGlobalFilters} sx={{ textTransform: 'none', borderRadius: 2 }}>
              Reset Filters
            </Button>
            <Button variant="contained" onClick={applyGlobalFilters} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: colorTokens.primaryMain }}>
              Apply Filters
            </Button>
          </Stack>
        </Paper>
      </Collapse>

      {/* ─── Tabs ─── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${colorTokens.borderPanel}`,
          bgcolor: colorTokens.white,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ borderBottom: `1px solid ${colorTokens.borderSoft}`, px: { xs: 1, md: 2 } }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 13,
                minHeight: 48,
                px: 2.5,
              },
              '& .Mui-selected': { color: colorTokens.primaryDark },
              '& .MuiTabs-indicator': { bgcolor: colorTokens.primaryMain, height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            {tabConfigs.map((tab) => (
              <Tab key={tab.id} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        {/* ─── Tab Content ─── */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {/* Tab-Specific Filters */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2.5,
              borderRadius: 2,
              border: `1px solid ${colorTokens.borderSoft}`,
              bgcolor: colorTokens.whiteSoft,
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
              {currentTab.filters.map((filter) => (
                <FormControl key={filter.field} size="small" sx={{ minWidth: 160, flex: 1 }}>
                  <InputLabel>{filter.label}</InputLabel>
                  <Select
                    value={(tabFilters[currentTab.id] || {})[filter.field] || ''}
                    label={filter.label}
                    onChange={handleTabFilterChange(currentTab.id, filter.field)}
                  >
                    <MenuItem value="">All</MenuItem>
                    {filter.options.map((opt) => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
              <Tooltip title="Clear tab filters">
                <Button
                  variant="text"
                  size="small"
                  startIcon={<FilterAltOff />}
                  onClick={() => clearTabFilters(currentTab.id)}
                  sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                >
                  Clear Filter
                </Button>
              </Tooltip>
            </Stack>
          </Paper>

          {/* Summary Cards */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              mb: 3,
            }}
          >
            {currentTab.summaryCards.map((card) => (
              <SummaryCard key={card.label} {...card} />
            ))}
          </Box>

          {/* Charts view */}
          {showCharts && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <ReportVisualization
                rows={filteredRows as Record<string, unknown>[]}
                columns={gridColumns}
                title={`${currentTab.label} — Data Visualization`}
                onOpenInTable={(sel, label) => { setDrill({ label, rows: sel }); setShowCharts(false); }}
              />
            </Box>
          )}

          {/* Data Grid */}
          {!showCharts && drill && (
            <Chip size="small" color="primary" label={`Filtered: ${drill.label} (${drill.rows.length})`} onDelete={() => setDrill(null)} sx={{ alignSelf: 'flex-start', mb: 1 }} />
          )}
          <Box sx={{ height: 520, width: '100%', display: showCharts ? 'none' : 'block' }}>
            {filteredRows.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${colorTokens.borderSoft}`,
                  borderRadius: 2,
                  bgcolor: colorTokens.whiteSoft,
                }}
              >
                <SearchOff sx={{ fontSize: 56, color: colorTokens.iconMuted, mb: 1.5 }} />
                <Typography variant="h6" sx={{ color: colorTokens.textSecondary, fontWeight: 600 }}>
                  No records found
                </Typography>
                <Typography variant="body2" sx={{ color: colorTokens.textMuted, mt: 0.5, textAlign: 'center', maxWidth: 320 }}>
                  Try adjusting your filters or search criteria to find the data you're looking for.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => { clearTabFilters(currentTab.id); resetGlobalFilters(); }}
                  sx={{ mt: 2, textTransform: 'none', borderRadius: 2 }}
                >
                  Reset All Filters
                </Button>
              </Paper>
            ) : (
              <DataGridPremium
                rows={(drill ? drill.rows : filteredRows) as any}
                columns={gridColumns}
                pagination
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                disableRowSelectionOnClick
                density={density}
                headerFilters
                headerFilterHeight={42}
                slots={{ toolbar: TabToolbar }}
                slotProps={{ toolbar: { onDownload: handleDownloadTab, downloading: downloadingTab, density, onDensityChange: setDensity } }}
                sx={{
                  border: `1px solid ${colorTokens.borderSoft}`,
                  borderRadius: 2,
                  '& .MuiDataGrid-columnHeaders': {
                    bgcolor: colorTokens.whiteSoft,
                    borderBottom: `1px solid ${colorTokens.borderSoft}`,
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 600,
                    fontSize: 13,
                  },
                  '& .MuiDataGrid-headerFilterRow': {
                    bgcolor: '#fff',
                    borderBottom: `1px solid ${colorTokens.borderSoft}`,
                    '& .MuiDataGrid-columnHeader': {
                      padding: '0 8px',
                    },
                    '& .MuiInputBase-root': {
                      fontSize: 12,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: '#f8fafc',
                    },
                    '& .MuiInputBase-input': {
                      padding: '4px 8px',
                      '&::placeholder': {
                        fontSize: 11,
                        opacity: 0.7,
                      },
                    },
                  },
                  '& .MuiDataGrid-cell': {
                    fontSize: 13,
                  },
                  '& .MuiDataGrid-row:hover': {
                    bgcolor: alpha(colorTokens.primaryMain, 0.04),
                  },
                }}
              />
            )}
          </Box>
        </Box>
      </Paper>

      {/* ─── Snackbar Feedback ─── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PerformanceReportingHub;
