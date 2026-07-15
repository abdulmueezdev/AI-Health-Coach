'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/database'

export function useUser() {
  const { user, session, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    let mounted = true
    
    async function fetchProfile() {
      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      setLoading(true)
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (mounted) {
        setProfile(data as Profile | null)
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchProfile()
    }

    return () => {
      mounted = false
    }
  }, [user, authLoading, supabase])

  return {
    user,
    session,
    profile,
    loading: authLoading || loading,
  }
}
