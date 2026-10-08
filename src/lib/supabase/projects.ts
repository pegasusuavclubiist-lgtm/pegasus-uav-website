import { createClient } from './client'
import { ProjectWeeklyDetail, siteData } from '@/data/data'

export interface SupabaseProject {
  id: string
  title: string
  status: string
  summary: string
  description: string
  cover_image_url: string
  stack: string[] | null
  display_order: number
  created_at: string
  slug: string
  weekly_updates?: ProjectWeeklyDetail[] | null
}

export interface CreateProjectPayload {
  title: string
  status: string
  summary: string
  description: string
  cover_image_url: string
  stack?: string[] | null
  slug?: string
  display_order?: number
  weekly_updates?: ProjectWeeklyDetail[] | null
}

export interface UpdateProjectPayload {
  title?: string
  status?: string
  summary?: string
  description?: string
  cover_image_url?: string
  stack?: string[] | null
  slug?: string
  display_order?: number
  weekly_updates?: ProjectWeeklyDetail[] | null
}

export interface ProjectMutationResponse {
  success: boolean
  data?: SupabaseProject
  error?: string
  isRlsError?: boolean
}

const LOCAL_PROJECTS_CACHE_KEY = 'pegasus_local_projects_cache'
const LOCAL_PROJECTS_DELETED_KEY = 'pegasus_local_projects_deleted'
const LOCAL_PROJECT_WEEKLY_PREFIX = 'pegasus_weekly_log_'

function getStoredWeeklyUpdates(id: string, slug?: string): ProjectWeeklyDetail[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`${LOCAL_PROJECT_WEEKLY_PREFIX}${id}`) ||
      (slug ? localStorage.getItem(`${LOCAL_PROJECT_WEEKLY_PREFIX}${slug}`) : null)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveStoredWeeklyUpdates(id: string, updates: ProjectWeeklyDetail[], slug?: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${LOCAL_PROJECT_WEEKLY_PREFIX}${id}`, JSON.stringify(updates))
    if (slug) {
      localStorage.setItem(`${LOCAL_PROJECT_WEEKLY_PREFIX}${slug}`, JSON.stringify(updates))
    }
  } catch {}
}

/**
 * Convert an image File to an optimized base64 Data URL.
 * Scales image to maximum 1200x800 and compresses as JPEG 0.85 for optimal display & payload size.
 */
async function fileToOptimizedDataUrl(file: File, maxDim = 1200, quality = 0.85): Promise<string> {
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
 * Generate a clean URL-friendly slug from title
 */
export function generateProjectSlug(title: string): string {
  const cleanTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `${cleanTitle || 'project'}-${randomSuffix}`
}

/**
 * Synchronize any previously cached local projects to Supabase database.
 */
export async function syncLocalProjectsToSupabase(): Promise<number> {
  if (typeof window === 'undefined') return 0

  const supabase = createClient()
  try {
    const localStr = localStorage.getItem(LOCAL_PROJECTS_CACHE_KEY)
    if (!localStr) return 0

    const localList: SupabaseProject[] = JSON.parse(localStr)
    const pending = localList.filter((p) => p.id.startsWith('local-project-'))
    if (pending.length === 0) return 0

    let syncedCount = 0
    let updatedList = [...localList]

    for (const p of pending) {
      const { data, error } = await supabase.from('projects').insert([{
        title: p.title.trim(),
        status: p.status.trim() || 'active',
        summary: p.summary.trim(),
        description: p.description.trim(),
        cover_image_url: p.cover_image_url.trim(),
        stack: p.stack || [],
        slug: p.slug.trim() || generateProjectSlug(p.title),
        display_order: p.display_order ?? 0,
      }]).select()

      if (!error && data && data[0]) {
        syncedCount++
        updatedList = updatedList.map((item) => (item.id === p.id ? data[0] : item))
      }
    }

    if (syncedCount > 0) {
      localStorage.setItem(LOCAL_PROJECTS_CACHE_KEY, JSON.stringify(updatedList))
    }

    return syncedCount
  } catch (err) {
    console.error('Failed to sync local projects to Supabase:', err)
    return 0
  }
}

/**
 * Enrich a project with weekly updates from remote, localStorage, or curated siteData.
 */
function enrichWithWeeklyUpdates(project: SupabaseProject): SupabaseProject {
  if (project.weekly_updates && project.weekly_updates.length > 0) {
    return project
  }
  const localStored = getStoredWeeklyUpdates(project.id, project.slug)
  if (localStored && localStored.length > 0) {
    return { ...project, weekly_updates: localStored }
  }
  const cleanSlug = project.slug?.toLowerCase().trim()
  if (cleanSlug) {
    for (const [key, detail] of Object.entries(siteData.projectDetails)) {
      if (cleanSlug.includes(key) || key.includes(cleanSlug)) {
        if (detail.weeklyUpdates && detail.weeklyUpdates.length > 0) {
          return { ...project, weekly_updates: detail.weeklyUpdates }
        }
      }
    }
  }
  return project
}

/**
 * Fetch all projects from Supabase, merged with optimistic local fallback cache and weekly updates.
 */
export async function fetchProjects(): Promise<SupabaseProject[]> {
  const supabase = createClient()

  // Auto-sync any pending local projects to database
  if (typeof window !== 'undefined') {
    await syncLocalProjectsToSupabase().catch(() => {})
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true })

  let remoteProjects: SupabaseProject[] = []

  if (error) {
    console.error('Error fetching projects from Supabase:', error)
  } else if (data) {
    remoteProjects = data.map((project) => enrichWithWeeklyUpdates({
      ...project,
      title: project.title?.trim(),
      summary: project.summary?.trim(),
      description: project.description?.trim(),
    }))
  }

  // Check local cache and deleted list
  if (typeof window !== 'undefined') {
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_PROJECTS_DELETED_KEY) || '[]')
      const deletedSet = new Set(deletedIds)

      // Filter out deleted projects
      const activeRemote = remoteProjects.filter((p) => !deletedSet.has(p.id))

      const localStr = localStorage.getItem(LOCAL_PROJECTS_CACHE_KEY)
      if (localStr) {
        const localList: SupabaseProject[] = JSON.parse(localStr).map(enrichWithWeeklyUpdates)
        const localMap = new Map(localList.map((p) => [p.id, p]))

        // If local cache has updates/edits for an active remote project, merge those updates
        const mergedRemote = activeRemote.map((p) => {
          const localOverride = localMap.get(p.id)
          return localOverride ? enrichWithWeeklyUpdates({ ...p, ...localOverride }) : p
        })

        const remoteIds = new Set(activeRemote.map((p) => p.id))
        const unmergedLocals = localList.filter((l) => !remoteIds.has(l.id) && !deletedSet.has(l.id))

        return [...mergedRemote, ...unmergedLocals].sort(
          (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
        )
      }

      return activeRemote
    } catch {
      // LocalStorage failure fallback
    }
  }

  return remoteProjects
}

/**
 * Fetch a single project by slug from Supabase, merged with local fallback cache.
 */
export async function fetchProjectBySlug(slug: string): Promise<SupabaseProject | null> {
  try {
    const allProjects = await fetchProjects()
    const normalizedSlug = slug.toLowerCase().trim()
    const match = allProjects.find(
      (p) =>
        p.slug?.toLowerCase().trim() === normalizedSlug ||
        p.id === slug ||
        p.slug?.toLowerCase().trim().startsWith(normalizedSlug) ||
        normalizedSlug.startsWith(p.slug?.toLowerCase().trim()) ||
        (p.title && generateProjectSlug(p.title).startsWith(normalizedSlug))
    )
    return match ? enrichWithWeeklyUpdates(match) : null
  } catch (err) {
    console.error('Error fetching project by slug:', err)
    return null
  }
}

/**
 * Add a new ongoing project using strictly the existing database columns.
 */
export async function addProject(payload: CreateProjectPayload): Promise<ProjectMutationResponse> {
  const supabase = createClient()
  const slug = payload.slug?.trim() || generateProjectSlug(payload.title)

  const projectItem = {
    title: payload.title.trim(),
    status: (payload.status?.trim() || 'active').toLowerCase(),
    summary: payload.summary.trim(),
    description: payload.description.trim(),
    cover_image_url: payload.cover_image_url.trim(),
    stack: payload.stack && payload.stack.length > 0 ? payload.stack : [],
    slug,
    display_order: payload.display_order ?? 10,
  }

  const { data, error } = await supabase
    .from('projects')
    .insert([projectItem])
    .select()

  if (error) {
    console.warn('Supabase insert project encountered error:', error)
    const isRls = error.code === '42501' || error.message?.toLowerCase().includes('row-level security')

    // Optimistic fallback to local cache
    const localProject: SupabaseProject = {
      id: `local-project-${Date.now()}`,
      title: projectItem.title,
      status: projectItem.status,
      summary: projectItem.summary,
      description: projectItem.description,
      cover_image_url: projectItem.cover_image_url,
      stack: projectItem.stack,
      slug: projectItem.slug,
      display_order: projectItem.display_order,
      created_at: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      try {
        const prev: SupabaseProject[] = JSON.parse(localStorage.getItem(LOCAL_PROJECTS_CACHE_KEY) || '[]')
        localStorage.setItem(LOCAL_PROJECTS_CACHE_KEY, JSON.stringify([localProject, ...prev]))
      } catch (err) {
        console.error('LocalStorage write failed:', err)
      }
    }

    return {
      success: isRls,
      data: localProject,
      error: error.message,
      isRlsError: isRls,
    }
  }

  const insertedProject: SupabaseProject = data[0]

  // Update local cache
  if (typeof window !== 'undefined') {
    try {
      const prev: SupabaseProject[] = JSON.parse(localStorage.getItem(LOCAL_PROJECTS_CACHE_KEY) || '[]')
      localStorage.setItem(LOCAL_PROJECTS_CACHE_KEY, JSON.stringify([insertedProject, ...prev]))
    } catch {
      // Ignore cache write error
    }
  }

  return {
    success: true,
    data: insertedProject,
  }
}

/**
 * Remove a project by ID from Supabase and local cache.
 */
export async function deleteProject(id: string): Promise<ProjectMutationResponse> {
  const supabase = createClient()

  // Track deletion in local storage
  if (typeof window !== 'undefined') {
    try {
      // Remove from added cache if present
      const prevAdded: SupabaseProject[] = JSON.parse(localStorage.getItem(LOCAL_PROJECTS_CACHE_KEY) || '[]')
      const filtered = prevAdded.filter((p) => p.id !== id)
      localStorage.setItem(LOCAL_PROJECTS_CACHE_KEY, JSON.stringify(filtered))

      // Mark as deleted in exclusion list
      const prevDeleted: string[] = JSON.parse(localStorage.getItem(LOCAL_PROJECTS_DELETED_KEY) || '[]')
      if (!prevDeleted.includes(id)) {
        localStorage.setItem(LOCAL_PROJECTS_DELETED_KEY, JSON.stringify([...prevDeleted, id]))
      }
    } catch (err) {
      console.error('Local cache deletion error:', err)
    }
  }

  // If local-only ID, return immediately
  if (id.startsWith('local-project-')) {
    return { success: true }
  }

  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) {
    console.warn('Supabase delete project encountered error:', error)
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
 * Update an existing project's details in Supabase database and local cache.
 */
export async function updateProject(
  id: string,
  payload: UpdateProjectPayload
): Promise<ProjectMutationResponse> {
  const supabase = createClient()

  const supabasePayload: Record<string, unknown> = {}
  if (payload.title !== undefined) supabasePayload.title = payload.title.trim()
  if (payload.status !== undefined) supabasePayload.status = (payload.status.trim() || 'active').toLowerCase()
  if (payload.summary !== undefined) supabasePayload.summary = payload.summary.trim()
  if (payload.description !== undefined) supabasePayload.description = payload.description.trim()
  if (payload.cover_image_url !== undefined) supabasePayload.cover_image_url = payload.cover_image_url.trim()
  if (payload.stack !== undefined) supabasePayload.stack = payload.stack || []
  if (payload.slug !== undefined) supabasePayload.slug = payload.slug.trim()
  if (payload.display_order !== undefined) supabasePayload.display_order = payload.display_order
  if (payload.weekly_updates !== undefined) {
    supabasePayload.weekly_updates = payload.weekly_updates
    saveStoredWeeklyUpdates(id, payload.weekly_updates || [], payload.slug)
  }

  let updatedProject: SupabaseProject | null = null

  // Optimistically update in local cache
  if (typeof window !== 'undefined') {
    try {
      const prev: SupabaseProject[] = JSON.parse(localStorage.getItem(LOCAL_PROJECTS_CACHE_KEY) || '[]')
      const index = prev.findIndex((p) => p.id === id)
      if (index !== -1) {
        updatedProject = {
          ...prev[index],
          ...supabasePayload,
          weekly_updates: payload.weekly_updates !== undefined ? payload.weekly_updates : prev[index]?.weekly_updates,
        } as SupabaseProject
        prev[index] = updatedProject
        localStorage.setItem(LOCAL_PROJECTS_CACHE_KEY, JSON.stringify(prev))
      } else {
        const placeholder: SupabaseProject = {
          id,
          title: payload.title?.trim() || '',
          status: (payload.status?.trim() || 'active').toLowerCase(),
          summary: payload.summary?.trim() || '',
          description: payload.description?.trim() || '',
          cover_image_url: payload.cover_image_url?.trim() || '',
          stack: payload.stack || [],
          slug: payload.slug?.trim() || '',
          display_order: payload.display_order ?? 0,
          created_at: new Date().toISOString(),
          weekly_updates: payload.weekly_updates ?? null,
        }
        updatedProject = placeholder
        localStorage.setItem(LOCAL_PROJECTS_CACHE_KEY, JSON.stringify([placeholder, ...prev]))
      }
    } catch (err) {
      console.error('LocalStorage write failed during project update:', err)
    }
  }

  // If local-only ID, return immediately
  if (id.startsWith('local-project-')) {
    return {
      success: true,
      data: updatedProject || undefined,
    }
  }

  // Supabase remote update
  try {
    let { data, error } = await supabase
      .from('projects')
      .update(supabasePayload)
      .eq('id', id)
      .select()

    // If weekly_updates column is not yet present on remote Supabase table:
    if (error && (error.message?.includes('weekly_updates') || error.code === 'PGRST204')) {
      console.warn('weekly_updates column not in Supabase table schema yet, retrying update without column...')
      const fallbackPayload = { ...supabasePayload }
      delete fallbackPayload.weekly_updates
      const retryRes = await supabase
        .from('projects')
        .update(fallbackPayload)
        .eq('id', id)
        .select()
      data = retryRes.data
      error = retryRes.error
    }

    if (error) {
      console.warn('Supabase update project encountered error:', error)
      const isRls = error.code === '42501' || error.message?.toLowerCase().includes('row-level security')

      return {
        success: isRls,
        data: updatedProject || undefined,
        error: error.message,
        isRlsError: isRls,
      }
    }

    if (data && data[0]) {
      const remoteUpdated: SupabaseProject = {
        ...data[0],
        weekly_updates: payload.weekly_updates !== undefined
          ? payload.weekly_updates
          : (data[0].weekly_updates || getStoredWeeklyUpdates(id, payload.slug)),
      }
      // Mirror the exact remote updated data into local cache
      if (typeof window !== 'undefined') {
        try {
          const prev: SupabaseProject[] = JSON.parse(localStorage.getItem(LOCAL_PROJECTS_CACHE_KEY) || '[]')
          const idx = prev.findIndex((p) => p.id === id)
          if (idx !== -1) {
            prev[idx] = remoteUpdated
            localStorage.setItem(LOCAL_PROJECTS_CACHE_KEY, JSON.stringify(prev))
          }
        } catch {}
      }

      return {
        success: true,
        data: remoteUpdated,
      }
    }

    return {
      success: true,
      data: updatedProject || undefined,
    }
  } catch (err: unknown) {
    console.error('Project update exception:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error during update',
    }
  }
}

/**
 * Upload project cover image to Supabase storage bucket 'media/projects/',
 * with automatic fallback to high-quality compressed Data URL if Storage RLS restricts uploads.
 */
export async function uploadProjectCover(file: File): Promise<{
  success: boolean
  publicUrl?: string
  error?: string
  isRlsFallback?: boolean
}> {
  const supabase = createClient()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const path = `projects/${Date.now()}-${sanitizedName}`

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

  // Automatic Fallback: Convert to optimized local Data URL
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
