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
  Alert,
  Badge,
  InputGroup,
  Dropdown,
  Pagination
} from 'react-bootstrap';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  MapPin,
  Building,
  Flag,
  Navigation
} from 'lucide-react';
import axios from 'axios';

const DistrictMaster = () => {
  // State management
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [districtToDelete, setDistrictToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    distrcitname: '',
    ditcrictcode: '',
    stateid: '',
    description: ''
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Load data on component mount
  useEffect(() => {
    loadDistricts();
    loadStates();
  }, []);

  // Normalize API district item into a consistent shape used by this component
  const normalizeDistrict = (d) => ({
    id: d?.distrcitid ?? null,
    name: d?.distrcitname ?? '',
    code: d?.ditcrictcode ?? '',
    state_id: d?.stateid ?? null,
    state_name: d?.state_name ?? '',
    country_name: d?.country_name ?? '',
    description: d?.description ?? '',
    status: d?.status ?? 1,
    created_at: d?.created_date ?? null,
  });

  // Load districts from API
  const loadDistricts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('http://localhost:3001/api/districts');
      console.log('Loaded districts:', response.data);
      const normalized = Array.isArray(response.data)
        ? response.data.map(normalizeDistrict)
        : [];
      setDistricts(normalized);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load districts');
      console.error('Error loading districts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load states for dropdown
  const loadStates = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/states');
      console.log('Loaded states:', response.data);
      setStates(response.data);
    } catch (err) {
      console.error('Error loading states:', err);
      setError('Failed to load states');
      setStates([]);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.distrcitname.trim()) {
      newErrors.distrcitname = 'District name is required';
    }
    
    if (!formData.ditcrictcode.trim()) {
      newErrors.ditcrictcode = 'District code is required';
    } else if (formData.ditcrictcode.length !== 2) {
      newErrors.ditcrictcode = 'District code must be 2 characters';
    }
    
    if (!formData.stateid) {
      newErrors.stateid = 'State is required';
    }
    
    setErrors(newErrors);
    console.log('Validation errors:', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Submitting formData:', formData);
      const payload = {
        distrcitname: formData.distrcitname.trim(),
        ditcrictcode: formData.ditcrictcode.trim().toUpperCase(),
        stateid: formData.stateid,
        description: formData.description || null
      };
      if (editingDistrict) {
        const response = await axios.put(`http://localhost:3001/api/districts/${editingDistrict.id}`, payload);
        console.log('Updated district:', response.data.district);
        await loadDistricts();
      } else {
        const response = await axios.post('http://localhost:3001/api/districts', payload);
        console.log('New district added:', response.data);
        const normalizedDistrict = normalizeDistrict(response.data.district);
        if (response.data.district) {
          setDistricts(prev => [normalizedDistrict, ...prev]);
        }
      }
      
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save district');
      console.error('Error saving district:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (district) => {
    setEditingDistrict(district);
    setFormData({
      distrcitname: district.name,
      ditcrictcode: district.code,
      stateid: district.state_id.toString(), // Ensure stateid is a string
      description: district.description || ''
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = (district) => {
    setDistrictToDelete(district);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (districtToDelete) {
      try {
        console.log('Deleting district:', districtToDelete.id);
        await axios.delete(`http://localhost:3001/api/districts/${districtToDelete.id}`);
        await loadDistricts();
        setShowDeleteModal(false);
        setDistrictToDelete(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete district');
        console.error('Error deleting district:', err.response?.data || err);
      }
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDistrict(null);
    setFormData({
      distrcitname: '',
      ditcrictcode: '',
      stateid: '',
      description: ''
    });
    setErrors({});
  };

  // Filter districts based on search term
  const normalizedSearch = (searchTerm || '').toString().toLowerCase();
  const filteredDistricts = districts.filter((district) => {
    if (!district || typeof district !== 'object') return false;
    const name = (district.name || '').toString().toLowerCase();
    const code = (district.code || '').toString().toLowerCase();
    const description = (district.description || '').toString().toLowerCase();
    const stateName = (district.state_name || '').toString().toLowerCase();
    const countryName = (district.country_name || '').toString().toLowerCase();
    return (
      name.includes(normalizedSearch) ||
      code.includes(normalizedSearch) ||
      description.includes(normalizedSearch) ||
      stateName.includes(normalizedSearch) ||
      countryName.includes(normalizedSearch)
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDistricts = filteredDistricts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDistricts.length / itemsPerPage);

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <Navigation className="me-2" size={24} />
                District Master
              </h2>
              <p className="text-muted mb-0">Manage districts and their information</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <Plus size={18} />
              Add District
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
              placeholder="Search districts..."
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
              <Dropdown.Item>All Districts</Dropdown.Item>
              <Dropdown.Item>Active Only</Dropdown.Item>
              <Dropdown.Item>Inactive Only</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Districts Table */}
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
                      <th style={{ minWidth: '200px' }}>District</th>
                      <th style={{ minWidth: '100px' }}>Code</th>
                      <th style={{ minWidth: '150px' }}>State</th>
                      <th style={{ minWidth: '150px' }}>Country</th>
                      <th style={{ minWidth: '150px' }}>Description</th>
                      <th style={{ minWidth: '100px' }}>Status</th>
                      <th style={{ minWidth: '120px' }}>Created</th>
                      <th style={{ minWidth: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDistricts.map((district, index) => (
                      <tr key={district.id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              <Building size={16} className="text-muted" />
                            </div>
                            <strong>{district.name}</strong>
                          </div>
                        </td>
                        <td>
                          <Badge bg="info" className="text-uppercase">
                            {district.code}
                          </Badge>
                        </td>
                        <td>
                          {district.state_name ? (
                            <div className="d-flex align-items-center">
                              <MapPin size={14} className="text-muted me-1" />
                              {district.state_name}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {district.country_name ? (
                            <div className="d-flex align-items-center">
                              <Flag size={14} className="text-muted me-1" />
                              {district.country_name}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {district.description ? (
                            <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                              {district.description}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <Badge bg={district.status === 1 ? 'success' : 'secondary'}>
                            {district.status === 1 ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <small className="text-muted">
                            {district.created_at ? new Date(district.created_at).toLocaleDateString() : '-'}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => handleEdit(district)}
                              title="Edit"
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(district)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {currentDistricts.length === 0 && (
                <div className="text-center py-5">
                  <Navigation size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No districts found</h5>
                  <p className="text-muted">
                    {searchTerm ? 'Try adjusting your search terms' : 'Add your first district to get started'}
                  </p>
                </div>
              )}
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
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingDistrict ? 'Edit District' : 'Add New District'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>District Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="distrcitname"
                    value={formData.distrcitname}
                    onChange={handleInputChange}
                    isInvalid={!!errors.distrcitname}
                    placeholder="Enter district name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.distrcitname}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>District Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="ditcrictcode"
                    value={formData.ditcrictcode}
                    onChange={handleInputChange}
                    isInvalid={!!errors.ditcrictcode}
                    placeholder="e.g., DL, MH"
                    maxLength={2}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.ditcrictcode}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>State *</Form.Label>
                  <Form.Select
                    name="stateid"
                    value={formData.stateid}
                    onChange={handleInputChange}
                    isInvalid={!!errors.stateid}
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state.stateid} value={state.stateid}>
                        {state.statename}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.stateid}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter district description"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editingDistrict ? 'Update' : 'Save')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{districtToDelete?.name}</strong>?
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

export default DistrictMaster;
