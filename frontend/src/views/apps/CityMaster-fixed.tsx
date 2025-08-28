import React, { useState, useEffect } from 'react';
import { Button, Card, Stack, Table, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import {
  getAllCities,
  createCity,
  updateCity,
  deleteCity,
  CityMaster,
  CreateCityMasterRequest
} from '@/services/cityMasterService';
import {
  fetchCountriesList,
  fetchStatesByCountry,
  fetchDistrictsByState,
  CountryItem,
  StateItem,
  DistrictItem,
} from '@/utils/commonfunction';

const CityMasterComponent: React.FC = () => {
  const [cities, setCities] = useState<CityMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState<CityMaster | null>(null);
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [states, setStates] = useState<StateItem[]>([]);
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | undefined>();
  const [selectedState, setSelectedState] = useState<number | undefined>();

  // Form state
  const [formData, setFormData] = useState<CreateCityMasterRequest>({
    countryid: 0,
    stateid: 0,
    districtid: 0,
    cityname: '',
    status: 1
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [citiesData, countriesData] = await Promise.all([
        getAllCities(),
        fetchCountriesList()
      ]);
      setCities(citiesData);
      setCountries(countriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      fetchStatesByCountry(selectedCountry).then(setStates).catch(console.error);
    } else {
      setStates([]);
    }
    setSelectedState(undefined);
  }, [selectedCountry]);

  // Load districts when state changes
  useEffect(() => {
    if (selectedState) {
      fetchDistrictsByState(selectedState).then(setDistricts).catch(console.error);
    } else {
      setDistricts([]);
    }
  }, [selectedState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'countryid' || name === 'stateid' || name === 'districtid' || name === 'status' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = parseInt(e.target.value);
    setSelectedCountry(countryId);
    setFormData(prev => ({
      ...prev,
      countryid: countryId,
      stateid: 0,
      districtid: 0
    }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateId = parseInt(e.target.value);
    setSelectedState(stateId);
    setFormData(prev => ({
      ...prev,
      stateid: stateId,
      districtid: 0
    }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = parseInt(e.target.value);
    setFormData(prev => ({
      ...prev,
      districtid: districtId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.cityname.trim()) {
      toast.error('City name is required');
      return;
    }
    if (!formData.countryid || !formData.stateid || !formData.districtid) {
      toast.error('Please select country, state and district');
      return;
    }

    try {
      if (editingCity) {
        await updateCity(editingCity.cityid!, formData);
        toast.success('City updated successfully!');
      } else {
        await createCity(formData);
        toast.success('City created successfully!');
      }
      
      setShowModal(false);
      setEditingCity(null);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error saving city:', error);
      toast.error('Error saving city');
    }
  };

  const handleEdit = (city: CityMaster) => {
    setEditingCity(city);
    setFormData({
      countryid: city.countryid,
      stateid: city.stateid,
      districtid: city.districtid,
      cityname: city.cityname,
      status: city.status || 1
    });
    setSelectedCountry(city.countryid);
    setSelectedState(city.stateid);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this city?')) {
      try {
        await deleteCity(id);
        toast.success('City deleted successfully!');
        await loadData();
      } catch (error) {
        console.error('Error deleting city:', error);
        toast.error('Error deleting city');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      countryid: 0,
      stateid: 0,
      districtid: 0,
      cityname: '',
      status: 1
    });
    setSelectedCountry(undefined);
    setSelectedState(undefined);
  };

  const openAddModal = () => {
    setEditingCity(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <Card>
        <Card.Header>
          <Stack direction="horizontal" className="justify-content-between align-items-center">
            <div>
              <h4 className="mb-0">City Master</h4>
            </div>
            <Button variant="primary" onClick={openAddModal}>
              <FiPlus className="me-2" />
              Add New City
            </Button>
          </Stack>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-light">
                <tr>
                  <th style={{ width: '5%' }}>#</th>
                  <th style={{ width: '20%' }}>City Name</th>
                  <th style={{ width: '15%' }}>Country</th>
                  <th style={{ width: '15%' }}>State</th>
                  <th style={{ width: '15%' }}>District</th>
                  <th style={{ width: '10%' }}>Status</th>
                  <th style={{ width: '15%' }}>Created Date</th>
                  <th style={{ width: '15%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cities.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <div className="text-muted">No cities found</div>
                    </td>
                  </tr>
                ) : (
                  cities.map((city, index) => (
                    <tr key={city.cityid}>
                      <td>{index + 1}</td>
                      <td>{city.cityname}</td>
                      <td>{city.country_name || 'N/A'}</td>
                      <td>{city.state_name || 'N/A'}</td>
                      <td>{city.district_name || 'N/A'}</td>
                      <td>
                        <Badge bg={city.status === 1 ? 'success' : 'danger'}>
                          {city.status === 1 ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>{city.created_date ? new Date(city.created_date).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <Stack direction="horizontal" gap={1}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(city)}
                            title="Edit"
                          >
                            <FiEdit size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(city.cityid!)}
                            title="Delete"
                          >
                            <FiTrash2 size={14} />
                          </Button>
                        </Stack>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCity ? 'Edit City' : 'Add New City'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Country <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="countryid"
                    value={formData.countryid || ''}
                    onChange={handleCountryChange}
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country.countryid} value={country.countryid}>
                        {country.country_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>State <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="stateid"
                    value={formData.stateid || ''}
                    onChange={handleStateChange}
                    required
                    disabled={!selectedCountry}
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state.stateid} value={state.stateid}>
                        {state.state_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>District <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="districtid"
                    value={formData.districtid || ''}
                    onChange={handleDistrictChange}
                    required
                    disabled={!selectedState}
                  >
                    <option value="">Select District</option>
                    {districts.map(district => (
                      <option key={district.districtid} value={district.districtid}>
                        {district.district_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="cityname"
                    value={formData.cityname}
                    onChange={handleInputChange}
                    placeholder="Enter city name"
                    required
                    maxLength={100}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingCity ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CityMasterComponent;
