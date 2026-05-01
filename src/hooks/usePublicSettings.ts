import useSWR from 'swr'

interface PublicSettings {
  school_name?: string
  logo_url?: string
  tagline?: string
  address?: string
  phone?: string
  phone2?: string
  phone3?: string
  email?: string
  website?: string
  seo_title?: string
  seo_description?: string
  facebook_url?: string
  instagram_url?: string
  twitter_url?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

async function fetchPublicSettings(): Promise<PublicSettings> {
  const res = await fetch(`${API_URL}/public/settings`)
  const json = await res.json()
  return json.data ?? {}
}

export function usePublicSettings() {
  const { data } = useSWR('public-settings', fetchPublicSettings, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })
  return data ?? {}
}
