import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Modal, Form, Badge, Alert } from 'react-bootstrap';
import { FiEdit, FiTrash2, FiHome, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getFeatures, createFeature, updateFeature, deleteFeature, Feature, CreateFeatureRequest } from '../../services/featureService';
import { getAllHotels, HotelMaster } from '../../services/hotelMasterService';
import { useAuthContext } from '../../common/context/useAuthContext';

const FeatureMaster: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [hotels, setHotels] = useState<HotelMaster[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateFeatureRequest>({
    feature_name: '',
    feature_Description: '',
    status: 1,
    hotelid: undefined
  });

  const { user } = useAuthContext();
  const isAdmin = user?.role === 'superadmin' || user?.role === 'agent';

  // Get current hotel info
  const getCurrentHotelId = () => user?.id;
  const getCurrentHotelName = () => user?.name || 'Current Hotel';

  useEffect(() => {
    loadFeatures();
    if (isAdmin) {
      loadHotels();
    }
  }, []);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const data = await getFeatures();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setFeatures(data);
      } else {
        console.error('Expected array but got:', typeof data, data);
        setFeatures([]);
        toast.error('Error: Invalid data format received');
      }
    } catch (error) {
      console.error('Error loading features:', error);
      toast.error('Error loading features');
      setFeatures([]);
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
    
    if (!formData.feature_name || !formData.feature_Description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      if (editingFeature) {
        await updateFeature(editingFeature.featureid, {
          feature_name: formData.feature_name,
          feature_Description: formData.feature_Description,
          status: formData.status || 1
        });
        toast.success('Feature updated successfully');
      } else {
        await createFeature({
          ...formData,
          hotelid: formData.hotelid || getCurrentHotelId()
        });
        toast.success('Feature created successfully');
      }

      setShowModal(false);
      setEditingFeature(null);
      setFormData({
        feature_name: '',
        feature_Description: '',
        status: 1,
        hotelid: undefined
      });
      
      await loadFeatures();
    } catch (error: any) {
      console.error('Error saving feature:', error);
      toast.error(`Error saving feature: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feature: Feature) => {
    setEditingFeature(feature);
    setFormData({
      feature_name: feature.feature_name,
      feature_Description: feature.feature_Description,
      status: feature.status,
      hotelid: feature.hotelid
    });
    setShowModal(true);
  };

  const handleDelete = async (featureId: number) => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      try {
        await deleteFeature(featureId);
        toast.success('Feature deleted successfully');
        await loadFeatures();
      } catch (error: any) {
        console.error('Error deleting feature:', error);
        toast.error(`Error deleting feature: ${error.message}`);
      }
    }
  };

  const handleAddNew = () => {
    setEditingFeature(null);
    setFormData({
      feature_name: '',
      feature_Description: '',
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
                      Feature Master
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
                   Add New Feature
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
              ) : features.length === 0 ? (
                <Alert variant="info">
                  No features found for this hotel.
                </Alert>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Feature Name</th>
                      <th>Description</th>
                      {isAdmin && <th>Hotel</th>}
                      <th>Status</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature, index) => (
                      <tr key={feature.featureid}>
                        <td>{index + 1}</td>
                        <td>{feature.feature_name}</td>
                        <td>{feature.feature_Description}</td>
                        {isAdmin && (
                          <td>{feature.ldg_hotel_name || 'N/A'}</td>
                        )}
                        <td>{getStatusBadge(feature.status)}</td>
                        <td>
                          {feature.created_date 
                            ? new Date(feature.created_date).toLocaleDateString()
                            : 'N/A'
                          }
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(feature)}
                          >
                            <FiEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(feature.featureid)}
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
            {editingFeature ? 'Edit Feature' : 'Add New Feature'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Feature Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="feature_name"
                    value={formData.feature_name}
                    onChange={(e) => setFormData({ ...formData, feature_name: e.target.value })}
                    placeholder="Enter feature name"
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
            
            <Form.Group className="mb-3">
              <Form.Label>Description <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="feature_Description"
                value={formData.feature_Description}
                onChange={(e) => setFormData({ ...formData, feature_Description: e.target.value })}
                placeholder="Enter feature description"
                required
              />
            </Form.Group>

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
                      {hotel.ldg_hotel_name}
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
              {loading ? 'Saving...' : (editingFeature ? 'Update' : 'Create')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default FeatureMaster; 