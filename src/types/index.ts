export type Role = 'admin' | 'agent' | 'user'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  phone?: string
  address?: string
}

export interface Payment {
  id: number
  payment_reference: string
  amount: string | number
  status: 'pending' | 'paid' | 'failed'
  payment_method: 'online' | 'reference'
  description?: string
  created_at: string
  user?: Pick<User, 'id' | 'name' | 'email'>
  receipt?: { id: number; receipt_number: string } | null
}

export interface Receipt {
  id: number
  receipt_number: string
  generated_at: string
  payment: {
    id: number
    amount: string | number
    payment_reference: string
    payment_method: string
    created_at: string
  }
}

export interface Document {
  id: number
  title: string
  description?: string
  file_name: string
  file_size: number
  is_active: boolean
  created_at: string
  uploader?: { name: string }
}

export interface PaymentReference {
  id: number
  reference_id: string
  amount: string | number
  description?: string
  status: 'pending' | 'used' | 'expired'
  expires_at?: string
  created_at: string
  user?: Pick<User, 'id' | 'name' | 'email'> | null
  creator?: { name: string } | null
}

export interface AgentLink {
  id: number
  name: string
  description?: string
  unique_link: string
  full_url: string
  is_active: boolean
  payments_count: number
  created_at: string
  agent?: Pick<User, 'id' | 'name'> | null
}

export interface PaginationMeta {
  total: number
  current_page: number
  last_page: number
  per_page?: number
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
