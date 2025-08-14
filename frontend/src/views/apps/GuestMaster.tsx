import React, { useState, useEffect } from 'react';
import './GuestMaster.css';
import { Button, Card, Stack, Table, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { apiCore } from '@/common/api/apiCore';
import { 
  fetchCurrentUserHotel, 
  fetchCountriesList,
  fetchStatesByCountry,
  fetchCitiesByState,
  fetchCompaniesList,
  HotelItem,
  CountryItem,
  StateItem,
  CityItem,
  CompanyItem
} from '@/utils/commonfunction';

interface GuestMaster {
  guest_id?: number;
  guest_name: string;
  organization: string;
  address: string;
  countryid?: number;
  stateid?: number;
  cityid?: number;
  company_id?: number;
  occupation: string;
  postHeld: string;
  phone1: string;
  phone2: string;
  mobile_no: string;
  office_mail: string;
  personal_mail: string;
  website: string;
  purpose: string;
  arrivalFrom: string;
  departureTo: string;
  guesttypeid?: number;
  gender: string;
  nationalityid?: number;
  birthday: string;
  anniversary: string;
  creditAllowed: number;
  isDiscountAllowed: number;
  discountPercent: string;
  personalInstructions: string;
  adhar_no: string;
  pan_no: string;
  driving_license: string;
  Other?: string;
  discount: string;
  gst_number?: string;
  hotelid?: number;
  status?: number;
  created_by_id?: number;
  created_date?: string;
  updated_by_id?: number;
  updated_date?: string;
  hotel_name?: string;
  company_name?: string;
  country_name?: string;
  state_name?: string;
  city_name?: string;
  guest_type?: string;
  nationality?: string;
}

interface CreateGuestRequest {
  guest_name: string;
  organization: string;
  address: string;
  countryid?: number;
  stateid?: number;
  cityid?: number;
  company_id?: number;
  occupation: string;
  postHeld: string;
  phone1: string;
  phone2: string;
  mobile_no: string;
  office_mail: string;
  personal_mail: string;
  website: string;
  purpose: string;
  arrivalFrom: string;
  departureTo: string;
  guesttypeid?: number;
  gender: string;
  nationalityid?: number;
  birthday: string;
  anniversary: string;
  creditAllowed: number;
  isDiscountAllowed: number;
  discountPercent: string;
  personalInstructions: string;
  adhar_no: string;
  pan_no: string;
  driving_license: string;
  Other?: string;
  discount: string;
  gst_number?: string;
  hotelid?: number;
}

interface GuestTypeItem {
  guesttypeid: number;
  guest_type: string;
  status: number | string;
}

interface NationalityItem {
  nationalityid: number;
  nationality: string;
  status: number | string;
}

const GuestMasterComponent: React.FC = () => {
  const [guests, setGuests] = useState<GuestMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestMaster | null>(null);
  const [currentHotel, setCurrentHotel] = useState<string>('');
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [guestTypes, setGuestTypes] = useState<GuestTypeItem[]>([]);
  const [nationalities, setNationalities] = useState<NationalityItem[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | undefined>();
  const [selectedState, setSelectedState] = useState<number | undefined>();
  
  // Other city modal states
  const [showOtherCityModal, setShowOtherCityModal] = useState(false);
  const [otherCityName, setOtherCityName] = useState('');
  const [isAddingCity, setIsAddingCity] = useState(false);
  
  // Autocomplete states
  const [arrivalSuggestions, setArrivalSuggestions] = useState<string[]>([]);
  const [departureSuggestions, setDepartureSuggestions] = useState<string[]>([]);
  const [showArrivalSuggestions, setShowArrivalSuggestions] = useState(false);
  const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);
  // City names cache for autocomplete
  const [suggestionCityNames, setSuggestionCityNames] = useState<string[]>([]);
  const [isSuggestionCitiesLoaded, setIsSuggestionCitiesLoaded] = useState(false);

  // File upload states
  const [adharFrontFile, setAdharFrontFile] = useState<File | null>(null);
  const [adharBackFile, setAdharBackFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [drivingLicenseFile, setDrivingLicenseFile] = useState<File | null>(null);
  const [otherFile, setOtherFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateGuestRequest>({
    guest_name: '',
    organization: '',
    address: '',
    countryid: undefined,
    stateid: undefined,
    cityid: undefined,
    company_id: undefined,
    occupation: '',
    postHeld: '',
    phone1: '',
    phone2: '',
    mobile_no: '',
    office_mail: '',
    personal_mail: '',
    website: '',
    purpose: '',
    arrivalFrom: '',
    departureTo: '',
    guesttypeid: undefined,
    gender: '',
    nationalityid: undefined,
    birthday: '',
    anniversary: '',
    creditAllowed: 0,
    isDiscountAllowed: 0,
    discountPercent: '',
    personalInstructions: '',
    adhar_no: '',
    pan_no: '',
    driving_license: '',
    Other: '',
    discount: '',
    gst_number: '',
    hotelid: undefined
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      fetchStatesByCountry(selectedCountry).then(setStates);
    } else {
      setStates([]);
    }
    setSelectedState(undefined);
  }, [selectedCountry]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedState) {
      fetchCitiesByState(selectedState).then(setCities);
    } else {
      setCities([]);
    }
  }, [selectedState]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Initialize empty arrays
      setCountries([]);
      setCompanies([]);
      setGuestTypes([]);
      setNationalities([]);
      
      // Try to load guests, but don't block other masters if it fails
      try {
        console.log('Loading guests...');
        const guestsData = await getAllGuests();
        console.log('Guests loaded:', guestsData);
        setGuests(guestsData);
      } catch (err) {
        console.error('Error loading guests:', err);
        setGuests([]);
      }

      // Load each data type individually to prevent one failure from blocking others
      try {
        console.log('Loading hotels...');
        const hotelsData = await fetchCurrentUserHotel();
        console.log('Hotels loaded:', hotelsData);
        setHotels(hotelsData);
        
        // Set hotels data and current hotel
        if (hotelsData.length > 0) {
          setCurrentHotel(hotelsData[0].hotel_name);
          setFormData(prev => ({
            ...prev,
            hotelid: hotelsData[0].hotelid
          }));
        }
      } catch (err) {
        console.error('Error loading hotels:', err);
        setHotels([]);
      }

      try {
        console.log('Loading countries...');
        const countriesData = await fetchCountriesList();
        console.log('Countries loaded:', countriesData);
        setCountries(countriesData);
      } catch (err) {
        console.error('Error loading countries:', err);
        setCountries([]);
      }

      try {
        console.log('Loading companies...');
        const companiesData = await fetchCompaniesList();
        console.log('Companies loaded:', companiesData);
        setCompanies(companiesData);
      } catch (err) {
        console.error('Error loading companies:', err);
        setCompanies([]);
      }

      try {
        console.log('Loading guest types...');
        const guestTypesData = await fetchGuestTypes();
        console.log('Guest types loaded:', guestTypesData);
        setGuestTypes(guestTypesData);
      } catch (err) {
        console.error('Error loading guest types:', err);
        setGuestTypes([]);
      }

      try {
        console.log('Loading nationalities...');
        const nationalitiesData = await fetchNationalities();
        console.log('Nationalities loaded:', nationalitiesData);
        setNationalities(nationalitiesData);
      } catch (err) {
        console.error('Error loading nationalities:', err);
        setNationalities([]);
      }

      console.log('All data loading completed');
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'countryid') {
      const countryId = value ? parseInt(value) : undefined;
      setSelectedCountry(countryId);
      setFormData(prev => ({
        ...prev,
        countryid: countryId,
        stateid: undefined,
        cityid: undefined
      }));
    } else if (name === 'stateid') {
      const stateId = value ? parseInt(value) : undefined;
      setSelectedState(stateId);
      setFormData(prev => ({
        ...prev,
        stateid: stateId,
        cityid: undefined
      }));
    } else if (name === 'cityid') {
      const cityId = value ? parseInt(value) : undefined;
      setFormData(prev => ({
        ...prev,
        cityid: cityId
      }));
    } else if (name === 'company_id') {
      const companyId = value ? parseInt(value) : undefined;
      setFormData(prev => {
        const next: CreateGuestRequest = {
          ...prev,
          company_id: companyId,
        };
        // If both credit and discount are allowed, and company selected, prefill discountPercent from company
        if (
          companyId &&
          next.creditAllowed === 1 &&
          next.isDiscountAllowed === 1
        ) {
          const company = companies.find(c => c.company_id === companyId);
          if (company && company.discount_percent !== undefined && company.discount_percent !== null) {
            next.discountPercent = String(company.discount_percent);
          }
        }
        return next;
      });
    } else if (name === 'guesttypeid') {
      const guestTypeId = value ? parseInt(value) : undefined;
      setFormData(prev => ({
        ...prev,
        guesttypeid: guestTypeId
      }));
    } else if (name === 'nationalityid') {
      const nationalityId = value ? parseInt(value) : undefined;
      setFormData(prev => ({
        ...prev,
        nationalityid: nationalityId
      }));
    } else if (name === 'hotelid') {
      const hotelId = value ? parseInt(value) : undefined;
      setFormData(prev => ({
        ...prev,
        hotelid: hotelId
      }));
    } else if (name === 'creditAllowed' || name === 'isDiscountAllowed') {
      const checked = (e.target as HTMLInputElement).checked ? 1 : 0;
      setFormData(prev => {
        const next: any = { ...prev, [name]: checked };
        const bothEnabled =
          (name === 'creditAllowed' ? checked : prev.creditAllowed) === 1 &&
          (name === 'isDiscountAllowed' ? checked : prev.isDiscountAllowed) === 1;
        if (bothEnabled && prev.company_id) {
          const company = companies.find(c => c.company_id === prev.company_id);
          if (company && company.discount_percent !== undefined && company.discount_percent !== null) {
            next.discountPercent = String(company.discount_percent);
          }
        }
        if (name === 'isDiscountAllowed' && checked === 0) {
          next.discountPercent = '';
        }
        return next;
      });
    } else if (name === 'arrivalFrom' || name === 'departureTo') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Handle autocomplete
      if (value.length > 0) {
        const pool = (cities && cities.length > 0
          ? cities.map(c => c.city_name)
          : suggestionCityNames) || [];
        const suggestions = pool
          .filter((n) => n && n.toLowerCase().includes(value.toLowerCase()))
          .filter((v, i, arr) => arr.indexOf(v) === i);
        
        if (name === 'arrivalFrom') {
          setArrivalSuggestions(suggestions);
          setShowArrivalSuggestions(true);
        } else {
          setDepartureSuggestions(suggestions);
          setShowDepartureSuggestions(true);
        }
      } else {
        if (name === 'arrivalFrom') {
          setShowArrivalSuggestions(false);
        } else {
          setShowDepartureSuggestions(false);
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSuggestionClick = (suggestion: string, field: 'arrivalFrom' | 'departureTo') => {
    setFormData(prev => ({
      ...prev,
      [field]: suggestion
    }));
    
    if (field === 'arrivalFrom') {
      setShowArrivalSuggestions(false);
    } else {
      setShowDepartureSuggestions(false);
    }
  };

  const getTopCitySuggestions = (limit = 10): string[] => {
    const names = (cities && cities.length > 0
      ? cities.map(c => c.city_name)
      : suggestionCityNames).filter(Boolean);
    const unique = Array.from(new Set(names));
    return unique.slice(0, limit);
  };

  const ensureCitySuggestionsLoaded = async () => {
    if (isSuggestionCitiesLoaded || (cities && cities.length > 0)) return;
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:3001/api/city-masters', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data: any[] = await res.json();
        const names = (data || []).map((c: any) => c.city_name).filter(Boolean);
        setSuggestionCityNames(Array.from(new Set(names)));
        setIsSuggestionCitiesLoaded(true);
      }
    } catch (err) {
      // Silent fail; suggestions remain empty
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (field === 'adhar_no') return; // deprecated in UI
      else if (field === 'adhar_front') setAdharFrontFile(file);
      else if (field === 'adhar_back') setAdharBackFile(file);
      else if (field === 'pan_no') setPanFile(file);
      else if (field === 'driving_license') setDrivingLicenseFile(file);
      else if (field === 'Other') setOtherFile(file);
      
      if (field !== 'adhar_front' && field !== 'adhar_back') {
        setFormData(prev => ({
          ...prev,
          [field]: file.name
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingGuest) {
        await updateGuest(editingGuest.guest_id!, formData);
        toast.success('Guest updated successfully!');
      } else {
        await createGuest(formData);
        toast.success('Guest created successfully!');
      }
      
      await loadData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving guest:', error);
      toast.error('Error saving guest');
    }
  };

  const handleEdit = (guest: GuestMaster) => {
    setEditingGuest(guest);
    setFormData({
      guest_name: guest.guest_name,
      organization: guest.organization,
      address: guest.address,
      countryid: guest.countryid,
      stateid: guest.stateid,
      cityid: guest.cityid,
      company_id: guest.company_id,
      occupation: guest.occupation,
      postHeld: guest.postHeld,
      phone1: guest.phone1,
      phone2: guest.phone2,
      mobile_no: guest.mobile_no,
      office_mail: guest.office_mail,
      personal_mail: guest.personal_mail,
      website: guest.website,
      purpose: guest.purpose,
      arrivalFrom: guest.arrivalFrom,
      departureTo: guest.departureTo,
      guesttypeid: guest.guesttypeid,
      gender: guest.gender,
      nationalityid: guest.nationalityid,
      birthday: guest.birthday,
      anniversary: guest.anniversary,
      creditAllowed: guest.creditAllowed,
      isDiscountAllowed: guest.isDiscountAllowed,
      discountPercent: guest.discountPercent,
      personalInstructions: guest.personalInstructions,
      adhar_no: guest.adhar_no,
      pan_no: guest.pan_no,
      driving_license: guest.driving_license,
      Other: guest.Other || '',
      discount: guest.discount,
      gst_number: guest.gst_number || '',
      hotelid: guest.hotelid
    });
    setSelectedCountry(guest.countryid);
    setSelectedState(guest.stateid);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
      try {
        await deleteGuest(id);
        toast.success('Guest deleted successfully!');
        await loadData();
      } catch (error) {
        console.error('Error deleting guest:', error);
        toast.error('Error deleting guest');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      guest_name: '',
      organization: '',
      address: '',
      countryid: undefined,
      stateid: undefined,
      cityid: undefined,
      company_id: undefined,
      occupation: '',
      postHeld: '',
      phone1: '',
      phone2: '',
      mobile_no: '',
      office_mail: '',
      personal_mail: '',
      website: '',
      purpose: '',
      arrivalFrom: '',
      departureTo: '',
      guesttypeid: undefined,
      gender: '',
      nationalityid: undefined,
      birthday: '',
      anniversary: '',
      creditAllowed: 0,
      isDiscountAllowed: 0,
      discountPercent: '',
      personalInstructions: '',
      adhar_no: '',
      pan_no: '',
      driving_license: '',
      Other: '',
      discount: '',
      gst_number: '',
      hotelid: undefined
    });
    setSelectedCountry(undefined);
    setSelectedState(undefined);
    setAdharFrontFile(null);
    setAdharBackFile(null);
    setPanFile(null);
    setDrivingLicenseFile(null);
    setOtherFile(null);
  };

  const openAddModal = () => {
    setEditingGuest(null);
    resetForm();
    setShowModal(true);
  };

  // API functions
  const getAllGuests = async (): Promise<GuestMaster[]> => {
    try {
      const response = await apiCore.get('/guest-masters');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching guests:', error);
      throw error;
    }
  };

  const createGuest = async (guestData: CreateGuestRequest): Promise<any> => {
    try {
      const fd = new FormData();
      Object.entries(guestData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) fd.append(key, String(value));
      });
      if (adharFrontFile) fd.append('adhar_front', adharFrontFile);
      if (adharBackFile) fd.append('adhar_back', adharBackFile);
      if (panFile) fd.append('pan_no', panFile);
      if (drivingLicenseFile) fd.append('driving_license', drivingLicenseFile);
      if (otherFile) fd.append('Other', otherFile);

      const response = await fetch('http://localhost:3001/api/guest-masters', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: fd,
      });
      if (!response.ok) throw new Error('Failed to create guest');
      return await response.json();
    } catch (error) {
      console.error('Error creating guest:', error);
      throw error;
    }
  };

  const updateGuest = async (id: number, guestData: CreateGuestRequest): Promise<any> => {
    try {
      const fd = new FormData();
      Object.entries(guestData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) fd.append(key, String(value));
      });
      if (adharFrontFile) fd.append('adhar_front', adharFrontFile);
      if (adharBackFile) fd.append('adhar_back', adharBackFile);
      if (panFile) fd.append('pan_no', panFile);
      if (drivingLicenseFile) fd.append('driving_license', drivingLicenseFile);
      if (otherFile) fd.append('Other', otherFile);

      const response = await fetch(`http://localhost:3001/api/guest-masters/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: fd,
      });
      if (!response.ok) throw new Error('Failed to update guest');
      return await response.json();
    } catch (error) {
      console.error('Error updating guest:', error);
      throw error;
    }
  };

  const deleteGuest = async (id: number): Promise<any> => {
    try {
      const response = await apiCore.delete(`/guest-masters/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting guest:', error);
      throw error;
    }
  };

  const fetchGuestTypes = async (): Promise<GuestTypeItem[]> => {
    try {
      const res = await fetch('http://localhost:3001/api/guest-types', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });
      const response = await res.json();
      const data = response.data || response;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Fetch guest types error:', err);
      return [];
    }
  };

  const fetchNationalities = async (): Promise<NationalityItem[]> => {
    try {
      const res = await fetch('http://localhost:3001/api/nationalities', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });
      const response = await res.json();
      const data = response.data || response;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Fetch nationalities error:', err);
      return [];
    }
  };

  // Function to handle adding a new city
  const handleAddNewCity = async () => {
    if (!otherCityName.trim() || !selectedCountry || !selectedState) {
      toast.error('Please enter a city name and ensure country and state are selected');
      return;
    }

    // Get the current user's hotel ID
    const currentHotelId = hotels.length > 0 ? hotels[0].hotelid : null;
    if (!currentHotelId) {
      toast.error('No hotel found for current user');
      return;
    }

    console.log('Adding city with hotel ID:', currentHotelId);

    try {
      setIsAddingCity(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:3001/api/city-masters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          country_id: selectedCountry,
          state_id: selectedState,
          district_id: 1, // Default district ID
          city_name: otherCityName.trim(),
          status: 1,
          hotelid: currentHotelId
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('City added successfully!');
        
        // Refresh cities list
        if (selectedState) {
          const updatedCities = await fetchCitiesByState(selectedState);
          setCities(updatedCities);
          
          // Set the newly added city as selected
          const newCity = updatedCities.find(city => city.city_name === otherCityName.trim());
          if (newCity) {
            setFormData(prev => ({
              ...prev,
              cityid: newCity.cityid
            }));
          }
        }
        
        // Close modal and reset
        setShowOtherCityModal(false);
        setOtherCityName('');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add city');
      }
    } catch (error) {
      console.error('Error adding city:', error);
      toast.error('Failed to add city');
    } finally {
      setIsAddingCity(false);
    }
  };

  // Function to handle city dropdown change
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value === 'other') {
      setShowOtherCityModal(true);
    } else {
      const cityId = value ? parseInt(value) : undefined;
      setFormData(prev => ({
        ...prev,
        cityid: cityId
      }));
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading Guest Master data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <Card.Header>
          <Stack direction="horizontal" className="justify-content-between">
            <div>
              <h4 className="mb-0">Guest Master</h4>
              {currentHotel && (
                <small className="text-muted">
                  Current Hotel: {currentHotel}
                </small>
              )}
            </div>
            <Button variant="primary" onClick={openAddModal}>
              <FiPlus className="me-2" />
              Add New Guest
            </Button>
          </Stack>
        </Card.Header>
        <Card.Body>
          <Table responsive striped>
            <thead>
              <tr>
                <th>#</th>
                <th>Guest Name</th>
                <th>Organization</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Purpose</th>
                <th>Hotel</th>
                <th>Credit Allowed</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {guests && guests.length > 0 ? (
                guests.map((g, idx) => (
                  <tr key={g.guest_id || idx}>
                    <td>{idx + 1}</td>
                    <td>{g.guest_name || '-'}</td>
                    <td>{g.organization || '-'}</td>
                    <td>{g.mobile_no || '-'}</td>
                    <td>{g.office_mail || g.personal_mail || '-'}</td>
                    <td>{g.purpose || '-'}</td>
                    <td>{g.hotel_name || '-'}</td>
                    <td>
                      <Badge bg={g.creditAllowed === 1 ? 'success' : 'secondary'}>
                        {g.creditAllowed === 1 ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td>{g.created_date ? String(g.created_date).replace('T', ' ').slice(0, 19) : '-'}</td>
                    <td>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline-primary" size="sm" onClick={() => handleEdit(g)}>
                          <FiEdit />
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => g.guest_id && handleDelete(g.guest_id)}>
                          <FiTrash2 />
                        </Button>
                      </Stack>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center">No guests found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingGuest ? 'Edit Guest' : 'Add New Guest'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Guest Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="guest_name"
                    value={formData.guest_name}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Organization</Form.Label>
                  <Form.Control
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Country, State, City */}
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Select
                    name="countryid"
                    value={formData.countryid || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Country</option>
                    {countries && countries.length > 0 && countries.map(country => (
                      <option key={country.countryid} value={country.countryid}>
                        {country.country_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Select
                    name="stateid"
                    value={formData.stateid || ''}
                    onChange={handleInputChange}
                    disabled={!selectedCountry}
                  >
                    <option value="">Select State</option>
                    {states && states.length > 0 && states.map(state => (
                      <option key={state.stateid} value={state.stateid}>
                        {state.state_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Select
                    name="cityid"
                    value={formData.cityid || ''}
                    onChange={handleCityChange}
                    disabled={!selectedState}
                  >
                    <option value="">Select City</option>
                    {cities && cities.length > 0 && cities.map(city => (
                      <option key={city.cityid} value={city.cityid}>
                        {city.city_name}
                      </option>
                    ))}
                    <option value="other">Other (Add New City)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Company and Hotel */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Company</Form.Label>
                  <Form.Select
                    name="company_id"
                    value={formData.company_id || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Company</option>
                    {companies && companies.length > 0 && companies.map(company => (
                      <option key={company.company_id} value={company.company_id}>
                        {company.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hotel</Form.Label>
                  <Form.Select
                    name="hotelid"
                    value={formData.hotelid || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Hotel</option>
                    {hotels && hotels.length > 0 && hotels.map(hotel => (
                      <option key={hotel.hotelid} value={hotel.hotelid}>
                        {hotel.hotel_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Credit and Discount - placed below Company */}
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Credit Allowed</Form.Label>
                  <div>
                    <Form.Check
                      type="checkbox"
                      name="creditAllowed"
                      checked={formData.creditAllowed === 1}
                      onChange={handleInputChange}
                      label="Allow Credit"
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Discount Allowed</Form.Label>
                  <div>
                    <Form.Check
                      type="checkbox"
                      name="isDiscountAllowed"
                      checked={formData.isDiscountAllowed === 1}
                      onChange={handleInputChange}
                      label="Allow Discount"
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Discount Percent</Form.Label>
                  <Form.Control
                    type="text"
                    name="discountPercent"
                    value={formData.discountPercent}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Contact Information */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Occupation</Form.Label>
                  <Form.Control
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Post Held</Form.Label>
                  <Form.Control
                    type="text"
                    name="postHeld"
                    value={formData.postHeld}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone 1</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone1"
                    value={formData.phone1}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone 2</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone2"
                    value={formData.phone2}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Mobile</Form.Label>
                  <Form.Control
                    type="tel"
                    name="mobile_no"
                    value={formData.mobile_no}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Office Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="office_mail"
                    value={formData.office_mail}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Personal Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="personal_mail"
                    value={formData.personal_mail}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Purpose</Form.Label>
                  <Form.Control
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Arrival and Departure with Autocomplete */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Arrival From</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      name="arrivalFrom"
                      value={formData.arrivalFrom}
                      onChange={handleInputChange}
                      onFocus={async () => {
                        await ensureCitySuggestionsLoaded();
                        const suggestions = getTopCitySuggestions();
                        setArrivalSuggestions(suggestions);
                        setShowArrivalSuggestions(true);
                      }}
                      onBlur={() => setTimeout(() => setShowArrivalSuggestions(false), 150)}
                    />
                    {showArrivalSuggestions && arrivalSuggestions.length > 0 && (
                      <div className="position-absolute w-100 bg-white border rounded mt-1" style={{ zIndex: 1000 }}>
                        {arrivalSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="p-2 cursor-pointer hover-bg-light"
                            onClick={() => handleSuggestionClick(suggestion, 'arrivalFrom')}
                            style={{ cursor: 'pointer' }}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Departure To</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      name="departureTo"
                      value={formData.departureTo}
                      onChange={handleInputChange}
                      onFocus={async () => {
                        await ensureCitySuggestionsLoaded();
                        const suggestions = getTopCitySuggestions();
                        setDepartureSuggestions(suggestions);
                        setShowDepartureSuggestions(true);
                      }}
                      onBlur={() => setTimeout(() => setShowDepartureSuggestions(false), 150)}
                    />
                    {showDepartureSuggestions && departureSuggestions.length > 0 && (
                      <div className="position-absolute w-100 bg-white border rounded mt-1" style={{ zIndex: 1000 }}>
                        {departureSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="p-2 cursor-pointer hover-bg-light"
                            onClick={() => handleSuggestionClick(suggestion, 'departureTo')}
                            style={{ cursor: 'pointer' }}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>
            </Row>

            {/* Guest Type and Nationality */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Guest Type</Form.Label>
                  <Form.Select
                    name="guesttypeid"
                    value={formData.guesttypeid || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Guest Type</option>
                    {guestTypes && guestTypes.length > 0 && guestTypes.map(type => (
                      <option key={type.guesttypeid} value={type.guesttypeid}>
                        {type.guest_type}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nationality</Form.Label>
                  <Form.Select
                    name="nationalityid"
                    value={formData.nationalityid || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Nationality</option>
                    {nationalities && nationalities.length > 0 && nationalities.map(nationality => (
                      <option key={nationality.nationalityid} value={nationality.nationalityid}>
                        {nationality.nationality}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Gender and Dates */}
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Birthday</Form.Label>
                  <Form.Control
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Anniversary</Form.Label>
                  <Form.Control
                    type="date"
                    name="anniversary"
                    value={formData.anniversary}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Removed duplicate Credit and Discount section (moved above) */}

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Personal Instructions</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="personalInstructions"
                    value={formData.personalInstructions}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* File Uploads */}
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Aadhar Front</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'adhar_front')}
                  />
                  {adharFrontFile && (
                    <small className="text-muted">Selected: {adharFrontFile.name}</small>
                  )}
                </Form.Group>
              </Col>
              {adharFrontFile && (
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Aadhar Back</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'adhar_back')}
                    />
                    {adharBackFile && (
                      <small className="text-muted">Selected: {adharBackFile.name}</small>
                    )}
                  </Form.Group>
                </Col>
              )}
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>PAN Card</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'pan_no')}
                  />
                  {formData.pan_no && (
                    <small className="text-muted">Selected: {formData.pan_no}</small>
                  )}
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Driving License</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'driving_license')}
                  />
                  {formData.driving_license && (
                    <small className="text-muted">Selected: {formData.driving_license}</small>
                  )}
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Other Document</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'Other')}
                  />
                  {formData.Other && (
                    <small className="text-muted">Selected: {formData.Other}</small>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Discount</Form.Label>
                  <Form.Control
                    type="text"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>GST Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="gst_number"
                    value={formData.gst_number}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingGuest ? 'Update Guest' : 'Create Guest'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Add New City Modal */}
      <Modal show={showOtherCityModal} onHide={() => setShowOtherCityModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New City</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>City Name *</Form.Label>
              <Form.Control
                type="text"
                value={otherCityName}
                onChange={(e) => setOtherCityName(e.target.value)}
                placeholder="Enter city name"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control
                type="text"
                value={countries.find(c => c.countryid === selectedCountry)?.country_name || ''}
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                value={states.find(s => s.stateid === selectedState)?.state_name || ''}
                disabled
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOtherCityModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddNewCity}
            disabled={!otherCityName.trim() || isAddingCity}
          >
            {isAddingCity ? 'Adding...' : 'Add City'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GuestMasterComponent;
