// src/utils/masterFetchers.ts

import { toast } from 'react-toastify';


export interface CountryItem {
  countryid: number;
  country_name: string;
  country_code: string;
  status: number | string;

  
}
export interface StateItem {
  
  stateid: number;
  state_name: string;
  status: number | string;

  
} 

export interface DistrictItem {
  districtid: number;
  district_name: string;
  stateid: number;
  status: number | string;
}
export interface CityItem {
  cityid: number;
  city_name: string;
  stateid: number;
    status: number | string;
}

export interface BlockItem{
  blockid: number;
  block_name: string;
  status: number | string;

}

export interface FloorItem{
  floorid: number;
  floor_name: string;
   status: number | string
}




export interface CompanyItem {
  company_id: number;
  name: string;
  discount_percent?: number;
  is_credit_allow?: number;
  is_discount?: string;
}

 export interface FeatureItem {
  featureid: number;
  feature_name: string;
  status: number | string;
  }

export interface HotelItem {
  hotelid: number;
  hotel_name: string;
  status: number | string;
}


export const fetchStates = async (
  setStates: (data: StateItem[]) => void,
  setstateid: (id: number) => void,
  currentStateId?: number
) => {
  try {
    const res = await fetch('http://localhost:3001/api/states');
    const data: StateItem[] = await res.json();
    setStates(data);
    if (data.length > 0 && !currentStateId) {
      setstateid(data[0].stateid);
    }
  } catch (err) {
    toast.error('Failed to fetch states');
    console.error('Fetch states error:', err);
  }
};

export const fetchDistricts = async (
  setDistricts: (data: DistrictItem[]) => void,
  setDistrictId?: (id: number) => void,
  currentDistrictId?: number
) => {
  try {
    const res = await fetch('http://localhost:3001/api/districts');
    const data: DistrictItem[] = await res.json();
    setDistricts(data);
    if (data.length > 0 && !currentDistrictId && setDistrictId) {
      setDistrictId(data[0].districtid);
    }
  } catch (err) {
    toast.error('Failed to fetch districts');
    console.error('Fetch districts error:', err);
  }
};

export const fetchDistrictsByState = async (stateId: number): Promise<DistrictItem[]> => {
  try {
    const res = await fetch(`http://localhost:3001/api/districts/by-state/${stateId}`);
    const data: DistrictItem[] = await res.json();
    return data;
  } catch (err) {
    toast.error('Failed to fetch districts');
    console.error('Fetch districts error:', err);
    return [];
  }
};

export const fetchStatesByCountry = async (countryId: number): Promise<StateItem[]> => {
  try {
    const res = await fetch(`http://localhost:3001/api/states/country/${countryId}`);
    const data: StateItem[] = await res.json();
    return data;
  } catch (err) {
    toast.error('Failed to fetch states');
    console.error('Fetch states error:', err);
    return [];
  }
};

export const fetchCitiesByState = async (stateId: number): Promise<CityItem[]> => {
  try {
    const res = await fetch(`http://localhost:3001/api/city-masters/by-state/${stateId}`);
    const data: CityItem[] = await res.json();
    return data;
  } catch (err) {
    console.error('Fetch cities error:', err);
    return [];
  }
};



export const fetchCities = async (
  setCityItems: (data: CityItem[]) => void,
  setCityId?: (id: number) => void
) => {
  try {
    const res = await fetch('http://localhost:3001/api/city-masters');
    const data: CityItem[] = await res.json();
    setCityItems(data);
    if (data.length > 0 && setCityId) {
      setCityId(data[0].cityid);
    }
  } catch (err) {
    toast.error('Failed to fetch cities');
    console.error('Fetch cities error:', err);
  }
};

export const fetchCountries = async (
  setCountryItems: (data: CountryItem[]) => void,
  setFilteredCountries?: (data: CountryItem[]) => void,
  setLoading?: (loading: boolean) => void
) => {
  try {
    setLoading?.(true);
    const res = await fetch('http://localhost:3001/api/countries');
    const data: CountryItem[] = await res.json();
    setCountryItems(data);
    setFilteredCountries?.(data);
  } catch (err) {
    toast.error('Failed to fetch countries');
    console.error('Fetch countries error:', err);
  } finally {
    setLoading?.(false);
  }
};

export const fetchCountriesList = async (): Promise<CountryItem[]> => {
  try {
    const res = await fetch('http://localhost:3001/api/countries');
    const data: CountryItem[] = await res.json();
    return data;
  } catch (err) {
    toast.error('Failed to fetch countries');
    console.error('Fetch countries error:', err);
    return [];
  }
};






export const fetchBlocks = async (
  setBlocks: (data: BlockItem[]) => void,
  setblockid: (id: number) => void,
  currentBlockId?: number
) => {
  try {
    const res = await fetch('http://localhost:3001/api/blocks');
    const data: BlockItem[] = await res.json();
    setBlocks(data);
    if (data.length > 0 && !currentBlockId) {
      setblockid(data[0].blockid);
    }
  } catch (err) {
    toast.error('Failed to fetch blocks');
    console.error('Fetch states error:', err);
  }
};


export const fetchFloors = async (
  setFloors: (data: FloorItem[]) => void,
  setfloorid: (id: number) => void,
  currentFloorId?: number
) => {
  try {
    const res = await fetch('http://localhost:3001/api/floors');
    const data: FloorItem[] = await res.json();
    setFloors(data);
    if (data.length > 0 && !currentFloorId) {
      setfloorid(data[0].floorid);
    }
  } catch (err) {
    toast.error('Failed to fetch floors');
    console.error('Fetch states error:', err);
  }
};


export const fetchCompanies = async (
  setCompanies: (data: CompanyItem[]) => void,
  setCompanyId: (id: number) => void,
  currentCompanyId?: number
) => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch('http://localhost:3001/api/company-masters', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const data: CompanyItem[] = await res.json();
    setCompanies(data);
    if (data.length > 0 && !currentCompanyId) {
      setCompanyId(data[0].company_id);
    }
  } catch (err) {
    toast.error('Failed to fetch companies');
    console.error('Fetch companies error:', err);
  }
};

// Standalone function for fetching companies
export const fetchCompaniesList = async (): Promise<CompanyItem[]> => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch('http://localhost:3001/api/company-masters', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const data: CompanyItem[] = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Fetch companies error:', err);
    return [];
  }
};


export const fetchFeatures = async (
  setFeatures: (data: FeatureItem[]) => void,
  setFeatureId: (id: number) => void,
  currentFeatureId?: number
) => {
  try {
    const res = await fetch('http://localhost:3001/api/features');
    const data: FeatureItem[] = await res.json();
    setFeatures(data);
    if (data.length > 0 && !currentFeatureId) {
      setFeatureId(data[0].featureid);
    }
  } catch (err) {
    toast.error('Failed to fetch features');
    console.error('Fetch features error:', err);
  }
};

export const fetchHotels = async (): Promise<HotelItem[]> => {
  try {
    const res = await fetch('http://localhost:3001/api/hotels');
    const raw = await res.json();
    const data: HotelItem[] = (raw || []).map((h: any) => ({
      hotelid: h.id ?? h.ldg_hotelid ?? h.hotelid,
      hotel_name: h.hotel_name ?? h.ldg_hotel_name ?? h.name,
      status: h.status ?? 1,
    }));
    return data;
  } catch (err) {
    toast.error('Failed to fetch hotels');
    console.error('Fetch hotels error:', err);
    return [];
  }
};

export const fetchCurrentUserHotel = async (): Promise<HotelItem[]> => {
  try {
    // Get the current user's hotel from localStorage or context
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('No auth token found');
      return [];
    }

    // Decode the token to get user info
    const tokenData = JSON.parse(atob(authToken.split('.')[1]));
    const userId = tokenData.id;
    const userRole = tokenData.role;

    // If user is hotel role, fetch only their hotel
    if (userRole === 'hotel') {
      const res = await fetch(`http://localhost:3001/api/hotels/user/${userId}`);
      const raw = await res.json();
      const data: HotelItem[] = (raw || []).map((h: any) => ({
        hotelid: h.id ?? h.ldg_hotelid ?? h.hotelid,
        hotel_name: h.hotel_name ?? h.ldg_hotel_name ?? h.name,
        status: h.status ?? 1,
      }));
      return data;
    } else {
      // For other roles, fetch all hotels
      const res = await fetch('http://localhost:3001/api/hotels');
      const raw = await res.json();
      const data: HotelItem[] = (raw || []).map((h: any) => ({
        hotelid: h.id ?? h.ldg_hotelid ?? h.hotelid,
        hotel_name: h.hotel_name ?? h.ldg_hotel_name ?? h.name,
        status: h.status ?? 1,
      }));
      return data;
    }
  } catch (err) {
    toast.error('Failed to fetch hotel');
    console.error('Fetch hotel error:', err);
    return [];
  }
};

