'use client'
import { useRouter } from 'next/navigation'

export function YearSelector({ currentYear }: { currentYear: number }) {
  const router = useRouter()
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]

  return (
    <select
      value={currentYear}
      onChange={e => router.push(`/?year=${e.target.value}`)}
      className="border rounded px-2 py-1 text-sm"
    >
      {years.map(y => <option key={y} value={y}>{y}</option>)}
    </select>
  )
}
