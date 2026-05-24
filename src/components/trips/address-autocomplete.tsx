'use client'
import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import type { AddressSuggestion } from '@/lib/mileage'

export function AddressAutocomplete({
  value, onChange, onSelect, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  onSelect: (s: AddressSuggestion) => void
  placeholder?: string
}) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (value.length < 3) { setSuggestions([]); return }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`)
        if (res.ok) setSuggestions(await res.json())
      } catch { /* silently degrade */ }
    }, 500)
    return () => clearTimeout(timer.current)
  }, [value])

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder={placeholder}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-popover text-popover-foreground border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
              onPointerDown={e => {
                e.preventDefault()
                onSelect(s)
                setOpen(false)
                setSuggestions([])
              }}
            >
              {s.displayName}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
