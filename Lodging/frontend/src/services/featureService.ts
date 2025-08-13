import { APICore } from '../common/api/apiCore';

const apiCore = new APICore();

export interface Feature {
  featureid: number;
  feature_name: string;
  feature_Description: string;
  status: number;
  created_by_id?: number;
  created_date?: string;
  updated_by_id?: number;
  updated_date?: string;
  hotelid?: number;
  ldg_hotel_name?: string;
}

export interface CreateFeatureRequest {
  feature_name: string;
  feature_Description: string;
  status?: number;
  hotelid?: number;
}

export interface UpdateFeatureRequest {
  feature_name: string;
  feature_Description: string;
  status?: number;
}

// Get all features
export const getFeatures = async (): Promise<Feature[]> => {
  try {
    const response = await apiCore.get('/features');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching features:', error);
    throw error;
  }
};

// Get feature by ID
export const getFeatureById = async (id: number): Promise<Feature> => {
  try {
    const response = await apiCore.get(`/features/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching feature:', error);
    throw error;
  }
};

// Create new feature
export const createFeature = async (data: CreateFeatureRequest): Promise<Feature> => {
  try {
    const response = await apiCore.create('/features', data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating feature:', error);
    throw error;
  }
};

// Update feature
export const updateFeature = async (id: number, data: UpdateFeatureRequest): Promise<void> => {
  try {
    await apiCore.update(`/features/${id}`, data);
  } catch (error) {
    console.error('Error updating feature:', error);
    throw error;
  }
};

// Delete feature
export const deleteFeature = async (id: number): Promise<void> => {
  try {
    await apiCore.delete(`/features/${id}`);
  } catch (error) {
    console.error('Error deleting feature:', error);
    throw error;
  }
}; 