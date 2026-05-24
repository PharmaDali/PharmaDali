import { useState, useEffect } from 'react';
import { getCustomerProfile } from '@shared/services/customerProfileService';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        const result = await getCustomerProfile();
        if (mounted && result?.data?.user) {
          setProfile(result.data.user);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  return { profile, loading, error, setProfile };
}
