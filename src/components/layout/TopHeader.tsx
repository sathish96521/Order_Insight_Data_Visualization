import { Box, Button, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import { colorTokens } from '../../theme/tokens';

export interface AppTab {
  id: string;
  label: string;
}

interface TopHeaderProps {
  attLogo: string;
  height?: number;
  fullName?: string;
  onLogout?: () => void;
  appTabs?: AppTab[];
  activeAppId?: string;
  onAppTabChange?: (appId: string) => void;
}

function TopHeader({ attLogo, height = 48, fullName, onLogout, appTabs = [], activeAppId, onAppTabChange }: TopHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        height,
        bgcolor: colorTokens.topHeaderBg,
        borderBottom: `1px solid ${colorTokens.whiteSoft}`,
      }}
    >
      <Toolbar
        sx={{
          minHeight: `${height}px !important`,
          px: { xs: 1, sm: 2 },
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            mr: 1.5,
            borderRight: `1px solid ${colorTokens.topHeaderDivider}`,
            pr: 1.5,
            minWidth: 0,
          }}
        >
          <Box
            component="img"
            src={attLogo}
            alt="AT&T"
            sx={{
              height: { xs: 24, sm: 28, md: 32 },
              width: 'auto',
              mr: 1,
            }}
          />
          <Typography sx={{ color: colorTokens.topHeaderText, fontWeight: 700, letterSpacing: 0.8, fontSize: { xs: 18, sm: 22 } }}>
            AT&amp;T
          </Typography>
        </Box>

        {/* App tabs in the header */}
        {appTabs.length > 1 ? (
          <Tabs
            value={activeAppId || appTabs[0]?.id}
            onChange={(_, val) => onAppTabChange?.(val)}
            textColor="inherit"
            TabIndicatorProps={{ sx: { bgcolor: '#fff', height: 3 } }}
            sx={{
              minHeight: height,
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                fontSize: { xs: 13, sm: 15 },
                textTransform: 'none',
                minHeight: height,
                px: 2,
                '&.Mui-selected': { color: '#fff' },
              },
            }}
          >
            {appTabs.map((tab) => (
              <Tab key={tab.id} value={tab.id} label={tab.label} />
            ))}
          </Tabs>
        ) : (
          <Typography
            sx={{
              flexGrow: 1,
              color: colorTokens.white,
              fontSize: { xs: 16, sm: 20, md: 24 },
              lineHeight: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {appTabs[0]?.label || 'ISOM Reporting Services'}
          </Typography>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.25, sm: 0.75 }, color: colorTokens.topHeaderText }}>
          <Typography component="span" sx={{ fontSize: '0.8125rem', lineHeight: 1.75, color: 'inherit', whiteSpace: 'nowrap', display: { xs: 'none', md: 'block' } }}>
            Welcome {fullName || 'User'}
          </Typography>
          <Button
            color="inherit"
            size="small"
            sx={{ textTransform: 'none', fontSize: '0.8125rem', minWidth: 'auto', px: 0.5 }}
            onClick={onLogout}
          >
            [Logout]
          </Button>
          <Button
            color="inherit"
            size="small"
            sx={{ textTransform: 'none', fontSize: '0.8125rem', minWidth: 'auto', px: 0.5 }}
            href="https://wiki.web.att.com/display/Encyclopedia/slax"
            target="_blank"
            rel="noopener noreferrer"
          >
            [Help]
          </Button>
        </Box>
      </Toolbar>
    </Box>
  );
}

export default TopHeader;
