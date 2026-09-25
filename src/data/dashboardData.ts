import { SummaryCard, IssueRow } from '../types';
import { GridColDef } from '@mui/x-data-grid-premium';

export const summaryCards: SummaryCard[] = [
  { title: 'Today', amount: '25', metric: 'Due Tasks', detailLabel: 'Completed', detailValue: '7' },
  { title: 'Overdue', amount: '4', metric: 'Tasks', detailLabel: "Yesterday's overdue", detailValue: '2' },
  { title: 'Issues', amount: '32', metric: 'Open', detailLabel: 'Closed today', detailValue: '0' },
  { title: 'Features', amount: '42', metric: 'Proposals', detailLabel: 'Implemented', detailValue: '8' },
];

export const issueRows: IssueRow[] = [
  { id: 1, status: 'Open', area: 'Authentication', owner: 'Abbott K.', priority: 'High', created: '2026-04-20' },
  { id: 2, status: 'In Progress', area: 'Billing', owner: 'Jenna M.', priority: 'Medium', created: '2026-04-21' },
  { id: 3, status: 'Resolved', area: 'Notifications', owner: 'David R.', priority: 'Low', created: '2026-04-22' },
  { id: 4, status: 'Open', area: 'User Profile', owner: 'Marie N.', priority: 'Medium', created: '2026-04-24' },
  { id: 5, status: 'Open', area: 'Reports', owner: 'Chris S.', priority: 'High', created: '2026-04-26' },
];

export const issueColumns: GridColDef[] = [
  { field: 'status', headerName: 'Status', flex: 1, minWidth: 120 },
  { field: 'area', headerName: 'Area', flex: 1, minWidth: 140 },
  { field: 'owner', headerName: 'Owner', flex: 1, minWidth: 130 },
  { field: 'priority', headerName: 'Priority', flex: 1, minWidth: 120 },
  { field: 'created', headerName: 'Created', flex: 1, minWidth: 130 },
];
