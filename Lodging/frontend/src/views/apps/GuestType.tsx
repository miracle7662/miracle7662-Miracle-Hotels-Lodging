import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { 
  getAllGuestTypes, 
  createGuestType, 
  updateGuestType, 
  deleteGuestType,
  GuestType,
  CreateGuestTypeRequest,
  UpdateGuestTypeRequest
} from '../../services/guestTypeService';
import { getAllHotels, HotelMaster } from '../../services/hotelMasterService';
import { useAuthContext } from '../../common/context/useAuthContext';

const GuestTypeMaster: React.FC = () => {
  const { user } = useAuthContext();
  const [guestTypes, setGuestTypes] = useState<GuestType[]>([]);
  const [hotels, setHotels] = useState<HotelMaster[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<number | undefined>(user?.id);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGuestType, setEditingGuestType] = useState<GuestType | null>(null);
  const [formData, setFormData] = useState<CreateGuestTypeRequest>({
    guest_type: '',
    hotelid: user?.role === 'hotel' || user?.role === 'user' ? user?.id : selectedHotelId,
    status: 1 // Default to active
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingGuestType, setDeletingGuestType] = useState<GuestType | null>(null);

  // Load hotels and guest types on component mount
  useEffect(() => {
    loadHotels();
    loadGuestTypes();
  }, []);

  // Load guest types when hotel selection changes
  useEffect(() => {
    if (selectedHotelId) {
      loadGuestTypes();
    }
  }, [selectedHotelId]);

  const loadHotels = async () => {
    try {
      const hotelData = await getAllHotels();
      setHotels(hotelData);
      
      // Debug: Log current user and hotels
      console.log('Current user:', user);
      console.log('Loaded hotels:', hotelData);
      
      // For hotel users, ensure their hotel is in the list
      if (user?.role === 'hotel' || user?.role === 'user') {
        const currentHotel = hotelData.find(hotel => hotel.ldg_hotelid === user?.id);
        if (!currentHotel) {
          console.log('Current hotel not found in list, adding it');
          // Add current hotel to the list if not found
          setHotels([...hotelData, {
            ldg_hotelid: user.id,
            hotel_name: user.name || 'Current Hotel',
            status: 1
          }]);
        }
      }
    } catch (error) {
      console.error('Error loading hotels:', error);
      toast.error('Failed to load hotels');
    }
  };

  const loadGuestTypes = async () => {
    try {
      setLoading(true);
      
      // Use the correct hotel ID based on user role
      const hotelIdToUse = user?.role === 'hotel' || user?.role === 'user' ? user?.id : selectedHotelId;
      
      console.log('Loading guest types for hotel ID:', hotelIdToUse);
      console.log('User role:', user?.role);
      console.log('User ID:', user?.id);
      console.log('Selected hotel ID:', selectedHotelId);
      
      const data = await getAllGuestTypes(hotelIdToUse);
      console.log('Loaded guest types:', data);
      setGuestTypes(data);
    } catch (error) {
      console.error('Error loading guest types:', error);
      toast.error('Failed to load guest types');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.guest_type.trim()) {
      toast.error('Guest type is required');
      return;
    }

    try {
      console.log('Submitting guest type:', formData);
      
      if (editingGuestType) {
        await updateGuestType(editingGuestType.guesttypeid, {
          guest_type: formData.guest_type,
          hotelid: formData.hotelid,
          status: formData.status
        });
        console.log('Guest type updated successfully');
        toast.success('Guest type updated successfully');
      } else {
        const result = await createGuestType(formData);
        console.log('Guest type created successfully:', result);
        toast.success('Guest type created successfully');
      }
      
      setShowModal(false);
      resetForm();
      
      // Force reload the guest types list
      console.log('Reloading guest types...');
      await loadGuestTypes();
      console.log('Guest types reloaded');
      
    } catch (error) {
      console.error('Error saving guest type:', error);
      toast.error('Failed to save guest type');
    }
  };

  const handleEdit = (guestType: GuestType) => {
    setEditingGuestType(guestType);
    setFormData({
      guest_type: guestType.guest_type,
      hotelid: guestType.hotelid,
      status: guestType.status
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingGuestType) return;

    try {
      await deleteGuestType(deletingGuestType.guesttypeid);
      toast.success('Guest type deleted successfully');
      setShowDeleteModal(false);
      setDeletingGuestType(null);
      loadGuestTypes();
    } catch (error) {
      console.error('Error deleting guest type:', error);
      toast.error('Failed to delete guest type');
    }
  };

  const resetForm = () => {
    setFormData({
      guest_type: '',
      hotelid: user?.role === 'hotel' || user?.role === 'user' ? user?.id : selectedHotelId,
      status: 1 // Default to active
    });
    setEditingGuestType(null);
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
                <h4 className="mb-0">Guest Type Master</h4>
                {!isAdmin && (
                  <small className="text-primary">
                    <i className="bi bi-building me-1"></i>
                    Current Hotel: {getCurrentHotelName()}
                  </small>
                )}
              </div>
              <Button variant="primary" onClick={openAddModal}>
                <FiPlus className="me-2" />
                Add Guest Type
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
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Guest Type</th>
                      <th>Hotel</th>
                      <th>Status</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guestTypes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <div className="text-muted">
                            {selectedHotelId ? 'No guest types found for this hotel.' : 'Please select a hotel to view guest types.'}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      guestTypes.map((guestType, index) => (
                        <tr key={guestType.guesttypeid}>
                          <td>{index + 1}</td>
                          <td>{guestType.guest_type}</td>
                          <td>{guestType.ldg_hotel_name || 'N/A'}</td>
                          <td>{getStatusBadge(guestType.status)}</td>
                          <td>{new Date(guestType.created_date).toLocaleDateString()}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(guestType)}
                            >
                              <FiEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setDeletingGuestType(guestType);
                                setShowDeleteModal(true);
                              }}
                            >
                              <FiTrash2 />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
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
            {editingGuestType ? 'Edit Guest Type' : 'Add Guest Type'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Guest Type *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter guest type"
                    value={formData.guest_type}
                    onChange={(e) => setFormData({ ...formData, guest_type: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              
              {/* Hotel Selection */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hotel *</Form.Label>
                  <Form.Select
                    value={formData.hotelid || getCurrentHotelId() || ''}
                    onChange={(e) => setFormData({ ...formData, hotelid: Number(e.target.value) || undefined })}
                    required
                  >
                    <option value="">Select a hotel</option>
                    {isAdmin ? (
                      // Show all hotels for admin users
                      hotels.map((hotel) => (
                        <option key={hotel.ldg_hotelid} value={hotel.ldg_hotelid}>
                          {hotel.hotel_name}
                        </option>
                      ))
                    ) : (
                      // Show only current hotel for hotel users
                      hotels
                        .filter(hotel => hotel.ldg_hotelid === user?.id)
                        .map((hotel) => (
                          <option key={hotel.ldg_hotelid} value={hotel.ldg_hotelid}>
                            {hotel.hotel_name}
                          </option>
                        ))
                    )}
                  </Form.Select>
                  {!isAdmin && (
                    <Form.Text className="text-muted">
                      Current hotel: {getCurrentHotelName()}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>

              {/* Status Selection */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                    required
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
              {editingGuestType ? 'Update' : 'Create'}
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
          <Alert variant="warning">
            Are you sure you want to delete the guest type "{deletingGuestType?.guest_type}"?
            This action cannot be undone.
          </Alert>
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

export default GuestTypeMaster; 