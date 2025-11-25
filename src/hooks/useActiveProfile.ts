import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  pin: string | null;
  created_at: string;
  updated_at: string;
}

export function useActiveProfile() {
  const [profileId, setProfileId] = useState<string | null>(() => 
    localStorage.getItem('active_profile_id')
  );
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [profileId]);

  const setActiveProfile = (id: string) => {
    localStorage.setItem('active_profile_id', id);
    setProfileId(id);
  };

  const clearActiveProfile = () => {
    localStorage.removeItem('active_profile_id');
    setProfileId(null);
    setProfile(null);
  };

  return { profileId, profile, setActiveProfile, clearActiveProfile, loading };
}
