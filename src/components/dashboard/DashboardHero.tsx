import { Box, Chip, Stack, Typography } from '@mui/material';
import { colorTokens } from '../../theme/tokens';

function DashboardHero() {
  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontSize: { xs: 20, md: 24 }, color: colorTokens.textStrong, lineHeight: 1.2, fontWeight: 600 }}>
              Welcome back,
            </Typography>
            {/* <Typography sx={{ color: colorTokens.textBody, mt: 0.5 }}>You have 2 new messages and 15 new tasks</Typography> */}
          </Box>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2.5, mb: 2 }}>
        {['Home', 'Budget', 'Team'].map((tab) => (
          <Chip
            key={tab}
            label={tab}
            color={tab === 'Home' ? 'primary' : 'default'}
            variant={tab === 'Home' ? 'filled' : 'outlined'}
            sx={{ height: 38, borderRadius: 2.5, fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}
          />
        ))}
      </Stack>
    </>
  );
}

export default DashboardHero;
