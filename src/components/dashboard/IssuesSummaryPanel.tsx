import { useState } from 'react';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { BarChart as BarChartIcon, TableChart } from '@mui/icons-material';
import { DataGridPremium, GridColDef } from '@mui/x-data-grid-premium';
import { colorTokens } from '../../theme/tokens';
import ReportVisualization from '../report/ReportVisualization';
import { IssueRow } from '../../types';

interface IssuesSummaryPanelProps {
  rows: IssueRow[];
  columns: GridColDef[];
}

function IssuesSummaryPanel({ rows, columns }: IssuesSummaryPanelProps) {
  const [showCharts, setShowCharts] = useState(false);

  return (
    <Paper elevation={0} sx={{ mt: 2.5, p: 2, borderRadius: 3, border: `1px solid ${colorTokens.borderSoft}` }}>
      <Stack direction="row" sx={{ mb: 1.2, justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ color: colorTokens.textStrong }}>
          GitHub Issues Summary
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            variant={showCharts ? 'contained' : 'outlined'}
            size="small"
            startIcon={showCharts ? <TableChart /> : <BarChartIcon />}
            onClick={() => setShowCharts((v) => !v)}
          >
            {showCharts ? 'Table View' : 'Visualize'}
          </Button>
          <Chip label="This Week" color="primary" size="small" />
        </Stack>
      </Stack>
      {showCharts ? (
        <ReportVisualization
          rows={rows as unknown as Record<string, unknown>[]}
          columns={columns}
          title="GitHub Issues — Data Visualization"
        />
      ) : (
        <Box sx={{ height: 300 }}>
          <DataGridPremium
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            hideFooter
            density="compact"
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': { bgcolor: colorTokens.whiteSoft, borderBottom: `1px solid ${colorTokens.borderSoft}` },
              '& .MuiDataGrid-cell': { borderBottom: `1px solid ${colorTokens.appBackground}` },
            }}
          />
        </Box>
      )}
    </Paper>
  );
}

export default IssuesSummaryPanel;
