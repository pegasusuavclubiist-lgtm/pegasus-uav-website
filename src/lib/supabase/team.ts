import { createClient } from './client'
import { TeamCategory, TeamMember } from '@/data/data'

export interface SupabaseTeamMember {
  id: string
  name: string
  role: string
  department: string
  subsystem: string | null
  photo_url: string
  linkedin_url: string | null
  display_order: number
  created_at: string
}

const DEPARTMENT_CONFIG: Record<string, { id: string; categoryCode: string; title: string }> = {
  executive: {
    id: 'executive-board',
    categoryCode: '01',
    title: 'Executive Board',
  },
  technical: {
    id: 'technical-core',
    categoryCode: '02',
    title: 'Technical Core',
  },
  management: {
    id: 'management-core',
    categoryCode: '03',
    title: 'Management Core',
  },
  understudy: {
    id: 'core-members',
    categoryCode: '04',
    title: 'Core Members',
  },
}

export async function fetchTeamMembers(): Promise<SupabaseTeamMember[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching team members from Supabase:', error)
    return []
  }

  return data || []
}

export async function fetchTeamCategories(): Promise<TeamCategory[]> {
  const members = await fetchTeamMembers()
  if (!members || members.length === 0) {
    return []
  }

  // Pre-define ordered categories
  const categoriesOrder = ['executive', 'technical', 'management', 'understudy']
  const grouped: Record<string, TeamMember[]> = {}

  for (const m of members) {
    const dept = (m.department || 'other').toLowerCase()
    if (!grouped[dept]) {
      grouped[dept] = []
    }
    grouped[dept].push({
      name: m.name.trim(),
      role: m.role.trim(),
      imageUrl: m.photo_url,
    })
  }

  const result: TeamCategory[] = []

  for (const deptKey of categoriesOrder) {
    if (grouped[deptKey] && grouped[deptKey].length > 0) {
      const config = DEPARTMENT_CONFIG[deptKey] || {
        id: deptKey,
        categoryCode: String(result.length + 1).padStart(2, '0'),
        title: deptKey.toUpperCase(),
      }
      result.push({
        id: config.id,
        categoryCode: config.categoryCode,
        title: config.title,
        members: grouped[deptKey],
      })
    }
  }

  // Any remaining departments
  for (const [deptKey, deptMembers] of Object.entries(grouped)) {
    if (!categoriesOrder.includes(deptKey) && deptMembers.length > 0) {
      result.push({
        id: deptKey,
        categoryCode: String(result.length + 1).padStart(2, '0'),
        title: deptKey.charAt(0).toUpperCase() + deptKey.slice(1),
        members: deptMembers,
      })
    }
  }

  return result
}
