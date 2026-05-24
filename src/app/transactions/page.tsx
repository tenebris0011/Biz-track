import { listTransactions } from '@/actions/transactions'
import { TransactionList } from '@/components/transactions/transaction-list'

export default async function TransactionsPage() {
  const rows = await listTransactions()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <TransactionList rows={rows} />
    </div>
  )
}
