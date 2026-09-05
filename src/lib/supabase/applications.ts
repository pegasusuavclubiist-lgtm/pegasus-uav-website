import { createClient } from './client'

export interface ApplicationPayload {
  name: string
  email: string
  interest: string
  message?: string
}

export interface ApplicationResponse {
  success: boolean
  error?: string
  id?: string
  isRlsError?: boolean
}

/**
 * Submit candidate recruitment application to Supabase applications table
 */
export async function submitApplication(payload: ApplicationPayload): Promise<ApplicationResponse> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('applications')
    .insert([
      {
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        interest: payload.interest.trim(),
        message: payload.message?.trim() || null,
      },
    ])
    .select()

  if (error) {
    console.error('Error submitting application to Supabase:', error)
    const isRls = error.code === '42501' || error.message?.toLowerCase().includes('row-level security')
    return {
      success: false,
      error: error.message,
      isRlsError: isRls,
    }
  }

  const newId = data && data.length > 0 ? data[0].id : undefined
  return {
    success: true,
    id: newId,
  }
}
