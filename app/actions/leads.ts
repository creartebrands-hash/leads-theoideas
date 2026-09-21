'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface UpdateLeadParams {
  leadId: string
  called?: boolean
  status?: string
  notes?: string
  campaignSlug?: string
}

export async function updateLeadCRMState({
  leadId,
  called,
  status,
  notes,
  campaignSlug,
}: UpdateLeadParams) {
  try {
    const dataToUpdate: Record<string, unknown> = {}

    if (called !== undefined) {
      dataToUpdate.called = called
      if (called) {
        dataToUpdate.lastContactedAt = new Date()
      }
    }

    if (status !== undefined) {
      dataToUpdate.status = status
      if (status !== 'pendiente') {
        dataToUpdate.lastContactedAt = new Date()
      }
    }

    if (notes !== undefined) {
      dataToUpdate.notes = notes
    }

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: dataToUpdate,
    })

    if (campaignSlug) {
      revalidatePath(`/estrategia/${campaignSlug}`)
    }
    revalidatePath('/')

    return { success: true, lead: updated }
  } catch (error: unknown) {
    console.error('Error updating lead CRM state:', error)
    return { success: false, error: (error as Error).message || 'Error al actualizar lead' }
  }
}

export interface ImportCampaignInput {
  slug?: string
  title: string
  subtitle?: string
  location: string
  category: string
  notice?: string
  leads: Array<{
    id?: string
    nombre?: string
    name?: string
    categoria?: string
    category?: string
    zona?: string
    zone?: string
    score?: number
    score_motivo?: string
    scoreReason?: string
    valoracion?: number
    rating?: number
    num_resenas?: number
    reviews?: number
    telefono?: string
    phone?: string
    phone_e164?: string
    phoneE164?: string
    direccion?: string
    address?: string
    website_status?: string
    websiteStatus?: string
    tiene_web?: boolean
    hasWebsite?: boolean
    web?: string
    websiteUrl?: string
    chain?: boolean
    is_chain?: boolean
    isChain?: boolean
    is_top_lead?: boolean
    isTopLead?: boolean
    social_verdict?: string
    socialVerdict?: string
    social_badge?: string
    socialBadge?: string
    social_note?: string
    socialNote?: string
    descripcion?: string
    description?: string
    resumen_resenas?: string
    sentiment?: string
    email_asunto?: string
    emailSubject?: string
    email_cuerpo?: string
    emailBody?: string
    email_advertencia?: string
    emailWarning?: string
    whatsapp_msg?: string
    whatsappMsg?: string
    maps_url?: string
    mapsUrl?: string
    instagram?: string
    instagram_url?: string
    instagramUrl?: string
    facebook_url?: string
    facebookUrl?: string
  }>
}

export async function importCampaignJSON(payload: ImportCampaignInput) {
  try {
    if (!payload.title || !payload.leads || !Array.isArray(payload.leads)) {
      throw new Error('Formato JSON inválido. Debe contener "title" y una lista de "leads".')
    }

    const generatedSlug = payload.slug || payload.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    const campaign = await prisma.campaign.upsert({
      where: { slug: generatedSlug },
      update: {
        title: payload.title,
        subtitle: payload.subtitle || null,
        location: payload.location || 'Varios',
        category: payload.category || 'General',
        notice: payload.notice || null,
      },
      create: {
        slug: generatedSlug,
        title: payload.title,
        subtitle: payload.subtitle || null,
        location: payload.location || 'Varios',
        category: payload.category || 'General',
        notice: payload.notice || null,
      },
    })

    for (const raw of payload.leads) {
      const name = raw.nombre || raw.name || 'Prospecto sin nombre'
      const rawId = raw.id || name.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const leadId = `${generatedSlug}-${rawId}`

      const hasWeb = raw.hasWebsite ?? raw.tiene_web ?? (raw.websiteStatus !== 'none' && raw.website_status !== 'none')

      await prisma.lead.upsert({
        where: { id: leadId },
        update: {
          name,
          category: raw.categoria || raw.category || payload.category,
          zone: raw.zona || raw.zone || payload.location,
          score: raw.score || 0,
          scoreReason: raw.score_motivo || raw.scoreReason || null,
          rating: raw.valoracion ?? raw.rating ?? null,
          reviews: raw.num_resenas ?? raw.reviews ?? 0,
          phone: raw.telefono || raw.phone || null,
          phoneE164: raw.phone_e164 || raw.phoneE164 || null,
          address: raw.direccion || raw.address || null,
          websiteStatus: raw.websiteStatus || raw.website_status || (hasWeb ? 'real' : 'none'),
          hasWebsite: Boolean(hasWeb),
          websiteUrl: raw.web || raw.websiteUrl || null,
          isChain: Boolean(raw.chain ?? raw.is_chain ?? raw.isChain ?? false),
          isTopLead: Boolean(raw.is_top_lead ?? raw.isTopLead ?? false),
          socialVerdict: raw.social_verdict || raw.socialVerdict || null,
          socialBadge: raw.social_badge || raw.socialBadge || null,
          socialNote: raw.social_note || raw.socialNote || null,
          description: raw.descripcion || raw.description || null,
          sentiment: raw.resumen_resenas || raw.sentiment || null,
          emailSubject: raw.email_asunto || raw.emailSubject || null,
          emailBody: raw.email_cuerpo || raw.emailBody || null,
          emailWarning: raw.email_advertencia || raw.emailWarning || null,
          whatsappMsg: raw.whatsapp_msg || raw.whatsappMsg || null,
          mapsUrl: raw.maps_url || raw.mapsUrl || null,
          instagramUrl: raw.instagram || raw.instagram_url || raw.instagramUrl || null,
          facebookUrl: raw.facebook_url || raw.facebookUrl || null,
        },
        create: {
          id: leadId,
          campaignId: campaign.id,
          name,
          category: raw.categoria || raw.category || payload.category,
          zone: raw.zona || raw.zone || payload.location,
          score: raw.score || 0,
          scoreReason: raw.score_motivo || raw.scoreReason || null,
          rating: raw.valoracion ?? raw.rating ?? null,
          reviews: raw.num_resenas ?? raw.reviews ?? 0,
          phone: raw.telefono || raw.phone || null,
          phoneE164: raw.phone_e164 || raw.phoneE164 || null,
          address: raw.direccion || raw.address || null,
          websiteStatus: raw.websiteStatus || raw.website_status || (hasWeb ? 'real' : 'none'),
          hasWebsite: Boolean(hasWeb),
          websiteUrl: raw.web || raw.websiteUrl || null,
          isChain: Boolean(raw.chain ?? raw.is_chain ?? raw.isChain ?? false),
          isTopLead: Boolean(raw.is_top_lead ?? raw.isTopLead ?? false),
          socialVerdict: raw.social_verdict || raw.socialVerdict || null,
          socialBadge: raw.social_badge || raw.socialBadge || null,
          socialNote: raw.social_note || raw.socialNote || null,
          description: raw.descripcion || raw.description || null,
          sentiment: raw.resumen_resenas || raw.sentiment || null,
          emailSubject: raw.email_asunto || raw.emailSubject || null,
          emailBody: raw.email_cuerpo || raw.emailBody || null,
          emailWarning: raw.email_advertencia || raw.emailWarning || null,
          whatsappMsg: raw.whatsapp_msg || raw.whatsappMsg || null,
          mapsUrl: raw.maps_url || raw.mapsUrl || null,
          instagramUrl: raw.instagram || raw.instagram_url || raw.instagramUrl || null,
          facebookUrl: raw.facebook_url || raw.facebookUrl || null,
          called: false,
          status: 'pendiente',
          notes: '',
        },
      })
    }

    revalidatePath('/')
    revalidatePath(`/estrategia/${generatedSlug}`)

    return { success: true, slug: generatedSlug, count: payload.leads.length }
  } catch (err: unknown) {
    console.error('Import campaign error:', err)
    return { success: false, error: (err as Error).message || 'Error importando campaña' }
  }
}
