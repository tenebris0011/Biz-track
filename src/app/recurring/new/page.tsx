import { listCategories } from '@/actions/categories'
import { RecurringForm } from '@/components/recurring/recurring-form'

export default async function NewRecurringPage() {
  const cats = await listCategories()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New Recurring Rule</h1>
      <RecurringForm categories={cats} />
    </div>
  )
}
