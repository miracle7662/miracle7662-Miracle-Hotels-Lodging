import { APICore } from '../common/api/apiCore';

const apiCore = new APICore();

export interface Newspaper {
  newsid: number;
  paper_name: string;
  status: number;
  hotelid?: number;
  ldg_hotel_name?: string;
  created_by_id?: number;
  created_date?: string;
  updated_by_id?: number;
  updated_date?: string;
}

export interface CreateNewspaperRequest {
  paper_name: string;
  hotelid?: number;
  status?: number;
}

export interface UpdateNewspaperRequest {
  paper_name: string;
  hotelid?: number;
  status?: number;
}

// Get all newspapers
export const getAllNewspapers = async (hotelid?: number): Promise<Newspaper[]> => {
  const params = hotelid ? { hotelid } : {};
  const response = await apiCore.get('/newspapers', params);
  return response.data.data;
};

// Get newspaper by ID
export const getNewspaperById = async (id: number): Promise<Newspaper> => {
  const response = await apiCore.get(`/newspapers/${id}`, {});
  return response.data.data;
};

// Create new newspaper
export const createNewspaper = async (data: CreateNewspaperRequest): Promise<Newspaper> => {
  console.log('🔍 createNewspaper - Starting API call');
  console.log('🔍 createNewspaper - Data to send:', data);
  
  // Check if token exists
  const token = localStorage.getItem('authToken');
  console.log('🔍 createNewspaper - Token exists:', !!token);
  if (token) {
    console.log('🔍 createNewspaper - Token preview:', token.substring(0, 20) + '...');
  }
  
  try {
    const response = await apiCore.create('/newspapers', data);
    console.log('🔍 createNewspaper - API call successful:', response);
    return response.data.data;
  } catch (error) {
    console.error('🔍 createNewspaper - API call failed:', error);
    throw error;
  }
};

// Update newspaper
export const updateNewspaper = async (id: number, data: UpdateNewspaperRequest): Promise<void> => {
  await apiCore.update(`/newspapers/${id}`, data);
};

// Delete newspaper
export const deleteNewspaper = async (id: number): Promise<void> => {
  await apiCore.delete(`/newspapers/${id}`);
}; 