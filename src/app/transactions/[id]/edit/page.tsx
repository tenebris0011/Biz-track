import { getTransaction } from '@/actions/transactions'
import { listCategories } from '@/actions/categories'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { notFound } from 'next/navigation'

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [transaction, cats] = await Promise.all([getTransaction(id), listCategories()])
  if (!transaction) notFound()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Transaction</h1>
      <TransactionForm categories={cats} transaction={transaction} />
    </div>
  )
}
