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
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Filter,
  Building,
  Hotel,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  CreditCard,
  User
} from 'lucide-react';
import { 
  getAllHotels, 
  createHotel, 
  updateHotel, 
  deleteHotel,
  toggleHotelBlock
} from '../../services/hotelMasterService';
import { getAllMarkets } from '../../services/marketService';
import { getAllHotelTypes } from '../../services/hotelTypeService';
import { stateService } from '../../services/stateService';

const ManageHotels = () => {
  // State management
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState(null);

  // Dropdown data state
  const [markets, setMarkets] = useState([]);
  const [states, setStates] = useState([]);
  const [hotelTypes, setHotelTypes] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    hotel_name: '',
    marketid: '',
    short_name: '',
    phone: '',
    email: '',
    password: '',
    fssai_no: '',
    trn_gstno: '',
    panno: '',
    website: '',
    address: '',
    stateid: '',
    hoteltypeid: '',
    ldg_HotelType: '',
    ldg_Shop_Act_Number: '',
    Masteruserid: ''
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Load hotels and dropdown data on component mount
  useEffect(() => {
    loadHotels();
    loadDropdownData();
  }, []);

  // Load dropdown data
  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      // Load markets
      const marketsData = await getAllMarkets();
      setMarkets(marketsData);

      // Load states - stateService.getAll() returns data directly
      const statesData = await stateService.getAll();
      setStates(statesData);

      // Load hotel types
      const hotelTypesData = await getAllHotelTypes();
      setHotelTypes(hotelTypesData);
    } catch (err) {
      console.error('Error loading dropdown data:', err);
      toast.error('Failed to load dropdown data');
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // Load hotels from API
  const loadHotels = async () => {
    setLoading(true);
    
    try {
      const data = await getAllHotels();
      console.log('Loaded hotels:', data);
      console.log('Number of hotels:', data.length);
      setHotels(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load hotels');
      console.error('Error loading hotels:', err);
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

  // Get display name for market
  const getMarketName = (marketId) => {
    const market = markets.find(m => m.ldg_marketid === marketId);
    return market ? market.ldg_market_name : '';
  };

  // Get display name for state
  const getStateName = (stateId) => {
    const state = states.find(s => s.id === stateId);
    return state ? state.name : '';
  };

  // Get display name for hotel type
  const getHotelTypeName = (hotelTypeId) => {
    const hotelType = hotelTypes.find(ht => ht.ldg_hoteltypeid === hotelTypeId);
    return hotelType ? hotelType.ldg_hotel_type : '';
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.hotel_name.trim()) {
      newErrors.hotel_name = 'Hotel name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!editingHotel && !formData.password) {
      newErrors.password = 'Password is required for new hotel registration';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.Masteruserid && isNaN(formData.Masteruserid)) {
      newErrors.Masteruserid = 'Master User ID must be a valid number';
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
        hotel_name: formData.hotel_name,
        marketid: formData.marketid ? parseInt(formData.marketid) : undefined,
        short_name: formData.short_name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        fssai_no: formData.fssai_no,
        trn_gstno: formData.trn_gstno,
        panno: formData.panno,
        website: formData.website,
        address: formData.address,
        stateid: formData.stateid ? parseInt(formData.stateid) : undefined,
        hoteltypeid: formData.hoteltypeid ? parseInt(formData.hoteltypeid) : undefined,
        ldg_HotelType: formData.ldg_HotelType,
        ldg_Shop_Act_Number: formData.ldg_Shop_Act_Number,
        Masteruserid: formData.Masteruserid ? parseInt(formData.Masteruserid) : undefined
      };

      console.log('Submitting hotel data:', {
        ...submitData,
        password: submitData.password ? '***' : 'undefined'
      });

      if (editingHotel) {
        // Update existing hotel
        await updateHotel(editingHotel.ldg_hotelid, submitData);
        // Reload hotels to get updated data
        await loadHotels();
        toast.success('Hotel updated successfully!');
      } else {
        // Add new hotel
        const newHotel = await createHotel(submitData);
        console.log('New hotel added:', newHotel);
        
        // Reload hotels to get updated data with proper field names
        await loadHotels();
        toast.success('Hotel registered successfully! Welcome email has been sent to the hotel owner.');
      }
      
      handleCloseModal();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      // Handle different types of errors
      let errorMessage = 'Failed to save hotel';
      if (err && err.response && err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
      } else if (err && err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      toast.error(errorMessage);
      console.error('Error saving hotel:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      hotel_name: hotel.hotel_name || '',
      marketid: hotel.marketid || '',
      short_name: hotel.short_name || '',
      phone: hotel.phone || '',
      email: hotel.email || '',
      password: '', // Clear password for editing
      fssai_no: hotel.fssai_no || '',
      trn_gstno: hotel.trn_gstno || '',
      panno: hotel.panno || '',
      website: hotel.website || '',
      address: hotel.address || '',
      stateid: hotel.stateid || '',
      hoteltypeid: hotel.hoteltypeid || '',
      ldg_HotelType: hotel.ldg_HotelType || '',
      ldg_Shop_Act_Number: hotel.ldg_Shop_Act_Number || '',
      Masteruserid: hotel.Masteruserid || ''
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = (hotel) => {
    console.log('Delete button clicked for hotel:', hotel);
    setHotelToDelete(hotel);
    setShowDeleteModal(true);
  };

  // Handle block/unblock
  const handleBlock = async (hotel) => {
    const action = hotel.ldg_blocked === 1 ? 'unblock' : 'block';
    const confirmMessage = `Are you sure you want to ${action} "${hotel.hotel_name}"?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        console.log(`${action} button clicked for hotel:`, hotel);
        const result = await toggleHotelBlock(hotel.ldg_hotelid);
        console.log(`${action} result:`, result);
        
        // Reload hotels to get updated data
        await loadHotels();
        toast.success(`Hotel "${hotel.hotel_name}" ${action}ed successfully!`);
      } catch (err) {
        console.error(`Error ${action}ing hotel:`, err);
        // Handle different types of errors
        let errorMessage = `Failed to ${action} hotel`;
        if (err && err.response && err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err && err.message) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        }
        toast.error(errorMessage);
      }
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    console.log('confirmDelete called with hotelToDelete:', hotelToDelete);
    if (hotelToDelete) {
      try {
        console.log('Attempting to delete hotel with ID:', hotelToDelete.ldg_hotelid);
        await deleteHotel(hotelToDelete.ldg_hotelid);
        console.log('Hotel deleted successfully');
        // Reload hotels to get updated data
        await loadHotels();
        setShowDeleteModal(false);
        setHotelToDelete(null);
        toast.success(`Hotel "${hotelToDelete.hotel_name}" deleted successfully!`);
      } catch (err) {
        console.error('Error in confirmDelete:', err);
        toast.error(err.response?.data?.error || 'Failed to delete hotel');
        console.error('Error deleting hotel:', err);
      }
    } else {
      console.log('No hotel to delete');
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHotel(null);
    setFormData({
      hotel_name: '',
      marketid: '',
      short_name: '',
      phone: '',
      email: '',
      password: '',
      fssai_no: '',
      trn_gstno: '',
      panno: '',
      website: '',
      address: '',
      stateid: '',
      hoteltypeid: '',
      ldg_HotelType: '',
      ldg_Shop_Act_Number: '',
      Masteruserid: ''
    });
    setErrors({});
  };

  // Filter hotels based on search term
  const filteredHotels = hotels.filter(hotel =>
    hotel.hotel_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.short_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHotels = filteredHotels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);

  // Debug pagination
  console.log('Pagination Debug:', {
    filteredHotels: filteredHotels.length,
    currentPage,
    itemsPerPage,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    currentHotels: currentHotels.length
  });

  return (
    <Container fluid className="py-4">
      {/* Custom CSS for scrollbar styling */}
      <style>
        {`
          .table-scroll-container::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          .table-scroll-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          
          .table-scroll-container::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
          }
          
          .table-scroll-container::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
          
          .table-scroll-container {
            scrollbar-width: thin;
            scrollbar-color: #c1c1c1 #f1f1f1;
          }
          
          .table-scroll-container table {
            border-collapse: separate;
            border-spacing: 0;
            table-layout: fixed;
            width: 100%;
          }
          
          .table-scroll-container th,
          .table-scroll-container td {
            border: 1px solid #dee2e6;
            padding: 12px 8px;
            white-space: nowrap;
            vertical-align: middle;
          }
          
          .table-scroll-container th {
            background-color: #f8f9fa;
            font-weight: 600;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          
          .sticky-left {
            position: sticky !important;
            left: 0;
            background-color: white !important;
            z-index: 5 !important;
            box-shadow: 2px 0 4px rgba(0,0,0,0.1);
            width: 60px !important;
          }
          
          .sticky-right {
            position: sticky !important;
            right: 0;
            background-color: white !important;
            z-index: 5 !important;
            box-shadow: -2px 0 4px rgba(0,0,0,0.1);
            width: 180px !important;
          }
          
          .table-scroll-container td {
            height: 60px;
            max-height: 60px;
            overflow: hidden;
          }
          
          .table-scroll-container .badge {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
          }
        `}
      </style>
      
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <Hotel className="me-2" size={24} />
                Manage Hotels
              </h2>
              <p className="text-muted mb-0">Register and manage hotel information</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <Plus size={18} />
              Register Hotel
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
              placeholder="Search hotels..."
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
              <Dropdown.Item>All Hotels</Dropdown.Item>
              <Dropdown.Item>Active Only</Dropdown.Item>
              <Dropdown.Item>Inactive Only</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>



      {/* Hotels Table */}
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
              <div className="table-responsive table-scroll-container" style={{ 
                maxHeight: '600px', 
                overflowY: 'auto',
                overflowX: 'auto',
                border: '1px solid #dee2e6',
                scrollbarWidth: 'thin',
                scrollbarColor: '#c1c1c1 #f1f1f1',
                borderRadius: '4px'
              }}>
                <Table hover className="mb-0" style={{ minWidth: '1400px' }}>
                  <thead className="table-light sticky-top bg-white" style={{ zIndex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <tr>
                      <th className="sticky-left text-center" style={{ width: '60px', minWidth: '60px' }}>#</th>
                      <th style={{ width: '250px', minWidth: '250px' }}>Hotel Name</th>
                      <th style={{ width: '150px', minWidth: '150px' }}>Short Name</th>
                      <th style={{ width: '140px', minWidth: '140px' }}>Contact</th>
                      <th style={{ width: '120px', minWidth: '120px' }}>Market</th>
                      <th style={{ width: '120px', minWidth: '120px' }}>Checkout Time</th>
                      <th style={{ width: '100px', minWidth: '100px' }}>Status</th>
                      <th style={{ width: '100px', minWidth: '100px' }}>Blocked</th>
                      <th style={{ width: '120px', minWidth: '120px' }}>Created</th>
                      <th className="sticky-right text-center" style={{ width: '180px', minWidth: '180px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                                         {currentHotels.map((hotel, index) => (
                       <tr key={hotel.ldg_hotelid}>
                         <td className="sticky-left text-center">{indexOfFirstItem + index + 1}</td>
                         <td>
                           <div className="d-flex align-items-center">
                             <div className="me-2">
                               <Building size={16} className="text-muted" />
                             </div>
                             <div>
                               <strong className="d-block">{hotel.hotel_name}</strong>
                               {hotel.email && (
                                 <div className="text-muted small">
                                   <Mail size={12} className="me-1" />
                                   {hotel.email}
                                 </div>
                               )}
                             </div>
                           </div>
                         </td>
                         <td className="text-center">
                           <span className="text-muted">{hotel.short_name || '-'}</span>
                         </td>
                         <td className="text-center">
                           {hotel.phone ? (
                             <div className="d-flex align-items-center justify-content-center">
                               <Phone size={14} className="text-muted me-1" />
                               <span>{hotel.phone}</span>
                             </div>
                           ) : (
                             <span className="text-muted">-</span>
                           )}
                         </td>
                         <td className="text-center">
                           <span className="text-muted">{hotel.ldg_market_name || '-'}</span>
                         </td>
                         <td className="text-center">
                           <Badge bg="info">
                             {hotel.ldg_HotelType || 'Not Set'}
                           </Badge>
                         </td>
                         <td className="text-center">
                           <Badge bg={hotel.status === 1 ? 'success' : 'secondary'}>
                             {hotel.status === 1 ? 'Active' : 'Inactive'}
                           </Badge>
                         </td>
                         <td className="text-center">
                           <Badge bg={hotel.ldg_blocked === 1 ? 'danger' : 'success'}>
                             {hotel.ldg_blocked === 1 ? 'Blocked' : 'Active'}
                           </Badge>
                         </td>
                         <td className="text-center">
                           <small className="text-muted">
                             {hotel.created_date ? 
                               new Date(hotel.created_date).toLocaleDateString() : 
                               '-'
                             }
                           </small>
                         </td>
                        <td className="sticky-right text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => handleEdit(hotel)}
                              title="Edit"
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => handleBlock(hotel)}
                              title={hotel.ldg_blocked === 1 ? 'Unblock Hotel' : 'Block Hotel'}
                            >
                              {hotel.ldg_blocked === 1 ? <Eye size={14} /> : <EyeOff size={14} />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(hotel)}
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
               
               {/* Scroll indicator */}
               {filteredHotels.length > itemsPerPage && (
                 <div className="text-center py-2 bg-light border-top">
                   <small className="text-muted">
                     <i className="fas fa-chevron-down me-1"></i>
                     Scroll to see more hotels ({filteredHotels.length - itemsPerPage} more)
                   </small>
                 </div>
               )}

               {/* Horizontal scroll indicator */}
               <div className="text-center py-2 bg-light border-top">
                 <small className="text-muted">
                   <i className="fas fa-arrows-alt-h me-1"></i>
                   Scroll horizontally to see all columns
                 </small>
               </div>

              {/* Empty State */}
              {currentHotels.length === 0 && (
                <div className="text-center py-5">
                  <Hotel size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">
                    {searchTerm ? 'No hotels found' : 'No hotels registered yet'}
                  </h5>
                  <p className="text-muted">
                    {searchTerm 
                      ? `No hotels match your search for "${searchTerm}". Try adjusting your search terms.`
                      : 'Register your first hotel to get started'
                    }
                  </p>
                  {!searchTerm && (
                    <Button 
                      variant="primary" 
                      onClick={() => setShowModal(true)}
                      className="mt-3"
                    >
                      <Plus size={16} className="me-2" />
                      Register First Hotel
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Pagination - Always Visible */}
      <Row className="mt-4">
        <Col className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <span className="text-muted me-3">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredHotels.length)} of {filteredHotels.length} hotels
            </span>
            <Form.Select 
              size="sm" 
              style={{ width: '80px' }}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Form.Select>
            <span className="text-muted ms-2">per page</span>
          </div>
            
          <Pagination className="mb-0" style={{ border: '1px solid #dee2e6', padding: '8px', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
            <Pagination.First 
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
            
            {/* Show page numbers with ellipsis for large numbers */}
            {(() => {
              const pages = [];
              const maxVisiblePages = 5;
              
              if (totalPages <= maxVisiblePages) {
                // Show all pages if total is small
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(
                    <Pagination.Item
                      key={i}
                      active={i === currentPage}
                      onClick={() => setCurrentPage(i)}
                    >
                      {i}
                    </Pagination.Item>
                  );
                }
              } else {
                // Show pages with ellipsis for large numbers
                if (currentPage <= 3) {
                  // Show first 3 pages + ellipsis + last page
                  for (let i = 1; i <= 3; i++) {
                    pages.push(
                      <Pagination.Item
                        key={i}
                        active={i === currentPage}
                        onClick={() => setCurrentPage(i)}
                      >
                        {i}
                      </Pagination.Item>
                    );
                  }
                  pages.push(<Pagination.Ellipsis key="ellipsis1" />);
                  pages.push(
                    <Pagination.Item
                      key={totalPages}
                      active={totalPages === currentPage}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Pagination.Item>
                  );
                } else if (currentPage >= totalPages - 2) {
                  // Show first page + ellipsis + last 3 pages
                  pages.push(
                    <Pagination.Item
                      key={1}
                      active={1 === currentPage}
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </Pagination.Item>
                  );
                  pages.push(<Pagination.Ellipsis key="ellipsis2" />);
                  for (let i = totalPages - 2; i <= totalPages; i++) {
                    pages.push(
                      <Pagination.Item
                        key={i}
                        active={i === currentPage}
                        onClick={() => setCurrentPage(i)}
                      >
                        {i}
                      </Pagination.Item>
                    );
                  }
                } else {
                  // Show first page + ellipsis + current page + ellipsis + last page
                  pages.push(
                    <Pagination.Item
                      key={1}
                      active={1 === currentPage}
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </Pagination.Item>
                  );
                  pages.push(<Pagination.Ellipsis key="ellipsis3" />);
                  for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(
                      <Pagination.Item
                        key={i}
                        active={i === currentPage}
                        onClick={() => setCurrentPage(i)}
                      >
                        {i}
                      </Pagination.Item>
                    );
                  }
                  pages.push(<Pagination.Ellipsis key="ellipsis4" />);
                  pages.push(
                    <Pagination.Item
                      key={totalPages}
                      active={totalPages === currentPage}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Pagination.Item>
                  );
                }
              }
              
              return pages;
            })()}
            
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
      
      {/* Debug Info */}
      <Row className="mt-2">
        <Col>
          <small className="text-muted">
            Debug: Total Hotels: {hotels.length} | Filtered: {filteredHotels.length} | 
            Current Page: {currentPage} | Total Pages: {totalPages} | 
            Items Per Page: {itemsPerPage}
          </small>
        </Col>
      </Row>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingHotel ? 'Edit Hotel' : 'Register New Hotel'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hotel Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="hotel_name"
                    value={formData.hotel_name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.hotel_name}
                    placeholder="Enter hotel name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.hotel_name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Short Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="short_name"
                    value={formData.short_name}
                    onChange={handleInputChange}
                    placeholder="Enter short name"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email}
                    placeholder="Enter email address"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    isInvalid={!!errors.phone}
                    placeholder="Enter phone number"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password {!editingHotel && '*'}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    isInvalid={!!errors.password}
                    placeholder="Enter password"
                    required={!editingHotel}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Market</Form.Label>
                  <Form.Select
                    name="marketid"
                    value={formData.marketid}
                    onChange={handleInputChange}
                    disabled={loadingDropdowns}
                  >
                    <option value="">Select market</option>
                    {markets.map(market => (
                      <option key={market.ldg_marketid} value={market.ldg_marketid}>
                        {market.ldg_market_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Select
                    name="stateid"
                    value={formData.stateid}
                    onChange={handleInputChange}
                    disabled={loadingDropdowns}
                  >
                    <option value="">Select state</option>
                    {states.map(state => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hotel Type</Form.Label>
                  <Form.Select
                    name="hoteltypeid"
                    value={formData.hoteltypeid}
                    onChange={handleInputChange}
                    disabled={loadingDropdowns}
                  >
                    <option value="">Select hotel type</option>
                    {hotelTypes.map(hotelType => (
                      <option key={hotelType.ldg_hoteltypeid} value={hotelType.ldg_hoteltypeid}>
                        {hotelType.ldg_hotel_type}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Checkout Time *</Form.Label>
                  <Form.Select
                    name="ldg_HotelType"
                    value={formData.ldg_HotelType}
                    onChange={handleInputChange}
                    isInvalid={!!errors.ldg_HotelType}
                  >
                    <option value="">Select checkout time</option>
                    <option value="12 Noon">12 Noon</option>
                    <option value="24 Noon">24 Noon</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.ldg_HotelType}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Shop Act Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="ldg_Shop_Act_Number"
                    value={formData.ldg_Shop_Act_Number}
                    onChange={handleInputChange}
                    placeholder="Enter shop act number"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>FSSAI Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="fssai_no"
                    value={formData.fssai_no}
                    onChange={handleInputChange}
                    placeholder="Enter FSSAI number"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>GST Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="trn_gstno"
                    value={formData.trn_gstno}
                    onChange={handleInputChange}
                    placeholder="Enter GST number"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>PAN Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="panno"
                    value={formData.panno}
                    onChange={handleInputChange}
                    placeholder="Enter PAN number"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="Enter website URL"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Master User ID</Form.Label>
                  <Form.Control
                    type="number"
                    name="Masteruserid"
                    value={formData.Masteruserid}
                    onChange={handleInputChange}
                    isInvalid={!!errors.Masteruserid}
                    placeholder="Enter master user ID"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.Masteruserid}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
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
              {loading ? 'Saving...' : (editingHotel ? 'Update' : 'Register')}
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
                      Are you sure you want to delete <strong>{hotelToDelete?.hotel_name}</strong>?
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

export default ManageHotels; 