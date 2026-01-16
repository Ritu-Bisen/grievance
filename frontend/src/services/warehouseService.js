import apiClient from '../api/apiClient';

class WarehouseService {
  // Get all warehouse complaints
  async getWarehouseComplaints() {
    try {
      const { data } = await apiClient.get('/warehouse/complaints');
      return data;
    } catch (error) {
      console.error('Error fetching warehouse complaints:', error);
      throw error;
    }
  }

  // Get warehouse statistics
  async getWarehouseStats() {
    try {
      const { data } = await apiClient.get('/warehouse/stats');
      return data;
    } catch (error) {
      console.error('Error fetching warehouse stats:', error);
      throw error;
    }
  }

  // Search complaint by ID
  async searchComplaint(complaintId) {
    try {
      const { data } = await apiClient.get(`/warehouse/complaints/search`, {
        params: { complaintId },
      });
      return data;
    } catch (error) {
      console.error('Error searching complaint:', error);
      throw error;
    }
  }

  // Update complaint status
  async updateComplaintStatus(complaintId, status) {
    try {
      const { data } = await apiClient.patch(
        `/warehouse/complaints/${complaintId}/status`,
        { status }
      );
      return data;
    } catch (error) {
      console.error('Error updating complaint status:', error);
      throw error;
    }
  }

  // Resolve complaint
  async resolveComplaint(complaintId, resolution) {
    try {
      const { data } = await apiClient.post(
        `/warehouse/complaints/${complaintId}/resolve`,
        { resolution }
      );
      return data;
    } catch (error) {
      console.error('Error resolving complaint:', error);
      throw error;
    }
  }

  // Export complaints report
  async exportComplaintsReport() {
    try {
      const { data } = await apiClient.get('/warehouse/complaints/export', {
        responseType: 'blob',
      });
      return data;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  // Filter complaints
  async filterComplaints(filters) {
    try {
      const { data } = await apiClient.get('/warehouse/complaints/filter', {
        params: filters,
      });
      return data;
    } catch (error) {
      console.error('Error filtering complaints:', error);
      throw error;
    }
  }
}

export default new WarehouseService();
