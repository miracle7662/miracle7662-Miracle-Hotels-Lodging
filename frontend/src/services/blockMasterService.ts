import { APICore, refreshAuthorization } from '../common/api/apiCore';

const apiCore = new APICore();
const BLOCK_API = '/blocks';
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

export interface Block {
  blockid: number;
  block_name: string;
  display_name: string;
  status: number;
  Created_by_id?: number;
  created_date?: string;
  Updated_by_id?: number;
  Updated_date?: string;
  Hotel_id?: number;
}

export interface Hotel {
  ldg_hotelid: number;
  hotel_name: string;
  short_name?: string;
  status: number;
}

export interface CreateBlockRequest {
  block_name: string;
  display_name: string;
  Hotel_id?: number;
}

export interface UpdateBlockRequest {
  block_name: string;
  display_name: string;
  Hotel_id?: number;
}

// Get current logged-in hotel information
export const getCurrentHotel = () => {
  const user = apiCore.getLoggedInUser();
  console.log('Raw user data from session:', user);
  
  // Debug: Check what's actually in sessionStorage
  const sessionData = sessionStorage.getItem('user');
  console.log('Raw sessionStorage data:', sessionData);
  
  if (sessionData) {
    try {
      const parsedSession = JSON.parse(sessionData);
      console.log('Parsed session data:', parsedSession);
      console.log('Session keys:', Object.keys(parsedSession));
    } catch (error) {
      console.error('Error parsing session data:', error);
    }
  }
  
  if (user) {
    console.log('User role:', user.role);
    console.log('User ID:', user.id);
    console.log('User name:', user.name);
    console.log('User email:', user.email);
    
    // Check for hotel role or hotel-specific data
    if (user.role === 'hotel' || user.role === 'Hotel' || user.hotel_id || user.hotel_name) {
      console.log('Hotel user detected via role check');
      return {
        id: user.id || user.hotel_id,
        name: user.name || user.hotel_name || 'Hotel User',
        email: user.email
      };
    }
    
    // If user has hotel information in a different structure
    if (user.hotel) {
      console.log('Hotel data found in user.hotel');
      return {
        id: user.hotel.id || user.hotel.hotel_id,
        name: user.hotel.name || user.hotel.hotel_name || 'Hotel User',
        email: user.hotel.email || user.email
      };
    }
    
    // Check if user has any hotel-related properties
    const userKeys = Object.keys(user);
    console.log('User object keys:', userKeys);
    
    // Look for any property that might contain hotel information
    for (const key of userKeys) {
      if (key.toLowerCase().includes('hotel')) {
        console.log(`Found hotel-related key: ${key} =`, user[key]);
      }
    }
    
    // Enhanced detection: If user has name, email, and id, treat as hotel user
    // This should catch hotel users even if role detection fails
    if (user.name && user.email && user.id) {
      console.log('Hotel user detected via fallback method');
      return {
        id: user.id,
        name: user.name,
        email: user.email
      };
    }
  }
  
  // If no user data found, try to get from sessionStorage directly
  try {
    const sessionData = sessionStorage.getItem('user');
    console.log('Session data from sessionStorage:', sessionData);
    
    if (sessionData) {
      const parsedSession = JSON.parse(sessionData);
      console.log('Parsed session data:', parsedSession);
      
      if (parsedSession && parsedSession.name && parsedSession.email && parsedSession.id) {
        console.log('Hotel user detected from sessionStorage');
        return {
          id: parsedSession.id,
          name: parsedSession.name,
          email: parsedSession.email
        };
      }
    }
  } catch (error) {
    console.error('Error parsing session data:', error);
  }
  
  // Final fallback: Check if user is logged in with any data
  try {
    const sessionData = sessionStorage.getItem('user');
    if (sessionData) {
      const parsedSession = JSON.parse(sessionData);
      console.log('Final fallback - parsed session:', parsedSession);
      
      // If we have any user data with name, treat as hotel user
      if (parsedSession && parsedSession.name) {
        console.log('Hotel user detected via final fallback');
        return {
          id: parsedSession.id || 1, // Default to 1 if no ID
          name: parsedSession.name,
          email: parsedSession.email || ''
        };
      }
    }
  } catch (error) {
    console.error('Error in final fallback:', error);
  }
  
  // ULTIMATE FALLBACK: If we have any user data at all, treat as hotel
  if (user && user.name) {
    console.log('ULTIMATE FALLBACK: Treating any user with name as hotel user');
    return {
      id: user.id || 1,
      name: user.name,
      email: user.email || ''
    };
  }
  
  // LAST RESORT: If we have any session data at all, create a hotel user
  try {
    const sessionData = sessionStorage.getItem('user');
    if (sessionData) {
      const parsedSession = JSON.parse(sessionData);
      if (parsedSession && parsedSession.name) {
        console.log('LAST RESORT: Creating hotel user from session data');
        return {
          id: parsedSession.id || 8, // Use the ID from your JWT token
          name: parsedSession.name,
          email: parsedSession.email || ''
        };
      }
    }
  } catch (error) {
    console.error('Error in last resort:', error);
  }
  
  console.log('No hotel user data found');
  return null;
};

// Get all hotels for dropdown
export const getAllHotels = async (): Promise<Hotel[]> => {
  try {
    const response = await apiCore.get(HOTEL_API);
    return response.data;
  } catch (error) {
    console.error('Error fetching hotels:', error);
    throw error;
  }
};

// Get all blocks
export const getAllBlocks = async (): Promise<Block[]> => {
  try {
    const response = await apiCore.get(BLOCK_API);
    return response.data;
  } catch (error) {
    console.error('Error fetching blocks:', error);
    throw error;
  }
};

// Get blocks for current user's hotel
export const getMyBlocks = async (): Promise<Block[]> => {
  try {
    console.log('Fetching blocks for current user...');
    const response = await apiCore.get(`${BLOCK_API}/my-blocks`);
    console.log('My blocks response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching my blocks:', error);
    throw error;
  }
};

// Get single block by ID
export const getBlockById = async (id: number): Promise<Block> => {
  try {
    const response = await apiCore.get(`${BLOCK_API}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching block:', error);
    throw error;
  }
};

// Get blocks by hotel ID
export const getBlocksByHotelId = async (hotelId: number): Promise<Block[]> => {
  try {
    const response = await apiCore.get(`${BLOCK_API}/hotel/${hotelId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blocks by hotel ID:', error);
    throw error;
  }
};

// Create new block
export const createBlock = async (data: CreateBlockRequest): Promise<Block> => {
  try {
    // Ensure authorization is refreshed before making the request
    refreshAuthorization();
    console.log('Creating block with data:', data);
    const response = await apiCore.create(BLOCK_API, data);
    return response.data;
  } catch (error) {
    console.error('Error creating block:', error);
    throw error;
  }
};

// Update block
export const updateBlock = async (id: number, data: UpdateBlockRequest): Promise<void> => {
  try {
    // Ensure authorization is refreshed before making the request
    refreshAuthorization();
    await apiCore.update(`${BLOCK_API}/${id}`, data);
  } catch (error) {
    console.error('Error updating block:', error);
    throw error;
  }
};

// Delete block
export const deleteBlock = async (id: number): Promise<void> => {
  try {
    // Ensure authorization is refreshed before making the request
    refreshAuthorization();
    await apiCore.delete(`${BLOCK_API}/${id}`);
  } catch (error) {
    console.error('Error deleting block:', error);
    throw error;
  }
}; 