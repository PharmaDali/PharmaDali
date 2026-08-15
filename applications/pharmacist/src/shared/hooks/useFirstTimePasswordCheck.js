import { useState, useEffect } from 'react';
import { getPharmacistProfile } from '@shared/services/pharmacistProfileService';

export function useFirstTimePasswordCheck() {
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkPasswordRequirement = async () => {
      try {
        setLoading(true);
        const res = await getPharmacistProfile();
        if (isMounted) {
          const profileData = res?.data || res;
          const user = profileData?.user;
          const requiresChange = Boolean(profileData?.requires_password_change || user?.requires_password_change);
          if (requiresChange) {
            setShowFirstTimeModal(true);
          }
        }
      } catch {
        // Silently catch network errors
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkPasswordRequirement();

    return () => {
      isMounted = false;
    };
  }, []);

  const closeModal = () => setShowFirstTimeModal(false);

  return {
    showFirstTimeModal,
    setShowFirstTimeModal,
    closeModal,
    loading,
  };
}
