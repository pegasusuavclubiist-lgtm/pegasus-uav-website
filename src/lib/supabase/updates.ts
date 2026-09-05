import { createClient } from './client'

export interface SupabaseUpdate {
  id: string
  title: string
  content: string
  image_url: string | null
  created_at: string
}

export interface CreateUpdatePayload {
  title: string
  content: string
  image_url?: string | null
}

export interface UpdateMutationResponse {
  success: boolean
  data?: SupabaseUpdate
  error?: string
  isRlsError?: boolean
}

const LOCAL_UPDATES_KEY = 'pegasus_local_updates_cache'

/**
 * Fetch all mission updates from Supabase sorted latest first (descending by created_at)
 * Integrates local cache fallback to preserve demo/admin items if RLS is active.
 */
export async function fetchUpdates(): Promise<SupabaseUpdate[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('updates')
    .select('*')
    .order('created_at', { ascending: false })

  let remoteUpdates: SupabaseUpdate[] = []

  if (error) {
    console.error('Error fetching updates from Supabase:', error)
  } else if (data) {
    remoteUpdates = data.map((update) => ({
      ...update,
      title: update.title?.trim(),
      content: update.content?.trim(),
    }))
  }

  // Check for locally added/cached posts (useful during RLS setup)
  if (typeof window !== 'undefined') {
    try {
      const localStr = localStorage.getItem(LOCAL_UPDATES_KEY)
      if (localStr) {
        const localList: SupabaseUpdate[] = JSON.parse(localStr)
        // Merge without duplicating IDs
        const remoteIds = new Set(remoteUpdates.map((u) => u.id))
        const unmergedLocals = localList.filter((l) => !remoteIds.has(l.id))
        return [...unmergedLocals, ...remoteUpdates].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }
    } catch {
      // LocalStorage access failure fallback
    }
  }

  return remoteUpdates
}

/**
 * Create a new mission update post in Supabase
 */
export async function createUpdate(payload: CreateUpdatePayload): Promise<UpdateMutationResponse> {
  const supabase = createClient()
  const postItem = {
    title: payload.title.trim(),
    content: payload.content.trim(),
    image_url: payload.image_url?.trim() || null,
  }

  const { data, error } = await supabase
    .from('updates')
    .insert([postItem])
    .select()

  if (error) {
    console.warn('Supabase insert update encountered error:', error)
    const isRls = error.code === '42501' || error.message?.toLowerCase().includes('row-level security')

    // Save optimistically to local cache so user's work isn't lost
    const localPost: SupabaseUpdate = {
      id: `local-post-${Date.now()}`,
      title: postItem.title,
      content: postItem.content,
      image_url: postItem.image_url,
      created_at: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      try {
        const prev = JSON.parse(localStorage.getItem(LOCAL_UPDATES_KEY) || '[]')
        localStorage.setItem(LOCAL_UPDATES_KEY, JSON.stringify([localPost, ...prev]))
      } catch (err) {
        console.error('LocalStorage write failed:', err)
      }
    }

    return {
      success: isRls, // return success with warning flag if saved locally due to RLS
      data: localPost,
      error: error.message,
      isRlsError: isRls,
    }
  }

  const insertedPost: SupabaseUpdate = data[0]

  // Also sync local cache
  if (typeof window !== 'undefined') {
    try {
      const prev = JSON.parse(localStorage.getItem(LOCAL_UPDATES_KEY) || '[]')
      localStorage.setItem(LOCAL_UPDATES_KEY, JSON.stringify([insertedPost, ...prev]))
    } catch {
      // Ignore storage error
    }
  }

  return {
    success: true,
    data: insertedPost,
  }
}

/**
 * Delete a mission update post by ID from Supabase
 */
export async function deleteUpdate(id: string): Promise<UpdateMutationResponse> {
  const supabase = createClient()

  // Always remove from local cache first
  if (typeof window !== 'undefined') {
    try {
      const prev: SupabaseUpdate[] = JSON.parse(localStorage.getItem(LOCAL_UPDATES_KEY) || '[]')
      const filtered = prev.filter((p) => p.id !== id)
      localStorage.setItem(LOCAL_UPDATES_KEY, JSON.stringify(filtered))
    } catch (err) {
      console.error('Local cache delete error:', err)
    }
  }

  // If it was purely a local fallback post, we are done
  if (id.startsWith('local-post-')) {
    return { success: true }
  }

  const { error } = await supabase.from('updates').delete().eq('id', id)

  if (error) {
    console.warn('Supabase delete update encountered error:', error)
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
 * Upload an image file to Supabase storage bucket 'media/updates/'
 */
export async function uploadUpdateMedia(file: File): Promise<{
  success: boolean
  publicUrl?: string
  error?: string
}> {
  const supabase = createClient()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const path = `updates/${Date.now()}-${sanitizedName}`

  try {
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return { success: false, error: uploadError.message }
    }

    const { data: publicData } = supabase.storage.from('media').getPublicUrl(path)
    return {
      success: true,
      publicUrl: publicData.publicUrl,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    return { success: false, error: message }
  }
}
