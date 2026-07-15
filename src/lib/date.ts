function formatMonth(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** e.g. '2026.03 - 진행 중' or '2025.11 - 2026.03' */
export function formatPeriod(date: string, endDate?: string) {
  const start = formatMonth(date)
  const end = endDate ? formatMonth(endDate) : '진행 중'
  return `${start} - ${end}`
}
