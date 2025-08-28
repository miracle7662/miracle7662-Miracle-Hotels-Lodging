import React, { useState, useEffect } from 'react';
import { Button, Card, Stack, Table, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { apiCore } from '@/common/api/apiCore';
import { 
  fetchCurrentUserHotel, 
  fetchCountriesList,
  fetchStatesByCountry,
  fetchDistrictsByState,
  fetchCitiesByState,
  HotelItem,
  CountryItem,
  StateItem,
  DistrictItem,
  CityItem
} from '@/utils/commonfunction';

interface CompanyMaster {
  company_id?: number;
  title: string;
  name: string;
  display_name: string;
  establishment_date: string;
  address: string;
  countryid?: number;
  stateid?: number;
  cityid?: number;
  phone1: string;
  phone2: string;
  gst_number?: string;
  mobile: string;
  email: string;
  website: string;
  booking_contact_name: string;
  booking_contact_mobile: string;
  booking_contact_phone: string;
  corresponding_contact_name: string;
  corresponding_contact_mobile: string;
  corresponding_contact_phone: string;
  credit_limit: string;
  is_credit_allow: number;
  is_company: number;
  is_discount: string;
  discount_percent?: number;
  hotel_id?: string;
  hotel_name?: string;
  created_by_id?: number;
  created_date?: string;
  updated_by_id?: number;
  updated_date?: string;
}

interface CreateCompanyRequest {
  title: string;
  name: string;
  display_name: string;
  establishment_date: string;
  address: string;
  countryid?: number;
  stateid?: number;
  cityid?: number;
  phone1: string;
  phone2: string;
  gst_number?: string;
  mobile: string;
  email: string;
  website: string;
  booking_contact_name: string;
  booking_contact_mobile: string;
  booking_contact_phone: string;
  corresponding_contact_name: string;
  corresponding_contact_mobile: string;
  corresponding_contact_phone: string;
  credit_limit: string;
  is_credit_allow: number;
  is_company: number;
  is_discount: string;
  discount_percent?: number;
  hotel_id?: string;
}

const CompanyMasterComponent: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyMaster | null>(null);
  const [currentHotel, setCurrentHotel] = useState<string>('');
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | undefined>();
  const [selectedState, setSelectedState] = useState<number | undefined>();
  const [showCreditLimit, setShowCreditLimit] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateCompanyRequest>({
    title: '',
    name: '',
    display_name: '',
    establishment_date: '',
    address: '',
    countryid: undefined,
    stateid: undefined,
    cityid: undefined,
    phone1: '',
    phone2: '',
    gst_number: '',
    mobile: '',
    email: '',
    website: '',
    booking_contact_name: '',
    booking_contact_mobile: '',
    booking_contact_phone: '',
    corresponding_contact_name: '',
    corresponding_contact_mobile: '',
    corresponding_contact_phone: '',
    credit_limit: '',
    is_credit_allow: 0,
    is_company: 1,
    is_discount: '',
    discount_percent: 0,
    hotel_id: undefined
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
      // Try to load companies, but don't block other masters if it fails/not implemented yet
      try {
        const response = await apiCore.get('/company-masters', {});
        setCompanies(response.data || []);
      } catch (err) {
        // Silently ignore for now; master endpoints may not be ready
        setCompanies([]);
      }

      const [hotelsData, countriesData] = await Promise.all([
        fetchCurrentUserHotel(),
        fetchCountriesList()
      ]);

      setHotels(hotelsData);
      setCountries(countriesData);
      
      // Set hotels data and current hotel
      if (hotelsData.length > 0) {
        setCurrentHotel(hotelsData[0].hotel_name);
        setFormData(prev => ({
          ...prev,
          hotel_id: hotelsData[0].hotelid?.toString()
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
  
    if (name === 'is_credit_allow' && type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setShowCreditLimit(checked);
      setFormData(prev => ({
        ...prev,
        [name]: checked ? 1 : 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate credit limit if credit is allowed
    if (formData.is_credit_allow === 1 && !formData.credit_limit) {
      toast.error('Credit Limit is required when Credit Allow is enabled');
      return;
    }
    
    try {
      if (editingCompany) {
        await apiCore.update(`/company-masters/${editingCompany.company_id}`, formData);
        toast.success('Company updated successfully!');
      } else {
        await apiCore.create('/company-masters', formData);
        toast.success('Company created successfully!');
      }
      
      setShowModal(false);
      setEditingCompany(null);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error('Error saving company');
    }
  };

  const handleEdit = (company: CompanyMaster) => {
    setEditingCompany(company);
    setFormData({
      title: company.title,
      name: company.name,
      display_name: company.display_name,
      establishment_date: company.establishment_date,
      address: company.address,
      countryid: company.countryid,
      stateid: company.stateid,
      cityid: company.cityid,
      phone1: company.phone1,
      phone2: company.phone2,
      gst_number: company.gst_number || '',
      mobile: company.mobile,
      email: company.email,
      website: company.website,
      booking_contact_name: company.booking_contact_name,
      booking_contact_mobile: company.booking_contact_mobile,
      booking_contact_phone: company.booking_contact_phone,
      corresponding_contact_name: company.corresponding_contact_name,
      corresponding_contact_mobile: company.corresponding_contact_mobile,
      corresponding_contact_phone: company.corresponding_contact_phone,
      credit_limit: company.credit_limit,
      is_credit_allow: company.is_credit_allow,
      is_company: company.is_company,
      is_discount: company.is_discount,
      discount_percent: company.discount_percent || 0,
      hotel_id: company.hotel_id
    });
         setShowCreditLimit(company.is_credit_allow === 1);
     setSelectedCountry(company.countryid);
     setSelectedState(company.stateid);
     setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await apiCore.delete(`/company-masters/${id}`);
        toast.success('Company deleted successfully!');
        await loadData();
      } catch (error) {
        console.error('Error deleting company:', error);
        toast.error('Error deleting company');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      name: '',
      display_name: '',
      establishment_date: '',
      address: '',
      countryid: undefined,
      stateid: undefined,
      cityid: undefined,
      phone1: '',
      phone2: '',
      gst_number: '',
      mobile: '',
      email: '',
      website: '',
      booking_contact_name: '',
      booking_contact_mobile: '',
      booking_contact_phone: '',
      corresponding_contact_name: '',
      corresponding_contact_mobile: '',
      corresponding_contact_phone: '',
      credit_limit: '',
      is_credit_allow: 0,
      is_company: 1,
      is_discount: '',
      discount_percent: 0,
      hotel_id: undefined
         });
     setShowCreditLimit(false);
     setSelectedCountry(undefined);
     setSelectedState(undefined);
  };

  const openAddModal = () => {
    setEditingCompany(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
             <Card>
         <Card.Header>
           <Stack direction="horizontal" className="justify-content-between">
             <div>
               <h4 className="mb-0">Company Master</h4>
               {currentHotel && (
                 <small className="text-muted">
                   Current Hotel: {currentHotel}
                 </small>
               )}
             </div>
             <Button variant="primary" onClick={openAddModal}>
               <FiPlus className="me-2" />
               Add New Company
             </Button>
           </Stack>
         </Card.Header>
        <Card.Body>
          <Table responsive striped>
                         <thead>
               <tr>
                 <th>#</th>
                 <th>Title</th>
                 <th>Name</th>
                 <th>Display Name</th>
                 <th>Phone</th>
                 <th>Email</th>
                 <th>Address</th>
                 <th>Hotel</th>
                 <th>Credit Allow</th>
                 <th>Created Date</th>
                 <th>Actions</th>
               </tr>
             </thead>
            <tbody>
                                            {companies.length === 0 ? (
                 <tr>
                   <td colSpan={11} className="text-center">No companies found</td>
                 </tr>
               ) : (
                 companies.map((company, index) => (
                   <tr key={company.company_id}>
                     <td>{index + 1}</td>
                     <td>{company.title}</td>
                     <td>{company.name}</td>
                     <td>{company.display_name}</td>
                     <td>{company.phone1}</td>
                     <td>{company.email}</td>
                     <td>{company.address}</td>
                     <td>{company.hotel_name || 'N/A'}</td>
                     <td>
                       <Badge bg={company.is_credit_allow === 1 ? 'success' : 'secondary'}>
                         {company.is_credit_allow === 1 ? 'Yes' : 'No'}
                       </Badge>
                     </td>
                     <td>{company.created_date ? new Date(company.created_date).toLocaleDateString() : 'N/A'}</td>
                     <td>
                       <Stack direction="horizontal" gap={2}>
                         <Button
                           variant="outline-primary"
                           size="sm"
                           onClick={() => handleEdit(company)}
                         >
                           <FiEdit />
                         </Button>
                         <Button
                           variant="outline-danger"
                           size="sm"
                           onClick={() => handleDelete(company.company_id!)}
                         >
                           <FiTrash2 />
                         </Button>
                       </Stack>
                     </td>
                   </tr>
                 ))
               )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

             {/* Add/Edit Modal */}
       <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
         <Modal.Header closeButton>
           <Modal.Title>
             {editingCompany ? 'Edit Company' : 'Add New Company'}
           </Modal.Title>
         </Modal.Header>
         <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                     <Form onSubmit={handleSubmit}>
             {/* Basic Information */}
             <Row>
               <Col md={4}>
                 <Form.Group className="mb-3">
                   <Form.Label>Title *</Form.Label>
                   <Form.Control
                     type="text"
                     name="title"
                     value={formData.title}
                     onChange={handleInputChange}
                     placeholder="Enter title"
                     required
                   />
                 </Form.Group>
               </Col>
               <Col md={4}>
                 <Form.Group className="mb-3">
                   <Form.Label>Name *</Form.Label>
                   <Form.Control
                     type="text"
                     name="name"
                     value={formData.name}
                     onChange={handleInputChange}
                     placeholder="Enter name"
                     required
                   />
                 </Form.Group>
               </Col>
               <Col md={4}>
                 <Form.Group className="mb-3">
                   <Form.Label>Display Name *</Form.Label>
                   <Form.Control
                     type="text"
                     name="display_name"
                     value={formData.display_name}
                     onChange={handleInputChange}
                     placeholder="Enter display name"
                     required
                   />
                 </Form.Group>
               </Col>
             </Row>
             <Row>
               <Col md={6}>
                 <Form.Group className="mb-3">
                   <Form.Label>Establishment Date *</Form.Label>
                   <Form.Control
                     type="date"
                     name="establishment_date"
                     value={formData.establishment_date}
                     onChange={handleInputChange}
                     required
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
                     placeholder="Enter GST number"
                   />
                 </Form.Group>
               </Col>
             </Row>
             {/* Location Information */}
             <Row>
               <Col md={4}>
                 <Form.Group className="mb-3">
                   <Form.Label>Country</Form.Label>
                   <Form.Select
                     name="countryid"
                     value={formData.countryid || ''}
                     onChange={(e) => {
                       const value = e.target.value ? parseInt(e.target.value) : undefined;
                       setSelectedCountry(value);
                       setFormData(prev => ({
                         ...prev,
                         countryid: value,
                         stateid: undefined,
                         cityid: undefined
                       }));
                     }}
                   >
                     <option value="">Select Country</option>
                     {countries.map(country => (
                       <option key={country.countryid} value={country.countryid}>
                         {country.countryname}
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
                     onChange={(e) => {
                       const value = e.target.value ? parseInt(e.target.value) : undefined;
                       setSelectedState(value);
                       setFormData(prev => ({
                         ...prev,
                         stateid: value,
                         cityid: undefined
                       }));
                     }}
                     disabled={!selectedCountry}
                   >
                     <option value="">Select State</option>
                     {states.map(state => (
                       <option key={state.stateid} value={state.stateid}>
                         {state.statename}
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
                     onChange={(e) => {
                       const value = e.target.value ? parseInt(e.target.value) : undefined;
                       setFormData(prev => ({
                         ...prev,
                         cityid: value
                       }));
                     }}
                     disabled={!selectedState}
                   >
                     <option value="">Select City</option>
                      {cities.map(city => (
                        <option key={city.cityid} value={city.cityid}>
                          {city.cityname}
                        </option>
                      ))}
                   </Form.Select>
                 </Form.Group>
               </Col>
             </Row>
             {/* Contact Information */}
             <Row>
               <Col md={4}>
                 <Form.Group className="mb-3">
                   <Form.Label>Phone 1 *</Form.Label>
                   <Form.Control
                     type="tel"
                     name="phone1"
                     value={formData.phone1}
                     onChange={handleInputChange}
                     placeholder="Enter phone 1"
                     required
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
                     placeholder="Enter phone 2"
                   />
                 </Form.Group>
               </Col>
               <Col md={4}>
                 <Form.Group className="mb-3">
                   <Form.Label>Mobile *</Form.Label>
                   <Form.Control
                     type="tel"
                     name="mobile"
                     value={formData.mobile}
                     onChange={handleInputChange}
                     placeholder="Enter mobile"
                     required
                   />
                 </Form.Group>
               </Col>
             </Row>
             <Row>
               <Col md={6}>
                 <Form.Group className="mb-3">
                   <Form.Label>Email *</Form.Label>
                   <Form.Control
                     type="email"
                     name="email"
                     value={formData.email}
                     onChange={handleInputChange}
                     placeholder="Enter email address"
                     required
                   />
                 </Form.Group>
               </Col>
               <Col md={6}>
                 <Form.Group className="mb-3">
                   <Form.Label>Website *</Form.Label>
                   <Form.Control
                     type="url"
                     name="website"
                     value={formData.website}
                     onChange={handleInputChange}
                     placeholder="Enter website URL"
                     required
                   />
                 </Form.Group>
               </Col>
             </Row>
             {/* Booking Contact */}
             <Row>
               <Col md={4}>
                 <Form.Group className="mb-3">
                   <Form.Label>Booking Contact Name *</Form.Label>
                   <Form.Control
                     type="text"
                     name="booking_contact_name"
                     value={formData.booking_contact_name}
                     onChange={handleInputChange}
                     placeholder="Enter booking contact name"
                     required
                   />
                 </Form.Group>
               </Col>
               <Col md={4}>
                 <Form.Group className="mb-3">
                   <Form.Label>Booking Contact Mobile *</Form.Label>
                   <Form.Control
                     type="tel"
                     name="booking_contact_mobile"
                     value={formData.booking_contact_mobile}
                     onChange={handleInputChange}
                     placeholder="Enter booking contact mobile"
                     required
                   />
                 </Form.Group>
               </Col>
               <Col md={4}>
                 <Form.Group className="mb-3">
                   <Form.Label>Booking Contact Phone *</Form.Label>
                   <Form.Control
                     type="tel"
                     name="booking_contact_phone"
                     value={formData.booking_contact_phone}
                     onChange={handleInputChange}
                     placeholder="Enter booking contact phone"
                     required
                   />
                 </Form.Group>
               </Col>
             </Row>
             {/* Corresponding Contact */}
             <Row>
               <Col md={4}>
                 <Form.Group className="mb-3">
                   <Form.Label>Corresponding Contact Name *</Form.Label>
                   <Form.Control
                     type="text"
                     name="corresponding_contact_name"
                     value={formData.corresponding_contact_name}
                     onChange={handleInputChange}
                     placeholder="Enter corresponding contact name"
                     required
                   />
                 </Form.Group>
               </Col>
               <Col md={4}>
                 <Form.Group className="mb-3">
                   <Form.Label>Corresponding Contact Mobile *</Form.Label>
                   <Form.Control
                     type="tel"
                     name="corresponding_contact_mobile"
                     value={formData.corresponding_contact_mobile}
                     onChange={handleInputChange}
                     placeholder="Enter corresponding contact mobile"
                     required
                   />
                 </Form.Group>
               </Col>
               <Col md={4}>
                 <Form.Group className="mb-3">
                   <Form.Label>Corresponding Contact Phone *</Form.Label>
                   <Form.Control
                     type="tel"
                     name="corresponding_contact_phone"
                     value={formData.corresponding_contact_phone}
                     onChange={handleInputChange}
                     placeholder="Enter corresponding contact phone"
                     required
                   />
                 </Form.Group>
               </Col>
             </Row>
                           {/* Credit and Discount */}
                             <Row>
                 <Col md={4}>
                   <Form.Group className="mb-3">
                     <Form.Label>Credit Allow</Form.Label>
                     <div>
                       <Form.Check
                         type="checkbox"
                         name="is_credit_allow"
                         checked={formData.is_credit_allow === 1}
                         onChange={handleInputChange}
                         label="Allow Credit"
                       />
                     </div>
                   </Form.Group>
                 </Col>
                 <Col md={4}>
                   <Form.Group className="mb-3">
                     <Form.Label>Is Company</Form.Label>
                     <Form.Select
                       name="is_company"
                       value={formData.is_company}
                       onChange={handleInputChange}
                     >
                       <option value={1}>Yes</option>
                       <option value={0}>No</option>
                     </Form.Select>
                   </Form.Group>
                 </Col>
                 <Col md={4}>
                   <Form.Group className="mb-3">
                     <Form.Label>Discount Type</Form.Label>
                     <Form.Control
                       type="text"
                       name="is_discount"
                       value={formData.is_discount}
                       onChange={handleInputChange}
                       placeholder="Enter discount type"
                     />
                   </Form.Group>
                 </Col>
               </Row>
                               {showCreditLimit && (
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Credit Limit *</Form.Label>
                        <Form.Control
                          type="text"
                          name="credit_limit"
                          value={formData.credit_limit}
                          onChange={handleInputChange}
                          placeholder="Enter credit limit"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Discount Percent</Form.Label>
                        <Form.Control
                          type="number"
                          name="discount_percent"
                          value={formData.discount_percent}
                          onChange={handleInputChange}
                          placeholder="Enter discount percent"
                          min="0"
                          max="100"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}
                           {/* Hotel and Address */}
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Hotel</Form.Label>
                    <Form.Select
                      name="hotel_id"
                      value={formData.hotel_id || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Hotel</option>
                      {hotels.map(hotel => (
                        <option key={hotel.hotelid} value={hotel.hotelid}>
                          {hotel.hotel_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
             <Row>
               <Col md={12}>
                 <Form.Group className="mb-3">
                   <Form.Label>Address *</Form.Label>
                   <Form.Control
                     as="textarea"
                     rows={3}
                     name="address"
                     value={formData.address}
                     onChange={handleInputChange}
                     placeholder="Enter company address"
                     required
                   />
                 </Form.Group>
               </Col>
             </Row>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingCompany ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CompanyMasterComponent;
