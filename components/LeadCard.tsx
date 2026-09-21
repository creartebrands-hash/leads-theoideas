'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Phone,
  MapPin,
  Star,
  Globe,
  Copy,
  Check,
  MessageSquare,
  ExternalLink,
  Instagram,
  Facebook,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react'
import { updateLeadCRMState } from '@/app/actions/leads'

export interface LeadProps {
  id: string
  campaignSlug: string
  name: string
  category: string | null
  zone: string | null
  score: number
  scoreReason: string | null
  rating: number | null
  reviews: number
  phone: string | null
  phoneE164: string | null
  address: string | null
  websiteStatus: string | null
  hasWebsite: boolean
  websiteUrl: string | null
  isChain: boolean
  isTopLead: boolean
  socialVerdict: string | null
  socialBadge: string | null
  socialNote: string | null
  description: string | null
  sentiment: string | null
  emailSubject: string | null
  emailBody: string | null
  emailWarning: string | null
  whatsappMsg: string | null
  mapsUrl: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  called: boolean
  status: string
  notes: string
}

export function LeadCard({ lead }: { lead: LeadProps }) {
  const [called, setCalled] = useState(lead.called)
  const [status, setStatus] = useState(lead.status)
  const [notes, setNotes] = useState(lead.notes)
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved')
  const [copiedEmail, setCopiedEmail] = useState(false)
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setCalled(lead.called)
    setStatus(lead.status)
    setNotes(lead.notes)
  }, [lead])

  const handleCalledToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCalled = e.target.checked
    setCalled(newCalled)
    setSaveState('saving')
    const res = await updateLeadCRMState({
      leadId: lead.id,
      called: newCalled,
      campaignSlug: lead.campaignSlug,
    })
    if (res.success) {
      setSaveState('saved')
    } else {
      setSaveState('error')
    }
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    setSaveState('saving')
    const res = await updateLeadCRMState({
      leadId: lead.id,
      status: newStatus,
      campaignSlug: lead.campaignSlug,
    })
    if (res.success) {
      setSaveState('saved')
    } else {
      setSaveState('error')
    }
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value
    setNotes(newNotes)
    setSaveState('saving')

    if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current)

    notesTimeoutRef.current = setTimeout(async () => {
      const res = await updateLeadCRMState({
        leadId: lead.id,
        notes: newNotes,
        campaignSlug: lead.campaignSlug,
      })
      if (res.success) {
        setSaveState('saved')
      } else {
        setSaveState('error')
      }
    }, 600)
  }

  const copyEmail = () => {
    if (!lead.emailSubject && !lead.emailBody) return
    const text = `Asunto: ${lead.emailSubject || ''}\n\n${lead.emailBody || ''}`
    navigator.clipboard.writeText(text).then(() => {
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    })
  }

  // Format WhatsApp link
  const cleanPhone = lead.phoneE164 || lead.phone?.replace(/[^0-9]/g, '')
  const whatsappUrl = cleanPhone && lead.whatsappMsg
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lead.whatsappMsg)}`
    : null

  // Score badge color
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    if (score >= 75) return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    return 'bg-purple-500/15 text-purple-400 border-purple-500/30'
  }

  return (
    <div
      className={`glass-panel p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:border-[var(--purple)] ${
        called ? 'opacity-75 bg-[var(--surface-2)]/60' : ''
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-extrabold text-lg text-[var(--ink)] leading-snug">
                {lead.name}
              </h3>
              {lead.isTopLead && (
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Top Lead
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-medium mt-0.5 flex-wrap">
              {lead.category && <span>{lead.category}</span>}
              {lead.category && lead.zone && <span>•</span>}
              {lead.zone && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.zone}</span>}
            </div>
          </div>

          {/* Score Badge */}
          <div
            className={`px-2.5 py-1 rounded-xl border text-xs font-extrabold flex flex-col items-center justify-center shrink-0 ${getScoreColor(
              lead.score
            )}`}
            title={lead.scoreReason || `Score de prioridad: ${lead.score}/100`}
          >
            <span className="text-base leading-none font-black">{lead.score}</span>
            <span className="text-[9px] uppercase tracking-wider font-semibold">pts</span>
          </div>
        </div>

        {/* Rating, Reviews, Website & Social Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-semibold mt-1">
          {lead.rating !== null && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--yellow)] border border-[var(--border)]">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{lead.rating}</span>
              <span className="text-[var(--muted)] font-normal">({lead.reviews})</span>
            </div>
          )}

          {/* Web status badge */}
          {!lead.hasWebsite ? (
            <span className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
              🚫 Sin web (Gran Oportunidad)
            </span>
          ) : (
            <span className="px-2 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--ink-soft)] border border-[var(--border)] text-[11px]">
              🌐 Con web propia
            </span>
          )}

          {/* Social Badge */}
          {lead.socialBadge && (
            <span className="px-2 py-1 rounded-lg bg-[var(--chip-bg)] text-[var(--ink-soft)] border border-[var(--border)] text-[11px]">
              {lead.socialBadge}
            </span>
          )}
        </div>

        {/* Address and Phone */}
        <div className="flex flex-col gap-1 text-xs text-[var(--ink-soft)] mt-2">
          {lead.phone && (
            <div className="flex items-center gap-2 font-bold text-[var(--ink)]">
              <Phone className="w-3.5 h-3.5 text-[var(--purple)]" />
              <a href={`tel:${lead.phone}`} className="hover:underline">
                {lead.phone}
              </a>
            </div>
          )}
          {lead.address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[var(--muted)] shrink-0 mt-0.5" />
              <span>{lead.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description / Motive */}
      {lead.description && (
        <p className="text-xs text-[var(--ink-soft)] leading-relaxed bg-[var(--surface-2)]/50 p-3 rounded-xl border border-[var(--border)]">
          {lead.description}
        </p>
      )}

      {/* Resumen de reseñas (Sentiment) */}
      {lead.sentiment && (
        <div className="text-xs text-[var(--ink-soft)] leading-relaxed bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)] flex flex-col gap-1">
          <span className="font-bold text-[var(--ink)] flex items-center gap-1 text-[11px] uppercase tracking-wider">
            💬 Resumen de reseñas:
          </span>
          <p className="text-[11.5px] italic">{lead.sentiment}</p>
        </div>
      )}

      {/* Email Draft Box */}
      {lead.emailSubject && (
        <div className="bg-[var(--surface-2)] border border-dashed border-[var(--border)] rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold uppercase text-[var(--purple)] tracking-wider">
              ✉️ Email Redactado
            </span>
            <button
              onClick={copyEmail}
              type="button"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                copiedEmail
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[var(--purple)] text-white hover:bg-[var(--purple-soft)]'
              }`}
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3 h-3" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copiar email
                </>
              )}
            </button>
          </div>
          <div className="text-xs font-bold text-[var(--ink)]">
            Asunto: {lead.emailSubject}
          </div>
          <div className="text-[11.5px] text-[var(--ink-soft)] whitespace-pre-wrap line-clamp-4 hover:line-clamp-none transition-all leading-snug">
            {lead.emailBody}
          </div>
        </div>
      )}

      {/* Action Buttons Bar */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Enviar WhatsApp
          </a>
        )}

        {lead.mapsUrl && (
          <a
            href={lead.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--purple)] text-[var(--ink)] text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[var(--purple)]" /> Ver en Maps
          </a>
        )}

        {lead.instagramUrl && (
          <a
            href={lead.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-all"
          >
            <Instagram className="w-3.5 h-3.5" /> Instagram
          </a>
        )}

        {lead.facebookUrl && (
          <a
            href={lead.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Facebook className="w-3.5 h-3.5" /> Facebook
          </a>
        )}
      </div>

      {/* CRM Control Section */}
      <div className="pt-3 border-t border-[var(--border)] flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Checkbox Called */}
          <label className="flex items-center gap-2 text-xs font-bold text-[var(--ink)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={called}
              onChange={handleCalledToggle}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            />
            <span>{called ? '✅ Ya contactado' : 'Marcar como contactado'}</span>
          </label>

          {/* Status selector */}
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={handleStatusChange}
              className="px-2.5 py-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-bold text-[var(--ink)] focus:outline-none focus:border-[var(--purple)]"
            >
              <option value="pendiente">🟡 Pendiente</option>
              <option value="contactado">🔵 Contactado</option>
              <option value="interesado">🔥 Interesado</option>
              <option value="sin_respuesta">⏳ Sin Respuesta</option>
              <option value="descartado">❌ Descartado</option>
              <option value="cerrado">🎉 Cliente Cerrado</option>
            </select>

            {/* Save state indicator */}
            <span className="text-[10px] text-[var(--muted)] font-medium">
              {saveState === 'saving' && 'Guardando...'}
              {saveState === 'saved' && 'Guardado ✅'}
              {saveState === 'error' && '⚠️ Error'}
            </span>
          </div>
        </div>

        {/* Notes Textarea */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-[var(--muted)]">
            Notas & Observaciones CRM:
          </label>
          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="Escribe detalles de la llamada, presupuesto enviado, seguimiento..."
            rows={2}
            className="w-full rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs p-2.5 text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--purple)] resize-y transition-colors"
          />
        </div>
      </div>
    </div>
  )
}
