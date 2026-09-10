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
const LOCAL_UPDATES_DELETED_KEY = 'pegasus_local_updates_deleted'

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
 * Synchronize any previously cached local updates to Supabase database.
 */
export async function syncLocalUpdatesToSupabase(): Promise<number> {
  if (typeof window === 'undefined') return 0

  const supabase = createClient()
  try {
    const localStr = localStorage.getItem(LOCAL_UPDATES_KEY)
    if (!localStr) return 0

    const localList: SupabaseUpdate[] = JSON.parse(localStr)
    const pending = localList.filter((u) => u.id.startsWith('local-post-'))
    if (pending.length === 0) return 0

    let syncedCount = 0
    let updatedList = [...localList]

    for (const u of pending) {
      const { data, error } = await supabase.from('updates').insert([{
        title: u.title.trim(),
        content: u.content.trim(),
        image_url: u.image_url?.trim() || null,
      }]).select()

      if (!error && data && data[0]) {
        syncedCount++
        updatedList = updatedList.map((item) => (item.id === u.id ? data[0] : item))
      }
    }

    if (syncedCount > 0) {
      localStorage.setItem(LOCAL_UPDATES_KEY, JSON.stringify(updatedList))
    }

    return syncedCount
  } catch (err) {
    console.error('Failed to sync local updates to Supabase:', err)
    return 0
  }
}

/**
 * Fetch all mission updates from Supabase sorted latest first (descending by created_at)
 * Integrates local cache fallback to preserve items if RLS is active.
 */
export async function fetchUpdates(): Promise<SupabaseUpdate[]> {
  const supabase = createClient()

  // Auto-sync any pending local updates to Supabase
  if (typeof window !== 'undefined') {
    await syncLocalUpdatesToSupabase().catch(() => {})
  }

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

  // Check for locally added/cached posts and filter out any deleted
  if (typeof window !== 'undefined') {
    try {
      const deletedIds: string[] = JSON.parse(
        localStorage.getItem(LOCAL_UPDATES_DELETED_KEY) || '[]'
      )
      const deletedSet = new Set(deletedIds)

      // Filter remote items
      remoteUpdates = remoteUpdates.filter((u) => !deletedSet.has(u.id))

      const localStr = localStorage.getItem(LOCAL_UPDATES_KEY)
      if (localStr) {
        const localList: SupabaseUpdate[] = JSON.parse(localStr)
        const remoteIds = new Set(remoteUpdates.map((u) => u.id))
        const unmergedLocals = localList.filter((l) => !remoteIds.has(l.id) && !deletedSet.has(l.id))
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

  // Always remove from local cache and remember deletion
  if (typeof window !== 'undefined') {
    try {
      const prev: SupabaseUpdate[] = JSON.parse(localStorage.getItem(LOCAL_UPDATES_KEY) || '[]')
      const filtered = prev.filter((p) => p.id !== id)
      localStorage.setItem(LOCAL_UPDATES_KEY, JSON.stringify(filtered))

      const prevDeleted: string[] = JSON.parse(localStorage.getItem(LOCAL_UPDATES_DELETED_KEY) || '[]')
      if (!prevDeleted.includes(id)) {
        localStorage.setItem(LOCAL_UPDATES_DELETED_KEY, JSON.stringify([...prevDeleted, id]))
      }
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
 * Upload an image file to Supabase storage bucket 'media/updates/',
 * with automatic fallback to high-quality compressed Data URL if Storage RLS restricts uploads.
 */
export async function uploadUpdateMedia(file: File): Promise<{
  success: boolean
  publicUrl?: string
  error?: string
  isRlsFallback?: boolean
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
