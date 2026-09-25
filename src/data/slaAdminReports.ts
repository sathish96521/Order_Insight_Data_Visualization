export type SlaAdminReportConfig = {
  id: string;
  title: string;
  subtitle: string;
  file: string;
};

export const slaAdminReports: Record<string, SlaAdminReportConfig> = {
  'sla-order-data-report': {
    id: 'sla-order-data-report',
    title: 'Order Data Report',
    subtitle: 'BVOIP-CPUC SLA Admin — order level detail',
    file: '/data/order-data-report.csv',
  },
  'sla-inventory-data-report': {
    id: 'sla-inventory-data-report',
    title: 'Inventory Data Report',
    subtitle: 'BVOIP-CPUC SLA Admin — installed inventory detail',
    file: '/data/inventory-data-report.csv',
  },
  'sla-customer-profile-report': {
    id: 'sla-customer-profile-report',
    title: 'Customer Profile Report',
    subtitle: 'BVOIP-CPUC SLA Admin — customer profile and SLA eligibility',
    file: '/data/customer-profile-report.csv',
  },
};

/** RFC4180-ish CSV parser: handles quoted fields, escaped quotes and CRLF. */
export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const headers = rows.shift() ?? [];
  return { headers, rows: rows.filter((r) => r.some((c) => c.trim() !== '')) };
}
