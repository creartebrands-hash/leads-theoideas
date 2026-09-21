'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { importCampaignJSON, ImportCampaignInput } from '@/app/actions/leads'
import { Upload, FileCode2, Sparkles, Check, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const EXAMPLE_JSON: ImportCampaignInput = {
  title: 'Miami · Clínicas Dentales Hispanas',
  subtitle: 'Campañas de prospección para clínicas dentales independientes en el área de Miami y Hialeah.',
  location: 'Miami, FL',
  category: 'Salud',
  notice: 'Base de datos de clínicas dentales con atención en español en el sur de Florida.',
  leads: [
    {
      id: 'miami-dental-1',
      name: 'Smile Center Miami',
      category: 'Dentista',
      zone: 'Hialeah, FL',
      score: 92,
      score_motivo: 'Excelente calificación 4.9 estrellas con 450 reseñas; no tienen sitio web propio.',
      valoracion: 4.9,
      num_resenas: 450,
      telefono: '(305) 555-0199',
      direccion: '450 W 49th St, Hialeah, FL 33012',
      website_status: 'none',
      tiene_web: false,
      social_verdict: 'sin_redes',
      social_badge: '📵 sin redes',
      descripcion: 'Clínica dental familiar en Hialeah con especialidad en implantes y ortodoncia.',
      resumen_resenas: '4.9/5 con 450 reseñas. Los pacientes destacan la amabilidad del personal y facilidades de pago.',
      email_asunto: 'Página web profesional para Smile Center Miami',
      email_cuerpo: 'Hola, vi que Smile Center Miami tiene 4.9 estrellas con 450 reseñas en Hialeah, pero no encontré sitio web propio...',
      whatsapp_msg: 'Hola, vi su clínica en Google Maps (4.9★, 450 reseñas) y noté que no tienen página web todavía. ¿Les gustaría ver una propuesta?',
      maps_url: 'https://maps.google.com',
    },
  ],
}

export default function ImportCampaignPage() {
  const [jsonString, setJsonString] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        setJsonString(text)
        setError(null)
      } catch (err) {
        setError('Error al leer el archivo JSON')
      }
    }
    reader.readAsText(file)
  }

  const loadExample = () => {
    setJsonString(JSON.stringify(EXAMPLE_JSON, null, 2))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jsonString.trim()) {
      setError('Por favor pega o sube un archivo JSON con los datos de la campaña.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const parsed: ImportCampaignInput = JSON.parse(jsonString)
      const res = await importCampaignJSON(parsed)

      if (res.success && res.slug) {
        router.push(`/estrategia/${res.slug}`)
      } else {
        setError(res.error || 'Error al guardar la campaña.')
        setLoading(false)
      }
    } catch (err: unknown) {
      setError('Formato JSON inválido. Verifica la sintaxis del código JSON.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-16">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
      </Link>

      <div className="glass-panel p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--pink)] flex items-center gap-1.5">
            <FileCode2 className="w-4 h-4" /> Importador de Campañas
          </span>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-[var(--ink)]">
            Añadir Nueva Campaña de Prospectos
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-soft)] leading-relaxed">
            Pega o sube la lista de leads en formato JSON generada por Claude o tu herramienta de extracción. El sistema creará la vista interactiva y registrará los datos en la base de datos automáticamente.
          </p>
        </div>

        {/* Upload & Example buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <label className="px-4 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--purple)] text-xs font-bold text-[var(--ink)] flex items-center gap-2 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-[var(--purple)]" />
            <span>Subir Archivo .json</span>
            <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={loadExample}
            className="px-4 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--pink)] text-xs font-bold text-[var(--pink)] flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Cargar Plantilla de Ejemplo
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* JSON Editor Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--ink)]">
              Código JSON de la Campaña:
            </label>
            <textarea
              value={jsonString}
              onChange={(e) => setJsonString(e.target.value)}
              placeholder={`{\n  "title": "Nombre de la Campaña",\n  "location": "Ciudad / Estado",\n  "category": "Categoría",\n  "leads": [ ... ]\n}`}
              rows={16}
              className="w-full rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-mono p-4 text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--purple)] leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--purple)] to-[var(--pink)] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-95 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span>Procesando e Importando Campaña...</span>
            ) : (
              <>
                <Check className="w-4 h-4" /> Importar y Crear Campaña
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
