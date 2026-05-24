'use client'
import { useState } from 'react'
import { toggleRecurrenceRule, deleteRecurrenceRule, logManualOccurrence } from '@/actions/recurring'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { InferSelectModel } from 'drizzle-orm'
import type { recurrenceRules } from '@/db/schema'

type Rule = InferSelectModel<typeof recurrenceRules>

export function RecurringList({ rules: initialRules }: { rules: Rule[] }) {
  const [rules, setRules] = useState(initialRules)
  const [error, setError] = useState('')
  const now = new Date()

  async function handleToggle(id: string, currentActive: boolean) {
    setError('')
    try {
      await toggleRecurrenceRule(id, !currentActive)
      setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !currentActive } : r))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rule')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this recurring rule?')) return
    setError('')
    const prev = rules
    setRules(rules.filter(r => r.id !== id))
    try {
      await deleteRecurrenceRule(id)
    } catch (err) {
      setRules(prev)
      setError(err instanceof Error ? err.message : 'Failed to delete rule')
    }
  }

  async function handleLog(id: string) {
    setError('')
    try {
      await logManualOccurrence(id)
      setRules(prev => prev.map(r => {
        if (r.id !== id) return r
        const next = new Date(r.nextRunAt)
        switch (r.frequency) {
          case 'daily': next.setUTCDate(next.getUTCDate() + 1); break
          case 'weekly': next.setUTCDate(next.getUTCDate() + 7); break
          case 'monthly': next.setUTCMonth(next.getUTCMonth() + 1); break
          case 'yearly': next.setUTCFullYear(next.getUTCFullYear() + 1); break
        }
        return { ...r, nextRunAt: next }
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log occurrence')
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="border rounded-md divide-y">
        {rules.map(rule => {
          const isDue = !rule.isSubscription && rule.isActive && rule.nextRunAt <= now
          return (
            <div key={rule.id} className="p-3 space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{rule.description}</p>
                  <p className="text-xs text-muted-foreground">
                    ${rule.amount.toFixed(2)} · {rule.frequency} · next: {rule.nextRunAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={rule.isSubscription ? 'default' : 'secondary'}>
                    {rule.isSubscription ? 'Auto' : 'Manual'}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleToggle(rule.id, rule.isActive)}>
                    {rule.isActive ? 'Pause' : 'Resume'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)}>Delete</Button>
                </div>
              </div>
              {isDue && (
                <Button size="sm" onClick={() => handleLog(rule.id)}>
                  Log now ({rule.nextRunAt.toLocaleDateString()})
                </Button>
              )}
            </div>
          )
        })}
        {rules.length === 0 && <p className="p-4 text-sm text-muted-foreground">No recurring rules.</p>}
      </div>
    </div>
  )
}
