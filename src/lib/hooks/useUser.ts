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

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
        }

        if (mounted) {
          setProfile(data as Profile | null)
          setLoading(false)
        }
      } catch (err) {
        console.error('Unexpected error fetching profile:', err)
        if (mounted) {
          setProfile(null)
          setLoading(false)
        }
      }
    }

    if (!authLoading) {
      fetchProfile()
    }

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading, supabase])

  return {
    user,
    session,
    profile,
    loading: authLoading || loading,
  }
}
