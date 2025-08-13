import { APICore } from '../common/api/apiCore';

const apiCore = new APICore();
const HOTEL_MASTER_API = '/hotel-masters';

export interface HotelMaster {
  ldg_hotelid: number;
  hotel_name: string;
  marketid?: number;
  short_name?: string;
  phone?: string;
  email?: string;
  fssai_no?: string;
  trn_gstno?: string;
  panno?: string;
  website?: string;
  address?: string;
  stateid?: number;
  hoteltypeid?: number;
  ldg_HotelType?: string;
  ldg_Shop_Act_Number?: string;
  status: number;
  created_by_id?: number;
  created_date?: string;
  updated_by_id?: number;
  updated_date?: string;
  Masteruserid?: number;
  ldg_market_name?: string;
  hotel_type_name?: string;
}

export interface CreateHotelMasterRequest {
  hotel_name: string;
  marketid?: number;
  short_name?: string;
  phone?: string;
  email?: string;
  password?: string;
  fssai_no?: string;
  trn_gstno?: string;
  panno?: string;
  website?: string;
  address?: string;
  stateid?: number;
  hoteltypeid?: number;
  ldg_HotelType?: string;
  ldg_Shop_Act_Number?: string;
  Masteruserid?: number;
}

export interface UpdateHotelMasterRequest {
  hotel_name: string;
  marketid?: number;
  short_name?: string;
  phone?: string;
  email?: string;
  fssai_no?: string;
  trn_gstno?: string;
  panno?: string;
  website?: string;
  address?: string;
  stateid?: number;
  hoteltypeid?: number;
  ldg_HotelType?: string;
  ldg_Shop_Act_Number?: string;
  status?: number;
  Masteruserid?: number;
}

// Get all hotels
export const getAllHotels = async (): Promise<HotelMaster[]> => {
  try {
    const response = await apiCore.get(HOTEL_MASTER_API);
    return response.data;
  } catch (error) {
    console.error('Error fetching hotels:', error);
    throw error;
  }
};

// Get hotel by ID
export const getHotelById = async (id: number): Promise<HotelMaster> => {
  try {
    const response = await apiCore.get(`${HOTEL_MASTER_API}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching hotel:', error);
    throw error;
  }
};

// Create new hotel
export const createHotel = async (data: CreateHotelMasterRequest): Promise<HotelMaster> => {
  try {
    const response = await apiCore.create(HOTEL_MASTER_API, data);
    return response.data.hotel; // The backend returns { hotel: {...}, message: "...", ... }
  } catch (error) {
    console.error('Error creating hotel:', error);
    throw error;
  }
};

// Update hotel
export const updateHotel = async (id: number, data: UpdateHotelMasterRequest): Promise<void> => {
  try {
    await apiCore.update(`${HOTEL_MASTER_API}/${id}`, data);
  } catch (error) {
    console.error('Error updating hotel:', error);
    throw error;
  }
};

// Delete hotel
export const deleteHotel = async (id: number): Promise<void> => {
  try {
    console.log('Attempting to delete hotel with ID:', id);
    const response = await apiCore.delete(`${HOTEL_MASTER_API}/${id}`);
    console.log('Delete response:', response);
  } catch (error) {
    console.error('Error deleting hotel:', error);
    throw error;
  }
};

// Toggle hotel block status
export const toggleHotelBlock = async (id: number): Promise<any> => {
  try {
    console.log('Toggling block for hotel ID:', id);
    const response = await apiCore.updatePatch(`${HOTEL_MASTER_API}/${id}/toggle-block`, {});
    console.log('Toggle block response:', response);
    return response.data;
  } catch (error) {
    console.error('Error toggling hotel block:', error);
    throw error;
  }
}; 