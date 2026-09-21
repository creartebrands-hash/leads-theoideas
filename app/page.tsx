import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  Building2,
  HardHat,
  Stethoscope,
  ArrowRight,
  PlusCircle,
  Globe,
  CheckCircle2,
  Flame,
  BarChart3,
  Layers
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      leads: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  // Global KPIs
  let totalLeadsCount = 0
  let totalNoWebCount = 0
  let totalCalledCount = 0
  let totalInterestedCount = 0

  campaigns.forEach((c) => {
    totalLeadsCount += c.leads.length
    totalNoWebCount += c.leads.filter((l) => !l.hasWebsite).length
    totalCalledCount += c.leads.filter((l) => l.called).length
    totalInterestedCount += c.leads.filter((l) => l.status === 'interesado').length
  })

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    const catLower = category.toLowerCase()
    if (catLower.includes('restaurante')) return <Building2 className="w-5 h-5 text-amber-400" />
    if (catLower.includes('contratista')) return <HardHat className="w-5 h-5 text-amber-500" />
    if (catLower.includes('salud')) return <Stethoscope className="w-5 h-5 text-pink-400" />
    return <Layers className="w-5 h-5 text-[var(--purple)]" />
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-16">
      {/* Hero Welcome */}
      <div className="glass-panel p-6 sm:p-10 relative overflow-hidden flex flex-col gap-6">
        <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-gradient-to-br from-[var(--purple)]/20 via-[var(--pink)]/15 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-2 max-w-3xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--pink)] flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" /> Central de Inteligencia CRM · theoideas.com
          </span>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-[var(--ink)] leading-tight">
            Panel de Prospección & Estrategias
          </h1>
          <p className="text-sm sm:text-base text-[var(--ink-soft)] leading-relaxed mt-1">
            Gestiona tus campañas de captación de clientes en tiempo real. Revisa el análisis de cada negocio, marca los prospectos contactados, guarda observaciones y añade nuevas campañas fácilmente.
          </p>
        </div>

        {/* Consolidated KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[var(--purple)]" /> Prospectos Totales
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-black text-3xl sm:text-4xl text-[var(--ink)]">
                {totalLeadsCount}
              </span>
              <span className="text-xs font-medium text-[var(--muted)]">leads</span>
            </div>
          </div>

          <div className="bg-[var(--surface-2)] border border-[var(--border)] p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" /> Sin Página Web
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-black text-3xl sm:text-4xl text-emerald-400">
                {totalNoWebCount}
              </span>
              <span className="text-xs font-semibold text-emerald-400/80">
                ({totalLeadsCount > 0 ? Math.round((totalNoWebCount / totalLeadsCount) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div className="bg-[var(--surface-2)] border border-[var(--border)] p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400" /> Ya Contactados
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-black text-3xl sm:text-4xl text-blue-400">
                {totalCalledCount}
              </span>
              <span className="text-xs font-semibold text-blue-400/80">
                ({totalLeadsCount > 0 ? Math.round((totalCalledCount / totalLeadsCount) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div className="bg-[var(--surface-2)] border border-[var(--border)] p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" /> Leads Interesados
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-black text-3xl sm:text-4xl text-amber-400">
                {totalInterestedCount}
              </span>
              <span className="text-xs font-medium text-[var(--muted)]">oportunidades</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-[var(--ink)]">
              Campañas de Prospección
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Selecciona una campaña para explorar leads y actualizar su estado CRM.
            </p>
          </div>

          <Link
            href="/admin/import"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--purple)] to-[var(--pink)] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:opacity-95 transition-opacity"
          >
            <PlusCircle className="w-4 h-4" /> Importar Nueva Campaña
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => {
            const cTotal = c.leads.length
            const cCalled = c.leads.filter((l) => l.called).length
            const cNoWeb = c.leads.filter((l) => !l.hasWebsite).length
            const cPctCalled = cTotal > 0 ? Math.round((cCalled / cTotal) * 100) : 0

            return (
              <Link
                key={c.id}
                href={`/estrategia/${c.slug}`}
                className="glass-panel p-6 flex flex-col justify-between gap-6 group hover:border-[var(--purple)] hover:shadow-xl transition-all duration-200"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] group-hover:scale-110 transition-transform">
                      {getCategoryIcon(c.category)}
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                      {cNoWeb} sin web
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-extrabold text-xl text-[var(--ink)] group-hover:text-[var(--pink)] transition-colors">
                      {c.title}
                    </h3>
                    <span className="text-xs text-[var(--muted)] font-semibold">
                      📍 {c.location}
                    </span>
                  </div>

                  {c.subtitle && (
                    <p className="text-xs text-[var(--ink-soft)] line-clamp-2 leading-relaxed">
                      {c.subtitle}
                    </p>
                  )}
                </div>

                {/* Campaign Progress Footer */}
                <div className="flex flex-col gap-2 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[var(--muted)]">Progreso de contacto</span>
                    <span className="text-[var(--ink)]">{cCalled} / {cTotal} ({cPctCalled}%)</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--purple)] to-[var(--pink)] transition-all duration-500"
                      style={{ width: `${cPctCalled}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-end text-xs font-extrabold text-[var(--purple)] group-hover:text-[var(--pink)] mt-1">
                    <span>Ver leads de la campaña</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
