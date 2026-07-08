import { AdminLeadsClient } from './admin-leads-client'
import { db } from '@/lib/db'

export default async function AdminLeadsPage() {
  const leads = await db.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
  })

  const serialized = leads.map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    programInterest: l.programInterest,
    preferredStart: l.preferredStart,
    message: l.message,
    status: l.status,
    source: l.source,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }))

  return <AdminLeadsClient leads={serialized} />
}
