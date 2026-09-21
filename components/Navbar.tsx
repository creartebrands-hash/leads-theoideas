'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sun, Moon, LayoutDashboard, PlusCircle, Building2, HardHat, Stethoscope } from 'lucide-react'

export function Navbar() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const pathname = usePathname()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theo_theme') as 'dark' | 'light' | null
    if (savedTheme) {
      setTheme(savedTheme)
      if (savedTheme === 'light') {
        document.documentElement.classList.add('light')
      } else {
        document.documentElement.classList.remove('light')
      }
    } else {
      document.documentElement.classList.remove('light')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theo_theme', newTheme)
    if (newTheme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--surface)]/85 border-b border-[var(--border)] px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--purple)] to-[var(--pink)] flex items-center justify-center text-white font-extrabold text-base shadow-md group-hover:scale-105 transition-transform">
            TI
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-lg text-[var(--ink)] leading-none">
              theoideas <span className="text-[var(--pink)] text-xs uppercase tracking-wider ml-1 px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)]">CRM</span>
            </span>
            <span className="text-[11px] text-[var(--muted)] font-medium">Inteligencia de Leads & Campañas</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)]">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              pathname === '/'
                ? 'bg-[var(--purple)] text-white shadow-sm'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--surface)]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard Hub
          </Link>
          <Link
            href="/estrategia/restaurantes-fresno"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              pathname.includes('restaurantes-fresno')
                ? 'bg-[var(--purple)] text-white shadow-sm'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--surface)]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Restaurantes Fresno
          </Link>
          <Link
            href="/estrategia/contratistas-la"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              pathname.includes('contratistas-la')
                ? 'bg-[var(--purple)] text-white shadow-sm'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--surface)]'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" />
            Contratistas LA
          </Link>
          <Link
            href="/estrategia/salud-la"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              pathname.includes('salud-la')
                ? 'bg-[var(--purple)] text-white shadow-sm'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--surface)]'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Salud LA
          </Link>
        </nav>

        {/* Right action controls */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/import"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[var(--purple)] to-[var(--purple-soft)] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-opacity"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Nueva Campaña
          </Link>

          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--ink)] hover:border-[var(--purple)] transition-colors"
            title="Cambiar tema (Claro/Oscuro)"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[var(--yellow)]" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--purple)]" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
