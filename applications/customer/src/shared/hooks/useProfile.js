import { useState, useEffect } from 'react';
import { getCustomerProfile } from '@shared/services/customerProfileService';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCustomerProfile();
      if (result?.data?.user) {
        setProfile(result.data.user);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, setProfile, refetchProfile: fetchProfile };
}

