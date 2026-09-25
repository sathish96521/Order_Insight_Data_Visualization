import { Suspense, lazy, useEffect, useState, type ReactNode } from 'react';
import { Box, CircularProgress, Drawer, useMediaQuery } from '@mui/material';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { Assessment, Description } from '@mui/icons-material';
import { fetchMenuTree } from '../../services/api';
import { menuTree as staticMenuTree } from '../../menuConfig';
import { slaAdminReports } from '../../data/slaAdminReports';
import attLogo from '../../assets/att_logo.png';
import { useAuth } from '../../context/AuthContext';
import SideNav from './SideNav';
import TopHeader from './TopHeader';
import type { AppTab } from './TopHeader';
import appTheme from '../../theme/appTheme';
import type { ApiMenuItem, MenuItem } from '../../types';

const DashboardContent = lazy(() => import('../dashboard/DashboardContent'));
const AbvDashboard = lazy(() => import('../abv/AbvDashboard'));

const LazyFallback = (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <CircularProgress />
  </Box>
);

const drawerWidth = 320;

const allAppTabs: AppTab[] = [
  { id: 'isom', label: 'ISOM Reporting Services' },
  { id: 'abv', label: 'BVOIP-CPUC' },
];

/** Transforms the backend menu API response into the BVOIP-CPUC sidebar tree. */
function transformAbvMenuTree(apiMenus: ApiMenuItem[], includeProductDashboards = true): MenuItem[] {
  const tree: MenuItem[] = [];

  if (includeProductDashboards) {
    tree.push(
      { id: 'abv-label', type: 'label', title: 'Product Dashboards' },
      { id: 'abv-dashboard', title: 'Product Dashboards', icon: Assessment },
    );
  }

  for (const parent of apiMenus) {
    const node: MenuItem = {
      id: parent.id,
      title: parent.title,
      serviceName: parent.serviceName,
      icon: Description,
    };

    if (parent.children && parent.children.length > 0) {
      node.children = parent.children.map((child) => ({
        id: child.id,
        title: child.title,
        reportType: child.id,
        serviceName: child.serviceName,
        menuType: child.menuType,
      }));
    }

    tree.push({ id: `${parent.id}-label`, type: 'label', title: parent.title });
    tree.push(node);
  }

  // SLA Admin Reports render from local data files while the backend is unavailable.
  tree.push({ id: 'sla-admin-label', type: 'label', title: 'SLA Admin Reports' });
  tree.push({
    id: 'sla-admin-reports',
    title: 'SLA Admin Reports',
    icon: Description,
    children: Object.values(slaAdminReports).map((report) => ({
      id: report.id,
      title: report.title,
      reportType: report.id,
      serviceName: 'BVOIP_CPUC',
    })),
  });

  return tree;
}

function normalizeMenuKey(value?: string) {
  return (value || '').trim().toLowerCase();
}

function findStaticMenuIcon(item: Pick<MenuItem, 'id' | 'title' | 'serviceName'>) {
  const normalizedId = normalizeMenuKey(item.id);
  const normalizedTitle = normalizeMenuKey(item.title);
  const normalizedServiceName = normalizeMenuKey(item.serviceName);

  return staticMenuTree.find((node) => {
    if (!node.icon) return false;
    const nodeId = normalizeMenuKey(node.id);
    const nodeTitle = normalizeMenuKey(node.title);
    const nodeServiceName = normalizeMenuKey(node.serviceName);
    return (
      (normalizedId && normalizedId === nodeId) ||
      (normalizedTitle && normalizedTitle === nodeTitle) ||
      (normalizedServiceName && normalizedServiceName === nodeServiceName)
    );
  })?.icon;
}

/** Converts the backend menu tree (from /api/menus) into the format SideNav expects. */
function transformMenuTree(apiMenus: ApiMenuItem[]): MenuItem[] {
  if (!apiMenus || apiMenus.length === 0) return [];

  const tree: MenuItem[] = [
    { id: 'dashboard-label', type: 'label', title: 'Dashboard' },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: findStaticMenuIcon({ id: 'dashboard', title: 'Dashboard' }),
    },
    { id: 'apps-label', type: 'label', title: 'Applications' },
  ];

  const perfHub = staticMenuTree.find((n) => n.id === 'performance-hub');
  if (perfHub) tree.push(perfHub);

  for (const parent of apiMenus) {
    const node: MenuItem = {
      id: parent.id,
      title: parent.title,
      serviceName: parent.serviceName,
      icon:
        findStaticMenuIcon({ id: parent.id, title: parent.title, serviceName: parent.serviceName }) ||
        Description,
    };

    if (parent.children && parent.children.length > 0) {
      node.children = parent.children.map((child) => ({
        id: child.id,
        title: child.title,
        reportType: child.id,
        serviceName: child.serviceName,
        menuType: child.menuType,
      }));
    }

    tree.push(node);
  }

  return tree;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login', replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}

export default function AppShell() {
  const topHeaderHeight = 48;
  const { user, logout } = useAuth();

  const userApps = user?.appAccess || ['ISOM'];
  const appTabs = allAppTabs.filter((tab) => {
    if (tab.id === 'isom') return userApps.includes('ISOM');
    if (tab.id === 'abv') return userApps.includes('BVOIP_CPUC');
    return true;
  });

  const isDesktop = useMediaQuery(appTheme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeApp, setActiveApp] = useState(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('active_app') : null;
    if (saved) return saved;
    if (userApps.includes('ISOM')) return 'isom';
    if (userApps.includes('BVOIP_CPUC')) return 'abv';
    return 'isom';
  });
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [selectedId, setSelectedId] = useState('dashboard');
  const [openState, setOpenState] = useState<Record<string, boolean>>({});
  const [menuTree, setMenuTree] = useState<MenuItem[]>(staticMenuTree);
  const [abvMenuTree, setAbvMenuTree] = useState<MenuItem[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    sessionStorage.setItem('active_app', activeApp);
  }, [activeApp]);

  // Sync selectedId from URL when location or menu changes
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      const childId = pathParts[1];
      setSelectedId(childId);
      const parentId = pathParts[0];
      setOpenState((prev) => (prev[parentId] ? prev : { [parentId]: true }));
    } else if (pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === 'dashboard')) {
      setSelectedId('dashboard');
    }
  }, [location.pathname, menuTree]);

  useEffect(() => {
    if (!userApps.includes('ISOM')) return;
    let cancelled = false;
    fetchMenuTree(['EISSLACR', 'ADI', 'UCPE', 'SDWAN_EDGE'])
      .then((apiMenus) => {
        if (!cancelled && apiMenus && apiMenus.length > 0) {
          const tree = transformMenuTree(apiMenus);
          setMenuTree(tree);
          const firstParent = tree.find((n) => n.children?.length);
          if (firstParent) setOpenState((prev) => ({ ...prev, [firstParent.id]: true }));
        }
      })
      .catch(() => {
        // Menu API unavailable — keep the static menu tree.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!userApps.includes('BVOIP_CPUC')) return;
    const isLegalOnly = userApps.includes('BVOIP_LEGAL') && !userApps.includes('BVOIP_ADMIN');
    const bvoipServices = userApps.includes('BVOIP_ADMIN')
      ? ['BVOIP_CPUC', 'BVOIPLEGAL']
      : isLegalOnly
        ? ['BVOIPLEGAL']
        : ['BVOIP_CPUC'];
    let cancelled = false;
    fetchMenuTree(bvoipServices)
      .then((apiMenus) => {
        if (cancelled) return;
        const tree = transformAbvMenuTree(apiMenus ?? [], !isLegalOnly);
        setAbvMenuTree(tree);
        const firstParent = tree.find((n) => n.children?.length);
        if (firstParent) setOpenState((prev) => ({ ...prev, [firstParent.id]: true }));
      })
      .catch(() => {
        if (cancelled) return;
        setAbvMenuTree(transformAbvMenuTree([], !isLegalOnly));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleBranch = (id: string) => {
    setOpenState((prev) => (prev[id] ? { ...prev, [id]: false } : { [id]: true }));
  };

  const selectMenuItem = (id: string) => {
    if (id === 'dashboard' || id === 'abv-dashboard') {
      navigate({ to: '/' });
    } else {
      const currentMenu = activeApp === 'isom' ? menuTree : abvMenuTree;
      let matched = false;
      for (const item of currentMenu) {
        if (item.children) {
          const child = item.children.find((c) => c.id === id);
          if (child) {
            navigate({ to: '/$', params: { _splat: `${item.id}/${child.id}` } });
            matched = true;
            break;
          }
        }
      }
      if (!matched) {
        navigate({ to: '/$', params: { _splat: `${id}/${id}` } });
      }
    }
    if (!isDesktop) setMobileOpen(false);
  };

  const sidebarOpen = isDesktop ? sidebarVisible : mobileOpen;

  const toggleSidebar = () => {
    if (isDesktop) setSidebarVisible((prev) => !prev);
    else setMobileOpen((prev) => !prev);
  };

  const activeMenuTree = activeApp === 'isom' ? menuTree : abvMenuTree;

  const sideNav = (
    <SideNav
      menuTree={activeMenuTree}
      selectedId={selectedId}
      openState={openState}
      onToggle={toggleBranch}
      onSelect={selectMenuItem}
      attLogo={attLogo}
      collapsed={false}
      onToggleCollapsed={toggleSidebar}
      isDesktop={isDesktop}
      brandTitle={activeApp === 'isom' ? 'ISOM' : 'BVOIP-CPUC'}
      brandSubtitle={activeApp === 'isom' ? 'Reporting Services' : ''}
    />
  );

  const drawerPaperSx = {
    width: drawerWidth,
    border: 'none',
    bgcolor: '#1e293b',
    top: topHeaderHeight,
    height: `calc(100% - ${topHeaderHeight}px)`,
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopHeader
        attLogo={attLogo}
        height={topHeaderHeight}
        fullName={
          [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.attuid || 'User'
        }
        onLogout={logout}
        appTabs={appTabs}
        activeAppId={activeApp}
        onAppTabChange={(id) => {
          setActiveApp(id);
          navigate({ to: '/' });
        }}
      />

      <Box sx={{ display: 'flex', flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
        {isDesktop ? (
          <Drawer
            variant="persistent"
            open={sidebarOpen}
            sx={{
              width: sidebarOpen ? drawerWidth : 0,
              flexShrink: 0,
              transition: 'width 225ms cubic-bezier(0.4, 0, 0.2, 1)',
              '& .MuiDrawer-paper': { ...drawerPaperSx, boxShadow: '2px 0 8px rgba(0,0,0,0.1)' },
            }}
          >
            {sideNav}
          </Drawer>
        ) : (
          <Drawer
            variant="temporary"
            open={sidebarOpen}
            onClose={toggleSidebar}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { ...drawerPaperSx, boxShadow: '4px 0 12px rgba(0,0,0,0.15)' },
            }}
          >
            {sideNav}
          </Drawer>
        )}

        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'margin-left 225ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Suspense fallback={LazyFallback}>
            {activeApp === 'isom' ? (
              <DashboardContent
                isDesktop={isDesktop}
                onToggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                selectedId={selectedId}
                menuTree={activeMenuTree}
                onSelect={selectMenuItem}
              />
            ) : (
              <AbvDashboard
                isDesktop={isDesktop}
                onToggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                selectedId={selectedId}
                menuTree={activeMenuTree}
                onSelect={selectMenuItem}
              />
            )}
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}
