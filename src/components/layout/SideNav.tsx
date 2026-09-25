import { Box, Divider } from '@mui/material';
import SideNavBrand from '../navigation/SideNavBrand';
import SideNavMenuList from '../navigation/SideNavMenuList';
import { colorTokens } from '../../theme/tokens';
import { MenuItem } from '../../types';

interface SideNavProps {
  menuTree: MenuItem[];
  selectedId: string;
  openState: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  attLogo: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  isDesktop: boolean;
  brandTitle?: string;
  brandSubtitle?: string;
}

function SideNav({
  menuTree,
  selectedId,
  openState,
  onToggle,
  onSelect,
  attLogo,
  collapsed,
  onToggleCollapsed,
  isDesktop,
  brandTitle,
  brandSubtitle,
}: SideNavProps) {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        backgroundColor: colorTokens.sidebarBg,
        overflow: 'hidden',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: 'rgba(255,255,255,0.12)',
          borderRadius: 2,
        },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
      }}
    >
      <SideNavBrand
        attLogo={attLogo}
        title={brandTitle}
        subtitle={brandSubtitle}
        collapsed={collapsed}
        onToggleCollapsed={onToggleCollapsed}
        showToggle={false}
      />

      <Divider sx={{ mx: collapsed ? 1 : 2, mb: 0.5, borderColor: colorTokens.sidebarDivider }} />

      <SideNavMenuList
        menuTree={menuTree}
        selectedId={selectedId}
        openState={openState}
        onToggle={onToggle}
        onSelect={onSelect}
        collapsed={collapsed}
      />
    </Box>
  );
}

export default SideNav;
