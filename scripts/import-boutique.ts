/**
 * Script de importación: Boutique Puerto Rico
 * Campaña: joyerías, boutiques, salones, estéticas, reposterías y artesanía
 * Fuente: PR_Leads_Boutique.html
 *
 * Uso:
 *   npx tsx scripts/import-boutique.ts
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// ─── Tipos del HTML de Boutique ─────────────────────────────────────────────
interface BoutiqueLead {
  id: string
  pid?: string
  pais?: string
  nombre?: string
  tipo_negocio?: string
  nicho?: string
  ciudad?: string
  zona?: string
  dir?: string
  tel?: string
  wa?: string
  wa_pub?: boolean
  rating?: number
  rc?: number
  horario?: string
  maps?: string
  web?: string
  wstat?: string   // 'si' | 'no' | 'basica' | 'nc'
  ig?: string
  fb?: string
  otras?: string
  checked?: boolean
  es?: string
  es_txt?: string
  tipo?: string    // 'indep' | 'grupo'
  desc?: string
  clientes?: string
  queja?: string
  fallas?: string[]
  sols?: string[]
  invest?: string[]
  score?: number
  pri?: string     // 'A+' | 'A' | 'B' | 'C' | 'D'
  wa_msg?: string
  subj?: string
  email?: string
  sedes?: number
}

// ─── Extractor de JSON ───────────────────────────────────────────────────────
function extractLeadsFromBoutiqueHtml(filePath: string): BoutiqueLead[] {
  const content = fs.readFileSync(filePath, 'utf-8')

  // El HTML de Boutique usa: <script id="data" type="application/json">{"leads":[...]}
  const dataMatch = content.match(/<script\s+id="data"\s+type="application\/json">([\s\S]*?)<\/script>/)
  if (dataMatch) {
    try {
      const parsed = JSON.parse(dataMatch[1])
      if (parsed.leads && Array.isArray(parsed.leads)) {
        console.log(`  ✅ Formato detectado: <script id="data"> — ${parsed.leads.length} leads`)
        return parsed.leads
      }
    } catch (e) {
      console.error('Error al parsear <script id="data">:', e)
    }
  }

  // Fallback: <script id="payload" type="application/json">
  const payloadMatch = content.match(/<script\s+id="payload"\s+type="application\/json">\s*(\{[\s\S]*?\})\s*<\/script>/)
  if (payloadMatch) {
    try {
      const parsed = JSON.parse(payloadMatch[1])
      if (parsed.leads && Array.isArray(parsed.leads)) {
        console.log(`  ✅ Formato detectado: <script id="payload"> — ${parsed.leads.length} leads`)
        return parsed.leads
      }
    } catch (e) {
      console.error('Error al parsear <script id="payload">:', e)
    }
  }

  console.warn(`  ⚠️  No se encontraron leads en ${filePath}`)
  return []
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function hasWebsite(wstat?: string): boolean {
  return wstat === 'si' || wstat === 'basica'
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Importando campaña: Boutique Puerto Rico…\n')

  const filePath = path.join(process.cwd(), 'PR_Leads_Boutique.html')
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Archivo no encontrado: ${filePath}`)
    process.exit(1)
  }

  const rawLeads = extractLeadsFromBoutiqueHtml(filePath)
  if (rawLeads.length === 0) {
    console.error('❌ No se encontraron leads. Abortando.')
    process.exit(1)
  }

  // ── Crear / actualizar la campaña ──────────────────────────────────────────
  const campaign = await prisma.campaign.upsert({
    where: { slug: 'boutique-puerto-rico' },
    update: {
      title: 'Boutique Puerto Rico',
      subtitle:
        'Joyerías, boutiques, salones, centros de estética, reposterías y tiendas de artesanía de Puerto Rico y las ciudades más hispanas de EE. UU. 600 leads seleccionados de 811 fichas revisadas, con análisis de presencia digital, resumen de reseñas y mensajes de prospección listos para enviar.',
      location: 'Puerto Rico & EE. UU.',
      category: 'Boutique',
      notice:
        'Emprendedoras y pequeños negocios hispanos — joyerías, boutiques, salones y estética, reposterías y artesanía. Datos públicos de Google Maps. Comprobado el 1 de octubre de 2026.',
    },
    create: {
      slug: 'boutique-puerto-rico',
      title: 'Boutique Puerto Rico',
      subtitle:
        'Joyerías, boutiques, salones, centros de estética, reposterías y tiendas de artesanía de Puerto Rico y las ciudades más hispanas de EE. UU. 600 leads seleccionados de 811 fichas revisadas, con análisis de presencia digital, resumen de reseñas y mensajes de prospección listos para enviar.',
      location: 'Puerto Rico & EE. UU.',
      category: 'Boutique',
      notice:
        'Emprendedoras y pequeños negocios hispanos — joyerías, boutiques, salones y estética, reposterías y artesanía. Datos públicos de Google Maps. Comprobado el 1 de octubre de 2026.',
    },
  })

  console.log(`  📋 Campaña "${campaign.title}" lista (id: ${campaign.id})\n`)

  // ── Importar leads ─────────────────────────────────────────────────────────
  let created = 0
  let updated = 0

  for (const raw of rawLeads) {
    const name = raw.nombre || 'Sin Nombre'
    const leadId = `boutique-puerto-rico-${raw.id}`

    const hw = hasWebsite(raw.wstat)

    // Construir descripción enriquecida
    const fallasText = raw.fallas?.length
      ? `Fallas: ${raw.fallas.join(' | ')}`
      : ''
    const solsText = raw.sols?.length
      ? `Soluciones: ${raw.sols.join(' | ')}`
      : ''
    const fullDesc = [raw.desc, fallasText, solsText].filter(Boolean).join('\n')

    const sentimentText = [raw.clientes, raw.queja].filter(Boolean).join(' — ')

    const payload = {
      name,
      category: raw.nicho || raw.tipo_negocio || 'Boutique',
      zone: raw.zona || raw.ciudad || 'Puerto Rico',
      score: raw.score ?? 0,
      scoreReason: raw.pri ?? null,
      rating: raw.rating ?? null,
      reviews: raw.rc ?? 0,
      phone: raw.tel || null,
      phoneE164: null as string | null,
      address: raw.dir || null,
      websiteStatus: raw.wstat || 'nc',
      hasWebsite: hw,
      websiteUrl: raw.web || null,
      isChain: raw.tipo === 'grupo',
      isTopLead: raw.pri === 'A+',
      socialVerdict: raw.es || null,
      socialBadge: raw.pri || null,
      socialNote: raw.es_txt || null,
      description: fullDesc || null,
      sentiment: sentimentText || null,
      emailSubject: raw.subj || null,
      emailBody: raw.email || null,
      emailWarning: null as string | null,
      whatsappMsg: raw.wa_msg || null,
      mapsUrl: raw.maps || null,
      instagramUrl: raw.ig || null,
      facebookUrl: raw.fb || null,
    }

    const existing = await prisma.lead.findUnique({ where: { id: leadId } })

    if (existing) {
      await prisma.lead.update({ where: { id: leadId }, data: payload })
      updated++
    } else {
      await prisma.lead.create({
        data: {
          id: leadId,
          campaignId: campaign.id,
          ...payload,
          called: false,
          status: 'pendiente',
          notes: '',
        },
      })
      created++
    }

    if ((created + updated) % 50 === 0) {
      console.log(`    … procesados ${created + updated} / ${rawLeads.length}`)
    }
  }

  console.log(`\n  🎉 Importación completada:`)
  console.log(`     • Leads creados:       ${created}`)
  console.log(`     • Leads actualizados:  ${updated}`)
  console.log(`     • Total procesados:    ${rawLeads.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
