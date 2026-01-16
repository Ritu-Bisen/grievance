import { useQuery } from '@tanstack/react-query';
import facilityService from '../services/facilityService';

// Hook to fetch all facilities
export const useFacilities = (searchQuery = '') => {
  return useQuery({
    queryKey: ['facilities', searchQuery],
    queryFn: () => facilityService.getFacilities(searchQuery),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch single facility
export const useFacility = (id) => {
  return useQuery({
    queryKey: ['facility', id],
    queryFn: () => facilityService.getFacilityById(id),
    enabled: !!id,
  });
};

// Hook to search facilities
export const useSearchFacilities = (name) => {
  return useQuery({
    queryKey: ['facilities', 'search', name],
    queryFn: () => facilityService.searchFacilities(name),
    enabled: name.length > 0,
  });
};
