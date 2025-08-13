import { APICore } from '../common/api/apiCore';

const apiCore = new APICore();

export interface Nationality {
  nationalityid: number;
  nationality: string;
  status: number;
  hotelid?: number;
  ldg_hotel_name?: string;
  Created_by_id?: number;
  created_date?: string;
  Updated_by_id?: number;
  Updated_date?: string;
}

export interface CreateNationalityRequest {
  nationality: string;
  hotelid?: number;
  status?: number;
}

export interface UpdateNationalityRequest {
  nationality: string;
  hotelid?: number;
  status?: number;
}

// Get all nationalities
export const getAllNationalities = async (hotelid?: number): Promise<Nationality[]> => {
  const params = hotelid ? { hotelid } : {};
  const response = await apiCore.get('/nationalities', params);
  return response.data.data;
};

// Get nationality by ID
export const getNationalityById = async (id: number): Promise<Nationality> => {
  const response = await apiCore.get(`/nationalities/${id}`, {});
  return response.data.data;
};

// Create new nationality
export const createNationality = async (data: CreateNationalityRequest): Promise<Nationality> => {
  console.log('🔍 createNationality - Starting API call');
  console.log('🔍 createNationality - Data to send:', data);
  
  // Check if token exists
  const token = localStorage.getItem('authToken');
  console.log('🔍 createNationality - Token exists:', !!token);
  if (token) {
    console.log('🔍 createNationality - Token preview:', token.substring(0, 20) + '...');
  }
  
  try {
    const response = await apiCore.create('/nationalities', data);
    console.log('🔍 createNationality - API call successful:', response);
    return response.data.data;
  } catch (error) {
    console.error('🔍 createNationality - API call failed:', error);
    throw error;
  }
};

// Update nationality
export const updateNationality = async (id: number, data: UpdateNationalityRequest): Promise<void> => {
  await apiCore.update(`/nationalities/${id}`, data);
};

// Delete nationality
export const deleteNationality = async (id: number): Promise<void> => {
  await apiCore.delete(`/nationalities/${id}`);
}; 