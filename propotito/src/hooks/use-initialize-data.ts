import { useEffect } from 'react';
import { useAuthStore, useIncidentsStore, useUsersStore } from '@/stores';

export function useInitializeData() {
  const { isAuthenticated, fetchCurrentUser } = useAuthStore();
  const fetchIncidents = useIncidentsStore(state => state.fetchIncidents);
  const fetchUsers = useUsersStore(state => state.fetchUsers);

  useEffect(() => {
    const initializeData = async () => {
      if (!isAuthenticated) return;

      try {
        // Fetch current user data if not already loaded
        await fetchCurrentUser();
        
        // Fetch initial data
        await Promise.all([
          fetchIncidents(),
          fetchUsers(),
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, [isAuthenticated, fetchCurrentUser, fetchIncidents, fetchUsers]);
}
