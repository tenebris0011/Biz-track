export function advanceDate(date: Date, frequency: string): Date {
  const next = new Date(date)
  switch (frequency) {
    case 'daily': next.setUTCDate(next.getUTCDate() + 1); break
    case 'weekly': next.setUTCDate(next.getUTCDate() + 7); break
    case 'monthly': next.setUTCMonth(next.getUTCMonth() + 1); break
    case 'yearly': next.setUTCFullYear(next.getUTCFullYear() + 1); break
  }
  return next
}
