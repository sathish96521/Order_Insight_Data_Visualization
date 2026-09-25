import { Breadcrumbs, Link, Typography } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { colorTokens } from '../../theme/tokens';
import { BreadcrumbItem } from '../../types';

interface AppBreadcrumbsProps {
  crumbs?: BreadcrumbItem[];
  onNavigate?: (id: string) => void;
}

function AppBreadcrumbs({ crumbs = [], onNavigate }: AppBreadcrumbsProps) {
  if (crumbs.length === 0) return null;

  return (
    <Breadcrumbs
      separator={<NavigateNext sx={{ fontSize: 18, color: colorTokens.textMuted }} />}
      maxItems={4}
      itemsAfterCollapse={1}
      itemsBeforeCollapse={1}
      sx={{
        px: 2,
        py: 0.75,
        bgcolor: colorTokens.white,
        borderRadius: 2,
        border: `1px solid ${colorTokens.borderSoft}`,
        display: 'inline-flex',
        '& .MuiBreadcrumbs-separator': { mx: 0.5 },
        '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' },
      }}
    >
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;

        if (isLast) {
          return (
            <Typography
              key={crumb.id}
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: colorTokens.textStrong,
                whiteSpace: 'nowrap',
              }}
            >
              {crumb.title}
            </Typography>
          );
        }

        return (
          <Link
            key={crumb.id}
            underline="hover"
            sx={{
              fontSize: 13,
              fontWeight: 500,
              color: colorTokens.textMuted,
              cursor: onNavigate ? 'pointer' : 'default',
              whiteSpace: 'nowrap',
              '&:hover': { color: colorTokens.primaryDark },
            }}
            onClick={() => onNavigate?.(crumb.id)}
          >
            {crumb.title}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}

export default AppBreadcrumbs;
