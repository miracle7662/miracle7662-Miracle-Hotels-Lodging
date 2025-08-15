import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Badge,
  InputGroup,
  Dropdown,
  Pagination
} from 'react-bootstrap';
import { 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Building,
  Flag,
  Navigation
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
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

const CityMasterComponent: React.FC<{}> = () => {
  const [cities, setCities] = useState<CityMaster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCity, setEditingCity] = useState<CityMaster | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [cityToDelete, setCityToDelete] = useState<CityMaster | null>(null);
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [states, setStates] = useState<StateItem[]>([]);
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | undefined>();
  const [selectedState, setSelectedState] = useState<number | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState<CreateCityMasterRequest>({
    countryid: 0,
    stateid: 0,
    distrcitid: 0,
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
      fetchStatesByCountry(selectedCountry).then(setStates);
    } else {
      setStates([]);
    }
    setSelectedState(undefined);
  }, [selectedCountry]);

  // Load districts when state changes
  useEffect(() => {
    if (selectedState) {
      fetchDistrictsByState(selectedState).then(setDistricts);
    } else {
      setDistricts([]);
    }
  }, [selectedState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = parseInt(e.target.value);
    setSelectedCountry(countryId);
    setFormData(prev => ({
      ...prev,
      countryid: countryId,
      stateid: 0,
      distrcitid: 0
    }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateId = parseInt(e.target.value);
    setSelectedState(stateId);
    setFormData(prev => ({
      ...prev,
      stateid: stateId,
      distrcitid: 0
    }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = parseInt(e.target.value);
    setFormData(prev => ({
      ...prev,
      distrcitid: districtId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      distrcitid: city.distrcitid,
      cityname: city.cityname,
      status: city.status || 1
    });
    setSelectedCountry(city.countryid);
    setSelectedState(city.stateid);
    setShowModal(true);
  };

  const handleDelete = (city: CityMaster) => {
    setCityToDelete(city);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (cityToDelete) {
      try {
        await deleteCity(cityToDelete.cityid!);
        toast.success('City deleted successfully!');
        setCities(prev => prev.filter(c => c.cityid !== cityToDelete.cityid));
        setShowDeleteModal(false);
        setCityToDelete(null);
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
      distrcitid: 0,
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

  // Filter cities based on search term
  const normalizedSearch = (searchTerm || '').toString().toLowerCase();
  const filteredCities = cities.filter((city) => {
    if (!city || typeof city !== 'object') return false;
    const cityName = (city.cityname || '').toString().toLowerCase();
    const countryName = (city.country_name || '').toString().toLowerCase();
    const stateName = (city.state_name || '').toString().toLowerCase();
    const districtName = (city.district_name || '').toString().toLowerCase();
    return (
      cityName.includes(normalizedSearch) ||
      countryName.includes(normalizedSearch) ||
      stateName.includes(normalizedSearch) ||
      districtName.includes(normalizedSearch)
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCities = filteredCities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCities.length / itemsPerPage);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <Navigation className="me-2" size={24} />
                City Master
              </h2>
              <p className="text-muted mb-0">Manage cities and their information</p>
            </div>
            <Button 
              variant="primary" 
              onClick={openAddModal}
              className="d-flex align-items-center gap-2"
            >
              <Plus size={18} />
              Add New City
            </Button>
          </div>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <Search size={16} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="d-flex justify-content-end">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" className="d-flex align-items-center gap-2">
              <Filter size={16} />
              Filter
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>All Cities</Dropdown.Item>
              <Dropdown.Item>Active Only</Dropdown.Item>
              <Dropdown.Item>Inactive Only</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>


      {/* Cities Table */}
      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <Table hover className="mb-0">
                  <thead className="table-light sticky-top bg-white" style={{ zIndex: 1 }}>
                    <tr>
                      <th style={{ minWidth: '50px' }}>#</th>
                      <th style={{ minWidth: '200px' }}>City Name</th>
                      <th style={{ minWidth: '150px' }}>Country</th>
                      <th style={{ minWidth: '150px' }}>State</th>
                      <th style={{ minWidth: '150px' }}>District</th>
                      <th style={{ minWidth: '100px' }}>Status</th>
                      <th style={{ minWidth: '120px' }}>Created Date</th>
                      <th style={{ minWidth: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCities.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center">No cities found</td>
                      </tr>
                    ) : (
                      currentCities.map((city, index) => (
                        <tr key={city.cityid}>
                          <td>{indexOfFirstItem + index + 1}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-2">
                                <Building size={16} className="text-muted" />
                              </div>
                              <strong>{city.cityname}</strong>
                            </div>
                          </td>
                          <td>
                            {city.country_name ? (
                              <div className="d-flex align-items-center">
                                <Flag size={14} className="text-muted me-1" />
                                {city.country_name}
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {city.state_name ? (
                              <div className="d-flex align-items-center">
                                <MapPin size={14} className="text-muted me-1" />
                                {city.state_name}
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {city.district_name ? (
                              <div className="d-flex align-items-center">
                                <MapPin size={14} className="text-muted me-1" />
                                {city.district_name}
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <Badge bg={city.status === 1 ? 'success' : 'danger'}>
                              {city.status === 1 ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td>
                            <small className="text-muted">
                              {city.created_date ? new Date(city.created_date).toLocaleDateString() : '-'}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleEdit(city)}
                                title="Edit"
                              >
                                <FiEdit />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDelete(city)}
                                title="Delete"
                              >
                                <FiTrash2 />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <Pagination>
              <Pagination.First 
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Pagination.Item
                  key={page}
                  active={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Pagination.Item>
              ))}
              <Pagination.Next 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last 
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </Col>
        </Row>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
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
                  <Form.Label>Country *</Form.Label>
                  <Form.Select
                    name="countryid"
                    value={formData.countryid || ''}
                    onChange={handleCountryChange}
                    required
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
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>State *</Form.Label>
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
                        {state.statename}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>District *</Form.Label>
                  <Form.Select
                    name="distrcitid"
                    value={formData.distrcitid || ''}
                    onChange={handleDistrictChange}
                    required
                    disabled={!selectedState}
                  >
                    <option value="">Select District</option>
                    {districts.map(district => (
                      <option key={district.distrcitid} value={district.distrcitid}>
                        {district.distrcitname}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="cityname"
                    value={formData.cityname}
                    onChange={handleInputChange}
                    placeholder="Enter city name"
                    required
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
            <div className="d-flex justify-content-end gap-2">
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{cityToDelete?.cityname}</strong>?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CityMasterComponent;