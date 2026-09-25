import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Assessment, BarChart, Menu, MenuOpen, PieChart, TableChart, TrendingUp } from '@mui/icons-material';
import { DataGridPremium, GridColDef } from '@mui/x-data-grid-premium';
import { colorTokens } from '../../theme/tokens';
import { findBreadcrumbPath } from '../../utils/breadcrumbHelper';
import AppBreadcrumbs from '../layout/AppBreadcrumbs';
import InventoryReport from '../report/InventoryReport';
import ResetClaim from '../report/ResetClaim';
import SlaAdminReport from '../report/SlaAdminReport';
import ReportVisualization from '../report/ReportVisualization';
import { slaAdminReports } from '../../data/slaAdminReports';
import type { MenuItem } from '../../types';

const summaryCards = [
  { label: 'Total Claims', value: '12,847', icon: Assessment, color: '#6366f1' },
  { label: 'Pending Review', value: '1,234', icon: BarChart, color: '#f59e0b' },
  { label: 'Approved', value: '10,892', icon: TrendingUp, color: '#10b981' },
  { label: 'Rejected', value: '721', icon: PieChart, color: '#ef4444' },
];

const claimColumns: GridColDef[] = [
  { field: 'claimId', headerName: 'Claim ID', width: 130 },
  { field: 'customer', headerName: 'Customer', flex: 1, minWidth: 180 },
  { field: 'circuitId', headerName: 'Circuit ID', width: 160 },
  { field: 'claimType', headerName: 'Claim Type', width: 140 },
  { field: 'amount', headerName: 'Amount ($)', width: 120 },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'submittedDate', headerName: 'Submitted', width: 130 },
  { field: 'resolvedDate', headerName: 'Resolved', width: 130 },
];

const claimRows = [
  { id: 1, claimId: 'CLM-2026-001', customer: 'ACME Corporation', circuitId: 'DHEC.123456.ATI', claimType: 'Overbilling', amount: '4,520.00', status: 'Pending', submittedDate: '2026-07-15', resolvedDate: '' },
  { id: 2, claimId: 'CLM-2026-002', customer: 'Global Tech Inc', circuitId: 'DHEC.789012.ATI', claimType: 'Service Credit', amount: '1,200.00', status: 'Approved', submittedDate: '2026-07-10', resolvedDate: '2026-07-20' },
  { id: 3, claimId: 'CLM-2026-003', customer: 'Metro Solutions', circuitId: 'DHEC.345678.ATI', claimType: 'Dispute', amount: '8,750.00', status: 'Under Review', submittedDate: '2026-07-08', resolvedDate: '' },
  { id: 4, claimId: 'CLM-2026-004', customer: 'Pacific Networks', circuitId: 'DHEC.901234.ATI', claimType: 'Overbilling', amount: '2,100.00', status: 'Rejected', submittedDate: '2026-06-28', resolvedDate: '2026-07-05' },
  { id: 5, claimId: 'CLM-2026-005', customer: 'Summit Telecom', circuitId: 'DHEC.567890.ATI', claimType: 'Late Fee', amount: '350.00', status: 'Approved', submittedDate: '2026-07-01', resolvedDate: '2026-07-12' },
  { id: 6, claimId: 'CLM-2026-006', customer: 'Valley Communications', circuitId: 'DHEC.234567.ATI', claimType: 'Service Credit', amount: '5,900.00', status: 'Pending', submittedDate: '2026-07-18', resolvedDate: '' },
  { id: 7, claimId: 'CLM-2026-007', customer: 'Northern Data Co', circuitId: 'DHEC.678901.ATI', claimType: 'Adjustment', amount: '980.00', status: 'Approved', submittedDate: '2026-06-25', resolvedDate: '2026-07-02' },
  { id: 8, claimId: 'CLM-2026-008', customer: 'Coastal Industries', circuitId: 'DHEC.112233.ATI', claimType: 'Dispute', amount: '12,400.00', status: 'Under Review', submittedDate: '2026-07-20', resolvedDate: '' },
];

const disputeColumns: GridColDef[] = [
  { field: 'disputeId', headerName: 'Dispute ID', width: 140 },
  { field: 'customer', headerName: 'Customer', flex: 1, minWidth: 180 },
  { field: 'invoiceNo', headerName: 'Invoice #', width: 140 },
  { field: 'disputeReason', headerName: 'Reason', width: 160 },
  { field: 'amount', headerName: 'Amount ($)', width: 120 },
  { field: 'priority', headerName: 'Priority', width: 100 },
  { field: 'createdDate', headerName: 'Created', width: 130 },
  { field: 'status', headerName: 'Status', width: 120 },
];

const disputeRows = [
  { id: 1, disputeId: 'DSP-2026-101', customer: 'ACME Corporation', invoiceNo: 'INV-88001', disputeReason: 'Incorrect charges', amount: '3,200.00', priority: 'High', createdDate: '2026-07-12', status: 'Open' },
  { id: 2, disputeId: 'DSP-2026-102', customer: 'TechVista LLC', invoiceNo: 'INV-88045', disputeReason: 'Duplicate billing', amount: '1,850.00', priority: 'Medium', createdDate: '2026-07-14', status: 'In Progress' },
  { id: 3, disputeId: 'DSP-2026-103', customer: 'Summit Telecom', invoiceNo: 'INV-88102', disputeReason: 'Service not rendered', amount: '6,500.00', priority: 'High', createdDate: '2026-07-16', status: 'Open' },
  { id: 4, disputeId: 'DSP-2026-104', customer: 'Metro Solutions', invoiceNo: 'INV-87998', disputeReason: 'Rate mismatch', amount: '920.00', priority: 'Low', createdDate: '2026-07-10', status: 'Resolved' },
  { id: 5, disputeId: 'DSP-2026-105', customer: 'Pacific Networks', invoiceNo: 'INV-88200', disputeReason: 'Incorrect charges', amount: '4,100.00', priority: 'Medium', createdDate: '2026-07-19', status: 'Open' },
];

const auditColumns: GridColDef[] = [
  { field: 'auditId', headerName: 'Audit ID', width: 130 },
  { field: 'customer', headerName: 'Customer', flex: 1, minWidth: 180 },
  { field: 'auditType', headerName: 'Audit Type', width: 150 },
  { field: 'period', headerName: 'Period', width: 120 },
  { field: 'findings', headerName: 'Findings', width: 100 },
  { field: 'recoveryAmount', headerName: 'Recovery ($)', width: 130 },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'completedDate', headerName: 'Completed', width: 130 },
];

const auditRows = [
  { id: 1, auditId: 'AUD-2026-01', customer: 'ACME Corporation', auditType: 'Billing Accuracy', period: 'Q1 2026', findings: '12', recoveryAmount: '18,500.00', status: 'Complete', completedDate: '2026-06-30' },
  { id: 2, auditId: 'AUD-2026-02', customer: 'Global Tech Inc', auditType: 'Rate Compliance', period: 'Q2 2026', findings: '5', recoveryAmount: '7,200.00', status: 'In Progress', completedDate: '' },
  { id: 3, auditId: 'AUD-2026-03', customer: 'Summit Telecom', auditType: 'Contract Terms', period: 'Q1 2026', findings: '8', recoveryAmount: '22,100.00', status: 'Complete', completedDate: '2026-05-15' },
  { id: 4, auditId: 'AUD-2026-04', customer: 'Valley Communications', auditType: 'Billing Accuracy', period: 'Q2 2026', findings: '3', recoveryAmount: '4,800.00', status: 'In Progress', completedDate: '' },
  { id: 5, auditId: 'AUD-2026-05', customer: 'Coastal Industries', auditType: 'Service Validation', period: 'Q1 2026', findings: '15', recoveryAmount: '31,000.00', status: 'Complete', completedDate: '2026-07-01' },
];

const adjustmentColumns: GridColDef[] = [
  { field: 'adjustmentId', headerName: 'Adjustment ID', width: 150 },
  { field: 'customer', headerName: 'Customer', flex: 1, minWidth: 180 },
  { field: 'category', headerName: 'Category', width: 150 },
  { field: 'amount', headerName: 'Amount ($)', width: 120 },
  { field: 'requestedBy', headerName: 'Requested By', width: 140 },
  { field: 'requestedDate', headerName: 'Requested', width: 130 },
  { field: 'status', headerName: 'Status', width: 120 },
];

const adjustmentRows = [
  { id: 1, adjustmentId: 'ADJ-2026-201', customer: 'ACME Corporation', category: 'Credit Rebill', amount: '2,450.00', requestedBy: 'Billing Ops', requestedDate: '2026-07-09', status: 'Pending' },
  { id: 2, adjustmentId: 'ADJ-2026-202', customer: 'Metro Solutions', category: 'Tax Correction', amount: '620.00', requestedBy: 'Audit Team', requestedDate: '2026-07-11', status: 'Approved' },
  { id: 3, adjustmentId: 'ADJ-2026-203', customer: 'Pacific Networks', category: 'Contract Reset', amount: '5,100.00', requestedBy: 'Claims Desk', requestedDate: '2026-07-15', status: 'In Review' },
  { id: 4, adjustmentId: 'ADJ-2026-204', customer: 'Summit Telecom', category: 'Usage Reclass', amount: '1,340.00', requestedBy: 'Billing Ops', requestedDate: '2026-07-21', status: 'Approved' },
];

const complianceColumns: GridColDef[] = [
  { field: 'complianceId', headerName: 'Compliance ID', width: 150 },
  { field: 'customer', headerName: 'Customer', flex: 1, minWidth: 180 },
  { field: 'control', headerName: 'Control', width: 180 },
  { field: 'severity', headerName: 'Severity', width: 110 },
  { field: 'owner', headerName: 'Owner', width: 140 },
  { field: 'dueDate', headerName: 'Due Date', width: 130 },
  { field: 'status', headerName: 'Status', width: 120 },
];

const complianceRows = [
  { id: 1, complianceId: 'CMP-2026-301', customer: 'Global Tech Inc', control: 'Invoice Accuracy', severity: 'High', owner: 'APBV Team', dueDate: '2026-08-12', status: 'Open' },
  { id: 2, complianceId: 'CMP-2026-302', customer: 'Coastal Industries', control: 'Tariff Mapping', severity: 'Medium', owner: 'Assurance Ops', dueDate: '2026-08-18', status: 'In Progress' },
  { id: 3, complianceId: 'CMP-2026-303', customer: 'Valley Communications', control: 'Contract Alignment', severity: 'High', owner: 'Audit Team', dueDate: '2026-08-22', status: 'Open' },
  { id: 4, complianceId: 'CMP-2026-304', customer: 'Northern Data Co', control: 'Usage Classification', severity: 'Low', owner: 'APBV Team', dueDate: '2026-08-27', status: 'Resolved' },
];

type AbvDashboardProps = {
  isDesktop: boolean;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  selectedId: string;
  menuTree: MenuItem[];
  onSelect: (id: string) => void;
};

const reportConfig: Record<string, { title: string; subtitle: string; columns: GridColDef[]; rows: Record<string, unknown>[] }> = {
  'abv-claim-report': {
    title: 'Claim Report',
    subtitle: 'Static demo data for ABV billing claims',
    columns: claimColumns,
    rows: claimRows,
  },
  'abv-dispute-report': {
    title: 'Dispute Report',
    subtitle: 'Static demo data for invoice disputes',
    columns: disputeColumns,
    rows: disputeRows,
  },
  'abv-adjustment-report': {
    title: 'Adjustment Report',
    subtitle: 'Static demo data for billing adjustments',
    columns: adjustmentColumns,
    rows: adjustmentRows,
  },
  'apbv-audit-report': {
    title: 'Audit Report',
    subtitle: 'Static demo data for APBV audits',
    columns: auditColumns,
    rows: auditRows,
  },
  'apbv-compliance-report': {
    title: 'Compliance Report',
    subtitle: 'Static demo data for compliance tracking',
    columns: complianceColumns,
    rows: complianceRows,
  },
};

function AbvDashboard({ isDesktop, onToggleSidebar, sidebarOpen, selectedId, menuTree, onSelect }: AbvDashboardProps) {
  const activeReport = reportConfig[selectedId];
  const breadcrumbs = findBreadcrumbPath(menuTree, selectedId);
  const [showCharts, setShowCharts] = useState(false);
  const [drill, setDrill] = useState<{ label: string; rows: Record<string, unknown>[] } | null>(null);
  useEffect(() => setDrill(null), [selectedId]);

  // Find selected menu item to check its menuType
  const selectedItem = menuTree.flatMap((n) => n.children ?? [n]).find((n) => n.id === selectedId);
  const isResetClaim = selectedItem?.menuType === 'RESET' || selectedId === 'BVOIP_CPUC_RESET';
  // DB-driven reports carry their own serviceName (e.g. BVOIPLEGAL); default to BVOIP_CPUC.
  const reportServiceName = selectedItem?.serviceName || 'BVOIP_CPUC';

  // Dynamic report from backend — any report not in static config is DB-driven
  if (!activeReport && selectedId !== 'abv-dashboard' && selectedId !== 'dashboard') {
    return (
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, minHeight: 0, px: { xs: 1.5, md: 3 }, py: 2, overflow: 'auto', overflowX: 'hidden' }}>
        <Stack direction="row" sx={{ mb: 2, alignItems: 'center', gap: 1 }}>
          <IconButton onClick={onToggleSidebar} size="small" aria-label={sidebarOpen ? 'Close side navigation' : 'Open side navigation'} sx={{ color: '#5f6f8b', border: '1px solid #d0d7e2', borderRadius: 1, width: 32, height: 32, '&:hover': { bgcolor: '#f3f6fb' } }}>
            {sidebarOpen ? <MenuOpen sx={{ fontSize: 20 }} /> : <Menu sx={{ fontSize: 20 }} />}
          </IconButton>
          <AppBreadcrumbs crumbs={breadcrumbs} onNavigate={onSelect} />
        </Stack>
        {slaAdminReports[selectedId] ? (
          <SlaAdminReport key={selectedId} reportId={selectedId} />
        ) : isResetClaim ? (
          <ResetClaim serviceName="BVOIP_CPUC" />
        ) : (
          <InventoryReport key={selectedId} reportType={selectedId} serviceName={reportServiceName} />
        )}
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, minWidth: 0, minHeight: 0, px: { xs: 1.5, md: 3 }, py: 2, overflow: 'auto', overflowX: 'hidden' }}>
      <Stack direction="row" sx={{ mb: 2, alignItems: 'center', gap: 1 }}>
        <IconButton onClick={onToggleSidebar} size="small" aria-label={sidebarOpen ? 'Close side navigation' : 'Open side navigation'} sx={{ color: '#5f6f8b', border: '1px solid #d0d7e2', borderRadius: 1, width: 32, height: 32, '&:hover': { bgcolor: '#f3f6fb' } }}>
          {sidebarOpen ? <MenuOpen sx={{ fontSize: 20 }} /> : <Menu sx={{ fontSize: 20 }} />}
        </IconButton>
        <AppBreadcrumbs crumbs={breadcrumbs} onNavigate={onSelect} />
      </Stack>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: colorTokens.textStrong }}>
        BVOIP - ABV and APBA Services
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card) => (
          <Card
            key={card.label}
            elevation={0}
            sx={{ flex: 1, border: `1px solid ${colorTokens.borderSoft}`, borderRadius: 2 }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: alpha(card.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon sx={{ color: card.color, fontSize: 22 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 11, color: colorTokens.textMuted }}>{card.label}</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: colorTokens.textStrong }}>{card.value}</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {activeReport ? (
        <>
          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: `1px solid ${colorTokens.borderSoft}`, borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 18, color: colorTokens.textStrong, mb: 0.5 }}>
                  {activeReport.title}
                </Typography>
                <Typography sx={{ color: colorTokens.textMuted, fontSize: 13 }}>
                  {activeReport.subtitle}
                </Typography>
              </Box>
              <Button
                variant={showCharts ? 'contained' : 'outlined'}
                size="small"
                startIcon={showCharts ? <TableChart /> : <BarChart />}
                onClick={() => setShowCharts((v) => !v)}
              >
                {showCharts ? 'Table View' : 'Visualize'}
              </Button>
            </Stack>
          </Paper>

          {showCharts ? (
            <ReportVisualization
              rows={activeReport.rows}
              columns={activeReport.columns}
              title={`${activeReport.title} — Data Visualization`}
              onOpenInTable={(sel, label) => { setDrill({ label, rows: sel }); setShowCharts(false); }}
            />
          ) : (
            <>{drill && (
            <Chip size="small" color="primary" label={`Filtered: ${drill.label} (${drill.rows.length})`} onDelete={() => setDrill(null)} sx={{ alignSelf: 'flex-start', mb: 1 }} />
          )}
          <Paper elevation={0} sx={{ flex: 1, minHeight: 0, border: `1px solid ${colorTokens.borderSoft}`, borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <DataGridPremium
                  rows={(drill ? drill.rows : activeReport.rows) as any}
                  columns={activeReport.columns}
                  pagination
                  pageSizeOptions={[10, 25]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                  disableRowSelectionOnClick
                  density="standard"
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': { bgcolor: colorTokens.whiteSoft },
                    '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12, textTransform: 'uppercase' },
                    '& .MuiDataGrid-cell': { fontSize: 13 },
                    '& .MuiDataGrid-row:hover': { bgcolor: alpha(colorTokens.primaryMain, 0.04) },
                  }}
                />
              </Box>
            </Paper></>
          )}

          <Chip label="Static Demo Data" size="small" color="warning" sx={{ alignSelf: 'flex-start', mt: 1 }} />
        </>
      ) : (
        <Paper elevation={0} sx={{ p: 3, border: `1px solid ${colorTokens.borderSoft}`, borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 16 }}>BVOIP-CPUC Dashboard</Typography>
            <Chip label="Landing Page" size="small" color="info" />
          </Stack>
          <Typography sx={{ color: colorTokens.textMuted, fontSize: 14 }}>
            Select a report from the side navigation to view its static demo grid data.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default AbvDashboard;
