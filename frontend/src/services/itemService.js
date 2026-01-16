import apiClient from '../api/apiClient';

class ItemService {
  // Get all items
  async getItems(searchQuery = '') {
    try {
      const { data } = await apiClient.get('/items', {
        params: { search: searchQuery },
      });
      return data;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  }

  // Get item by code
  async getItemByCode(code) {
    try {
      const { data } = await apiClient.get(`/items/${code}`);
      return data;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  }

  // Search items by code or name
  async searchItems(query) {
    try {
      const { data } = await apiClient.get('/items/search', {
        params: { query },
      });
      return data;
    } catch (error) {
      console.error('Error searching items:', error);
      throw error;
    }
  }
}

export default new ItemService();
