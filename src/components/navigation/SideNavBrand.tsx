import { ViewSidebar } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { colorTokens } from '../../theme/tokens';
import IconButton from '@mui/material/IconButton';

interface SideNavBrandProps {
  attLogo: string;
  title?: string;
  subtitle?: string;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  showToggle?: boolean;
}

function SideNavBrand({
  attLogo,
  title = 'ISOM',
  subtitle = 'Reporting Services',
  collapsed = false,
  onToggleCollapsed,
  showToggle = false,
}: SideNavBrandProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 1,
        px: collapsed ? 1 : 2,
        py: 1.5,
        bgcolor: colorTokens.sidebarBrandBg,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        <Box
          component="img"
          src={attLogo}
          alt="ATT logo"
          sx={{
            width: 36,
            height: 36,
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)',
            opacity: 0.9,
          }}
        />
        {!collapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 700,
                lineHeight: 1.2,
                color: colorTokens.sidebarTextActive,
                letterSpacing: 0.5,
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                color: colorTokens.sidebarTextMuted,
                letterSpacing: 0.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {subtitle}
            </Typography>
          </Box>
        )}
      </Box>
      {showToggle && (
        <IconButton
          size="small"
          onClick={onToggleCollapsed}
          sx={{ color: colorTokens.sidebarText, '&:hover': { bgcolor: colorTokens.sidebarHover } }}
          aria-label="Hide side navigation"
        >
          <ViewSidebar fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}

export default SideNavBrand;
