import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import complaintService from '../services/complaintService';

// Hook to fetch complaints
export const useComplaints = (filters) => {
  return useQuery({
    queryKey: ['complaints', filters],
    queryFn: () => complaintService.getComplaints(filters),
    select: (data) => data.complaints || [],
  });
};

// Hook to get single complaint
export const useComplaint = (id) => {
  return useQuery({
    queryKey: ['complaint', id],
    queryFn: () => complaintService.getComplaintById(id),
    enabled: !!id,
  });
};

// Hook to create a complaint
export const useCreateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (complaintData) => complaintService.createComplaint(complaintData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });
};

// Hook to update complaint status
export const useUpdateComplaintStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => complaintService.updateComplaintStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });
};

// Hook to upload documents
export const useUploadDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ complaintId, files }) => complaintService.uploadDocuments(complaintId, files),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', variables.complaintId] });
    },
  });
};
