'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  FileText,
  AlertTriangle,
  ClipboardCheck,
  BarChart3,
  Settings,
  Bot,
  Shield,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Vendors', href: '/vendors', icon: Building2 },
  { name: 'Assessments', href: '/assessments', icon: ClipboardCheck },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Findings', href: '/findings', icon: AlertTriangle },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'AI Agents', href: '/agents', icon: Bot },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-800">
        <Shield className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-lg font-bold text-white">AI TPRM</h1>
          <p className="text-xs text-gray-400">Sleep Number</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Agent Status */}
      <div className="border-t border-gray-800 p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          AI Agents
        </h3>
        <div className="space-y-2">
          {['VERA', 'CARA', 'DORA', 'SARA', 'RITA', 'MARS'].map((agent) => (
            <div key={agent} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-400">{agent}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
