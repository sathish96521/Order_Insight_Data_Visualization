import { SvgIconComponent } from '@mui/icons-material';

// ── Menu Types ──
export interface MenuItem {
  id: string;
  title: string;
  type?: 'label';
  icon?: SvgIconComponent;
  subtitle?: string;
  badge?: string;
  children?: MenuItem[];
  reportType?: string;
  serviceName?: string;
  menuType?: string;
}

export interface ApiMenuItem {
  id: string;
  title: string;
  type: 'group' | 'item';
  iconName?: string;
  menuType?: string;
  serviceName?: string;
  children?: ApiMenuItem[];
}

// ── Auth Types ──
export interface AuthUser {
  attuid: string;
  token: string;
  adminAccess?: string;
  isAdmin?: boolean;
  appAccess?: string[];
  firstName?: string;
  lastName?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (attuid: string) => Promise<AuthUser>;
  logout: () => void | Promise<void>;
}

export interface LoginResponse {
  attuid: string;
  token: string;
  adminAccess: string;
  appAccess?: string[];
}

// ── Report Types ──
export interface ReportColumn {
  field: string;
  headerName: string;
  dataType?: string;
  dataLength?: number;
  sortable?: boolean;
  filterable?: boolean;
  columnType?: string;
  displayType?: string;
  displayValue?: string;
}

export interface ReportResponse {
  reportType: string;
  reportName: string;
  serviceName: string;
  isEditable?: string;
  isSearchable?: string;
  isMonthlyData?: string;
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  totalRows: number;
  page?: number;
  size?: number;
}

export interface ReportFilterOptions {
  services: string[];
  months: string[];
  customers: string[];
  siteDeletedIndicators: string[];
}

// ── Report Save Types ──
export interface ReportRowUpdate {
  keyColumns: Record<string, unknown>;
  updatedColumns: Record<string, string>;
}

export interface ReportSaveRequest {
  reportType: string;
  serviceName: string;
  rows: ReportRowUpdate[];
}

export interface ReportSaveResponse {
  status: string;
  updatedRows: number;
}

// ── Reset Claim Types ──
export interface ResetClaimRequest {
  claimId: string;
  aotsTickets?: string;
  serviceName: 'ADI' | 'ADIG' | 'BVOIP_CPUC';
  resetReason?: string;
  moveToAdi?: boolean;
}

export interface ResetClaimResponse {
  claimId: string;
  serviceName: string;
  status: 'SUCCESS' | 'FAILED';
  message: string;
  resetType: string;
  timestamp: string;
  performedBy: string;
}

export interface ResetClaimAudit {
  transactionId: string;
  claimId: string;
  serviceName: string;
  action: string;
  previousState: string;
  newState: string;
  resetReason: string;
  aotsTickets: string;
  performedBy: string;
  timestamp: string;
  status: string;
}

// ── Dashboard Types ──
export interface SummaryCard {
  title: string;
  amount: string;
  metric: string;
  detailLabel: string;
  detailValue: string;
}

export interface IssueRow {
  id: number;
  status: string;
  area: string;
  owner: string;
  priority: string;
  created: string;
}

// ── Breadcrumb Types ──
export interface BreadcrumbItem {
  id: string;
  title: string;
}
