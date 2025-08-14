import { api } from '../common/api/apiCore';

export interface Zone {
  zoneid: number;
  zonename: string;
  zonecode: string;
  districtid: number;
  description?: string;
  status: number;
  created_date: string;
  updated_date?: string;
  district_name?: string;
  state_name?: string;
  country_name?: string;
}

export interface CreateZoneData {
  zonename: string;
  zonecode: string;
  districtid: number;
  description?: string;
}

export interface UpdateZoneData {
  zonename: string;
  zonecode: string;
  districtid: number;
  description?: string;
}

// Get all zones
export const getAllZones = async (): Promise<Zone[]> => {
  const response = await api.get('/zones');
  return response.data;
};

// Get zones by district
export const getZonesByDistrict = async (districtId: string): Promise<Zone[]> => {
  const response = await api.get(`/zones/by-district/${districtId}`);
  return response.data;
};

// Get zone by ID
export const getZoneById = async (id: string): Promise<Zone> => {
  const response = await api.get(`/zones/${id}`);
  return response.data;
};

// Create new zone
export const createZone = async (data: CreateZoneData): Promise<any> => {
  const response = await api.post('/zones', data);
  return response.data;
};

// Update zone
export const updateZone = async (id: string, data: UpdateZoneData): Promise<any> => {
  const response = await api.put(`/zones/${id}`, data);
  return response.data;
};

// Delete zone
export const deleteZone = async (id: string): Promise<any> => {
  const response = await api.delete(`/zones/${id}`);
  return response.data;
};
