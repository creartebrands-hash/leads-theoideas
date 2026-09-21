import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { CampaignView } from '@/components/CampaignView'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { slug: params.slug },
  })

  if (!campaign) {
    return {
      title: 'Campaña no encontrada · theoideas CRM',
    }
  }

  return {
    title: `${campaign.title} · theoideas CRM`,
    description: campaign.subtitle || `Estrategia de prospección de leads para ${campaign.title}`,
  }
}

export default async function CampaignPage({ params }: { params: { slug: string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { slug: params.slug },
    include: {
      leads: {
        orderBy: {
          score: 'desc',
        },
      },
    },
  })

  if (!campaign) {
    notFound()
  }

  return <CampaignView campaign={campaign} />
}
