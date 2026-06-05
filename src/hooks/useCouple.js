import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useCouple() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['couple', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('couples')
        .select(`
          *,
          user1:user1_id(user_id, display_name, avatar_url),
          user2:user2_id(user_id, display_name, avatar_url)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'active')
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}