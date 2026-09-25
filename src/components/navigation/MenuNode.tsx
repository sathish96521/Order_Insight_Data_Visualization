import { Description, ExpandMore, FiberManualRecord } from '@mui/icons-material';
import {
  Box,
  Chip,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  Tooltip,
  Typography,
} from '@mui/material';
import { colorTokens } from '../../theme/tokens';
import { MenuItem } from '../../types';

interface MenuNodeProps {
  item: MenuItem;
  depth?: number;
  selectedId: string;
  openState: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  collapsed?: boolean;
}

function MenuNode({ item, depth = 0, selectedId, openState, onToggle, onSelect, collapsed = false }: MenuNodeProps) {
  // ── Section label ──
  if (item.type === 'label') {
    if (collapsed) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <Box sx={{ width: 24, height: 1, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1 }} />
        </Box>
      );
    }

    return (
      <Box sx={{ px: 2.5, pt: 2.5, pb: 0.75 }}>
        <Typography
          sx={{
            fontSize: 11.5,
            fontWeight: 700,
            color: colorTokens.sidebarIndicator,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}
        >
          {item.title}
        </Typography>
      </Box>
    );
  }

  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);
  const isOpen = openState[item.id];
  const isSelected = selectedId === item.id;
  const isNested = depth > 0;

  const content = (
    <ListItemButton
      onClick={() => {
        if (hasChildren && !collapsed) {
          onToggle(item.id);
          return;
        }
        onSelect(item.id);
      }}
      sx={{
        position: 'relative',
        mx: 1,
        pl: collapsed ? 1.5 : isNested ? 3.5 + depth * 1.2 : 2,
        pr: collapsed ? 1.5 : 1.5,
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 2,
        minHeight: isNested ? 36 : 42,
        mb: 0.25,
        color: isSelected ? colorTokens.sidebarTextActive : colorTokens.sidebarText,
        bgcolor: isSelected ? colorTokens.sidebarSelected : 'transparent',
        overflow: 'hidden',
        transition: 'background-color 200ms ease, color 200ms ease',
        '&:hover': {
          bgcolor: isSelected ? colorTokens.sidebarSelected : colorTokens.sidebarHover,
        },
        // Active indicator bar
        ...(isSelected && {
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '20%',
            bottom: '20%',
            width: 3,
            borderRadius: '0 3px 3px 0',
            bgcolor: colorTokens.sidebarIndicator,
          },
        }),
      }}
    >
      {/* Icon or dot */}
      {isNested ? (
        <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 28 }}>
          <FiberManualRecord
            sx={{
              fontSize: isSelected ? 8 : 6,
              color: isSelected ? colorTokens.sidebarDotActive : colorTokens.sidebarDot,
              transition: 'font-size 200ms ease, color 200ms ease',
            }}
          />
        </ListItemIcon>
      ) : (
        <ListItemIcon
          sx={{
            minWidth: collapsed ? 'auto' : 34,
            color: isSelected ? colorTokens.sidebarIndicator : '#e2e8f0',
            transition: 'color 200ms ease',
            '& .MuiSvgIcon-root': {
              color: 'inherit',
            },
          }}
        >
          {Icon ? <Icon sx={{ fontSize: 20 }} /> : <Description sx={{ fontSize: 20 }} />}
        </ListItemIcon>
      )}

      {/* Title & subtitle */}
      {!collapsed && (
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: isNested ? 13.5 : 14,
              fontWeight: isSelected ? 600 : 400,
              letterSpacing: 0.15,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.title}
          </Typography>
          {item.subtitle && (
            <Typography sx={{ fontSize: 11.5, color: colorTokens.sidebarTextMuted, mt: -0.25 }}>
              {item.subtitle}
            </Typography>
          )}
        </Box>
      )}

      {/* Badge */}
      {!collapsed && item.badge && (
        <Chip
          size="small"
          label={item.badge}
          sx={{
            height: 20,
            borderRadius: 1.25,
            fontWeight: 700,
            fontSize: 10.5,
            bgcolor: colorTokens.sidebarBadgeBg,
            color: colorTokens.white,
          }}
        />
      )}

      {/* Expand arrow */}
      {!collapsed && hasChildren && (
        <ExpandMore
          sx={{
            fontSize: 18,
            color: colorTokens.sidebarTextMuted,
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 250ms cubic-bezier(0.4,0,0.2,1)',
            ml: 0.5,
          }}
        />
      )}
    </ListItemButton>
  );

  return (
    <>
      {collapsed ? (
        <Tooltip title={item.title} placement="right" arrow>
          {content}
        </Tooltip>
      ) : (
        content
      )}
      {hasChildren && !collapsed && (
        <Collapse in={isOpen} timeout={300} easing="cubic-bezier(0.4,0,0.2,1)" unmountOnExit>
          <List disablePadding>
            {item.children!.map((child) => (
              <MenuNode
                key={child.id}
                item={child}
                depth={depth + 1}
                selectedId={selectedId}
                openState={openState}
                onToggle={onToggle}
                onSelect={onSelect}
                collapsed={collapsed}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

export default MenuNode;
