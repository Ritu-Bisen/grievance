import apiClient from '../api/apiClient';

class FacilityService {
  // Get all facilities
  async getFacilities(searchQuery = '') {
    try {
      const { data } = await apiClient.get('/facilities', {
        params: { search: searchQuery },
      });
      return data;
    } catch (error) {
      console.error('Error fetching facilities:', error);
      throw error;
    }
  }

  // Get facility by ID
  async getFacilityById(id) {
    try {
      const { data } = await apiClient.get(`/facilities/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching facility:', error);
      throw error;
    }
  }

  // Search facilities by name
  async searchFacilities(name) {
    try {
      const { data } = await apiClient.get('/facilities/search', {
        params: { name },
      });
      return data;
    } catch (error) {
      console.error('Error searching facilities:', error);
      throw error;
    }
  }
}

export default new FacilityService();
