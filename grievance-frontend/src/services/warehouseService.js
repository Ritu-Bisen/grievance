import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const warehouseService = {
  // Get all complaints/items in warehouse
  getWarehouseComplaints: async () => {
    try {
      const response = await apiClient.get('/warehouse/complaints');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search complaints by ID
  searchComplaint: async (complaintId) => {
    try {
      const response = await apiClient.get(`/warehouse/complaints/search/${complaintId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get complaints filtered by date range
  getComplaintsByDateRange: async (startDate, endDate) => {
    try {
      const response = await apiClient.get('/warehouse/complaints/filter', {
        params: {
          startDate,
          endDate,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get complaints by category/type
  getComplaintsByCategory: async (category) => {
    try {
      const response = await apiClient.get(`/warehouse/complaints/category/${category}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single complaint details
  getComplaintDetails: async (complaintId) => {
    try {
      const response = await apiClient.get(`/warehouse/complaints/${complaintId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update complaint status
  updateComplaintStatus: async (complaintId, status) => {
    try {
      const response = await apiClient.patch(`/warehouse/complaints/${complaintId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add comment/note to complaint
  addComplaintNote: async (complaintId, note) => {
    try {
      const response = await apiClient.post(`/warehouse/complaints/${complaintId}/notes`, {
        note,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Resolve complaint
  resolveComplaint: async (complaintId, resolution) => {
    try {
      const response = await apiClient.post(`/warehouse/complaints/${complaintId}/resolve`, {
        resolution,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get warehouse statistics
  getWarehouseStats: async () => {
    try {
      const response = await apiClient.get('/warehouse/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Export complaints report
  exportComplaintsReport: async (filters = {}) => {
    try {
      const response = await apiClient.get('/warehouse/complaints/export', {
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default warehouseService;
