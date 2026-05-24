import { listCategories } from '@/actions/categories'
import { TransactionForm } from '@/components/transactions/transaction-form'

export default async function NewTransactionPage() {
  const cats = await listCategories()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New Transaction</h1>
      <TransactionForm categories={cats} />
    </div>
  )
}
