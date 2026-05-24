'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, ArrowLeftRight, RefreshCw,
  Car, Upload, Download, Settings, LogOut, Menu, X
} from 'lucide-react'

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/recurring', label: 'Recurring', icon: RefreshCw },
  { href: '/trips', label: 'Trips', icon: Car },
  { href: '/import', label: 'Import', icon: Upload },
  { href: '/export', label: 'Export', icon: Download },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  async function handleSignOut() {
    await authClient.signOut()
    router.refresh()
    router.push('/auth/signin')
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-background border-b flex items-center px-4 gap-3">
        <button onClick={() => setOpen(true)} className="p-1 rounded hover:bg-muted">
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold text-lg">Biz Track</span>
      </div>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-background border-r flex flex-col transition-transform duration-200',
        open ? 'translate-x-0' : '-translate-x-full',
        'md:static md:w-56 md:h-screen md:shrink-0 md:translate-x-0 md:z-auto'
      )}>
        <div className="p-4 border-b font-semibold text-lg flex items-center justify-between">
          <span>Biz Track</span>
          <button className="md:hidden p-1 rounded hover:bg-muted" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm w-full hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
