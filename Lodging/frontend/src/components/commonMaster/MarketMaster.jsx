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
  Building,
  MapPin,
  Store
} from 'lucide-react';
import { 
  getAllMarkets, 
  createMarket, 
  updateMarket, 
  deleteMarket
} from '../../services/marketService';

const MarketMaster = () => {
  // State management
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMarket, setEditingMarket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [marketToDelete, setMarketToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    ldg_market_name: '',
    ldg_status: 1
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Load markets on component mount
  useEffect(() => {
    loadMarkets();
  }, []);

  // Load markets from API
  const loadMarkets = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await getAllMarkets();
      console.log('Loaded markets:', data);
      console.log('Number of markets:', data.length);
      setMarkets(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load markets');
      console.error('Error loading markets:', err);
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
    
    if (!formData.ldg_market_name.trim()) {
      newErrors.ldg_market_name = 'Market name is required';
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
        ldg_market_name: formData.ldg_market_name
      };

      if (editingMarket) {
        // Update existing market
        await updateMarket(editingMarket.ldg_marketid, submitData);
        // Reload markets to get updated data
        await loadMarkets();
      } else {
        // Add new market
        const newMarket = await createMarket(submitData);
        console.log('New market added:', newMarket);
        
        // Add the new market to the list immediately
        setMarkets(prev => [newMarket, ...prev]);
      }
      
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save market');
      console.error('Error saving market:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (market) => {
    setEditingMarket(market);
    setFormData({
      ldg_market_name: market.ldg_market_name,
      ldg_status: market.ldg_status
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = (market) => {
    setMarketToDelete(market);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (marketToDelete) {
      try {
        await deleteMarket(marketToDelete.ldg_marketid);
        // Reload markets to get updated data
        await loadMarkets();
        setShowDeleteModal(false);
        setMarketToDelete(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete market');
        console.error('Error deleting market:', err);
      }
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMarket(null);
    setFormData({
      ldg_market_name: '',
      ldg_status: 1
    });
    setErrors({});
  };

  // Filter markets based on search term
  const filteredMarkets = markets.filter(market =>
    market.ldg_market_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMarkets = filteredMarkets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMarkets.length / itemsPerPage);

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <Store className="me-2" size={24} />
                Market Master
              </h2>
              <p className="text-muted mb-0">Manage markets and their information</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <Plus size={18} />
              Add Market
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
              placeholder="Search markets..."
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
              <Dropdown.Item>All Markets</Dropdown.Item>
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

      {/* Markets Table */}
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
                      <th style={{ minWidth: '200px' }}>Market Name</th>
                      <th style={{ minWidth: '100px' }}>Status</th>
                      <th style={{ minWidth: '120px' }}>Created</th>
                      <th style={{ minWidth: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMarkets.map((market, index) => (
                      <tr key={market.ldg_marketid}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              <MapPin size={16} className="text-muted" />
                            </div>
                            <strong>{market.ldg_market_name}</strong>
                          </div>
                        </td>
                        <td>
                          <Badge bg={market.ldg_status === 1 ? 'success' : 'secondary'}>
                            {market.ldg_status === 1 ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <small className="text-muted">
                            {market.ldg_created_date ? 
                              new Date(market.ldg_created_date).toLocaleDateString() : 
                              '-'
                            }
                          </small>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => handleEdit(market)}
                              title="Edit"
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(market)}
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
              {currentMarkets.length === 0 && (
                <div className="text-center py-5">
                  <Store size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No markets found</h5>
                  <p className="text-muted">
                    {searchTerm ? 'Try adjusting your search terms' : 'Add your first market to get started'}
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
            {editingMarket ? 'Edit Market' : 'Add New Market'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Market Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="ldg_market_name"
                    value={formData.ldg_market_name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.ldg_market_name}
                    placeholder="Enter market name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.ldg_market_name}
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
              {loading ? 'Saving...' : (editingMarket ? 'Update' : 'Save')}
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
          Are you sure you want to delete <strong>{marketToDelete?.ldg_market_name}</strong>?
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

export default MarketMaster; 