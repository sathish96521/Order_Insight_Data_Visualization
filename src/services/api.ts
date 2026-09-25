import { LoginResponse, ApiMenuItem, ReportResponse, ReportFilterOptions, ResetClaimRequest, ResetClaimResponse, ResetClaimAudit, ReportSaveRequest, ReportSaveResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '/IsomReportingServices/api';
const SESSION_KEY = 'eisslacr_auth';
const authMode = import.meta.env.VITE_AUTH_MODE || '';
const isLocalTestMode = authMode === 'test';

function getToken(): string | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.message || `Request failed: ${response.status}`) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

// ── Auth ──
export async function loginApi(attuid: string): Promise<LoginResponse> {
  if (isLocalTestMode) {
    const response = await request<{ token: string; user: string }>(`/auth/test-login?username=${encodeURIComponent(attuid)}`, {
      method: 'POST',
    });

    return {
      attuid: response.user,
      token: response.token,
      adminAccess: 'Y',
      appAccess: ['ISOM', 'BVOIP_CPUC'],
    };
  }

  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ attuid }),
  });
}

// ── Menus ──
export function fetchMenuTree(serviceNames: string[] = ['EISSLACR', 'ADI']): Promise<ApiMenuItem[]> {
  const names = Array.isArray(serviceNames) ? serviceNames : [serviceNames];
  const params = names.map((n) => `serviceName=${encodeURIComponent(n)}`).join('&');
  return request<ApiMenuItem[]>(`/menus?${params}`);
}

// ── Reports ──
export function fetchReport(
  reportType: string,
  serviceName: string = 'ADI',
  page: number = 0,
  size: number = 25,
  customerName: string | null = null,
  applianceService: string | null = null,
  reportMonth: string | null = null,
  siteDeletedIndicator: string | null = null,
  columnFilters: string | null = null,
  search: string | null = null
): Promise<ReportResponse> {
  const customerParam = customerName
    ? `&customerName=${encodeURIComponent(customerName)}`
    : '';
  const serviceParam = applianceService
    ? `&applianceService=${encodeURIComponent(applianceService)}`
    : '';
  const monthParam = reportMonth
    ? `&reportMonth=${encodeURIComponent(reportMonth)}`
    : '';
  const siteDeletedParam = siteDeletedIndicator
    ? `&siteDeletedIndicator=${encodeURIComponent(siteDeletedIndicator)}`
    : '';
  const columnFiltersParam = columnFilters
    ? `&columnFilters=${encodeURIComponent(columnFilters)}`
    : '';
  const searchParam = search
    ? `&search=${encodeURIComponent(search)}`
    : '';
  return request<ReportResponse>(
    `/reports/${encodeURIComponent(reportType)}?serviceName=${encodeURIComponent(serviceName)}&page=${page}&size=${size}${customerParam}${serviceParam}${monthParam}${siteDeletedParam}${columnFiltersParam}${searchParam}`,
  );
}

export function fetchReportFilters(reportType: string, serviceName: string = 'ADI'): Promise<ReportFilterOptions> {
  return request<ReportFilterOptions>(
    `/reports/${encodeURIComponent(reportType)}/filters?serviceName=${encodeURIComponent(serviceName)}`,
  );
}

export function fetchCustomerList(reportType: string, serviceName: string = 'ADI'): Promise<string[]> {
  return request<string[]>(
    `/reports/${encodeURIComponent(reportType)}/customers?serviceName=${encodeURIComponent(serviceName)}`,
  );
}

export async function exportReportCsv(
  reportType: string,
  serviceName: string = 'ADI',
  customerName: string | null = null,
  applianceService: string | null = null,
  reportMonth: string | null = null,
  siteDeletedIndicator: string | null = null,
  columnFilters: string | null = null,
  search: string | null = null,
): Promise<void> {
  const token = getToken();

  const params = new URLSearchParams();
  params.set('serviceName', serviceName);
  if (customerName) params.set('customerName', customerName);
  if (applianceService) params.set('applianceService', applianceService);
  if (reportMonth) params.set('reportMonth', reportMonth);
  if (siteDeletedIndicator) params.set('siteDeletedIndicator', siteDeletedIndicator);
  if (columnFilters) params.set('columnFilters', columnFilters);
  if (search) params.set('search', search);
  if (token) params.set('token', token);

  // Use direct browser navigation for native streaming download — avoids
  // buffering the entire response in JS memory via fetch() + blob().
  const url = `${API_BASE}/reports/${encodeURIComponent(reportType)}/export?${params.toString()}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = '';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ── Report Save ──
export function saveReport(payload: ReportSaveRequest): Promise<ReportSaveResponse> {
  return request<ReportSaveResponse>('/reports/save', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// ── Dashboard ──
export function fetchDashboardSummary(): Promise<unknown> {
  return request<unknown>('/dashboard/summary');
}

// ── Reset Claim ──
export function resetClaim(payload: ResetClaimRequest): Promise<ResetClaimResponse> {
  return request<ResetClaimResponse>('/claims/reset', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchResetClaimAudit(claimId: string): Promise<ResetClaimAudit[]> {
  return request<ResetClaimAudit[]>(`/claims/reset/audit?claimId=${encodeURIComponent(claimId)}`);
}
