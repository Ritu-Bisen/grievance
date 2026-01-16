import apiClient from '../api/apiClient';

class BatchService {
  // Get all batches
  async getBatches(itemCode = '') {
    try {
      const { data } = await apiClient.get('/batches', {
        params: { itemCode },
      });
      return data;
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }
  }

  // Get batch by batch number
  async getBatchByNumber(batchNo) {
    try {
      const { data } = await apiClient.get(`/batches/${batchNo}`);
      return data;
    } catch (error) {
      console.error('Error fetching batch:', error);
      throw error;
    }
  }

  // Search batches
  async searchBatches(query) {
    try {
      const { data } = await apiClient.get('/batches/search', {
        params: { query },
      });
      return data;
    } catch (error) {
      console.error('Error searching batches:', error);
      throw error;
    }
  }

  // Get batches by item code
  async getBatchesByItem(itemCode) {
    try {
      const { data } = await apiClient.get(`/batches/item/${itemCode}`);
      return data;
    } catch (error) {
      console.error('Error fetching batches for item:', error);
      throw error;
    }
  }
}

export default new BatchService();
