import { useQuery } from '@tanstack/react-query';
import itemService from '../services/itemService';

// Hook to fetch all items
export const useItems = (searchQuery = '') => {
  return useQuery({
    queryKey: ['items', searchQuery],
    queryFn: () => itemService.getItems(searchQuery),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch single item
export const useItem = (code) => {
  return useQuery({
    queryKey: ['item', code],
    queryFn: () => itemService.getItemByCode(code),
    enabled: !!code,
  });
};

// Hook to search items
export const useSearchItems = (query) => {
  return useQuery({
    queryKey: ['items', 'search', query],
    queryFn: () => itemService.searchItems(query),
    enabled: query.length > 0,
  });
};
