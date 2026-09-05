import { createClient } from './client'

export interface RequestedPart {
  itemId: string
  sku: string
  name: string
  quantity: number
}

export interface InventoryRequestPayload {
  name: string
  studentCode: string
  email: string
  phone: string
  parts: RequestedPart[]
  purpose?: string
}

export type RequestStatus = 'PENDING' | 'APPROVED' | 'DISPATCHED' | 'RETURNED' | 'REJECTED'

export interface InventoryRequestRecord {
  id: string
  name: string
  studentCode: string
  email: string
  phone: string
  parts: RequestedPart[]
  purpose?: string | null
  status: RequestStatus
  createdAt: string
}

export interface RequestSubmissionResponse {
  success: boolean
  id?: string
  error?: string
  isRlsError?: boolean
}

const LOCAL_REQUESTS_KEY = 'pegasus_inventory_requests_store'

function getLocalRequests(): InventoryRequestRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_REQUESTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('Error reading local requests:', err)
    return []
  }
}

function saveLocalRequests(list: InventoryRequestRecord[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(list))
  } catch (err) {
    console.error('Error saving local requests:', err)
  }
}

/**
 * Submit a student hardware inventory requisition
 */
export async function submitInventoryRequest(
  payload: InventoryRequestPayload
): Promise<RequestSubmissionResponse> {
  const supabase = createClient()
  const generatedId = `REQ-${Date.now().toString().slice(-6)}`
  const now = new Date().toISOString()

  const newRecord: InventoryRequestRecord = {
    id: generatedId,
    name: payload.name.trim(),
    studentCode: payload.studentCode.trim().toUpperCase(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    parts: payload.parts,
    purpose: payload.purpose?.trim() || null,
    status: 'PENDING',
    createdAt: now,
  }

  // Attempt Supabase insert
  try {
    const { data, error } = await supabase
      .from('inventory_requests')
      .insert([
        {
          name: newRecord.name,
          student_code: newRecord.studentCode,
          email: newRecord.email,
          phone: newRecord.phone,
          parts: newRecord.parts,
          purpose: newRecord.purpose,
          status: newRecord.status,
        },
      ])
      .select()

    if (error) {
      const isRls = error.code === '42501' || error.message?.toLowerCase().includes('row-level security')

      // Save locally so the requisition is never lost
      const current = getLocalRequests()
      saveLocalRequests([newRecord, ...current])

      return {
        success: true,
        id: generatedId,
        isRlsError: isRls,
      }
    }

    const inserted = data[0]
    const record: InventoryRequestRecord = {
      ...newRecord,
      id: inserted.id || generatedId,
    }

    const current = getLocalRequests()
    saveLocalRequests([record, ...current])

    return {
      success: true,
      id: record.id,
    }
  } catch (err) {
    console.error('Failed inserting inventory request to Supabase, saving locally:', err)
    const current = getLocalRequests()
    saveLocalRequests([newRecord, ...current])
    return {
      success: true,
      id: generatedId,
    }
  }
}

/**
 * Fetch all inventory requests for the admin console
 */
export async function fetchInventoryRequests(): Promise<InventoryRequestRecord[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('inventory_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data) {
      return getLocalRequests()
    }

    const mapped: InventoryRequestRecord[] = data.map((row) => ({
      id: row.id,
      name: row.name,
      studentCode: row.student_code || row.studentCode || '',
      email: row.email,
      phone: row.phone,
      parts: (typeof row.parts === 'string' ? JSON.parse(row.parts) : row.parts) || [],
      purpose: row.purpose,
      status: (row.status as RequestStatus) || 'PENDING',
      createdAt: row.created_at || new Date().toISOString(),
    }))

    // Save/merge to local
    saveLocalRequests(mapped)
    return mapped
  } catch (err) {
    console.warn('Fallback to local inventory requests:', err)
    return getLocalRequests()
  }
}

/**
 * Update the status of an inventory requisition (e.g. Approve, Dispatch, Reject)
 */
export async function updateInventoryRequestStatus(
  id: string,
  status: RequestStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // Update local storage
  const current = getLocalRequests()
  const updated = current.map((r) => (r.id === id ? { ...r, status } : r))
  saveLocalRequests(updated)

  try {
    await supabase.from('inventory_requests').update({ status }).eq('id', id)
  } catch (err) {
    console.warn('Supabase request status update failed:', err)
  }

  return { success: true }
}
