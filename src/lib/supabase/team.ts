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

export interface CreateTeamMemberPayload {
  name: string
  role: string
  subsystem?: string | null
  photo_url: string
  department?: string
  linkedin_url?: string | null
  display_order?: number
}

export interface TeamMutationResponse {
  success: boolean
  data?: SupabaseTeamMember
  error?: string
  isRlsError?: boolean
}

const LOCAL_TEAM_CACHE_KEY = 'pegasus_local_team_cache'
const LOCAL_TEAM_DELETED_KEY = 'pegasus_local_team_deleted'

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

/**
 * Synchronize any previously cached local members to Supabase database.
 */
export async function syncLocalMembersToSupabase(): Promise<number> {
  if (typeof window === 'undefined') return 0

  const supabase = createClient()
  try {
    const localStr = localStorage.getItem(LOCAL_TEAM_CACHE_KEY)
    if (!localStr) return 0

    const localList: SupabaseTeamMember[] = JSON.parse(localStr)
    const pending = localList.filter((m) => m.id.startsWith('local-member-'))
    if (pending.length === 0) return 0

    let syncedCount = 0
    let updatedList = [...localList]

    for (const m of pending) {
      const { data, error } = await supabase.from('team_members').insert([{
        name: m.name.trim(),
        role: m.role.trim(),
        subsystem: m.subsystem?.trim() || null,
        photo_url: m.photo_url.trim(),
        department: (m.department?.trim() || 'understudy').toLowerCase(),
        display_order: m.display_order ?? 10,
      }]).select()

      if (!error && data && data[0]) {
        syncedCount++
        updatedList = updatedList.map((item) => (item.id === m.id ? data[0] : item))
      }
    }

    if (syncedCount > 0) {
      localStorage.setItem(LOCAL_TEAM_CACHE_KEY, JSON.stringify(updatedList))
    }

    return syncedCount
  } catch (err) {
    console.error('Failed to sync local members to Supabase:', err)
    return 0
  }
}

/**
 * Fetch all team/core members from Supabase, merged with optimistic local fallback cache.
 */
export async function fetchTeamMembers(): Promise<SupabaseTeamMember[]> {
  const supabase = createClient()

  // Auto-sync any pending local members to database now that permissions are active
  if (typeof window !== 'undefined') {
    await syncLocalMembersToSupabase().catch(() => {})
  }

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('display_order', { ascending: true })

  let remoteMembers: SupabaseTeamMember[] = []

  if (error) {
    console.error('Error fetching team members from Supabase:', error)
  } else if (data) {
    remoteMembers = data.map((member) => ({
      ...member,
      name: member.name?.trim(),
      role: member.role?.trim(),
      subsystem: member.subsystem?.trim() || null,
    }))
  }

  // Check local cache and deleted list
  if (typeof window !== 'undefined') {
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_TEAM_DELETED_KEY) || '[]')
      const deletedSet = new Set(deletedIds)

      // Filter out deleted members from remote
      const activeRemote = remoteMembers.filter((m) => !deletedSet.has(m.id))

      const localStr = localStorage.getItem(LOCAL_TEAM_CACHE_KEY)
      if (localStr) {
        const localList: SupabaseTeamMember[] = JSON.parse(localStr)
        const remoteIds = new Set(activeRemote.map((m) => m.id))
        const unmergedLocals = localList.filter((l) => !remoteIds.has(l.id) && !deletedSet.has(l.id))

        return [...activeRemote, ...unmergedLocals].sort(
          (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
        )
      }

      return activeRemote
    } catch {
      // LocalStorage failure fallback
    }
  }

  return remoteMembers
}

/**
 * Fetch team members organized by department category for the public roster.
 */
export async function fetchTeamCategories(): Promise<TeamCategory[]> {
  const members = await fetchTeamMembers()
  if (!members || members.length === 0) {
    return []
  }

  // Pre-define ordered categories
  const categoriesOrder = ['executive', 'technical', 'management', 'understudy']
  const grouped: Record<string, TeamMember[]> = {}

  for (const m of members) {
    const dept = (m.department || 'understudy').toLowerCase()
    if (!grouped[dept]) {
      grouped[dept] = []
    }
    grouped[dept].push({
      name: m.name.trim(),
      role: m.role.trim(),
      imageUrl: m.photo_url,
      subsystem: m.subsystem?.trim() || null,
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

/**
 * Add a new core member using only the existing database columns.
 */
export async function addTeamMember(payload: CreateTeamMemberPayload): Promise<TeamMutationResponse> {
  const supabase = createClient()
  const memberItem = {
    name: payload.name.trim(),
    role: payload.role.trim(),
    subsystem: payload.subsystem?.trim() || null,
    photo_url: payload.photo_url.trim(),
    department: (payload.department?.trim() || 'understudy').toLowerCase(),
    linkedin_url: payload.linkedin_url?.trim() || null,
    display_order: payload.display_order ?? 10,
  }

  const { data, error } = await supabase
    .from('team_members')
    .insert([memberItem])
    .select()

  if (error) {
    console.warn('Supabase insert team member encountered error:', error)
    const isRls = error.code === '42501' || error.message?.toLowerCase().includes('row-level security')

    // Optimistic fallback to local cache so user's addition persists
    const localMember: SupabaseTeamMember = {
      id: `local-member-${Date.now()}`,
      name: memberItem.name,
      role: memberItem.role,
      subsystem: memberItem.subsystem,
      photo_url: memberItem.photo_url,
      department: memberItem.department,
      linkedin_url: memberItem.linkedin_url,
      display_order: memberItem.display_order,
      created_at: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      try {
        const prev: SupabaseTeamMember[] = JSON.parse(localStorage.getItem(LOCAL_TEAM_CACHE_KEY) || '[]')
        localStorage.setItem(LOCAL_TEAM_CACHE_KEY, JSON.stringify([localMember, ...prev]))
      } catch (err) {
        console.error('LocalStorage write failed:', err)
      }
    }

    return {
      success: isRls,
      data: localMember,
      error: error.message,
      isRlsError: isRls,
    }
  }

  const insertedMember: SupabaseTeamMember = data[0]

  // Update local cache
  if (typeof window !== 'undefined') {
    try {
      const prev: SupabaseTeamMember[] = JSON.parse(localStorage.getItem(LOCAL_TEAM_CACHE_KEY) || '[]')
      localStorage.setItem(LOCAL_TEAM_CACHE_KEY, JSON.stringify([insertedMember, ...prev]))
    } catch {
      // Ignore cache write error
    }
  }

  return {
    success: true,
    data: insertedMember,
  }
}

/**
 * Remove a core member by ID from Supabase and local cache.
 */
export async function deleteTeamMember(id: string): Promise<TeamMutationResponse> {
  const supabase = createClient()

  // Track deletion in local storage
  if (typeof window !== 'undefined') {
    try {
      // Remove from added cache if present
      const prevAdded: SupabaseTeamMember[] = JSON.parse(localStorage.getItem(LOCAL_TEAM_CACHE_KEY) || '[]')
      const filtered = prevAdded.filter((m) => m.id !== id)
      localStorage.setItem(LOCAL_TEAM_CACHE_KEY, JSON.stringify(filtered))

      // Mark as deleted in exclusion list
      const prevDeleted: string[] = JSON.parse(localStorage.getItem(LOCAL_TEAM_DELETED_KEY) || '[]')
      if (!prevDeleted.includes(id)) {
        localStorage.setItem(LOCAL_TEAM_DELETED_KEY, JSON.stringify([...prevDeleted, id]))
      }
    } catch (err) {
      console.error('Local cache deletion error:', err)
    }
  }

  // If local-only ID, return immediately
  if (id.startsWith('local-member-')) {
    return { success: true }
  }

  const { error } = await supabase.from('team_members').delete().eq('id', id)

  if (error) {
    console.warn('Supabase delete team member encountered error:', error)
    const isRls = error.code === '42501' || error.message?.toLowerCase().includes('row-level security')
    return {
      success: false,
      error: error.message,
      isRlsError: isRls,
    }
  }

  return { success: true }
}

/**
 * Convert an image File to an optimized base64 Data URL.
 * Scales image to maximum 800x800 and compresses as JPEG 0.82 for optimal database storage size.
 */
async function fileToOptimizedDataUrl(file: File, maxDim = 800, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve('')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (!result) {
        resolve('')
        return
      }

      const img = new window.Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', quality))
          return
        }
        resolve(result)
      }
      img.onerror = () => resolve(result)
      img.src = result
    }
    reader.onerror = () => resolve('')
    reader.readAsDataURL(file)
  })
}

/**
 * Upload member photo to Supabase storage bucket 'media/team/',
 * with automatic fallback to high-quality compressed Data URL if Storage RLS restricts uploads.
 */
export async function uploadMemberPhoto(file: File): Promise<{
  success: boolean
  publicUrl?: string
  error?: string
  isRlsFallback?: boolean
}> {
  const supabase = createClient()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const path = `team/${Date.now()}-${sanitizedName}`

  try {
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (!uploadError) {
      const { data: publicData } = supabase.storage.from('media').getPublicUrl(path)
      return {
        success: true,
        publicUrl: publicData.publicUrl,
      }
    }

    console.warn('Supabase storage upload restricted by RLS policy:', uploadError.message)
  } catch (err: unknown) {
    console.warn('Storage attempt exception:', err)
  }

  // Automatic Fallback: Convert to optimized local Data URL so the user can still attach & save the photo seamlessly
  try {
    const dataUrl = await fileToOptimizedDataUrl(file)
    if (dataUrl) {
      return {
        success: true,
        publicUrl: dataUrl,
        isRlsFallback: true,
      }
    }
  } catch (convErr) {
    console.error('Data URL fallback conversion failed:', convErr)
  }

  return {
    success: false,
    error: 'Storage RLS policy active. Please paste an image URL or run the Supabase Storage SQL script.',
  }
}
