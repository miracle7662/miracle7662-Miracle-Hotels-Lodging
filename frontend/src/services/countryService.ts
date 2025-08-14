import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';

export interface Country {
  countryid: number;
  countryname: string;
  countrycode: string;
  countrycapital?: string;
  status: number;
  created_date: string;
  updated_date?: string;
}

export interface CreateCountryData {
  countryname: string;
  countrycode: string;
  countrycapital?: string;
}

export interface UpdateCountryData {
  countryname: string;
  countrycode: string;
  countrycapital?: string;
}

export const countryService = {
  // Get all countries
  getAll: async (): Promise<Country[]> => {
    return apiService.get<Country[]>(API_ENDPOINTS.COUNTRIES.GET_ALL);
  },

  // Get country by ID
  getById: async (id: string): Promise<Country> => {
    return apiService.get<Country>(API_ENDPOINTS.COUNTRIES.GET_BY_ID(id));
  },

  // Create new country
  create: async (data: CreateCountryData): Promise<Country> => {
    return apiService.post<Country>(API_ENDPOINTS.COUNTRIES.CREATE, data);
  },

  // Update country
  update: async (id: string, data: UpdateCountryData): Promise<{ message: string }> => {
    return apiService.put<{ message: string }>(API_ENDPOINTS.COUNTRIES.UPDATE(id), data);
  },

  // Delete country
  delete: async (id: string): Promise<{ message: string }> => {
    return apiService.delete<{ message: string }>(API_ENDPOINTS.COUNTRIES.DELETE(id));
  },
};