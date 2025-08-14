import { APICore, refreshAuthorization } from '../common/api/apiCore';

const apiCore = new APICore();
const FLOOR_API = '/floors';
const HOTEL_API = '/hotel-masters';

// Debug function to check authentication status
export const checkAuthStatus = () => {
  const token = localStorage.getItem('authToken');
  const user = apiCore.getLoggedInUser();
  console.log('🔐 Auth Status Check:');
  console.log('  - Token in localStorage:', token ? 'Found' : 'Not found');
  console.log('  - User from session:', user ? 'Found' : 'Not found');
  console.log('  - Is authenticated:', apiCore.isUserAuthenticated());
  if (token) {
    console.log('  - Token preview:', token.substring(0, 20) + '...');
  }
  return { token: !!token, user: !!user, authenticated: apiCore.isUserAuthenticated() };
};

// Interfaces
export interface Floor {
  floorid: number;
  floor_name: string;
  display_name: string;
  status: number;
  Created_by_id?: number;
  created_date?: string;
  Updated_by_id?: number;
  Updated_date?: string;
  Hotel_id?: number;
}

export interface CreateFloorRequest {
  floor_name: string;
  display_name: string;
  Hotel_id?: number;
  status?: number;
}

export interface UpdateFloorRequest {
  floor_name: string;
  display_name: string;
  Hotel_id?: number;
  status?: number;
}

// Get all floors
export const getAllFloors = async (): Promise<Floor[]> => {
  try {
    const response = await apiCore.get(FLOOR_API);
    return response.data;
  } catch (error) {
    console.error('Error fetching floors:', error);
    throw error;
  }
};

// Get floors for current user's hotel
export const getMyFloors = async (): Promise<Floor[]> => {
  try {
    console.log('Fetching floors for current user...');
    const response = await apiCore.get(`${FLOOR_API}/my-floors`);
    console.log('My floors response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching my floors:', error);
    throw error;
  }
};

// Create new floor
export const createFloor = async (data: CreateFloorRequest): Promise<Floor> => {
  try {
    // Ensure authorization is refreshed before making the request
    refreshAuthorization();
    console.log('Creating floor with data:', data);
    const response = await apiCore.create(FLOOR_API, data);
    return response.data;
  } catch (error) {
    console.error('Error creating floor:', error);
    throw error;
  }
};

// Update floor
export const updateFloor = async (id: number, data: UpdateFloorRequest): Promise<void> => {
  try {
    // Ensure authorization is refreshed before making the request
    refreshAuthorization();
    await apiCore.update(`${FLOOR_API}/${id}`, data);
  } catch (error) {
    console.error('Error updating floor:', error);
    throw error;
  }
};

// Delete floor
export const deleteFloor = async (id: number): Promise<void> => {
  try {
    // Ensure authorization is refreshed before making the request
    refreshAuthorization();
    await apiCore.delete(`${FLOOR_API}/${id}`);
  } catch (error) {
    console.error('Error deleting floor:', error);
    throw error;
  }
};

// Get current hotel information
export const getCurrentHotel = () => {
  const user = apiCore.getLoggedInUser();
  console.log('Current user from service:', user);
  
  if (user && user.name && user.id) {
    return {
      id: user.id,
      name: user.name,
      email: user.email || ''
    };
  }
  
  return null;
};

// Get all hotels
export const getAllHotels = async () => {
  try {
    const response = await apiCore.get(HOTEL_API);
    return response.data;
  } catch (error) {
    console.error('Error fetching hotels:', error);
    throw error;
  }
}; 