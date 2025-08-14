import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Modal, Form, Badge, Alert } from 'react-bootstrap';
import { FiEdit, FiTrash2, FiHome, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getFragments, createFragment, updateFragment, deleteFragment, Fragment, CreateFragmentRequest } from '../../services/fragmentService';
import { getAllHotels, HotelMaster } from '../../services/hotelMasterService';
import { useAuthContext } from '../../common/context/useAuthContext';

const FragmentMaster: React.FC = () => {
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [hotels, setHotels] = useState<HotelMaster[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFragment, setEditingFragment] = useState<Fragment | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateFragmentRequest>({
    fragment_name: '',
    status: 1,
    hotelid: undefined
  });

  const { user } = useAuthContext();
  const isAdmin = user?.role === 'superadmin' || user?.role === 'agent';

  // Get current hotel info
  const getCurrentHotelId = () => user?.id;
  const getCurrentHotelName = () => user?.name || 'Current Hotel';

  useEffect(() => {
    loadFragments();
    if (isAdmin) {
      loadHotels();
    }
  }, []);

  const loadFragments = async () => {
    try {
      setLoading(true);
      const data = await getFragments();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setFragments(data);
      } else {
        console.error('Expected array but got:', typeof data, data);
        setFragments([]);
        toast.error('Error: Invalid data format received');
      }
    } catch (error) {
      console.error('Error loading fragments:', error);
      toast.error('Error loading fragments');
      setFragments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadHotels = async () => {
    try {
      const data = await getAllHotels();
      setHotels(data);
    } catch (error) {
      console.error('Error loading hotels:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fragment_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      if (editingFragment) {
        await updateFragment(editingFragment.fragmentid, {
          fragment_name: formData.fragment_name,
          status: formData.status || 1
        });
        toast.success('Fragment updated successfully');
      } else {
        await createFragment({
          ...formData,
          hotelid: formData.hotelid || getCurrentHotelId()
        });
        toast.success('Fragment created successfully');
      }

      setShowModal(false);
      setEditingFragment(null);
      setFormData({
        fragment_name: '',
        status: 1,
        hotelid: undefined
      });
      
      await loadFragments();
    } catch (error: any) {
      console.error('Error saving fragment:', error);
      toast.error(`Error saving fragment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (fragment: Fragment) => {
    setEditingFragment(fragment);
    setFormData({
      fragment_name: fragment.fragment_name,
      status: fragment.status,
      hotelid: fragment.hotelid
    });
    setShowModal(true);
  };

  const handleDelete = async (fragmentId: number) => {
    if (window.confirm('Are you sure you want to delete this fragment?')) {
      try {
        await deleteFragment(fragmentId);
        toast.success('Fragment deleted successfully');
        await loadFragments();
      } catch (error: any) {
        console.error('Error deleting fragment:', error);
        toast.error(`Error deleting fragment: ${error.message}`);
      }
    }
  };

  const handleAddNew = () => {
    setEditingFragment(null);
    setFormData({
      fragment_name: '',
      status: 1,
      hotelid: getCurrentHotelId()
    });
    setShowModal(true);
  };

  const getStatusBadge = (status: number) => {
    return status === 1 ? (
      <Badge bg="success">Active</Badge>
    ) : (
      <Badge bg="danger">Inactive</Badge>
    );
  };

  return (
    <div className="container-fluid">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                                      <h4 className="mb-0">
                      <FiHome className="me-2" />
                      Fragment Master
                    </h4>
                    {!isAdmin && (
                      <small className="text-primary">
                        <FiHome className="me-1" />
                        Current Hotel: {getCurrentHotelName()}
                      </small>
                    )}
                </div>
                <Button variant="primary" onClick={handleAddNew}>
                  <FiPlus className="me-1" />
                  Add New Fragment
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : fragments.length === 0 ? (
                <Alert variant="info">
                  No fragments found for this hotel.
                </Alert>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fragment Name</th>
                      {isAdmin && <th>Hotel</th>}
                      <th>Status</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fragments.map((fragment, index) => (
                      <tr key={fragment.fragmentid}>
                        <td>{index + 1}</td>
                        <td>{fragment.fragment_name}</td>
                        {isAdmin && (
                          <td>{fragment.ldg_hotel_name || 'N/A'}</td>
                        )}
                        <td>{getStatusBadge(fragment.status)}</td>
                        <td>
                          {fragment.created_date 
                            ? new Date(fragment.created_date).toLocaleDateString()
                            : 'N/A'
                          }
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(fragment)}
                          >
                            <FiEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(fragment.fragmentid)}
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
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingFragment ? 'Edit Fragment' : 'Add New Fragment'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fragment Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="fragment_name"
                    value={formData.fragment_name}
                    onChange={(e) => setFormData({ ...formData, fragment_name: e.target.value })}
                    placeholder="Enter fragment name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status || 1}
                    onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {isAdmin && (
              <Form.Group className="mb-3">
                <Form.Label>Hotel <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="hotelid"
                  value={formData.hotelid || ''}
                  onChange={(e) => setFormData({ ...formData, hotelid: Number(e.target.value) || undefined })}
                >
                  <option value="">Select Hotel</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.ldg_hotelid} value={hotel.ldg_hotelid}>
                      {hotel.hotel_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            {!isAdmin && (
              <Form.Group className="mb-3">
                <Form.Label>Hotel <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="hotelid"
                  value={formData.hotelid || getCurrentHotelId() || ''}
                  onChange={(e) => setFormData({ ...formData, hotelid: Number(e.target.value) || undefined })}
                >
                  <option value={getCurrentHotelId()}>{getCurrentHotelName()}</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Current hotel: {getCurrentHotelName()}
                </Form.Text>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : (editingFragment ? 'Update' : 'Create')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default FragmentMaster; 