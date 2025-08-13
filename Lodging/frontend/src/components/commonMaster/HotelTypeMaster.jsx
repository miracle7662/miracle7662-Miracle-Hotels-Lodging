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
  Eye, 
  Filter,
  Building,
  Hotel,
  MapPin
} from 'lucide-react';
import { 
  getAllHotelTypes, 
  createHotelType, 
  updateHotelType, 
  deleteHotelType
} from '../../services/hotelTypeService';

const HotelTypeMaster = () => {
  // State management
  const [hotelTypes, setHotelTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingHotelType, setEditingHotelType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hotelTypeToDelete, setHotelTypeToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    ldg_hotel_type: '',
    ldg_hotelid: '',
    ldg_marketid: '',
    ldg_status: 1
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Load hotel types on component mount
  useEffect(() => {
    loadHotelTypes();
  }, []);

  // Load hotel types from API
  const loadHotelTypes = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await getAllHotelTypes();
      console.log('Loaded hotel types:', data);
      console.log('Number of hotel types:', data.length);
      setHotelTypes(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load hotel types');
      console.error('Error loading hotel types:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
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
    
    if (!formData.ldg_hotel_type.trim()) {
      newErrors.ldg_hotel_type = 'Hotel type name is required';
    }
    
    if (formData.ldg_hotelid && isNaN(formData.ldg_hotelid)) {
      newErrors.ldg_hotelid = 'Hotel ID must be a valid number';
    }
    
    if (formData.ldg_marketid && isNaN(formData.ldg_marketid)) {
      newErrors.ldg_marketid = 'Market ID must be a valid number';
    }
    
    setErrors(newErrors);
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
      const submitData = {
        ldg_hotel_type: formData.ldg_hotel_type,
        ldg_hotelid: formData.ldg_hotelid ? parseInt(formData.ldg_hotelid) : undefined,
        ldg_marketid: formData.ldg_marketid ? parseInt(formData.ldg_marketid) : undefined
      };

      if (editingHotelType) {
        // Update existing hotel type
        await updateHotelType(editingHotelType.ldg_hoteltypeid, submitData);
        // Reload hotel types to get updated data
        await loadHotelTypes();
      } else {
        // Add new hotel type
        const newHotelType = await createHotelType(submitData);
        console.log('New hotel type added:', newHotelType);
        
        // Add the new hotel type to the list immediately
        setHotelTypes(prev => [newHotelType, ...prev]);
      }
      
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save hotel type');
      console.error('Error saving hotel type:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (hotelType) => {
    setEditingHotelType(hotelType);
    setFormData({
      ldg_hotel_type: hotelType.ldg_hotel_type,
      ldg_hotelid: hotelType.ldg_hotelid || '',
      ldg_marketid: hotelType.ldg_marketid || '',
      ldg_status: hotelType.ldg_status
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = (hotelType) => {
    setHotelTypeToDelete(hotelType);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (hotelTypeToDelete) {
      try {
        await deleteHotelType(hotelTypeToDelete.ldg_hoteltypeid);
        // Reload hotel types to get updated data
        await loadHotelTypes();
        setShowDeleteModal(false);
        setHotelTypeToDelete(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete hotel type');
        console.error('Error deleting hotel type:', err);
      }
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHotelType(null);
    setFormData({
      ldg_hotel_type: '',
      ldg_hotelid: '',
      ldg_marketid: '',
      ldg_status: 1
    });
    setErrors({});
  };

  // Filter hotel types based on search term
  const filteredHotelTypes = hotelTypes.filter(hotelType =>
    hotelType.ldg_hotel_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHotelTypes = filteredHotelTypes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHotelTypes.length / itemsPerPage);

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <Hotel className="me-2" size={24} />
                Hotel Type Master
              </h2>
              <p className="text-muted mb-0">Manage hotel types and their information</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <Plus size={18} />
              Add Hotel Type
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
              placeholder="Search hotel types..."
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
              <Dropdown.Item>All Hotel Types</Dropdown.Item>
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

      {/* Hotel Types Table */}
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
                      <th style={{ minWidth: '200px' }}>Hotel Type</th>
                      <th style={{ minWidth: '100px' }}>Hotel ID</th>
                      <th style={{ minWidth: '100px' }}>Market ID</th>
                      <th style={{ minWidth: '100px' }}>Status</th>
                      <th style={{ minWidth: '120px' }}>Created</th>
                      <th style={{ minWidth: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentHotelTypes.map((hotelType, index) => (
                      <tr key={hotelType.ldg_hoteltypeid}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              <Building size={16} className="text-muted" />
                            </div>
                            <strong>{hotelType.ldg_hotel_type}</strong>
                          </div>
                        </td>
                        <td>
                          {hotelType.ldg_hotelid ? (
                            <Badge bg="info">
                              {hotelType.ldg_hotelid}
                            </Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {hotelType.ldg_marketid ? (
                            <Badge bg="secondary">
                              {hotelType.ldg_marketid}
                            </Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <Badge bg={hotelType.ldg_status === 1 ? 'success' : 'secondary'}>
                            {hotelType.ldg_status === 1 ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <small className="text-muted">
                            {hotelType.ldg_created_date ? 
                              new Date(hotelType.ldg_created_date).toLocaleDateString() : 
                              '-'
                            }
                          </small>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => handleEdit(hotelType)}
                              title="Edit"
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(hotelType)}
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

              {/* Empty State */}
              {currentHotelTypes.length === 0 && (
                <div className="text-center py-5">
                  <Hotel size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No hotel types found</h5>
                  <p className="text-muted">
                    {searchTerm ? 'Try adjusting your search terms' : 'Add your first hotel type to get started'}
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
            {editingHotelType ? 'Edit Hotel Type' : 'Add New Hotel Type'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Hotel Type Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="ldg_hotel_type"
                    value={formData.ldg_hotel_type}
                    onChange={handleInputChange}
                    isInvalid={!!errors.ldg_hotel_type}
                    placeholder="Enter hotel type name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.ldg_hotel_type}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hotel ID</Form.Label>
                  <Form.Control
                    type="number"
                    name="ldg_hotelid"
                    value={formData.ldg_hotelid}
                    onChange={handleInputChange}
                    isInvalid={!!errors.ldg_hotelid}
                    placeholder="Enter hotel ID"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.ldg_hotelid}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Market ID</Form.Label>
                  <Form.Control
                    type="number"
                    name="ldg_marketid"
                    value={formData.ldg_marketid}
                    onChange={handleInputChange}
                    isInvalid={!!errors.ldg_marketid}
                    placeholder="Enter market ID"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.ldg_marketid}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="ldg_status"
                    value={formData.ldg_status}
                    onChange={handleInputChange}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </Form.Select>
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
              {loading ? 'Saving...' : (editingHotelType ? 'Update' : 'Save')}
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
          Are you sure you want to delete <strong>{hotelTypeToDelete?.ldg_hotel_type}</strong>?
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

export default HotelTypeMaster; 