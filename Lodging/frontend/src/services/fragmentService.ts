import { APICore } from '../common/api/apiCore';

const apiCore = new APICore();

export interface Fragment {
  fragmentid: number;
  fragment_name: string;
  status: number;
  created_by_id?: number;
  created_date?: string;
  updated_by_id?: number;
  updated_date?: string;
  hotelid?: number;
  ldg_hotel_name?: string;
}

export interface CreateFragmentRequest {
  fragment_name: string;
  status?: number;
  hotelid?: number;
}

export interface UpdateFragmentRequest {
  fragment_name: string;
  status?: number;
}

// Get all fragments
export const getFragments = async (): Promise<Fragment[]> => {
  try {
    const response = await apiCore.get('/fragments');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching fragments:', error);
    throw error;
  }
};

// Get fragment by ID
export const getFragmentById = async (id: number): Promise<Fragment> => {
  try {
    const response = await apiCore.get(`/fragments/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching fragment:', error);
    throw error;
  }
};

// Create new fragment
export const createFragment = async (data: CreateFragmentRequest): Promise<Fragment> => {
  try {
    const response = await apiCore.create('/fragments', data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating fragment:', error);
    throw error;
  }
};

// Update fragment
export const updateFragment = async (id: number, data: UpdateFragmentRequest): Promise<void> => {
  try {
    await apiCore.update(`/fragments/${id}`, data);
  } catch (error) {
    console.error('Error updating fragment:', error);
    throw error;
  }
};

// Delete fragment
export const deleteFragment = async (id: number): Promise<void> => {
  try {
    await apiCore.delete(`/fragments/${id}`);
  } catch (error) {
    console.error('Error deleting fragment:', error);
    throw error;
  }
}; 