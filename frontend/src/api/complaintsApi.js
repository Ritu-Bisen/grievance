
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../store/constants';

// Fetch complaints with filters
export const fetchComplaints = async (filters) => {
  const { data } = await apiClient.get(API_ENDPOINTS.DASHBOARD, {
    params: filters,
  });
  return data;
};

// Submit a new complaint
export const submitComplaint = async (complaintData) => {
  const { data } = await apiClient.post('/complaints', complaintData);
  return data;
};

// Get complaint by ID
export const getComplaintById = async (id) => {
  const { data } = await apiClient.get(`/complaints/${id}`);
  return data;
};

// Update complaint status
export const updateComplaintStatus = async ({ id, status }) => {
  const { data } = await apiClient.patch(`/complaints/${id}/status`, { status });
  return data;
};
