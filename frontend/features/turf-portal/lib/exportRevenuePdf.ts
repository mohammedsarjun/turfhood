import type { TurfRevenueReportDTO } from '@turfhood/shared';
const money = (paise: number) => `INR ${(paise / 100).toFixed(2)}`;
const escapePdf = (value: string) =>
  value
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')
    .replaceAll(/[^\x20-\x7E]/g, '');
export function exportRevenuePdf(report: TurfRevenueReportDTO) {
  const summary = report.selectedRange.summary;
  const lines = [
    `${report.turfName} - Revenue report`,
    `${report.selectedRange.startDate} to ${report.selectedRange.endDate}`,
    '',
    `Bookings: ${summary.bookings}`,
    `Gross revenue: ${money(summary.grossRevenuePaise)}`,
    `Platform commission: ${money(summary.commissionPaise)}`,
    `Net earnings: ${money(summary.netEarningsPaise)}`,
    '',
    'Recent transactions',
    ...report.transactions
      .slice(0, 24)
      .map(
        (item) =>
          `${item.bookingDate}  ${item.reference}  ${item.courtName}  ${money(item.netEarningsPaise)}`,
      ),
  ];
  const stream = lines
    .map(
      (line, index) =>
        `BT /F1 ${index === 0 ? 17 : 10} Tf 50 ${790 - index * 21} Td (${escapePdf(line)}) Tj ET`,
    )
    .join('\n');
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n `)
    .join('\n')}\ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `revenue-${report.selectedRange.startDate}-${report.selectedRange.endDate}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
