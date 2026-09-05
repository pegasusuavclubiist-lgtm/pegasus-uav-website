import { createClient } from './client'
import { InventoryItem, siteData } from '@/data/data'

const INVENTORY_STORAGE_KEY = 'pegasus_club_inventory_store'

export interface InventoryMutationResponse {
  success: boolean
  data?: InventoryItem
  error?: string
  isTableMissing?: boolean
  isRlsError?: boolean
}

/**
 * Get initial default inventory list from seed data
 */
function getSeedInventory(): InventoryItem[] {
  return siteData.admin.seedInventory || []
}

/**
 * Read inventory from localStorage
 */
function getLocalInventory(): InventoryItem[] {
  if (typeof window === 'undefined') return getSeedInventory()
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY)
    if (!raw) {
      const initial = getSeedInventory()
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(initial))
      return initial
    }
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed reading local inventory:', err)
    return getSeedInventory()
  }
}

/**
 * Save inventory to localStorage
 */
function saveLocalInventory(items: InventoryItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items))
  } catch (err) {
    console.error('Failed saving local inventory:', err)
  }
}

/**
 * Check if the inventory table is provisioned in Supabase
 */
export async function checkSupabaseInventoryTable(): Promise<{
  tableExists: boolean
  rlsConfigured: boolean
}> {
  const supabase = createClient()
  try {
    const { error } = await supabase.from('inventory').select('id').limit(1)
    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return { tableExists: false, rlsConfigured: false }
      }
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        return { tableExists: true, rlsConfigured: false }
      }
    }
    return { tableExists: true, rlsConfigured: true }
  } catch {
    return { tableExists: false, rlsConfigured: false }
  }
}

/**
 * Fetch all club inventory items (from Supabase if table exists, or local storage store)
 */
export async function fetchInventoryItems(): Promise<{
  items: InventoryItem[]
  source: 'supabase' | 'local'
  tableMissing?: boolean
}> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('sku', { ascending: true })

    if (error) {
      const tableMissing = error.code === '42P01' || error.message?.includes('does not exist')
      const localItems = getLocalInventory()
      return {
        items: localItems,
        source: 'local',
        tableMissing,
      }
    }

    if (data && data.length > 0) {
      const mapped: InventoryItem[] = data.map((row) => ({
        id: row.id,
        sku: row.sku || '',
        name: row.name,
        category: row.category,
        quantity: row.quantity ?? 0,
        minThreshold: row.min_threshold ?? 1,
        status: row.status || 'IN_STOCK',
        location: row.location || 'Lab Bay 1',
        assignedProject: row.assigned_project || null,
        notes: row.notes || null,
        updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
      }))

      // Sync local copy
      saveLocalInventory(mapped)
      return { items: mapped, source: 'supabase' }
    }

    // If Supabase table is empty, seed it with initial defaults or return local
    const localItems = getLocalInventory()
    return { items: localItems, source: 'local' }
  } catch (err) {
    console.error('Error in fetchInventoryItems:', err)
    return { items: getLocalInventory(), source: 'local' }
  }
}

/**
 * Add a new hardware inventory item
 */
export async function createInventoryItem(
  payload: Omit<InventoryItem, 'id' | 'updatedAt'>
): Promise<InventoryMutationResponse> {
  const supabase = createClient()
  const now = new Date().toISOString()
  const generatedId = `inv-${Date.now()}`

  const newItem: InventoryItem = {
    ...payload,
    id: generatedId,
    updatedAt: now,
  }

  // Attempt Supabase insert
  try {
    const { data, error } = await supabase
      .from('inventory')
      .insert([
        {
          sku: newItem.sku.trim(),
          name: newItem.name.trim(),
          category: newItem.category.trim(),
          quantity: newItem.quantity,
          min_threshold: newItem.minThreshold,
          status: newItem.status,
          location: newItem.location.trim(),
          assigned_project: newItem.assignedProject?.trim() || null,
          notes: newItem.notes?.trim() || null,
        },
      ])
      .select()

    if (error) {
      const isMissing = error.code === '42P01' || error.message?.includes('does not exist')
      const isRls = error.code === '42501' || error.message?.includes('row-level security')

      // Save locally
      const current = getLocalInventory()
      saveLocalInventory([newItem, ...current])

      return {
        success: true,
        data: newItem,
        isTableMissing: isMissing,
        isRlsError: isRls,
      }
    }

    const inserted = data[0]
    const mapped: InventoryItem = {
      id: inserted.id,
      sku: inserted.sku,
      name: inserted.name,
      category: inserted.category,
      quantity: inserted.quantity,
      minThreshold: inserted.min_threshold,
      status: inserted.status,
      location: inserted.location,
      assignedProject: inserted.assigned_project,
      notes: inserted.notes,
      updatedAt: inserted.updated_at || now,
    }

    // Update local cache
    const current = getLocalInventory()
    saveLocalInventory([mapped, ...current])

    return { success: true, data: mapped }
  } catch (err) {
    console.error('createInventoryItem error:', err)
    const current = getLocalInventory()
    saveLocalInventory([newItem, ...current])
    return { success: true, data: newItem }
  }
}

/**
 * Update an existing inventory item (e.g. quantity adjust, status change, notes)
 */
export async function updateInventoryItem(
  id: string,
  fields: Partial<InventoryItem>
): Promise<InventoryMutationResponse> {
  const supabase = createClient()
  const now = new Date().toISOString()

  // Update local storage first
  const current = getLocalInventory()
  const index = current.findIndex((i) => i.id === id)
  let updatedItem: InventoryItem | null = null

  if (index !== -1) {
    updatedItem = {
      ...current[index],
      ...fields,
      updatedAt: now,
    }
    current[index] = updatedItem
    saveLocalInventory(current)
  }

  // Attempt Supabase update
  try {
    const supabasePayload: Record<string, unknown> = {}
    if (fields.sku !== undefined) supabasePayload.sku = fields.sku
    if (fields.name !== undefined) supabasePayload.name = fields.name
    if (fields.category !== undefined) supabasePayload.category = fields.category
    if (fields.quantity !== undefined) supabasePayload.quantity = fields.quantity
    if (fields.minThreshold !== undefined) supabasePayload.min_threshold = fields.minThreshold
    if (fields.status !== undefined) supabasePayload.status = fields.status
    if (fields.location !== undefined) supabasePayload.location = fields.location
    if (fields.assignedProject !== undefined) supabasePayload.assigned_project = fields.assignedProject
    if (fields.notes !== undefined) supabasePayload.notes = fields.notes

    if (Object.keys(supabasePayload).length > 0) {
      await supabase.from('inventory').update(supabasePayload).eq('id', id)
    }
  } catch (err) {
    console.warn('Supabase update skipped / failed:', err)
  }

  return {
    success: true,
    data: updatedItem || undefined,
  }
}

/**
 * Delete an inventory item
 */
export async function deleteInventoryItem(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // Remove from local storage
  const current = getLocalInventory()
  const filtered = current.filter((i) => i.id !== id)
  saveLocalInventory(filtered)

  try {
    await supabase.from('inventory').delete().eq('id', id)
  } catch (err) {
    console.warn('Supabase delete item skipped / failed:', err)
  }

  return { success: true }
}
