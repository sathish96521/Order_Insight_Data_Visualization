// Dummy data for Performance Reporting Hub

export interface TabConfig {
  id: string;
  label: string;
  filters: TabFilter[];
  summaryCards: TabSummaryCard[];
  columns: { field: string; headerName: string; width?: number; flex?: number }[];
  rows: Record<string, unknown>[];
}

export interface TabFilter {
  field: string;
  label: string;
  options: string[];
}

export interface TabSummaryCard {
  label: string;
  value: string;
  trend?: string;
  color: string;
}

export const globalFilterOptions = {
  businessUnits: ['Enterprise Solutions', 'Cloud Services', 'Network Operations', 'Security Division', 'Data Analytics'],
  regions: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'],
  categories: ['Infrastructure', 'Application', 'Network', 'Security', 'Compliance'],
  statuses: ['Active', 'Pending', 'Resolved', 'Escalated', 'On Hold'],
  priorities: ['Critical', 'High', 'Medium', 'Low'],
};

export const tabConfigs: TabConfig[] = [
  {
    id: 'executive-summary',
    label: 'Executive Summary',
    filters: [
      { field: 'quarter', label: 'Quarter', options: ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'] },
      { field: 'department', label: 'Department', options: ['Engineering', 'Operations', 'Finance', 'Sales', 'Support'] },
      { field: 'level', label: 'Level', options: ['Executive', 'Director', 'Manager', 'Team Lead'] },
    ],
    summaryCards: [
      { label: 'Overall Score', value: '94.7%', trend: '+2.3%', color: '#10b981' },
      { label: 'Active Projects', value: '142', trend: '+12', color: '#6366f1' },
      { label: 'On-Time Delivery', value: '89.2%', trend: '+1.8%', color: '#f59e0b' },
      { label: 'Budget Utilization', value: '78.5%', trend: '-3.1%', color: '#ef4444' },
    ],
    columns: [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'initiative', headerName: 'Initiative', flex: 1 },
      { field: 'owner', headerName: 'Owner', width: 150 },
      { field: 'progress', headerName: 'Progress', width: 120 },
      { field: 'status', headerName: 'Status', width: 120 },
      { field: 'dueDate', headerName: 'Due Date', width: 130 },
      { field: 'budget', headerName: 'Budget ($K)', width: 130 },
    ],
    rows: [
      { id: 1, initiative: 'Cloud Migration Phase 3', owner: 'Sarah Chen', progress: '87%', status: 'On Track', dueDate: '2026-08-15', budget: '450' },
      { id: 2, initiative: 'Security Framework Upgrade', owner: 'Michael Ross', progress: '62%', status: 'At Risk', dueDate: '2026-07-30', budget: '320' },
      { id: 3, initiative: 'Network Optimization', owner: 'David Park', progress: '95%', status: 'Complete', dueDate: '2026-06-30', budget: '180' },
      { id: 4, initiative: 'Data Platform Modernization', owner: 'Lisa Wang', progress: '45%', status: 'On Track', dueDate: '2026-09-20', budget: '620' },
      { id: 5, initiative: 'Customer Portal Redesign', owner: 'James Miller', progress: '71%', status: 'On Track', dueDate: '2026-08-05', budget: '290' },
      { id: 6, initiative: 'API Gateway Implementation', owner: 'Amy Johnson', progress: '33%', status: 'Delayed', dueDate: '2026-10-01', budget: '410' },
      { id: 7, initiative: 'Compliance Automation', owner: 'Robert Kim', progress: '58%', status: 'On Track', dueDate: '2026-09-15', budget: '275' },
      { id: 8, initiative: 'Edge Computing Rollout', owner: 'Nina Patel', progress: '22%', status: 'Planning', dueDate: '2026-11-30', budget: '550' },
      { id: 9, initiative: 'Observability Platform', owner: 'Tom Richards', progress: '79%', status: 'On Track', dueDate: '2026-08-25', budget: '340' },
      { id: 10, initiative: 'Zero Trust Architecture', owner: 'Karen Lee', progress: '41%', status: 'At Risk', dueDate: '2026-09-10', budget: '480' },
    ],
  },
  {
    id: 'service-metrics',
    label: 'Service Metrics',
    filters: [
      { field: 'serviceType', label: 'Service Type', options: ['Compute', 'Storage', 'Network', 'Database', 'Messaging'] },
      { field: 'tier', label: 'Tier', options: ['Platinum', 'Gold', 'Silver', 'Bronze'] },
      { field: 'environment', label: 'Environment', options: ['Production', 'Staging', 'Development', 'DR'] },
    ],
    summaryCards: [
      { label: 'Uptime SLA', value: '99.97%', trend: '+0.02%', color: '#10b981' },
      { label: 'Avg Response (ms)', value: '142', trend: '-18ms', color: '#6366f1' },
      { label: 'Throughput (req/s)', value: '12,450', trend: '+890', color: '#f59e0b' },
      { label: 'Error Rate', value: '0.03%', trend: '-0.01%', color: '#ef4444' },
    ],
    columns: [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'service', headerName: 'Service', flex: 1 },
      { field: 'availability', headerName: 'Availability', width: 130 },
      { field: 'latency', headerName: 'Latency (ms)', width: 130 },
      { field: 'throughput', headerName: 'Throughput', width: 130 },
      { field: 'errorRate', headerName: 'Error Rate', width: 120 },
      { field: 'lastIncident', headerName: 'Last Incident', width: 150 },
    ],
    rows: [
      { id: 1, service: 'Auth Gateway', availability: '99.99%', latency: '45', throughput: '3,200/s', errorRate: '0.01%', lastIncident: '2026-05-12' },
      { id: 2, service: 'Order Processing', availability: '99.95%', latency: '210', throughput: '1,800/s', errorRate: '0.05%', lastIncident: '2026-06-28' },
      { id: 3, service: 'Payment Engine', availability: '99.99%', latency: '89', throughput: '950/s', errorRate: '0.02%', lastIncident: '2026-04-03' },
      { id: 4, service: 'Notification Hub', availability: '99.92%', latency: '125', throughput: '5,600/s', errorRate: '0.08%', lastIncident: '2026-07-15' },
      { id: 5, service: 'Search Index', availability: '99.97%', latency: '320', throughput: '2,100/s', errorRate: '0.03%', lastIncident: '2026-06-01' },
      { id: 6, service: 'File Storage', availability: '99.98%', latency: '78', throughput: '4,500/s', errorRate: '0.01%', lastIncident: '2026-03-22' },
      { id: 7, service: 'Cache Layer', availability: '99.99%', latency: '12', throughput: '18,000/s', errorRate: '0.00%', lastIncident: '2026-02-10' },
      { id: 8, service: 'Report Generator', availability: '99.88%', latency: '580', throughput: '320/s', errorRate: '0.12%', lastIncident: '2026-07-22' },
      { id: 9, service: 'Data Pipeline', availability: '99.94%', latency: '245', throughput: '890/s', errorRate: '0.04%', lastIncident: '2026-06-18' },
      { id: 10, service: 'Config Service', availability: '99.99%', latency: '28', throughput: '1,200/s', errorRate: '0.00%', lastIncident: '2026-01-05' },
    ],
  },
  {
    id: 'operational-insights',
    label: 'Operational Insights',
    filters: [
      { field: 'impactLevel', label: 'Impact Level', options: ['Critical', 'Major', 'Minor', 'Informational'] },
      { field: 'team', label: 'Team', options: ['Platform', 'Infrastructure', 'Application', 'Security', 'Database'] },
      { field: 'resolution', label: 'Resolution', options: ['Resolved', 'In Progress', 'Pending', 'Escalated'] },
    ],
    summaryCards: [
      { label: 'Open Incidents', value: '23', trend: '-5', color: '#ef4444' },
      { label: 'MTTR (hours)', value: '2.4', trend: '-0.8h', color: '#10b981' },
      { label: 'Change Success', value: '96.8%', trend: '+1.2%', color: '#6366f1' },
      { label: 'Capacity Util.', value: '72.3%', trend: '+4.1%', color: '#f59e0b' },
    ],
    columns: [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'event', headerName: 'Event', flex: 1 },
      { field: 'impact', headerName: 'Impact', width: 120 },
      { field: 'team', headerName: 'Team', width: 140 },
      { field: 'duration', headerName: 'Duration', width: 120 },
      { field: 'rootCause', headerName: 'Root Cause', width: 180 },
      { field: 'status', headerName: 'Status', width: 120 },
    ],
    rows: [
      { id: 1, event: 'Database Failover Triggered', impact: 'Major', team: 'Database', duration: '45 min', rootCause: 'Disk I/O Saturation', status: 'Resolved' },
      { id: 2, event: 'Load Balancer Misconfiguration', impact: 'Critical', team: 'Infrastructure', duration: '2.5 hrs', rootCause: 'Config Drift', status: 'Resolved' },
      { id: 3, event: 'Memory Leak Detection', impact: 'Minor', team: 'Application', duration: '1.2 hrs', rootCause: 'Code Defect', status: 'In Progress' },
      { id: 4, event: 'Certificate Expiry Warning', impact: 'Informational', team: 'Security', duration: 'N/A', rootCause: 'Automation Gap', status: 'Pending' },
      { id: 5, event: 'Network Partition Event', impact: 'Major', team: 'Platform', duration: '35 min', rootCause: 'Switch Failure', status: 'Resolved' },
      { id: 6, event: 'Deployment Rollback', impact: 'Minor', team: 'Application', duration: '20 min', rootCause: 'Regression Bug', status: 'Resolved' },
      { id: 7, event: 'DNS Resolution Delay', impact: 'Minor', team: 'Infrastructure', duration: '15 min', rootCause: 'Provider Issue', status: 'Resolved' },
      { id: 8, event: 'Queue Backlog Spike', impact: 'Major', team: 'Platform', duration: '1.8 hrs', rootCause: 'Consumer Failure', status: 'Escalated' },
      { id: 9, event: 'Storage Threshold Breach', impact: 'Informational', team: 'Infrastructure', duration: 'N/A', rootCause: 'Growth Forecast', status: 'Pending' },
      { id: 10, event: 'Auth Service Degradation', impact: 'Critical', team: 'Security', duration: '55 min', rootCause: 'Token Store Overload', status: 'Resolved' },
    ],
  },
  {
    id: 'compliance-dashboard',
    label: 'Compliance Dashboard',
    filters: [
      { field: 'framework', label: 'Framework', options: ['SOC 2', 'ISO 27001', 'NIST', 'PCI DSS', 'HIPAA'] },
      { field: 'riskLevel', label: 'Risk Level', options: ['Critical', 'High', 'Medium', 'Low', 'Negligible'] },
      { field: 'auditStatus', label: 'Audit Status', options: ['Passed', 'Failed', 'In Review', 'Scheduled'] },
    ],
    summaryCards: [
      { label: 'Compliance Score', value: '91.4%', trend: '+3.2%', color: '#10b981' },
      { label: 'Open Findings', value: '18', trend: '-7', color: '#ef4444' },
      { label: 'Controls Tested', value: '384', trend: '+42', color: '#6366f1' },
      { label: 'Audit Readiness', value: '88.6%', trend: '+5.4%', color: '#f59e0b' },
    ],
    columns: [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'control', headerName: 'Control', flex: 1 },
      { field: 'framework', headerName: 'Framework', width: 130 },
      { field: 'riskLevel', headerName: 'Risk', width: 100 },
      { field: 'status', headerName: 'Status', width: 120 },
      { field: 'lastAudit', headerName: 'Last Audit', width: 130 },
      { field: 'nextReview', headerName: 'Next Review', width: 130 },
    ],
    rows: [
      { id: 1, control: 'Access Management Policy', framework: 'SOC 2', riskLevel: 'Low', status: 'Passed', lastAudit: '2026-06-15', nextReview: '2026-09-15' },
      { id: 2, control: 'Data Encryption at Rest', framework: 'ISO 27001', riskLevel: 'Medium', status: 'Passed', lastAudit: '2026-05-20', nextReview: '2026-08-20' },
      { id: 3, control: 'Incident Response Plan', framework: 'NIST', riskLevel: 'High', status: 'In Review', lastAudit: '2026-04-10', nextReview: '2026-07-10' },
      { id: 4, control: 'Network Segmentation', framework: 'PCI DSS', riskLevel: 'Critical', status: 'Failed', lastAudit: '2026-07-01', nextReview: '2026-08-01' },
      { id: 5, control: 'Backup & Recovery Testing', framework: 'SOC 2', riskLevel: 'Medium', status: 'Passed', lastAudit: '2026-06-28', nextReview: '2026-09-28' },
      { id: 6, control: 'Vulnerability Management', framework: 'NIST', riskLevel: 'High', status: 'In Review', lastAudit: '2026-06-05', nextReview: '2026-09-05' },
      { id: 7, control: 'Change Management Process', framework: 'ISO 27001', riskLevel: 'Low', status: 'Passed', lastAudit: '2026-05-30', nextReview: '2026-08-30' },
      { id: 8, control: 'PHI Data Handling', framework: 'HIPAA', riskLevel: 'Critical', status: 'Passed', lastAudit: '2026-07-10', nextReview: '2026-10-10' },
      { id: 9, control: 'User Activity Logging', framework: 'PCI DSS', riskLevel: 'Medium', status: 'Passed', lastAudit: '2026-06-22', nextReview: '2026-09-22' },
      { id: 10, control: 'Third-Party Risk Assessment', framework: 'SOC 2', riskLevel: 'High', status: 'Scheduled', lastAudit: '2026-03-15', nextReview: '2026-08-15' },
    ],
  },
  {
    id: 'trend-analysis',
    label: 'Trend Analysis',
    filters: [
      { field: 'timeframe', label: 'Timeframe', options: ['Last 30 Days', 'Last 90 Days', 'Last 6 Months', 'Year to Date', 'Custom'] },
      { field: 'metric', label: 'Metric', options: ['Performance', 'Reliability', 'Cost', 'Utilization', 'Incidents'] },
      { field: 'granularity', label: 'Granularity', options: ['Daily', 'Weekly', 'Monthly', 'Quarterly'] },
    ],
    summaryCards: [
      { label: 'Performance Index', value: '8.7/10', trend: '+0.4', color: '#10b981' },
      { label: 'Cost Efficiency', value: '92.1%', trend: '+6.3%', color: '#6366f1' },
      { label: 'Growth Rate', value: '+14.2%', trend: '+2.1%', color: '#f59e0b' },
      { label: 'Forecast Accuracy', value: '87.5%', trend: '+1.9%', color: '#ef4444' },
    ],
    columns: [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'metric', headerName: 'Metric', flex: 1 },
      { field: 'current', headerName: 'Current', width: 120 },
      { field: 'previous', headerName: 'Previous', width: 120 },
      { field: 'change', headerName: 'Change', width: 120 },
      { field: 'trend', headerName: 'Trend', width: 100 },
      { field: 'forecast', headerName: 'Forecast', width: 120 },
    ],
    rows: [
      { id: 1, metric: 'Average Response Time', current: '142ms', previous: '160ms', change: '-11.3%', trend: '↓', forecast: '135ms' },
      { id: 2, metric: 'System Throughput', current: '12.4K/s', previous: '11.1K/s', change: '+11.7%', trend: '↑', forecast: '13.2K/s' },
      { id: 3, metric: 'Error Rate', current: '0.03%', previous: '0.04%', change: '-25.0%', trend: '↓', forecast: '0.02%' },
      { id: 4, metric: 'Infrastructure Cost', current: '$284K', previous: '$310K', change: '-8.4%', trend: '↓', forecast: '$270K' },
      { id: 5, metric: 'User Satisfaction', current: '4.6/5', previous: '4.4/5', change: '+4.5%', trend: '↑', forecast: '4.7/5' },
      { id: 6, metric: 'Deployment Frequency', current: '18/week', previous: '14/week', change: '+28.6%', trend: '↑', forecast: '22/week' },
      { id: 7, metric: 'Lead Time', current: '2.1 days', previous: '3.4 days', change: '-38.2%', trend: '↓', forecast: '1.8 days' },
      { id: 8, metric: 'Recovery Time', current: '24 min', previous: '42 min', change: '-42.9%', trend: '↓', forecast: '18 min' },
      { id: 9, metric: 'Resource Utilization', current: '72.3%', previous: '68.1%', change: '+6.2%', trend: '↑', forecast: '75.0%' },
      { id: 10, metric: 'Automation Coverage', current: '81.5%', previous: '74.2%', change: '+9.8%', trend: '↑', forecast: '86.0%' },
    ],
  },
  {
    id: 'monthly-overview',
    label: 'Monthly Overview',
    filters: [
      { field: 'month', label: 'Month', options: ['January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026', 'July 2026'] },
      { field: 'reportingUnit', label: 'Reporting Unit', options: ['All Units', 'Division A', 'Division B', 'Division C', 'Corporate'] },
      { field: 'format', label: 'View Format', options: ['Summary', 'Detailed', 'Comparative'] },
    ],
    summaryCards: [
      { label: 'Monthly Revenue', value: '$4.2M', trend: '+8.3%', color: '#10b981' },
      { label: 'Active Users', value: '28,450', trend: '+1,200', color: '#6366f1' },
      { label: 'Tickets Resolved', value: '1,847', trend: '+145', color: '#f59e0b' },
      { label: 'SLA Compliance', value: '97.2%', trend: '+0.8%', color: '#ef4444' },
    ],
    columns: [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'category', headerName: 'Category', flex: 1 },
      { field: 'target', headerName: 'Target', width: 120 },
      { field: 'actual', headerName: 'Actual', width: 120 },
      { field: 'variance', headerName: 'Variance', width: 120 },
      { field: 'ytdPerformance', headerName: 'YTD', width: 120 },
      { field: 'notes', headerName: 'Notes', width: 200 },
    ],
    rows: [
      { id: 1, category: 'Service Availability', target: '99.95%', actual: '99.97%', variance: '+0.02%', ytdPerformance: '99.96%', notes: 'Exceeding target' },
      { id: 2, category: 'Customer Satisfaction', target: '4.5/5', actual: '4.6/5', variance: '+0.1', ytdPerformance: '4.55/5', notes: 'Upward trend' },
      { id: 3, category: 'Response Time P95', target: '<200ms', actual: '165ms', variance: '-35ms', ytdPerformance: '178ms', notes: 'Well within SLA' },
      { id: 4, category: 'Incident Resolution', target: '<4 hrs', actual: '2.4 hrs', variance: '-1.6 hrs', ytdPerformance: '3.1 hrs', notes: 'Improved processes' },
      { id: 5, category: 'Change Success Rate', target: '95%', actual: '96.8%', variance: '+1.8%', ytdPerformance: '95.9%', notes: 'Above baseline' },
      { id: 6, category: 'Cost Per Transaction', target: '$0.12', actual: '$0.09', variance: '-$0.03', ytdPerformance: '$0.10', notes: 'Optimization gains' },
      { id: 7, category: 'Deployment Cadence', target: '15/week', actual: '18/week', variance: '+3', ytdPerformance: '16/week', notes: 'CI/CD improvements' },
      { id: 8, category: 'Security Posture', target: '90%', actual: '91.4%', variance: '+1.4%', ytdPerformance: '89.8%', notes: 'New controls added' },
      { id: 9, category: 'Data Accuracy', target: '99.5%', actual: '99.7%', variance: '+0.2%', ytdPerformance: '99.6%', notes: 'Validation rules active' },
      { id: 10, category: 'Team Productivity', target: '85%', actual: '88.2%', variance: '+3.2%', ytdPerformance: '86.5%', notes: 'Automation gains' },
    ],
  },
];
