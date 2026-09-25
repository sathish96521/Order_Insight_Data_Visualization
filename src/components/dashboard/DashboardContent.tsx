import { lazy, Suspense } from 'react';
import { Menu, MenuOpen } from '@mui/icons-material';
import { Box, CircularProgress, IconButton, Paper, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { findBreadcrumbPath } from '../../utils/breadcrumbHelper';
import { issueColumns, issueRows, summaryCards } from '../../data/dashboardData';
import { alphaTokens, colorTokens } from '../../theme/tokens';
import AppBreadcrumbs from '../layout/AppBreadcrumbs';
import DashboardHero from './DashboardHero';
import IssuesSummaryPanel from './IssuesSummaryPanel';
import SummaryCardsGrid from './SummaryCardsGrid';
const InventoryReport = lazy(() => import('../report/InventoryReport'));
const PerformanceReportingHub = lazy(() => import('../report/PerformanceReportingHub'));
const ResetClaim = lazy(() => import('../report/ResetClaim'));
import { MenuItem } from '../../types';

/**
 * Finds the selected menu item in the tree and returns it
 * (including reportType and serviceName from the DB-driven menu).
 */
function findMenuItem(menuTree: MenuItem[], selectedId: string): MenuItem | null {
  for (const item of menuTree) {
    if (item.id === selectedId) return item;
    if (item.children) {
      const found = item.children.find((c) => c.id === selectedId);
      if (found) return found;
    }
  }
  return null;
}

interface DashboardContentProps {
  isDesktop: boolean;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  selectedId: string;
  menuTree: MenuItem[];
  onSelect: (id: string) => void;
}

function DashboardContent({ isDesktop, onToggleSidebar, sidebarOpen, selectedId, menuTree, onSelect }: DashboardContentProps) {
  const breadcrumbs = findBreadcrumbPath(menuTree, selectedId);

  const selectedItem = findMenuItem(menuTree, selectedId);
  // Support both DB-driven menus (reportType) and static menus (id === 'inventory')
  const isReport = selectedItem && (selectedItem.reportType || selectedId === 'inventory');
  const isPerformanceHub = selectedId === 'performance-hub-view';
  const isResetClaim = selectedItem?.menuType === 'RESET' || selectedId === 'MIS_RESET' || selectedId === 'GMIS_RESET';

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minWidth: 0,
        minHeight: 0,
        px: { xs: 1.5, md: 3 },
        py: 2,
        overflow: 'auto',
        overflowX: 'hidden',
      }}
    >
      <Stack direction="row" sx={{ mb: 2, alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={onToggleSidebar}
          size="small"
          aria-label={sidebarOpen ? 'Close side navigation' : 'Open side navigation'}
          sx={{
            color: '#5f6f8b',
            border: '1px solid #d0d7e2',
            borderRadius: 1,
            width: 32,
            height: 32,
            '&:hover': { bgcolor: '#f3f6fb' },
          }}
        >
          {sidebarOpen ? <MenuOpen sx={{ fontSize: 20 }} /> : <Menu sx={{ fontSize: 20 }} />}
        </IconButton>
        <AppBreadcrumbs crumbs={breadcrumbs} onNavigate={onSelect} />
      </Stack>

      {isPerformanceHub ? (
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>}>
          <PerformanceReportingHub />
        </Suspense>
      ) : isResetClaim ? (
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>}>
          <ResetClaim serviceName={selectedItem?.serviceName} />
        </Suspense>
      ) : isReport ? (
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>}>
          <InventoryReport
            key={selectedId}
            reportType={selectedItem?.reportType || 'MIS_Inventory_Report'}
            serviceName={selectedItem?.serviceName || 'ADI'}
          />
        </Suspense>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            border: `1px solid ${colorTokens.borderPanel}`,
            bgcolor: alpha(colorTokens.white, alphaTokens.paperBackground),
            backdropFilter: 'blur(2px)',
          }}
        >
          <DashboardHero />
          <SummaryCardsGrid cards={summaryCards} />
          <IssuesSummaryPanel rows={issueRows} columns={issueColumns} />
        </Paper>
      )}
    </Box>
  );
}

export default DashboardContent;
