'use client'

import React, { useState, useMemo } from 'react'
import { LeadCard, LeadProps } from './LeadCard'
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  Flame,
  Globe,
  BarChart2
} from 'lucide-react'

export interface CampaignData {
  id: string
  slug: string
  title: string
  subtitle: string | null
  location: string
  category: string
  notice: string | null
  leads: Array<Omit<LeadProps, 'campaignSlug'>>
}

export function CampaignView({ campaign }: { campaign: CampaignData }) {
  const [search, setSearch] = useState('')
  const [selectedZone, setSelectedZone] = useState('')
  const [webFilter, setWebFilter] = useState<'all' | 'no' | 'yes'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'score' | 'reviews' | 'rating' | 'name'>('score')
  const [hideCalled, setHideCalled] = useState(false)

  // Extract unique zones
  const zones = useMemo(() => {
    const set = new Set<string>()
    campaign.leads.forEach((l) => {
      if (l.zone) set.add(l.zone)
    })
    return Array.from(set).sort()
  }, [campaign.leads])

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    return campaign.leads
      .filter((lead) => {
        // Text Search
        if (search.trim()) {
          const q = search.toLowerCase()
          const matchName = lead.name.toLowerCase().includes(q)
          const matchAddress = lead.address?.toLowerCase().includes(q) || false
          const matchZone = lead.zone?.toLowerCase().includes(q) || false
          const matchCat = lead.category?.toLowerCase().includes(q) || false
          if (!matchName && !matchAddress && !matchZone && !matchCat) return false
        }

        // Zone filter
        if (selectedZone && lead.zone !== selectedZone) return false

        // Web filter
        if (webFilter === 'no' && lead.hasWebsite) return false
        if (webFilter === 'yes' && !lead.hasWebsite) return false

        // CRM Status filter
        if (statusFilter !== 'all' && lead.status !== statusFilter) return false

        // Hide called filter
        if (hideCalled && lead.called) return false

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'reviews') return (b.reviews || 0) - (a.reviews || 0)
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
        if (sortBy === 'name') return a.name.localeCompare(b.name, 'es')
        return b.score - a.score
      })
  }, [campaign.leads, search, selectedZone, webFilter, statusFilter, hideCalled, sortBy])

  // Compute metrics
  const totalCount = campaign.leads.length
  const calledCount = campaign.leads.filter((l) => l.called).length
  const noWebCount = campaign.leads.filter((l) => !l.hasWebsite).length
  const interestedCount = campaign.leads.filter((l) => l.status === 'interesado').length

  // Export CSV function
  const exportCSV = () => {
    const headers = [
      'Nombre',
      'Categoría',
      'Zona',
      'Teléfono',
      'Tiene Web',
      'Score',
      'Valoración',
      'Reseñas',
      'Contactado',
      'Estado CRM',
      'Notas',
    ]

    const rows = filteredLeads.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${(l.category || '').replace(/"/g, '""')}"`,
      `"${(l.zone || '').replace(/"/g, '""')}"`,
      `"${l.phone || ''}"`,
      l.hasWebsite ? 'Sí' : 'No',
      l.score,
      l.rating || '',
      l.reviews || 0,
      l.called ? 'Sí' : 'No',
      l.status,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `leads_${campaign.slug}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Campaign Hero Banner */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-gradient-to-br from-[var(--purple)]/20 to-[var(--pink)]/20 blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--pink)] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> {campaign.location} · {campaign.category}
          </span>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-[var(--ink)]">
            {campaign.title}
          </h1>
          {campaign.subtitle && (
            <p className="text-sm text-[var(--ink-soft)] max-w-3xl leading-relaxed mt-1">
              {campaign.subtitle}
            </p>
          )}
        </div>

        {/* Campaign Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] p-3.5 rounded-2xl flex flex-col">
            <span className="text-[11px] text-[var(--muted)] font-bold uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> Total Leads
            </span>
            <span className="font-display font-black text-2xl text-[var(--ink)] mt-1">
              {totalCount}
            </span>
          </div>

          <div className="bg-[var(--surface-2)] border border-[var(--border)] p-3.5 rounded-2xl flex flex-col">
            <span className="text-[11px] text-[var(--muted)] font-bold uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-emerald-400" /> Oportunidad Sin Web
            </span>
            <span className="font-display font-black text-2xl text-emerald-400 mt-1">
              {noWebCount} <span className="text-xs font-normal text-[var(--muted)]">({Math.round((noWebCount / totalCount) * 100)}%)</span>
            </span>
          </div>

          <div className="bg-[var(--surface-2)] border border-[var(--border)] p-3.5 rounded-2xl flex flex-col">
            <span className="text-[11px] text-[var(--muted)] font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Ya Contactados
            </span>
            <span className="font-display font-black text-2xl text-blue-400 mt-1">
              {calledCount} <span className="text-xs font-normal text-[var(--muted)]">({Math.round((calledCount / totalCount) * 100)}%)</span>
            </span>
          </div>

          <div className="bg-[var(--surface-2)] border border-[var(--border)] p-3.5 rounded-2xl flex flex-col">
            <span className="text-[11px] text-[var(--muted)] font-bold uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Interesados CRM
            </span>
            <span className="font-display font-black text-2xl text-amber-400 mt-1">
              {interestedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, zona o categoría..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-medium text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--purple)]"
            />
          </div>

          {/* Zone filter */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:border-[var(--purple)]"
          >
            <option value="">Todas las Zonas / Barrios ({zones.length})</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                📍 {z}
              </option>
            ))}
          </select>

          {/* Web filter */}
          <select
            value={webFilter}
            onChange={(e) => setWebFilter(e.target.value as 'all' | 'no' | 'yes')}
            className="px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:border-[var(--purple)]"
          >
            <option value="all">Web: Todas</option>
            <option value="no">🚫 Sin Web (Oportunidad)</option>
            <option value="yes">🌐 Con Web</option>
          </select>

          {/* CRM Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:border-[var(--purple)]"
          >
            <option value="all">Estado CRM: Todos</option>
            <option value="pendiente">🟡 Pendiente</option>
            <option value="contactado">🔵 Contactado</option>
            <option value="interesado">🔥 Interesado</option>
            <option value="sin_respuesta">⏳ Sin Respuesta</option>
            <option value="descartado">❌ Descartado</option>
            <option value="cerrado">🎉 Cliente Cerrado</option>
          </select>
        </div>

        {/* Secondary controls row */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--border)] flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort selector */}
            <div className="flex items-center gap-1 text-xs text-[var(--muted)] font-medium">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'reviews' | 'rating' | 'name')}
                className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs font-bold text-[var(--ink)] focus:outline-none"
              >
                <option value="score">Puntuación Score</option>
                <option value="reviews">Nº Reseñas</option>
                <option value="rating">Valoración Stars</option>
                <option value="name">Nombre A-Z</option>
              </select>
            </div>

            {/* Hide called toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--ink-soft)] cursor-pointer select-none bg-[var(--surface-2)] px-3 py-1 rounded-xl border border-[var(--border)]">
              <input
                type="checkbox"
                checked={hideCalled}
                onChange={(e) => setHideCalled(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-emerald-500"
              />
              <span>Ocultar ya llamados</span>
            </label>
          </div>

          {/* Result counter & CSV export */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[var(--ink-soft)]">
              {filteredLeads.length} de {totalCount} prospectos
            </span>
            <button
              onClick={exportCSV}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--purple)] text-xs font-bold text-[var(--ink)] flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[var(--purple)]" />
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Leads */}
      {filteredLeads.length === 0 ? (
        <div className="glass-panel p-12 text-center text-[var(--muted)] flex flex-col items-center justify-center gap-2">
          <p className="font-display font-bold text-lg text-[var(--ink)]">
            No se encontraron prospectos
          </p>
          <p className="text-xs max-w-md">
            Intenta cambiar o limpiar los filtros de búsqueda, zona o estado CRM para ver más resultados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={{ ...lead, campaignSlug: campaign.slug }} />
          ))}
        </div>
      )}

      {/* Notice footer */}
      {campaign.notice && (
        <footer className="text-xs text-[var(--muted)] leading-relaxed pt-4 border-t border-[var(--border)]">
          ℹ️ {campaign.notice}
        </footer>
      )}
    </div>
  )
}
