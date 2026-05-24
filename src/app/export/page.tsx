'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function triggerDownload(url: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = ''
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export default function ExportPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  function buildUrl(type: 'transactions' | 'trips') {
    const params = new URLSearchParams({ type })
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    return `/api/export?${params.toString()}`
  }

  return (
    <div className="space-y-6 max-w-md">
      <h1 className="text-2xl font-bold">Export CSV</h1>
      <Card>
        <CardHeader><CardTitle>Date Range (optional)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>From</Label><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div><Label>To</Label><Input type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-3">
        <Button onClick={() => triggerDownload(buildUrl('transactions'))}>Download Transactions CSV</Button>
        <Button variant="outline" onClick={() => triggerDownload(buildUrl('trips'))}>Download Trips CSV</Button>
        <Button variant="secondary" onClick={() => {
          triggerDownload(buildUrl('transactions'))
          triggerDownload(buildUrl('trips'))
        }}>Download Both</Button>
      </div>
    </div>
  )
}
