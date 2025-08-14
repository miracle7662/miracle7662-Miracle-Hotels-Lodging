// import React, { useState, useEffect } from 'react';
// import { 
//   Container, 
//   Row, 
//   Col, 
//   Card, 
//   Table, 
//   Button, 
//   Modal, 
//   Form, 
//   Alert,
//   Badge,
//   InputGroup,
//   Dropdown,
//   Pagination
// } from 'react-bootstrap';
// import { 
//   Plus, 
//   Search, 
//   Edit, 
//   Trash2, 
//   Eye, 
//   Filter,
//   Globe,
//   MapPin,
//   Building
// } from 'lucide-react';
// import axios from 'axios';

// const CountryMaster = () => {
//   // State management
//   const [countries, setCountries] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [editingCountry, setEditingCountry] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [countryToDelete, setCountryToDelete] = useState(null);

//   // Form state
//   const [formData, setFormData] = useState({
//     countryname: '',
//     countrycode: '',
//     countrycapital: '',
//     status: 1
//   });

//   // Validation state
//   const [errors, setErrors] = useState({});

//   // Load countries on component mount
//   useEffect(() => {
//     loadCountries();
//   }, []);

//   // Load countries from API
//   const loadCountries = async () => {
//     setLoading(true);
//     setError('');
    
//     try {
//       const response = await axios.get('http://localhost:3001/api/countries');
//       const raw = response.data || [];
//       console.log('Loaded countries:', raw);
//       console.log('Number of countries:', raw.length);
//       // Normalize API shape to { id, name, code, capital, status }
//       const normalized = (raw || []).map((c) => ({
//         id: c.countryid,
//         name: c.countryname || '',
//         code: c.countrycode || '',
//         capital: c.countrycapital || '',
//         status: c.status ?? 1,
//       }));
//       setCountries(normalized);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to load countries');
//       console.error('Error loading countries:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     // Clear validation error for this field
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   // Validate form
//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.countryname.trim()) {
//       newErrors.countryname = 'Country name is required';
//     }
    
//     if (!formData.countrycode.trim()) {
//       newErrors.countrycode = 'Country code is required';
//     } else if (formData.countrycode.length !== 2) {
//       newErrors.countrycode = 'Country code must be 2 characters';
//     }
    
//     if (formData.countrycapital && formData.countrycapital.length < 2) {
//       newErrors.countrycapital = 'Capital name must be at least 2 characters';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       if (editingCountry) {
//         // Update existing country
//         await axios.put(`http://localhost:3001/api/countries/${editingCountry.id}`, formData);
//         // Reload countries to get updated data
//         await loadCountries();
//       } else {
//         // Add new country
//         const response = await axios.post('http://localhost:3001/api/countries', formData);
//         console.log('New country added:', response.data);
//         console.log('Response from API:', response);
//         console.log('New country data:', response.data.country);
        
//         // Add the new country to the list immediately
//         console.log('Current countries before adding:', countries);
//         if (response.data.country) {
//           setCountries(prev => [response.data.country, ...prev]);
//         }
//       }
      
//       handleCloseModal();
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to save country');
//       console.error('Error saving country:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle edit
//   const handleEdit = (country) => {
//     setEditingCountry(country);
//     setFormData({
//       countryname: country.name,
//       countrycode: country.code,
//       countrycapital: country.capital || '',
//       status: country.status
//     });
//     setShowModal(true);
//   };

//   // Handle delete
//   const handleDelete = (country) => {
//     setCountryToDelete(country);
//     setShowDeleteModal(true);
//   };

//   // Confirm delete
//   const confirmDelete = async () => {
//     if (countryToDelete) {
//       try {
//         await axios.delete(`http://localhost:3001/api/countries/${countryToDelete.id}`);
//         // Reload countries to get updated data
//         await loadCountries();
//         setShowDeleteModal(false);
//         setCountryToDelete(null);
//       } catch (err) {
//         setError(err.response?.data?.error || 'Failed to delete country');
//         console.error('Error deleting country:', err);
//       }
//     }
//   };

//   // Handle modal close
//   const handleCloseModal = () => {
//     setShowModal(false);
//     setEditingCountry(null);
//     setFormData({
//       countryname: '',
//       countrycode: '',
//       countrycapital: '',
//       status: 1
//     });
//     setErrors({});
//   };

//   // Filter countries based on search term
//   const filteredCountries = countries.filter(country =>
//     (country.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (country.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (country.capital && country.capital.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   // Pagination
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentCountries = filteredCountries.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);

//   return (
//     <Container fluid className="py-4">
//       {/* Header */}
//       <Row className="mb-4">
//         <Col>
//           <div className="d-flex justify-content-between align-items-center">
//             <div>
//               <h2 className="mb-1">
//                 <Globe className="me-2" size={24} />
//                 Country Master
//               </h2>
//               <p className="text-muted mb-0">Manage countries and their information</p>
//             </div>
//             <Button 
//               variant="primary" 
//               onClick={() => setShowModal(true)}
//               className="d-flex align-items-center gap-2"
//             >
//               <Plus size={18} />
//               Add Country
//             </Button>
//           </div>
//         </Col>
//       </Row>

//       {/* Search and Filters */}
//       <Row className="mb-4">
//         <Col md={6}>
//           <InputGroup>
//             <InputGroup.Text>
//               <Search size={16} />
//             </InputGroup.Text>
//             <Form.Control
//               type="text"
//               placeholder="Search countries..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </InputGroup>
//         </Col>
//         <Col md={6} className="d-flex justify-content-end">
//           <Dropdown>
//             <Dropdown.Toggle variant="outline-secondary" className="d-flex align-items-center gap-2">
//               <Filter size={16} />
//               Filter
//             </Dropdown.Toggle>
//             <Dropdown.Menu>
//               <Dropdown.Item>All Countries</Dropdown.Item>
//               <Dropdown.Item>Active Only</Dropdown.Item>
//               <Dropdown.Item>Inactive Only</Dropdown.Item>
//             </Dropdown.Menu>
//           </Dropdown>
//         </Col>
//       </Row>

//       {/* Error Alert */}
//       {error && (
//         <Alert variant="danger" dismissible onClose={() => setError('')}>
//           {error}
//         </Alert>
//       )}

//       {/* Countries Table */}
//       <Card>
//         <Card.Body className="p-0">
//           {loading ? (
//             <div className="text-center py-5">
//               <div className="spinner-border" role="status">
//                 <span className="visually-hidden">Loading...</span>
//               </div>
//             </div>
//           ) : (
//             <>
//               <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
//                 <Table hover className="mb-0">
//                   <thead className="table-light sticky-top bg-white" style={{ zIndex: 1 }}>
//                     <tr>
//                       <th style={{ minWidth: '50px' }}>#</th>
//                       <th style={{ minWidth: '200px' }}>Country</th>
//                       <th style={{ minWidth: '100px' }}>Code</th>
//                       <th style={{ minWidth: '150px' }}>Capital</th>
//                       <th style={{ minWidth: '100px' }}>Status</th>
//                       <th style={{ minWidth: '120px' }}>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {currentCountries.map((country, index) => (
//                       <tr key={country.id}>
//                         <td>{indexOfFirstItem + index + 1}</td>
//                         <td>
//                           <div className="d-flex align-items-center">
//                             <div className="me-2">
//                               <Building size={16} className="text-muted" />
//                             </div>
//                             <strong>{country.name}</strong>
//                           </div>
//                         </td>
//                         <td>
//                           <Badge bg="info" className="text-uppercase">
//                             {country.code}
//                           </Badge>
//                         </td>
//                         <td>
//                           {country.capital ? (
//                             <div className="d-flex align-items-center">
//                               <MapPin size={14} className="text-muted me-1" />
//                               {country.capital}
//                             </div>
//                           ) : (
//                             <span className="text-muted">-</span>
//                           )}
//                         </td>
//                         <td>
//                           <Badge bg={country.status === 1 ? 'success' : 'secondary'}>
//                             {country.status === 1 ? 'Active' : 'Inactive'}
//                           </Badge>
//                         </td>
//                         <td>
//                           <div className="d-flex gap-1">
//                             <Button
//                               size="sm"
//                               variant="outline-info"
//                               onClick={() => handleEdit(country)}
//                               title="Edit"
//                             >
//                               <Edit size={14} />
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="outline-danger"
//                               onClick={() => handleDelete(country)}
//                               title="Delete"
//                             >
//                               <Trash2 size={14} />
//                             </Button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </Table>
//               </div>

//               {/* Empty State */}
//               {currentCountries.length === 0 && (
//                 <div className="text-center py-5">
//                   <Globe size={48} className="text-muted mb-3" />
//                   <h5 className="text-muted">No countries found</h5>
//                   <p className="text-muted">
//                     {searchTerm ? 'Try adjusting your search terms' : 'Add your first country to get started'}
//                   </p>
//                 </div>
//               )}
//             </>
//           )}
//         </Card.Body>
//       </Card>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <Row className="mt-4">
//           <Col className="d-flex justify-content-center">
//             <Pagination>
//               <Pagination.First 
//                 onClick={() => setCurrentPage(1)}
//                 disabled={currentPage === 1}
//               />
//               <Pagination.Prev 
//                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                 disabled={currentPage === 1}
//               />
              
//               {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
//                 <Pagination.Item
//                   key={page}
//                   active={page === currentPage}
//                   onClick={() => setCurrentPage(page)}
//                 >
//                   {page}
//                 </Pagination.Item>
//               ))}
              
//               <Pagination.Next 
//                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                 disabled={currentPage === totalPages}
//               />
//               <Pagination.Last 
//                 onClick={() => setCurrentPage(totalPages)}
//                 disabled={currentPage === totalPages}
//               />
//             </Pagination>
//           </Col>
//         </Row>
//       )}

//       {/* Add/Edit Modal */}
//       <Modal show={showModal} onHide={handleCloseModal} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editingCountry ? 'Edit Country' : 'Add New Country'}
//           </Modal.Title>
//         </Modal.Header>
//         <Form onSubmit={handleSubmit}>
//           <Modal.Body>
//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Country Name *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="countryname"
//                     value={formData.countryname}
//                     onChange={handleInputChange}
//                     isInvalid={!!errors.countryname}
//                     placeholder="Enter country name"
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {errors.countryname}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Country Code *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="countrycode"
//                     value={formData.countrycode}
//                     onChange={handleInputChange}
//                     isInvalid={!!errors.countrycode}
//                     placeholder="e.g., IN, US"
//                     maxLength={2}
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {errors.countrycode}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Capital City</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="countrycapital"
//                     value={formData.countrycapital}
//                     onChange={handleInputChange}
//                     isInvalid={!!errors.countrycapital}
//                     placeholder="Enter capital city"
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {errors.countrycapital}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Status</Form.Label>
//                   <Form.Select
//                     name="status"
//                     value={formData.status}
//                     onChange={handleInputChange}
//                   >
//                     <option value={1}>Active</option>
//                     <option value={0}>Inactive</option>
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//             </Row>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleCloseModal}>
//               Cancel
//             </Button>
//             <Button 
//               variant="primary" 
//               type="submit"
//               disabled={loading}
//             >
//               {loading ? 'Saving...' : (editingCountry ? 'Update' : 'Save')}
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>

//       {/* Delete Confirmation Modal */}
//       <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Delete</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           Are you sure you want to delete <strong>{countryToDelete?.name}</strong>?
//           This action cannot be undone.
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="danger" onClick={confirmDelete}>
//             Delete
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// };

// export default CountryMaster;





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
  Globe,
  MapPin,
  Building
} from 'lucide-react';
import axios from 'axios';

const CountryMaster = () => {
  // State management
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    countryname: '',
    countrycode: '',
    countrycapital: '',
    status: 1
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Load countries on component mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Load countries from API
  const loadCountries = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('http://localhost:3001/api/countries');
      const raw = response.data || [];
      console.log('Loaded countries:', raw);
      console.log('Number of countries:', raw.length);
      // Normalize API shape to { id, name, code, capital, status }
      const normalized = (raw || []).map((c) => ({
        id: c.countryid,
        name: c.countryname || '',
        code: c.countrycode || '',
        capital: c.countrycapital || '',
        status: c.status ?? 1,
      }));
      setCountries(normalized);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load countries');
      console.error('Error loading countries:', err);
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
    
    if (!formData.countryname.trim()) {
      newErrors.countryname = 'Country name is required';
    }
    
    if (!formData.countrycode.trim()) {
      newErrors.countrycode = 'Country code is required';
    } else if (formData.countrycode.length !== 2) {
      newErrors.countrycode = 'Country code must be 2 characters';
    }
    
    if (formData.countrycapital && formData.countrycapital.length < 2) {
      newErrors.countrycapital = 'Capital name must be at least 2 characters';
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
      if (editingCountry) {
        // Update existing country
        await axios.put(`http://localhost:3001/api/countries/${editingCountry.id}`, formData);
        // Update countries state directly with normalized updated country
        const updatedCountry = {
          id: editingCountry.id,
          name: formData.countryname,
          code: formData.countrycode,
          capital: formData.countrycapital,
          status: formData.status ?? 1,
        };
        setCountries(prev =>
          prev.map(c => (c.id === editingCountry.id ? updatedCountry : c))
        );
      } else {
        // Add new country
        const response = await axios.post('http://localhost:3001/api/countries', formData);
        console.log('New country added:', response.data);
        
        // Add the new country to the list immediately
        if (response.data.country) {
          const c = response.data.country;
          const normalizedCountry = {
            id: c.countryid,
            name: c.countryname || '',
            code: c.countrycode || '',
            capital: c.countrycapital || '',
            status: c.status ?? 1,
          };
          setCountries(prev => [normalizedCountry, ...prev]);
        }
      }
      
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save country');
      console.error('Error saving country:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (country) => {
    setEditingCountry(country);
    setFormData({
      countryname: country.name,
      countrycode: country.code,
      countrycapital: country.capital || '',
      status: country.status
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = (country) => {
    setCountryToDelete(country);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (countryToDelete) {
      try {
        await axios.delete(`http://localhost:3001/api/countries/${countryToDelete.id}`);
        // Remove deleted country from state directly
        setCountries(prev => prev.filter(c => c.id !== countryToDelete.id));
        setShowDeleteModal(false);
        setCountryToDelete(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete country');
        console.error('Error deleting country:', err);
      }
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCountry(null);
    setFormData({
      countryname: '',
      countrycode: '',
      countrycapital: '',
      status: 1
    });
    setErrors({});
  };

  // Filter countries based on search term
  const filteredCountries = countries.filter(country =>
    (country.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (country.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (country.capital && country.capital.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCountries = filteredCountries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <Globe className="me-2" size={24} />
                Country Master
              </h2>
              <p className="text-muted mb-0">Manage countries and their information</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <Plus size={18} />
              Add Country
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
              placeholder="Search countries..."
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
              <Dropdown.Item>All Countries</Dropdown.Item>
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

      {/* Countries Table */}
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
                       <th style={{ minWidth: '200px' }}>Country</th>
                       <th style={{ minWidth: '100px' }}>Code</th>
                       <th style={{ minWidth: '150px' }}>Capital</th>
                       <th style={{ minWidth: '100px' }}>Status</th>
                       <th style={{ minWidth: '120px' }}>Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                    {currentCountries.map((country, index) => (
                      <tr key={country.id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              <Building size={16} className="text-muted" />
                            </div>
                            <strong>{country.name}</strong>
                          </div>
                        </td>
                        <td>
                          <Badge bg="info" className="text-uppercase">
                            {country.code}
                          </Badge>
                        </td>
                        <td>
                          {country.capital ? (
                            <div className="d-flex align-items-center">
                              <MapPin size={14} className="text-muted me-1" />
                              {country.capital}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                                                 <td>
                           <Badge bg={country.status === 1 ? 'success' : 'secondary'}>
                             {country.status === 1 ? 'Active' : 'Inactive'}
                           </Badge>
                         </td>
                         <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => handleEdit(country)}
                              title="Edit"
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(country)}
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
              {currentCountries.length === 0 && (
                <div className="text-center py-5">
                  <Globe size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No countries found</h5>
                  <p className="text-muted">
                    {searchTerm ? 'Try adjusting your search terms' : 'Add your first country to get started'}
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
            {editingCountry ? 'Edit Country' : 'Add New Country'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Country Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="countryname"
                    value={formData.countryname}
                    onChange={handleInputChange}
                    isInvalid={!!errors.countryname}
                    placeholder="Enter country name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.countryname}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Country Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="countrycode"
                    value={formData.countrycode}
                    onChange={handleInputChange}
                    isInvalid={!!errors.countrycode}
                    placeholder="e.g., IN, US"
                    maxLength={2}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.countrycode}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Capital City</Form.Label>
                  <Form.Control
                    type="text"
                    name="countrycapital"
                    value={formData.countrycapital}
                    onChange={handleInputChange}
                    isInvalid={!!errors.countrycapital}
                    placeholder="Enter capital city"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.countrycapital}
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
              {loading ? 'Saving...' : (editingCountry ? 'Update' : 'Save')}
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
          Are you sure you want to delete <strong>{countryToDelete?.name}</strong>?
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

export default CountryMaster;




