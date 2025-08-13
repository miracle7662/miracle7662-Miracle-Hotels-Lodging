import { APICore } from '../common/api/apiCore';

const apiCore = new APICore();
const MARKET_API = '/markets';

export interface Market {
  ldg_marketid: number;
  ldg_market_name: string;
  ldg_status: number;
  ldg_created_by_id?: number;
  ldg_created_date?: string;
  ldg_updated_by_id?: number;
  ldg_updated_date?: string;
}

export interface CreateMarketRequest {
  ldg_market_name: string;
}

export interface UpdateMarketRequest {
  ldg_market_name: string;
  ldg_status?: number;
}

// Get all markets
export const getAllMarkets = async (): Promise<Market[]> => {
  try {
    const response = await apiCore.get(MARKET_API);
    return response.data;
  } catch (error) {
    console.error('Error fetching markets:', error);
    throw error;
  }
};

// Get market by ID
export const getMarketById = async (id: number): Promise<Market> => {
  try {
    const response = await apiCore.get(`${MARKET_API}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching market:', error);
    throw error;
  }
};

// Create new market
export const createMarket = async (data: CreateMarketRequest): Promise<Market> => {
  try {
    const response = await apiCore.create(MARKET_API, data);
    return response.data.market;
  } catch (error) {
    console.error('Error creating market:', error);
    throw error;
  }
};

// Update market
export const updateMarket = async (id: number, data: UpdateMarketRequest): Promise<void> => {
  try {
    await apiCore.update(`${MARKET_API}/${id}`, data);
  } catch (error) {
    console.error('Error updating market:', error);
    throw error;
  }
};

// Delete market
export const deleteMarket = async (id: number): Promise<void> => {
  try {
    await apiCore.delete(`${MARKET_API}/${id}`);
  } catch (error) {
    console.error('Error deleting market:', error);
    throw error;
  }
}; 