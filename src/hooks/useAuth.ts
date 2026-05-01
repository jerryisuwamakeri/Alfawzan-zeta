'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { api, removeToken } from '@/lib/api'
import type { User } from '@/types'

export function useAuth(redirectIfUnauthenticated = true) {
  const router = useRouter()

  const { data, error, mutate, isLoading } = useSWR<{ id: number; name: string; email: string; role: string; phone?: string; address?: string }>(
    '/auth/user',
    () => api.get<User>('/auth/user'),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onError: () => {
        if (redirectIfUnauthenticated) {
          router.push('/login')
        }
      },
    }
  )

  const user = data as User | undefined

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch {}
    removeToken()
    localStorage.removeItem('auth_user')
    router.push('/login')
  }

  return { user, error, isLoading, mutate, logout }
}
