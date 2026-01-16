import { useQuery } from '@tanstack/react-query';
import batchService from '../services/batchService';

// Hook to fetch all batches
export const useBatches = (itemCode = '') => {
  return useQuery({
    queryKey: ['batches', itemCode],
    queryFn: () => batchService.getBatches(itemCode),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch single batch
export const useBatch = (batchNo) => {
  return useQuery({
    queryKey: ['batch', batchNo],
    queryFn: () => batchService.getBatchByNumber(batchNo),
    enabled: !!batchNo,
  });
};

// Hook to search batches
export const useSearchBatches = (query) => {
  return useQuery({
    queryKey: ['batches', 'search', query],
    queryFn: () => batchService.searchBatches(query),
    enabled: query.length > 0,
  });
};

// Hook to get batches by item code
export const useBatchesByItem = (itemCode) => {
  return useQuery({
    queryKey: ['batches', 'item', itemCode],
    queryFn: () => batchService.getBatchesByItem(itemCode),
    enabled: !!itemCode,
  });
};
