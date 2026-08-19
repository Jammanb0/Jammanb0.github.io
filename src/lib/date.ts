function formatMonth(iso: string) {
  const [year, month] = iso.split('-')
  return `${year}.${month}`
}

/** Reads the year without parsing the ISO date as UTC, avoiding timezone shifts. */
export function getYear(iso: string) {
  return Number(iso.slice(0, 4))
}

/** e.g. '2026.03 - 진행 중' or '2025.11 - 2026.03' */
export function formatPeriod(date: string, endDate?: string) {
  const start = formatMonth(date)
  const end = endDate ? formatMonth(endDate) : '진행 중'
  return `${start} - ${end}`
}
