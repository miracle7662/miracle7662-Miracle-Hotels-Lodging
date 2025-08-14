import { APICore } from '../common/api/apiCore';

const apiCore = new APICore();
const STATE_API = '/states';

export interface State {
  stateid: number;
  statename: string;
  statecode: string;
  statecapital?: string;
  countryid: number;
  country_name?: string;
  status: number;
  created_date: string;
  updated_date?: string;
}

export interface CreateStateData {
  statename: string;
  statecode: string;
  statecapital?: string;
  countryid: number;
}

export interface UpdateStateData {
  statename: string;
  statecode: string;
  statecapital?: string;
  countryid: number;
}

export const stateService = {
  // Get all states
  getAll: async (): Promise<State[]> => {
    try {
      const response = await apiCore.get(STATE_API);
      return response.data;
    } catch (error) {
      console.error('Error fetching states:', error);
      throw error;
    }
  },

  // Get states by country
  getByCountry: async (countryId: string): Promise<State[]> => {
    try {
      const response = await apiCore.get(`${STATE_API}/by-country/${countryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching states by country:', error);
      throw error;
    }
  },

  // Get state by ID
  getById: async (id: string): Promise<State> => {
    try {
      const response = await apiCore.get(`${STATE_API}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching state:', error);
      throw error;
    }
  },

  // Create new state
  create: async (data: CreateStateData): Promise<State> => {
    try {
      const response = await apiCore.create(STATE_API, data);
      return response.data;
    } catch (error) {
      console.error('Error creating state:', error);
      throw error;
    }
  },

  // Update state
  update: async (id: string, data: UpdateStateData): Promise<{ message: string }> => {
    try {
      const response = await apiCore.update(`${STATE_API}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating state:', error);
      throw error;
    }
  },

  // Delete state
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await apiCore.delete(`${STATE_API}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting state:', error);
      throw error;
    }
  },
};