import { APICore } from '@/common/api/apiCore';

const apiCore = new APICore();

export interface CityMaster {
  cityid?: number;
  countryid: number;
  stateid: number;
  districtid: number;
  cityname: string;
  status?: number;
  created_by_id?: number;
  created_date?: string;
  updated_by_id?: number;
  updated_date?: string;
  country_name?: string;
  state_name?: string;
  district_name?: string;
}

export interface CreateCityMasterRequest {
  countryid: number;
  stateid: number;
  districtid: number;
  cityname: string;
  status?: number;
}

// Get all cities
export const getAllCities = async (): Promise<CityMaster[]> => {
  try {
    const response = await apiCore.get('/city-masters');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

// Get city by ID
export const getCityById = async (id: number): Promise<CityMaster> => {
  try {
    const response = await apiCore.get(`/city-masters/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching city:', error);
    throw error;
  }
};

// Create new city
export const createCity = async (cityData: CreateCityMasterRequest): Promise<any> => {
  try {
    const response = await apiCore.create('/city-masters', cityData);
    return response.data;
  } catch (error) {
    console.error('Error creating city:', error);
    throw error;
  }
};

// Update city
export const updateCity = async (id: number, cityData: CreateCityMasterRequest): Promise<any> => {
  try {
    const response = await apiCore.update(`/city-masters/${id}`, cityData);
    return response.data;
  } catch (error) {
    console.error('Error updating city:', error);
    throw error;
  }
};

// Delete city
export const deleteCity = async (id: number): Promise<any> => {
  try {
    const response = await apiCore.delete(`/city-masters/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting city:', error);
    throw error;
  }
};
