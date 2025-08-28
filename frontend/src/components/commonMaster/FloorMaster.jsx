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
  Pagination,
  Toast,
  ToastContainer
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
  MapPin,
  Home,
  Layers
} from 'lucide-react';
import { 
  getAllFloors, 
  getMyFloors,
  createFloor, 
  updateFloor, 
  deleteFloor,
  getCurrentHotel,
  getAllHotels,
  checkAuthStatus
} from '../../services/floorMasterService';
import { APICore } from '../../common/api/apiCore';

const FloorMaster = () => {
  // State management
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState(null);
  const [currentHotel, setCurrentHotel] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    floor_name: '',
    display_name: '',
    Hotel_id: '',
    status: 1
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Load floors and current hotel on component mount
  useEffect(() => {
    loadFloors();
    loadCurrentHotel();
  }, []);

  // Reset to first page when search term or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Always load hotels to find matching hotel for user
  useEffect(() => {
    console.log('Loading hotels to find matching hotel...');
    loadHotels();
  }, []);

  // Watch for when hotels are loaded and try to match user's hotel
  useEffect(() => {
    if (hotels.length > 0 && loggedInUser && !currentHotel) {
      console.log('Hotels loaded, trying to match user hotel...');
      console.log('Logged in user:', loggedInUser);
      console.log('Available hotels:', hotels);
      
      // Try to find hotel by user name - more flexible matching
      const matchingHotel = hotels.find(hotel => {
        const hotelName = hotel.hotel_name.toLowerCase();
        const userName = loggedInUser.name?.toLowerCase();
        
        console.log(`Comparing hotel "${hotelName}" with user "${userName}"`);
        
        return hotelName === userName ||
               hotelName.includes(userName) ||
               userName.includes(hotelName) ||
               hotelName.startsWith(userName) ||
               userName.startsWith(hotelName);
      });
      
      if (matchingHotel) {
        console.log('Found matching hotel:', matchingHotel);
        const newHotel = {
          id: matchingHotel.ldg_hotelid,
          name: matchingHotel.hotel_name,
          email: loggedInUser.email || ''
        };
        console.log('Setting current hotel to:', newHotel);
        setCurrentHotel(newHotel);
      } else {
        console.log('No matching hotel found for user:', loggedInUser.name);
        console.log('Available hotel names:', hotels.map(h => h.hotel_name));
      }
    }
  }, [hotels, loggedInUser, currentHotel]);

  // Debug: Log current hotel state changes
  useEffect(() => {
    console.log('Current hotel state changed:', currentHotel);
  }, [currentHotel]);

  // Get logged-in user information
  const getLoggedInUser = () => {
    const apiCore = new APICore();
    
    // Debug: Check sessionStorage directly first
    const sessionData = sessionStorage.getItem('user');
    console.log('Raw sessionStorage data:', sessionData);
    
    if (sessionData) {
      try {
        const parsedSession = JSON.parse(sessionData);
        console.log('Parsed session data:', parsedSession);
        console.log('Session keys:', Object.keys(parsedSession));
      } catch (error) {
        console.error('Error parsing session data:', error);
      }
    }
    
    const user = apiCore.getLoggedInUser();
    console.log('Logged-in user data from apiCore:', user);
    
    // Additional debugging
    if (user) {
      console.log('Username:', user.name);
      console.log('User email:', user.email);
      console.log('User role:', user.role);
      console.log('User ID:', user.id);
      console.log('User object keys:', Object.keys(user));
      console.log('User object:', JSON.stringify(user, null, 2));
      return user;
    } else {
      console.log('No user data returned from apiCore.getLoggedInUser()');
      
      // Try to get user data directly from sessionStorage as fallback
      if (sessionData) {
        try {
          const parsedSession = JSON.parse(sessionData);
          console.log('Using fallback session data:', parsedSession);
          return parsedSession;
        } catch (error) {
          console.error('Error parsing fallback session data:', error);
        }
      }
    }
    return null;
  };

  // Load current hotel information
  const loadCurrentHotel = () => {
    // First get the logged-in user
    const user = getLoggedInUser();
    console.log('Logged-in user:', user);
    setLoggedInUser(user);
    
    // Debug: Check sessionStorage directly
    const sessionData = sessionStorage.getItem('user');
    console.log('Session data from sessionStorage:', sessionData);

    // Debug: Check what's in localStorage
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    console.log('Auth token:', authToken);
    console.log('User data from localStorage:', userData);
    
    // PRIORITY: Use the actual logged-in user information first
    let finalHotel = null;
    
    if (user && user.name && user.id) {
      console.log('Using actual logged-in user for hotel detection');
      finalHotel = {
        id: user.id,
        name: user.name,
        email: user.email || ''
      };
      console.log('Final hotel from logged-in user:', finalHotel);
    } else {
      // Try to find hotel by name in the hotels array
      console.log('Trying to find hotel by name in hotels array...');
      
      // First, load hotels to get the list
      loadHotels().then(() => {
        // This will be handled in the useEffect that watches hotels
      });
      
      // Only try service method if no user data available
      const hotel = getCurrentHotel();
      console.log('Current hotel data from service:', hotel);
      
      if (hotel) {
        console.log('Using detected hotel from service');
        finalHotel = hotel;
      }
    }
    
    // Only use fallback if no user is detected at all
    if (!finalHotel) {
      console.log('No user detected, using fallback');
      finalHotel = {
        id: 1,
        name: 'Default Hotel',
        email: ''
      };
    }
    
    console.log('Final hotel being set:', finalHotel);
    setCurrentHotel(finalHotel);
    
    // If we have a current hotel, set it as the default Hotel_id
    if (finalHotel) {
      setFormData(prev => ({
        ...prev,
        Hotel_id: finalHotel.id.toString()
      }));
    }
  };

  // Load floors from API
  const loadFloors = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Use getMyFloors instead of getAllFloors to get only current user's floors
      const data = await getMyFloors();
      console.log('Loaded my floors:', data);
      console.log('Number of my floors:', data.length);
      setFloors(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load floors');
      console.error('Error loading my floors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load hotels from API
  const loadHotels = async () => {
    try {
      const data = await getAllHotels();
      console.log('Loaded hotels:', data);
      setHotels(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load hotels');
      console.error('Error loading hotels:', err);
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
    
    if (!formData.floor_name.trim()) {
      newErrors.floor_name = 'Floor name is required';
    }
    
    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Display name is required';
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
      // Check authentication status before making request
      console.log('🔐 Checking authentication before submitting...');
      const authStatus = checkAuthStatus();
      
      if (!authStatus.authenticated) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const submitData = {
        floor_name: formData.floor_name,
        display_name: formData.display_name,
        Hotel_id: currentHotel ? currentHotel.id : (formData.Hotel_id ? parseInt(formData.Hotel_id) : undefined),
        status: formData.status
      };

      console.log('📤 Submitting floor data:', submitData);

      if (editingFloor) {
        // Update existing floor
        await updateFloor(editingFloor.floorid, submitData);
        // Reload floors to get updated data
        await loadFloors();
        setSuccessMessage('Floor updated successfully!');
      } else {
        // Add new floor
        const response = await createFloor(submitData);
        console.log('API response:', response);
        
        // Extract the floor from the response
        const newFloor = response.floor || response;
        console.log('New floor extracted:', newFloor);
        console.log('New floor structure:', Object.keys(newFloor));
        console.log('floor_name:', newFloor.floor_name);
        console.log('display_name:', newFloor.display_name);
        
        // Add the new floor to the list immediately
        setFloors(prev => [newFloor, ...prev]);
        setSuccessMessage('Floor created successfully!');
      }
      
      // Show success toast
      setShowSuccessToast(true);
      console.log('Success! Showing toast and closing modal');
      handleCloseModal();
    } catch (err) {
      console.error('❌ Error saving floor:', err);
      setError(err.response?.data?.error || err.message || 'Failed to save floor');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (floor) => {
    setEditingFloor(floor);
    setFormData({
      floor_name: floor.floor_name,
      display_name: floor.display_name,
      Hotel_id: floor.Hotel_id ? floor.Hotel_id.toString() : (currentHotel ? currentHotel.id.toString() : ''),
      status: floor.status
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = (floor) => {
    setFloorToDelete(floor);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (floorToDelete) {
      try {
        await deleteFloor(floorToDelete.floorid);
        // Reload floors to get updated data
        await loadFloors();
        setShowDeleteModal(false);
        setFloorToDelete(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete floor');
        console.error('Error deleting floor:', err);
      }
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFloor(null);
    setFormData({
      floor_name: '',
      display_name: '',
      Hotel_id: currentHotel ? currentHotel.id.toString() : '',
      status: 1
    });
    setErrors({});
  };

  // Filter floors based on search term and status
  const filteredFloors = floors.filter(floor => {
    // Text search filter
    const matchesSearch = (floor.floor_name && floor.floor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (floor.display_name && floor.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = floor.status === 1;
    } else if (statusFilter === 'inactive') {
      matchesStatus = floor.status === 0;
    }
    // If statusFilter is 'all', matchesStatus remains true
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFloors = filteredFloors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFloors.length / itemsPerPage);
  
  // Debug pagination
  console.log('Pagination Debug:', {
    totalFloors: floors.length,
    filteredFloors: filteredFloors.length,
    itemsPerPage,
    currentPage,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    currentFloorsLength: currentFloors.length
  });

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <Layers className="me-2" size={24} />
                Floor Master
              </h2>
              <p className="text-muted mb-0">Manage your hotel floors and their information</p>
              <small className="text-muted">
                My Floors: {floors.length} | Showing: {filteredFloors.length}
              </small>
              {loggedInUser && (
                <small className="text-primary">
                  👤 Logged in as: {loggedInUser.name} ({loggedInUser.role})
                </small>
              )}
              {currentHotel ? (
                <small className="text-info">
                  <Hotel size={14} className="me-1" />
                  Current Hotel: {currentHotel.name}
                </small>
              ) : (
                <small className="text-warning">
                  <Hotel size={14} className="me-1" />
                  No hotel detected - please log in as a hotel user
                </small>
              )}
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <Plus size={18} />
              Add Floor
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
              placeholder="Search floors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="d-flex justify-content-end">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" className="d-flex align-items-center gap-2">
              <Filter size={16} />
              {statusFilter === 'all' ? 'All Floors' : 
               statusFilter === 'active' ? 'Active Only' : 'Inactive Only'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item 
                active={statusFilter === 'all'}
                onClick={() => setStatusFilter('all')}
              >
                All Floors
              </Dropdown.Item>
              <Dropdown.Item 
                active={statusFilter === 'active'}
                onClick={() => setStatusFilter('active')}
              >
                Active Only
              </Dropdown.Item>
              <Dropdown.Item 
                active={statusFilter === 'inactive'}
                onClick={() => setStatusFilter('inactive')}
              >
                Inactive Only
              </Dropdown.Item>
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

      {/* Floors Table */}
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
              <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'auto' }}>
                <Table hover className="mb-0" style={{ minWidth: '800px' }}>
                  <thead className="table-light sticky-top bg-white" style={{ zIndex: 1 }}>
                    <tr>
                      <th style={{ minWidth: '50px' }}>#</th>
                      <th style={{ minWidth: '200px' }}>Floor Name</th>
                      <th style={{ minWidth: '200px' }}>Display Name</th>
                      <th style={{ minWidth: '150px' }}>Hotel</th>
                      <th style={{ minWidth: '100px' }}>Status</th>
                      <th style={{ minWidth: '120px' }}>Created</th>
                      <th style={{ minWidth: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentFloors.map((floor, index) => (
                      <tr key={floor.floorid}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              <Layers size={16} className="text-muted" />
                            </div>
                            <strong>{floor.floor_name}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="text-muted">{floor.display_name}</span>
                        </td>
                        <td>
                          {floor.Hotel_id ? (
                            <div className="d-flex align-items-center">
                              <Hotel size={14} className="text-muted me-1" />
                              <span>
                                {currentHotel && floor.Hotel_id === currentHotel.id 
                                  ? currentHotel.name 
                                  : `Hotel ${floor.Hotel_id}`
                                }
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <Badge bg={floor.status === 1 ? 'success' : 'secondary'}>
                            {floor.status === 1 ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <small className="text-muted">
                            {floor.created_date ? 
                              new Date(floor.created_date).toLocaleDateString() : 
                              '-'
                            }
                          </small>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => handleEdit(floor)}
                              title="Edit"
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(floor)}
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
              {currentFloors.length === 0 && (
                <div className="text-center py-5">
                  <Layers size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No floors found</h5>
                  <p className="text-muted">
                    {searchTerm ? 'Try adjusting your search terms' : 'Add your first floor to get started'}
                  </p>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Pagination */}
      <Row className="mt-4">
        <Col className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div className="text-muted">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredFloors.length)} of {filteredFloors.length} floors
            </div>
            <div className="d-flex align-items-center gap-2">
              <small className="text-muted">Show:</small>
              <Form.Select 
                size="sm" 
                style={{ width: '70px' }}
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing page size
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </Form.Select>
            </div>
          </div>
          <div>
            <Pagination className="mb-0">
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
          </div>
        </Col>
      </Row>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingFloor ? 'Edit Floor' : 'Add New Floor'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Floor Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="floor_name"
                    value={formData.floor_name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.floor_name}
                    placeholder="Enter floor name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.floor_name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Display Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.display_name}
                    placeholder="Enter display name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.display_name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hotel Name</Form.Label>
                  <div>
                    {currentHotel ? (
                      <Form.Select
                        value={currentHotel.id}
                        name="Hotel_id"
                        onChange={handleInputChange}
                        isInvalid={!!errors.Hotel_id}
                      >
                        <option value={currentHotel.id}>{currentHotel.name}</option>
                      </Form.Select>
                    ) : (
                      <Form.Select
                        value={formData.Hotel_id}
                        name="Hotel_id"
                        onChange={handleInputChange}
                        isInvalid={!!errors.Hotel_id}
                      >
                        <option value="">Select Hotel</option>
                        {hotels.map(hotel => (
                          <option key={hotel.ldg_hotelid} value={hotel.ldg_hotelid}>
                            {hotel.hotel_name}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {errors.Hotel_id}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
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
              {loading ? 'Saving...' : (editingFloor ? 'Update' : 'Save')}
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
          Are you sure you want to delete <strong>{floorToDelete?.floor_name}</strong>?
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

      {/* Success Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showSuccessToast} 
          onClose={() => setShowSuccessToast(false)}
          delay={3000}
          autohide
          bg="success"
          text="white"
        >
          <Toast.Header closeButton>
            <strong className="me-auto">Success!</strong>
          </Toast.Header>
          <Toast.Body>
            {successMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default FloorMaster; 