import { createClient } from './client'

export interface SupabaseMentor {
  id: string
  name: string
  title: string
  photo_url: string
  bio: string
  linkedin_url: string | null
  display_order: number
  created_at: string
}

export async function fetchMentors(): Promise<SupabaseMentor[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mentors')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching mentors from Supabase:', error)
    return []
  }

  return (data || []).map((mentor) => ({
    ...mentor,
    name: mentor.name?.trim(),
    title: mentor.title?.trim(),
    bio: mentor.bio?.trim(),
  }))
}
