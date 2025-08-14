import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuthContext } from '../../common/context/useAuthContext';
import { 
  getAllNewspapers, 
  createNewspaper, 
  updateNewspaper, 
  deleteNewspaper,
  Newspaper 
} from '../../services/newspaperService';
import { getAllHotels, HotelMaster } from '../../services/hotelMasterService';
import jwtDecode from 'jwt-decode';

const NewspaperMaster: React.FC = () => {
  const { user, isAuthenticated } = useAuthContext();
  
  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    window.location.href = '/auth/login';
    return null;
  }
  
  // Check if token exists
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/auth/login';
    return null;
  }
  
  const [newspapers, setNewspapers] = useState<Newspaper[]>([]);
  const [hotels, setHotels] = useState<HotelMaster[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingNewspaper, setDeletingNewspaper] = useState<Newspaper | null>(null);
  const [editingNewspaper, setEditingNewspaper] = useState<Newspaper | null>(null);
  const [formData, setFormData] = useState({
    paper_name: '',
    hotelid: user?.role === 'hotel' || user?.role === 'user' ? user?.id : selectedHotelId,
    status: 1 // Default to active
  });

  // Load hotels for admin users
  const loadHotels = async () => {
    try {
      const hotelsData = await getAllHotels();
      setHotels(hotelsData);
      
      // For hotel users, add their hotel to the list if not present
      if (user?.role === 'hotel' || user?.role === 'user') {
        const userHotel = hotelsData.find(hotel => hotel.ldg_hotelid === user?.id);
        if (!userHotel && user?.id) {
          setHotels(prev => [...prev, {
            ldg_hotelid: user.id,
            hotel_name: user.name || 'Current Hotel',
            status: 1
          }]);
        }
      }
    } catch (error) {
      console.error('Error loading hotels:', error);
    }
  };

  // Load newspapers
  const loadNewspapers = async () => {
    try {
      setLoading(true);
      const hotelId = user?.role === 'hotel' || user?.role === 'user' ? user?.id : selectedHotelId;
      const data = await getAllNewspapers(hotelId);
      setNewspapers(data);
    } catch (error) {
      console.error('Error loading newspapers:', error);
      toast.error('Failed to load newspapers');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadHotels();
    loadNewspapers();
  }, []);

  // Reload newspapers when selected hotel changes
  useEffect(() => {
    if (user?.role === 'superadmin' || user?.role === 'agent') {
      loadNewspapers();
    }
  }, [selectedHotelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paper_name.trim()) {
      toast.error('Paper name is required');
      return;
    }

    try {
      // Check token before making API call
      const token = localStorage.getItem('authToken');
      if (token) {
        
        // Check if token is expired
        try {
          const decoded: any = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            console.warn('🔍 handleSubmit - Token is expired!');
            toast.error('Your session has expired. Please login again.');
            window.location.href = '/auth/login';
            return;
          }
        } catch (error) {
          console.error('🔍 handleSubmit - Error decoding token:', error);
          toast.error('Invalid authentication token. Please login again.');
          window.location.href = '/auth/login';
          return;
        }
      } else {
        console.error('🔍 handleSubmit - No token found!');
        toast.error('No authentication token found. Please login again.');
        window.location.href = '/auth/login';
        return;
      }
      
      if (editingNewspaper) {
        await updateNewspaper(editingNewspaper.newsid, {
          paper_name: formData.paper_name,
          hotelid: formData.hotelid,
          status: formData.status
        });
        toast.success('Newspaper updated successfully');
      } else {
        const result = await createNewspaper(formData);
        toast.success('Newspaper created successfully');
      }
      
      setShowModal(false);
      resetForm();
      
      // Force reload the newspapers list
      await loadNewspapers();
      
    } catch (error: any) {
      console.error('Error saving newspaper:', error);
      toast.error('Failed to save newspaper');
    }
  };

  const handleEdit = (newspaper: Newspaper) => {
    setEditingNewspaper(newspaper);
    setFormData({
      paper_name: newspaper.paper_name,
      hotelid: newspaper.hotelid,
      status: newspaper.status
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingNewspaper) return;

    try {
      await deleteNewspaper(deletingNewspaper.newsid);
      toast.success('Newspaper deleted successfully');
      setShowDeleteModal(false);
      setDeletingNewspaper(null);
      loadNewspapers();
    } catch (error) {
      console.error('Error deleting newspaper:', error);
      toast.error('Failed to delete newspaper');
    }
  };

  const resetForm = () => {
    setFormData({
      paper_name: '',
      hotelid: user?.role === 'hotel' || user?.role === 'user' ? user?.id : selectedHotelId,
      status: 1 // Default to active
    });
    setEditingNewspaper(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const getStatusBadge = (status: number) => {
    return status === 1 ? (
      <Badge bg="success">Active</Badge>
    ) : (
      <Badge bg="danger">Inactive</Badge>
    );
  };

  const getCurrentHotelName = () => {
    if (user?.role === 'hotel' || user?.role === 'user') {
      return user?.name || 'Current Hotel';
    }
    if (selectedHotelId) {
      const selectedHotel = hotels.find(hotel => hotel.ldg_hotelid === selectedHotelId);
      return selectedHotel?.hotel_name || 'Select Hotel';
    }
    return 'Select Hotel';
  };

  const getCurrentHotelId = () => {
    if (user?.role === 'hotel' || user?.role === 'user') {
      return user?.id;
    }
    return selectedHotelId;
  };

  const isAdmin = user?.role === 'superadmin' || user?.role === 'agent';

  return (
    <div className="container-fluid">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">Newspaper Master</h4>
                {!isAdmin && (
                  <small className="text-primary">
                    <i className="bi bi-building me-1"></i>
                    Current Hotel: {getCurrentHotelName()}
                  </small>
                )}
              </div>
              <Button variant="primary" onClick={openAddModal}>
                <FiPlus className="me-2" />
                Add Newspaper
              </Button>
            </Card.Header>
            <Card.Body>
              {/* Hotel Selection for Admin Users */}
              {isAdmin && (
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Select Hotel</Form.Label>
                      <Form.Select
                        value={selectedHotelId || ''}
                        onChange={(e) => setSelectedHotelId(Number(e.target.value) || undefined)}
                      >
                        <option value="">Select a hotel</option>
                        {hotels.map((hotel) => (
                          <option key={hotel.ldg_hotelid} value={hotel.ldg_hotelid}>
                            {hotel.hotel_name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : newspapers.length === 0 ? (
                <Alert variant="info">
                  No newspapers found for this hotel.
                </Alert>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Paper Name</th>
                      <th>Hotel</th>
                      <th>Status</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newspapers.map((newspaper, index) => (
                      <tr key={newspaper.newsid}>
                        <td>{index + 1}</td>
                        <td>{newspaper.paper_name}</td>
                        <td>{newspaper.ldg_hotel_name || 'N/A'}</td>
                        <td>{getStatusBadge(newspaper.status)}</td>
                        <td>{newspaper.created_date ? new Date(newspaper.created_date).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(newspaper)}
                          >
                            <FiEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setDeletingNewspaper(newspaper);
                              setShowDeleteModal(true);
                            }}
                          >
                            <FiTrash2 />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingNewspaper ? 'Edit Newspaper' : 'Add New Newspaper'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Paper Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.paper_name}
                    onChange={(e) => setFormData({ ...formData, paper_name: e.target.value })}
                    placeholder="Enter paper name"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hotel</Form.Label>
                  <Form.Select
                    value={formData.hotelid || getCurrentHotelId() || ''}
                    onChange={(e) => setFormData({ ...formData, hotelid: Number(e.target.value) || undefined })}
                  >
                    <option value={getCurrentHotelId()}>{getCurrentHotelName()}</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Current hotel: {getCurrentHotelName()}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingNewspaper ? 'Update' : 'Create'}
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
          Are you sure you want to delete the newspaper "{deletingNewspaper?.paper_name}"?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NewspaperMaster; 