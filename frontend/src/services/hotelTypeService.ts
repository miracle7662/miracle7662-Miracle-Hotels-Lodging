import { APICore } from '../common/api/apiCore';

const apiCore = new APICore();
const HOTEL_TYPE_API = '/hotel-types';

export interface HotelType {
  ldg_hoteltypeid: number;
  ldg_hotel_type: string;
  ldg_status: number;
  ldg_created_by_id?: number;
  ldg_created_date?: string;
  ldg_updated_by_id?: number;
  ldg_updated_date?: string;
  ldg_hotelid?: number;
  ldg_marketid?: number;
}

export interface CreateHotelTypeRequest {
  ldg_hotel_type: string;
  ldg_hotelid?: number;
  ldg_marketid?: number;
}

export interface UpdateHotelTypeRequest {
  ldg_hotel_type: string;
  ldg_hotelid?: number;
  ldg_marketid?: number;
}

// Get all hotel types
export const getAllHotelTypes = async (): Promise<HotelType[]> => {
  try {
    const response = await apiCore.get(HOTEL_TYPE_API);
    return response.data;
  } catch (error) {
    console.error('Error fetching hotel types:', error);
    throw error;
  }
};

// Get hotel type by ID
export const getHotelTypeById = async (id: number): Promise<HotelType> => {
  try {
    const response = await apiCore.get(`${HOTEL_TYPE_API}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching hotel type:', error);
    throw error;
  }
};

// Create new hotel type
export const createHotelType = async (data: CreateHotelTypeRequest): Promise<HotelType> => {
  try {
    const response = await apiCore.create(HOTEL_TYPE_API, data);
    return response.data.hotelType;
  } catch (error) {
    console.error('Error creating hotel type:', error);
    throw error;
  }
};

// Update hotel type
export const updateHotelType = async (id: number, data: UpdateHotelTypeRequest): Promise<void> => {
  try {
    await apiCore.update(`${HOTEL_TYPE_API}/${id}`, data);
  } catch (error) {
    console.error('Error updating hotel type:', error);
    throw error;
  }
};

// Delete hotel type
export const deleteHotelType = async (id: number): Promise<void> => {
  try {
    await apiCore.delete(`${HOTEL_TYPE_API}/${id}`);
  } catch (error) {
    console.error('Error deleting hotel type:', error);
    throw error;
  }
}; 