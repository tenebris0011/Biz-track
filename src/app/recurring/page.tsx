import { listRecurrenceRules } from '@/actions/recurring'
import { RecurringList } from '@/components/recurring/recurring-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function RecurringPage() {
  const rules = await listRecurrenceRules()
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recurring</h1>
        <Link href="/recurring/new"><Button>Add Rule</Button></Link>
      </div>
      <RecurringList rules={rules} />
    </div>
  )
}
