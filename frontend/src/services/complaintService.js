import apiClient from '../api/apiClient';

class ComplaintService {
  // Fetch all complaints with filters
  async getComplaints(filters = {}) {
    try {
      const { data } = await apiClient.get('/', {
        params: {
          complaintCode: filters.complaintCode || '',
          status: filters.status || '',
          fromDate: filters.fromDate || '',
          toDate: filters.toDate || '',
        },
      });
      return data;
    } catch (error) {
      console.error('Error fetching complaints:', error);
      throw error;
    }
  }

  // Get single complaint by ID
  async getComplaintById(id) {
    try {
      const { data } = await apiClient.get(`/complaints/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching complaint:', error);
      throw error;
    }
  }

  // Create new complaint
  async createComplaint(complaintData) {
    try {
      const { data } = await apiClient.post('/complaints', complaintData);
      return data;
    } catch (error) {
      console.error('Error creating complaint:', error);
      throw error;
    }
  }

  // Update complaint
  async updateComplaint(id, updateData) {
    try {
      const { data } = await apiClient.put(`/complaints/${id}`, updateData);
      return data;
    } catch (error) {
      console.error('Error updating complaint:', error);
      throw error;
    }
  }

  // Update complaint status
  async updateComplaintStatus(id, status) {
    try {
      const { data } = await apiClient.patch(`/complaints/${id}/status`, { status });
      return data;
    } catch (error) {
      console.error('Error updating complaint status:', error);
      throw error;
    }
  }

  // Delete complaint
  async deleteComplaint(id) {
    try {
      const { data } = await apiClient.delete(`/complaints/${id}`);
      return data;
    } catch (error) {
      console.error('Error deleting complaint:', error);
      throw error;
    }
  }

  // Upload documents for complaint
  async uploadDocuments(complaintId, files) {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('documents', file);
      });

      const { data } = await apiClient.post(
        `/complaints/${complaintId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error;
    }
  }
}

export default new ComplaintService();
