import { APICore } from '../common/api/apiCore';

const apiCore = new APICore();

export interface GuestType {
  guesttypeid: number;
  guest_type: string;
  status: number;
  created_by_id: number;
  created_date: string;
  updated_by_id?: number;
  updated_date?: string;
  hotelid: number;
  ldg_hotel_name?: string;
}

export interface CreateGuestTypeRequest {
  guest_type: string;
  hotelid?: number;
  status?: number;
}

export interface UpdateGuestTypeRequest {
  guest_type: string;
  hotelid?: number;
  status?: number;
}

// Get all guest types
export const getAllGuestTypes = async (hotelid?: number): Promise<GuestType[]> => {
  const params = hotelid ? { hotelid } : {};
  const response = await apiCore.get('/guest-types', params);
  return response.data.data;
};

// Get guest type by ID
export const getGuestTypeById = async (id: number): Promise<GuestType> => {
  const response = await apiCore.get(`/guest-types/${id}`, {});
  return response.data.data;
};

// Create new guest type
export const createGuestType = async (data: CreateGuestTypeRequest): Promise<GuestType> => {
  const response = await apiCore.create('/guest-types', data);
  return response.data.data;
};

// Update guest type
export const updateGuestType = async (id: number, data: UpdateGuestTypeRequest): Promise<void> => {
  await apiCore.update(`/guest-types/${id}`, data);
};

// Delete guest type
export const deleteGuestType = async (id: number): Promise<void> => {
  await apiCore.delete(`/guest-types/${id}`);
}; 