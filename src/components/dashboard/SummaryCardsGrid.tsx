import { FlagOutlined } from '@mui/icons-material';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { colorTokens } from '../../theme/tokens';
import { SummaryCard } from '../../types';

interface SummaryCardsGridProps {
  cards: SummaryCard[];
}

function SummaryCardsGrid({ cards }: SummaryCardsGridProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 2 }}>
      {cards.map((card) => (
        <Paper
          key={card.title}
          elevation={0}
          sx={{
            p: 2.2,
            borderRadius: 3,
            border: `1px solid ${colorTokens.borderSoft}`,
            background: `linear-gradient(180deg, ${colorTokens.white} 0%, ${colorTokens.whiteSoft} 100%)`,
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ color: colorTokens.textSecondary, fontWeight: 600 }}>{card.title}</Typography>
            <FlagOutlined sx={{ color: colorTokens.iconMuted, fontSize: 18 }} />
          </Stack>
          <Typography sx={{ fontSize: 62, fontWeight: 700, color: colorTokens.textStrong, lineHeight: 1.1, mt: 1 }}>
            {card.amount}
          </Typography>
          <Typography sx={{ fontSize: 26, color: colorTokens.textSecondary, fontWeight: 500 }}>{card.metric}</Typography>
          <Typography sx={{ color: colorTokens.textBody, mt: 1.2 }}>
            {card.detailLabel}: <b>{card.detailValue}</b>
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}

export default SummaryCardsGrid;
