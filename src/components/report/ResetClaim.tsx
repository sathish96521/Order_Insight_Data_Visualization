import { useCallback, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CheckCircle,
  Close,
  Error as ErrorIcon,
  ExpandMore,
  ExpandLess,
  History,
  Info,
  RestartAlt,
  Search,
  Warning,
} from '@mui/icons-material';
import { DataGridPremium, GridColDef } from '@mui/x-data-grid-premium';
import { resetClaim, fetchResetClaimAudit } from '../../services/api';
import { colorTokens } from '../../theme/tokens';
import type { ResetClaimAudit, ResetClaimResponse } from '../../types';

const VALID_RESET_STATUSES = ['PEN', 'REJ', 'ERR', 'AER', 'END'];

const auditColumns: GridColDef[] = [
  { field: 'timestamp', headerName: 'Date/Time', width: 170 },
  { field: 'performedBy', headerName: 'User', width: 110 },
  { field: 'action', headerName: 'Action', width: 150 },
  { field: 'serviceName', headerName: 'Service', width: 90 },
  {
    field: 'status', headerName: 'Result', width: 200,
    renderCell: (params) => {
      const val = (params.value as string) || '';
      const ok = val.toLowerCase().includes('success');
      return (
        <Chip
          size="small"
          label={ok ? 'Success' : 'Failed'}
          color={ok ? 'success' : 'error'}
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: 12 }}
        />
      );
    },
  },
  { field: 'resetReason', headerName: 'Reason', flex: 1, minWidth: 160 },
  { field: 'aotsTickets', headerName: 'AOTS Tickets', width: 160 },
  { field: 'transactionId', headerName: 'Transaction ID', width: 200 },
];

interface ResetClaimProps {
  serviceName?: string;
}

const SERVICE_LABELS: Record<string, string> = {
  ADI: 'MIS',
  ADIG: 'GMIS',
  BVOIP_CPUC: 'BVOIP-CPUC',
};

export default function ResetClaim({ serviceName: propService }: ResetClaimProps) {
  const serviceName = (propService === 'ADIG' ? 'ADIG' : propService === 'BVOIP_CPUC' ? 'BVOIP_CPUC' : 'ADI') as 'ADI' | 'ADIG' | 'BVOIP_CPUC';
  const serviceLabel = SERVICE_LABELS[serviceName] || serviceName;

  // Form state
  const [claimId, setClaimId] = useState('');
  const [aotsTickets, setAotsTickets] = useState('');
  const [resetReason, setResetReason] = useState('');
  const [moveToAdi, setMoveToAdi] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<ResetClaimResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({
    open: false, severity: 'success', message: '',
  });

  // Audit state
  const [auditExpanded, setAuditExpanded] = useState(false);
  const [auditRows, setAuditRows] = useState<ResetClaimAudit[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSearchId, setAuditSearchId] = useState('');

  // Validation
  const claimIdError = claimId.length > 0 && !/^[a-zA-Z0-9-]+$/.test(claimId);
  const ticketsError = aotsTickets.length > 0 && !/^[a-zA-Z0-9,\s]*$/.test(aotsTickets);
  const formValid = claimId.trim().length > 0 && !claimIdError && !ticketsError;

  const handleSubmitClick = () => {
    if (!formValid) return;
    setConfirmOpen(true);
  };

  const handleConfirmedReset = useCallback(async () => {
    setConfirmOpen(false);
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await resetClaim({
        claimId: claimId.trim(),
        aotsTickets: aotsTickets.trim() || undefined,
        serviceName,
        resetReason: resetReason.trim() || undefined,
        moveToAdi: moveToAdi && serviceName === 'ADIG',
      });

      setResult(response);
      const success = response.status === 'SUCCESS';
      setSnackbar({
        open: true,
        severity: success ? 'success' : 'error',
        message: success
          ? `Claim ${response.claimId} reset successfully`
          : `Reset failed: ${response.message}`,
      });

      // Auto-refresh audit if expanded
      if (auditExpanded && claimId.trim()) {
        loadAudit(claimId.trim());
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(msg);
      setSnackbar({ open: true, severity: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  }, [claimId, aotsTickets, serviceName, resetReason, moveToAdi, auditExpanded]);

  const handleReset = () => {
    setClaimId('');
    setAotsTickets('');
    setResetReason('');
    if (serviceName === 'ADIG') setMoveToAdi(false);
    setResult(null);
    setError(null);
  };

  const loadAudit = useCallback(async (id: string) => {
    if (!id.trim()) return;
    setAuditLoading(true);
    try {
      const data = await fetchResetClaimAudit(id.trim());
      setAuditRows(data);
    } catch {
      setAuditRows([]);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  const handleAuditSearch = () => {
    const id = auditSearchId.trim() || claimId.trim();
    if (id) loadAudit(id);
  };

  return (
    <Box sx={{ maxWidth: 960 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          px: 3, py: 2, mb: 0.5,
          borderRadius: '14px 14px 0 0',
          background: 'linear-gradient(135deg, #0a79b5 0%, #0d6eab 100%)',
          color: '#fff',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <RestartAlt sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18, lineHeight: 1.3 }}>
              Customer Credit Claim Reset
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, fontSize: 13 }}>
              Reset claims in PEN, REJ, ERR, AER, or END status
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Help banner */}
      <Paper
        elevation={0}
        sx={{
          px: 3, py: 1.5, mb: 2,
          borderRadius: '0 0 14px 14px',
          bgcolor: '#fff3cd',
          border: '1px solid #ffc107',
          borderTop: 'none',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Info sx={{ color: '#856404', fontSize: 18, mt: 0.2 }} />
          <Typography variant="body2" sx={{ color: '#856404', fontSize: 12.5, lineHeight: 1.5 }}>
            Only claims in <strong>PEN, REJ, ERR, AER, END</strong> status can be reset.
            To reset specific tickets within a claim, enter comma-separated AOTS ticket numbers.
            The Claim ID will not change after reset.
          </Typography>
        </Stack>
      </Paper>

      {/* Service Type indicator */}
      {/* <Typography variant="body2" sx={{ mb: 2, color: colorTokens.textSecondary }}>
        Service Type: <strong style={{ color: '#1565c0' }}>{serviceLabel}</strong>
      </Typography> */}

      {/* Form */}
      <Paper
        elevation={0}
        sx={{
          p: 3, mb: 2,
          borderRadius: 3.5,
          border: `1px solid ${colorTokens.borderPanel}`,
          bgcolor: '#fff',
        }}
      >
        <Stack spacing={2.5}>
          {/* Claim ID */}
          <TextField
            label="Credit Claim ID"
            required
            size="small"
            value={claimId}
            onChange={(e) => setClaimId(e.target.value)}
            error={claimIdError}
            helperText={claimIdError ? 'Letters, numbers, and dashes only' : ''}
            sx={{ maxWidth: 320 }}
            slotProps={{
              htmlInput: { maxLength: 50 },
            }}
          />

          {/* AOTS Tickets */}
          <TextField
            label="AOTS Tickets"
            size="small"
            multiline
            minRows={3}
            maxRows={6}
            value={aotsTickets}
            onChange={(e) => setAotsTickets(e.target.value)}
            error={ticketsError}
            helperText={ticketsError ? 'Letters, numbers, commas only' : 'Optional — comma-separated ticket numbers'}
            sx={{ maxWidth: 480 }}
          />

          {/* Reset Reason */}
          {/* <TextField
            label="Reset Reason"
            size="small"
            multiline
            minRows={2}
            maxRows={4}
            value={resetReason}
            onChange={(e) => setResetReason(e.target.value)}
            placeholder="Describe the reason for resetting this claim..."
            sx={{ maxWidth: 480 }}
            slotProps={{
              htmlInput: { maxLength: 500 },
            }}
          /> */}

          {/* Move to ADI toggle (only for ADIG) */}
          {serviceName === 'ADIG' && (
            <FormControlLabel
              control={
                <Switch checked={moveToAdi} onChange={(e) => setMoveToAdi(e.target.checked)} />
              }
              label={
                <Typography variant="body2" sx={{ color: colorTokens.textSecondary }}>
                  Reset and move claim from GMIS to MIS
                </Typography>
              }
            />
          )}

          {/* Action buttons */}
          <Stack direction="row" spacing={1.5} sx={{ pt: 0.5 }}>
            <Button
              variant="contained"
              onClick={handleSubmitClick}
              disabled={!formValid || loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RestartAlt />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                bgcolor: colorTokens.topHeaderBg,
                '&:hover': { bgcolor: '#0968a0' },
              }}
            >
              {loading ? 'Processing...' : 'Submit Reset'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={loading}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                color: colorTokens.textSecondary,
                borderColor: colorTokens.borderSoft,
              }}
            >
              Clear Form
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Result */}
      {result && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5, mb: 2,
            borderRadius: 3.5,
            border: `1px solid ${result.status === 'SUCCESS' ? '#a3e635' : '#fca5a5'}`,
            bgcolor: result.status === 'SUCCESS' ? '#f0fdf4' : '#fef2f2',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            {result.status === 'SUCCESS' ? (
              <CheckCircle sx={{ color: '#16a34a', fontSize: 24 }} />
            ) : (
              <ErrorIcon sx={{ color: '#dc2626', fontSize: 24 }} />
            )}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, fontSize: 15 }}>
                {result.status === 'SUCCESS' ? 'Claim Reset Successful' : 'Claim Reset Failed'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1.5, color: colorTokens.textBody }}>
                {result.message}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mt: 1 }}>
                <InfoPair label="Claim ID" value={result.claimId} />
                <InfoPair label="Service" value={result.serviceName} />
                <InfoPair label="Reset Type" value={result.resetType} />
                <InfoPair label="Time" value={result.timestamp} />
                <InfoPair label="User" value={result.performedBy} />
              </Stack>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Error */}
      {error && !result && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setError(null)}>
          <AlertTitle>Reset Failed</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Audit History */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3.5,
          border: `1px solid ${colorTokens.borderPanel}`,
          bgcolor: '#fff',
          overflow: 'hidden',
        }}
      >
        <Box
          onClick={() => setAuditExpanded(!auditExpanded)}
          sx={{
            px: 3, py: 1.5,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { bgcolor: alpha(colorTokens.primaryMain, 0.04) },
          }}
        >
          <History sx={{ color: colorTokens.textMuted, fontSize: 20, mr: 1 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
            Audit History
          </Typography>
          {auditExpanded ? <ExpandLess /> : <ExpandMore />}
        </Box>

        <Collapse in={auditExpanded}>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                size="small"
                placeholder="Claim ID"
                value={auditSearchId || claimId}
                onChange={(e) => setAuditSearchId(e.target.value)}
                sx={{ width: 240 }}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<Search />}
                onClick={handleAuditSearch}
                disabled={auditLoading}
                sx={{
                  textTransform: 'none',
                  borderColor: colorTokens.borderSoft,
                  color: colorTokens.textSecondary,
                }}
              >
                Search
              </Button>
            </Stack>

            {auditLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : auditRows.length > 0 ? (
              <DataGridPremium
                rows={auditRows}
                columns={auditColumns}
                getRowId={(row) => row.transactionId}
                density="compact"
                autoHeight
                pageSizeOptions={[10, 25]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                disableRowSelectionOnClick
                sx={{
                  border: `1px solid ${colorTokens.borderSoft}`,
                  borderRadius: 2,
                  '& .MuiDataGrid-columnHeaders': {
                    bgcolor: '#f8fafc',
                    borderBottom: `1px solid ${colorTokens.borderSoft}`,
                  },
                  '& .MuiDataGrid-cell': { fontSize: 13 },
                }}
              />
            ) : (
              <Typography variant="body2" sx={{ color: colorTokens.textMuted, py: 3, textAlign: 'center' }}>
                {auditSearchId || claimId ? 'No audit records found' : 'Enter a Claim ID and click Search'}
              </Typography>
            )}
          </Box>
        </Collapse>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
          <Warning sx={{ color: '#f59e0b' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 17 }}>
            Confirm Claim Reset
          </Typography>
          <IconButton
            onClick={() => setConfirmOpen(false)}
            sx={{ ml: 'auto' }}
            size="small"
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            This action will reset the claim to its initial state. This cannot be undone.
          </Alert>

          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Impact Summary
          </Typography>

          <Stack spacing={1} sx={{ mb: 2 }}>
            <InfoPair label="Claim ID" value={claimId} />
            <InfoPair label="Service Type" value={serviceLabel} />
            {aotsTickets.trim() && (
              <InfoPair label="Tickets" value={aotsTickets.trim()} />
            )}
            {resetReason.trim() && (
              <InfoPair label="Reason" value={resetReason.trim()} />
            )}
            {moveToAdi && serviceName === 'ADIG' && (
              <InfoPair label="Move to MIS" value="Yes — claim will be moved from GMIS to MIS after reset" />
            )}
          </Stack>

          <Alert severity="info" variant="outlined" sx={{ borderRadius: 2, fontSize: 13 }}>
            <strong>Valid statuses for reset:</strong> {VALID_RESET_STATUSES.join(', ')}
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{ textTransform: 'none', color: colorTokens.textSecondary }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmedReset}
            startIcon={<RestartAlt />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              bgcolor: '#dc2626',
              '&:hover': { bgcolor: '#b91c1c' },
            }}
          >
            Confirm Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 2, fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: colorTokens.textMuted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 13.5 }}>
        {value}
      </Typography>
    </Box>
  );
}
