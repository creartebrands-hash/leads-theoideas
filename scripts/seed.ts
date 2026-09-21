import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface RawLead {
  id: string
  nombre?: string
  name?: string
  categoria?: string
  category?: string
  zona?: string
  zone?: string
  score?: number
  score_motivo?: string
  valoracion?: number
  rating?: number
  num_resenas?: number
  reviews?: number
  telefono?: string
  phone?: string
  phone_e164?: string
  direccion?: string
  address?: string
  website_status?: string
  tiene_web?: boolean
  web?: string
  chain?: boolean
  is_chain?: boolean
  is_top_lead?: boolean
  social_verdict?: string
  social_badge?: string
  social_note?: string
  descripcion?: string
  description?: string
  resumen_resenas?: string
  sentiment?: string
  email_asunto?: string
  email_subject?: string
  email_cuerpo?: string
  email_body?: string
  email_advertencia?: string
  whatsapp_msg?: string
  maps_url?: string
  instagram?: string
  instagram_url?: string
  facebook_url?: string
}

function extractLeadsFromHtml(filePath: string): RawLead[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  
  // Try <script id="payload" type="application/json">
  const payloadMatch = content.match(/<script\s+id="payload"\s+type="application\/json">\s*(\{[\s\S]*?\})\s*<\/script>/)
  if (payloadMatch) {
    try {
      const parsed = JSON.parse(payloadMatch[1])
      if (parsed.leads && Array.isArray(parsed.leads)) {
        return parsed.leads
      }
    } catch (e) {
      console.error(`Error parsing JSON payload in ${filePath}:`, e)
    }
  }

  // Try const LEADS = [ ... ];
  const constMatch = content.match(/const\s+LEADS\s*=\s*(\[[\s\S]*?\])\s*;/);
  if (constMatch) {
    try {
      const parsed = JSON.parse(constMatch[1])
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch (e) {
      console.error(`Error parsing const LEADS in ${filePath}:`, e)
    }
  }

  // Try var LEADS = [ ... ];
  const varMatch = content.match(/var\s+LEADS\s*=\s*(\[[\s\S]*?\])\s*;/);
  if (varMatch) {
    try {
      const parsed = JSON.parse(varMatch[1])
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch (e) {
      console.error(`Error parsing var LEADS in ${filePath}:`, e)
    }
  }

  console.warn(`Could not extract leads from ${filePath}`)
  return []
}

async function main() {
  console.log('🌱 Seed script started...')

  const rootDir = process.cwd()

  const campaignsData = [
    {
      slug: 'restaurantes-fresno',
      title: 'Fresno · Restaurantes',
      subtitle: 'Rastreo por 11 zonas de Fresno — no solo el centro — para encontrar restaurantes con boca a boca real y sin presencia web. Cada ficha trae el resumen para la llamada y el email de Diseño Web ya redactado.',
      location: 'Fresno, CA',
      category: 'Restaurantes',
      notice: 'Datos públicos de negocios, recopilados por barrio en Fresno, CA. Las notas y estado CRM se guardan permanentemente en el servidor.',
      file: 'CA_Leads_Restaurantes.html'
    },
    {
      slug: 'contratistas-la',
      title: 'Los Ángeles · Contratistas Hispanos',
      subtitle: 'Inteligencia de prospección para contratistas hispanos en Los Ángeles (plomeros, remodelación, concreto). Fichas con análisis de redes sociales, resumen de reseñas y plantilla de WhatsApp / Email.',
      location: 'Los Ángeles, CA',
      category: 'Contratistas',
      notice: 'Prospección de plomeros, contratistas de concreto y remodeladores en el área metropolitana de Los Ángeles.',
      file: 'LA_Leads_Contratistas_Hispanos.html'
    },
    {
      slug: 'salud-la',
      title: 'Los Ángeles · Salud Hispanohablantes',
      subtitle: 'Prospectos del sector salud (dentistas, podólogos, nutriólogos, etc.) que atienden a la comunidad hispanohablante en Los Ángeles.',
      location: 'Los Ángeles, CA',
      category: 'Salud',
      notice: 'Base de datos de clínicas y consultorios independientes de salud en Los Ángeles.',
      file: 'LA_Leads_Salud_Hispanohablantes.html'
    }
  ]

  for (const cData of campaignsData) {
    const filePath = path.join(rootDir, cData.file)
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`)
      continue
    }

    const rawLeads = extractLeadsFromHtml(filePath)
    console.log(`Found ${rawLeads.length} leads in ${cData.file}`)

    // Create or update campaign
    const campaign = await prisma.campaign.upsert({
      where: { slug: cData.slug },
      update: {
        title: cData.title,
        subtitle: cData.subtitle,
        location: cData.location,
        category: cData.category,
        notice: cData.notice,
      },
      create: {
        slug: cData.slug,
        title: cData.title,
        subtitle: cData.subtitle,
        location: cData.location,
        category: cData.category,
        notice: cData.notice,
      },
    })

    // Upsert leads
    for (const raw of rawLeads) {
      const name = raw.nombre || raw.name || 'Sin Nombre'
      const leadId = raw.id ? `${cData.slug}-${raw.id}` : `${cData.slug}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`

      const hasWeb = raw.tiene_web !== undefined ? raw.tiene_web : (raw.website_status !== 'none' && raw.website_status !== null)

      await prisma.lead.upsert({
        where: { id: leadId },
        update: {
          name,
          category: raw.categoria || raw.category || cData.category,
          zone: raw.zona || raw.zone || cData.location,
          score: raw.score || 0,
          scoreReason: raw.score_motivo || null,
          rating: raw.valoracion ?? raw.rating ?? null,
          reviews: raw.num_resenas ?? raw.reviews ?? 0,
          phone: raw.telefono || raw.phone || null,
          phoneE164: raw.phone_e164 || null,
          address: raw.direccion || raw.address || null,
          websiteStatus: raw.website_status || (hasWeb ? 'real' : 'none'),
          hasWebsite: Boolean(hasWeb),
          websiteUrl: raw.web || null,
          isChain: Boolean(raw.chain ?? raw.is_chain ?? false),
          isTopLead: Boolean(raw.is_top_lead ?? false),
          socialVerdict: raw.social_verdict || null,
          socialBadge: raw.social_badge || null,
          socialNote: raw.social_note || null,
          description: raw.descripcion || raw.description || null,
          sentiment: raw.resumen_resenas || raw.sentiment || null,
          emailSubject: raw.email_asunto || raw.email_subject || null,
          emailBody: raw.email_cuerpo || raw.email_body || null,
          emailWarning: raw.email_advertencia || null,
          whatsappMsg: raw.whatsapp_msg || null,
          mapsUrl: raw.maps_url || null,
          instagramUrl: raw.instagram || raw.instagram_url || null,
          facebookUrl: raw.facebook_url || null,
        },
        create: {
          id: leadId,
          campaignId: campaign.id,
          name,
          category: raw.categoria || raw.category || cData.category,
          zone: raw.zona || raw.zone || cData.location,
          score: raw.score || 0,
          scoreReason: raw.score_motivo || null,
          rating: raw.valoracion ?? raw.rating ?? null,
          reviews: raw.num_resenas ?? raw.reviews ?? 0,
          phone: raw.telefono || raw.phone || null,
          phoneE164: raw.phone_e164 || null,
          address: raw.direccion || raw.address || null,
          websiteStatus: raw.website_status || (hasWeb ? 'real' : 'none'),
          hasWebsite: Boolean(hasWeb),
          websiteUrl: raw.web || null,
          isChain: Boolean(raw.chain ?? raw.is_chain ?? false),
          isTopLead: Boolean(raw.is_top_lead ?? false),
          socialVerdict: raw.social_verdict || null,
          socialBadge: raw.social_badge || null,
          socialNote: raw.social_note || null,
          description: raw.descripcion || raw.description || null,
          sentiment: raw.resumen_resenas || raw.sentiment || null,
          emailSubject: raw.email_asunto || raw.email_subject || null,
          emailBody: raw.email_cuerpo || raw.email_body || null,
          emailWarning: raw.email_advertencia || null,
          whatsappMsg: raw.whatsapp_msg || null,
          mapsUrl: raw.maps_url || null,
          instagramUrl: raw.instagram || raw.instagram_url || null,
          facebookUrl: raw.facebook_url || null,
          called: false,
          status: 'pendiente',
          notes: '',
        },
      })
    }
  }

  console.log('✅ Database seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
