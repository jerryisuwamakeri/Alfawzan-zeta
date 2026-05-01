'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      className="btn btn-ghost btn-sm"
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark'
        ? <Sun className="h-4 w-4" style={{ color: 'var(--text-2)' }} />
        : <Moon className="h-4 w-4" style={{ color: 'var(--text-2)' }} />
      }
    </button>
  )
}
