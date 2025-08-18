// // import React, { useState, useEffect } from 'react';
// // import { 
// //   Container, 
// //   Row, 
// //   Col, 
// //   Card, 
// //   Table, 
// //   Button, 
// //   Modal, 
// //   Form, 
// //   Alert,
// //   Badge,
// //   InputGroup,
// //   Dropdown,
// //   Pagination
// // } from 'react-bootstrap';
// // import { 
// //   Plus, 
// //   Search, 
// //   Edit, 
// //   Trash2, 
// //   Filter,
// //   MapPin,
// //   Building,
// //   Flag
// // } from 'lucide-react';
// // import axios from 'axios';

// // const StateMaster = () => {
// //   // State management
// //   const [states, setStates] = useState([]);
// //   const [countries, setCountries] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');
// //   const [showModal, setShowModal] = useState(false);
// //   const [editingState, setEditingState] = useState(null);
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [itemsPerPage] = useState(10);
// //   const [showDeleteModal, setShowDeleteModal] = useState(false);
// //   const [stateToDelete, setStateToDelete] = useState(null);

// //   // Form state
// //   const [formData, setFormData] = useState({
// //     statename: '',
// //     statecode: '',
// //     statecapital: '',
// //     countryid: ''
// //   });

// //   // Validation state
// //   const [errors, setErrors] = useState({});

// //   // Load data on component mount
// //   useEffect(() => {
// //     loadStates();
// //     loadCountries();
// //   }, []);

// //   // Normalize API state item into a consistent shape used by this component
// //   const normalizeState = (s) => ({
// //     id: s?.stateid ?? null,
// //     name: s?.statename ?? '',
// //     code: s?.statecode ?? '',
// //     capital: s?.statecapital ?? '',
// //     country_id: s?.countryid ?? null,
// //     country_name: s?.country_name ?? '',
// //     status: s?.status ?? 1,
// //   });

// //   // Load states from API
// //   const loadStates = async () => {
// //     setLoading(true);
// //     setError('');
    
// //     try {
// //       const response = await axios.get('http://localhost:3001/api/states');
// //       console.log('Loaded states:', response.data);
// //       console.log('Number of states:', response.data.length);
// //       // Backend returns `stateid` and `state_name`; normalize for UI
// //       const normalized = Array.isArray(response.data)
// //         ? response.data.map(normalizeState)
// //         : [];
// //       setStates(normalized);
// //     } catch (err) {
// //       setError(err.response?.data?.error || 'Failed to load states');
// //       console.error('Error loading states:', err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Load countries for dropdown
// //   const loadCountries = async () => {
// //     try {
// //       const response = await axios.get('http://localhost:3001/api/countries');
// //       setCountries(response.data);
// //     } catch (err) {
// //       console.error('Error loading countries:', err);
// //     }
// //   };

// //   // Handle form input changes
// //   const handleInputChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData(prev => ({
// //       ...prev,
// //       [name]: value
// //     }));
    
// //     // Clear validation error for this field
// //     if (errors[name]) {
// //       setErrors(prev => ({
// //         ...prev,
// //         [name]: ''
// //       }));
// //     }
// //   };

// //   // Validate form
// //   const validateForm = () => {
// //     const newErrors = {};
    
// //     if (!formData.statename.trim()) {
// //       newErrors.statename = 'State name is required';
// //     }
    
// //     if (!formData.statecode.trim()) {
// //       newErrors.statecode = 'State code is required';
// //     } else if (formData.statecode.length !== 2) {
// //       newErrors.statecode = 'State code must be 2 characters';
// //     }
    
// //     if (!formData.countryid) {
// //       newErrors.countryid = 'Country is required';
// //     }
    
// //     if (formData.statecapital && formData.statecapital.length < 2) {
// //       newErrors.statecapital = 'Capital name must be at least 2 characters';
// //     }
    
// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   // Handle form submission
// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
    
// //     if (!validateForm()) {
// //       return;
// //     }
    
// //     setLoading(true);
    
// //     try {
// //       if (editingState) {
// //         // Update existing state
// //         await axios.put(`http://localhost:3001/api/states/${editingState.id}`, formData);
// //         // Reload states to get updated data
// //         await loadStates();
// //       } else {
// //         // Add new state
// //         const response = await axios.post('http://localhost:3001/api/states', formData);
// //         console.log('New state added:', response.data);
// //         console.log('Response from API:', response);
// //         console.log('New state data:', response.data.state);
// //         console.log('Response from API:', response);
        
// //         // Add the new state to the list immediately
// //         const normalizedState = {
// //           id: response.data.state.stateid,
// //           name: response.data.state.statename,
// //           code: response.data.state.statecode,
// //           capital: response.data.state.statecapital,
// //           country_id: response.data.state.countryid,
// //           country_name: response.data.state.country_name,
// //           status: response.data.state.status,
// //           created_at: response.data.state.created_at // Ensure this is coming from the API response
// //         };
// //         if (response.data.state) {
// //           setStates(prev => [normalizeState(response.data.state), ...prev]);
// //         }
// //       }
      
// //       handleCloseModal();
// //     } catch (err) {
// //       setError(err.response?.data?.error || 'Failed to save state');
// //       console.error('Error saving state:', err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Handle edit
// //   const handleEdit = (state) => {
// //     setEditingState(state);
// //     setFormData({
// //       statename: state.name,
// //       statecode: state.code,
// //       statecapital: state.capital || '',
// //       countryid: state.country_id
// //     });
// //     setShowModal(true);
// //   };

// //   // Handle delete
// //   const handleDelete = (state) => {
// //     setStateToDelete(state);
// //     setShowDeleteModal(true);
// //   };

// //   // Confirm delete
// //   const confirmDelete = async () => {
// //     if (stateToDelete) {
// //       try {
// //         await axios.delete(`http://localhost:3001/api/states/${stateToDelete.id}`);
// //         // Reload states to get updated data
// //         await loadStates();
// //         setShowDeleteModal(false);
// //         setStateToDelete(null);
// //       } catch (err) {
// //         setError(err.response?.data?.error || 'Failed to delete state');
// //         console.error('Error deleting state:', err);
// //       }
// //     }
// //   };

// //   // Handle modal close
// //   const handleCloseModal = () => {
// //     setShowModal(false);
// //     setEditingState(null);
// //     setFormData({
// //       statename: '',
// //       statecode: '',
// //       statecapital: '',
// //       countryid: ''
// //     });
// //     setErrors({});
// //   };

// //   // Filter states based on search term (defensive against missing fields)
// //   const normalizedSearch = (searchTerm || '').toString().toLowerCase();
// //   const filteredStates = states.filter((state) => {
// //     if (!state || typeof state !== 'object') {
// //       return false;
// //     }
// //     const name = (state.name || '').toString().toLowerCase();
// //     const code = (state.code || '').toString().toLowerCase();
// //     const capital = (state.capital || '').toString().toLowerCase();
// //     const countryName = (state.country_name || '').toString().toLowerCase();
// //     return (
// //       name.includes(normalizedSearch) ||
// //       code.includes(normalizedSearch) ||
// //       capital.includes(normalizedSearch) ||
// //       countryName.includes(normalizedSearch)
// //     );
// //   });

// //   // Pagination
// //   const indexOfLastItem = currentPage * itemsPerPage;
// //   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
// //   const currentStates = filteredStates.slice(indexOfFirstItem, indexOfLastItem);
// //   const totalPages = Math.ceil(filteredStates.length / itemsPerPage);

// //   return (
// //     <Container fluid className="py-4">
// //       {/* Header */}
// //       <Row className="mb-4">
// //         <Col>
// //           <div className="d-flex justify-content-between align-items-center">
// //             <div>
// //               <h2 className="mb-1">
// //                 <MapPin className="me-2" size={24} />
// //                 State Master
// //               </h2>
// //               <p className="text-muted mb-0">Manage states and their information</p>
// //             </div>
// //             <Button 
// //               variant="primary" 
// //               onClick={() => setShowModal(true)}
// //               className="d-flex align-items-center gap-2"
// //             >
// //               <Plus size={18} />
// //               Add State
// //             </Button>
// //           </div>
// //         </Col>
// //       </Row>

// //       {/* Search and Filters */}
// //       <Row className="mb-4">
// //         <Col md={6}>
// //           <InputGroup>
// //             <InputGroup.Text>
// //               <Search size={16} />
// //             </InputGroup.Text>
// //             <Form.Control
// //               type="text"
// //               placeholder="Search states..."
// //               value={searchTerm}
// //               onChange={(e) => setSearchTerm(e.target.value)}
// //             />
// //           </InputGroup>
// //         </Col>
// //         <Col md={6} className="d-flex justify-content-end">
// //           <Dropdown>
// //             <Dropdown.Toggle variant="outline-secondary" className="d-flex align-items-center gap-2">
// //               <Filter size={16} />
// //               Filter
// //             </Dropdown.Toggle>
// //             <Dropdown.Menu>
// //               <Dropdown.Item>All States</Dropdown.Item>
// //               <Dropdown.Item>Active Only</Dropdown.Item>
// //               <Dropdown.Item>Inactive Only</Dropdown.Item>
// //             </Dropdown.Menu>
// //           </Dropdown>
// //         </Col>
// //       </Row>

// //       {/* Error Alert */}
// //       {error && (
// //         <Alert variant="danger" dismissible onClose={() => setError('')}>
// //           {error}
// //         </Alert>
// //       )}

// //       {/* States Table */}
// //       <Card>
// //         <Card.Body className="p-0">
// //           {loading ? (
// //             <div className="text-center py-5">
// //               <div className="spinner-border" role="status">
// //                 <span className="visually-hidden">Loading...</span>
// //               </div>
// //             </div>
// //           ) : (
// //             <>
// //               <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
// //                 <Table hover className="mb-0">
// //                   <thead className="table-light sticky-top bg-white" style={{ zIndex: 1 }}>
// //                     <tr>
// //                       <th style={{ minWidth: '50px' }}>#</th>
// //                       <th style={{ minWidth: '200px' }}>State</th>
// //                       <th style={{ minWidth: '100px' }}>Code</th>
// //                       <th style={{ minWidth: '150px' }}>Capital</th>
// //                       <th style={{ minWidth: '150px' }}>Country</th>
// //                       <th style={{ minWidth: '100px' }}>Status</th>
// //                       <th style={{ minWidth: '120px' }}>Created</th>
// //                       <th style={{ minWidth: '120px' }}>Actions</th>
// //                     </tr>
// //                   </thead>
// //                   <tbody>
// //                     {currentStates.map((state, index) => (
// //                       <tr key={state.id}>
// //                         <td>{indexOfFirstItem + index + 1}</td>
// //                         <td>
// //                           <div className="d-flex align-items-center">
// //                             <div className="me-2">
// //                               <Building size={16} className="text-muted" />
// //                             </div>
// //                             <strong>{state.name}</strong>
// //                           </div>
// //                         </td>
// //                         <td>
// //                           <Badge bg="info" className="text-uppercase">
// //                             {state.code}
// //                           </Badge>
// //                         </td>
// //                         <td>
// //                           {state.capital ? (
// //                             <div className="d-flex align-items-center">
// //                               <MapPin size={14} className="text-muted me-1" />
// //                               {state.capital}
// //                             </div>
// //                           ) : (
// //                             <span className="text-muted">-</span>
// //                           )}
// //                         </td>
// //                         <td>
// //                           {state.country_name ? (
// //                             <div className="d-flex align-items-center">
// //                               <Flag size={14} className="text-muted me-1" />
// //                               {state.country_name}
// //                             </div>
// //                           ) : (
// //                             <span className="text-muted">-</span>
// //                           )}
// //                         </td>
// //                         <td>
// //                           <Badge bg={state.status === 1 ? 'success' : 'secondary'}>
// //                             {state.status === 1 ? 'Active' : 'Inactive'}
// //                           </Badge>
// //                         </td>
// //                         <td>
// //                           <small className="text-muted">
// //                             {state.created_at ? new Date(state.created_at).toLocaleDateString() : '-'}
// //                           </small>
// //                         </td>
// //                         <td>
// //                           <div className="d-flex gap-1">
// //                             <Button
// //                               size="sm"
// //                               variant="outline-info"
// //                               onClick={() => handleEdit(state)}
// //                               title="Edit"
// //                             >
// //                               <Edit size={14} />
// //                             </Button>
// //                             <Button
// //                               size="sm"
// //                               variant="outline-danger"
// //                               onClick={() => handleDelete(state)}
// //                               title="Delete"
// //                             >
// //                               <Trash2 size={14} />
// //                             </Button>
// //                           </div>
// //                         </td>
// //                       </tr>
// //                     ))}
// //                   </tbody>
// //                 </Table>
// //               </div>

// //               {/* Empty State */}
// //               {currentStates.length === 0 && (
// //                 <div className="text-center py-5">
// //                   <MapPin size={48} className="text-muted mb-3" />
// //                   <h5 className="text-muted">No states found</h5>
// //                   <p className="text-muted">
// //                     {searchTerm ? 'Try adjusting your search terms' : 'Add your first state to get started'}
// //                   </p>
// //                 </div>
// //               )}
// //             </>
// //           )}
// //         </Card.Body>
// //       </Card>

// //       {/* Pagination */}
// //       {totalPages > 1 && (
// //         <Row className="mt-4">
// //           <Col className="d-flex justify-content-center">
// //             <Pagination>
// //               <Pagination.First 
// //                 onClick={() => setCurrentPage(1)}
// //                 disabled={currentPage === 1}
// //               />
// //               <Pagination.Prev 
// //                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
// //                 disabled={currentPage === 1}
// //               />
              
// //               {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
// //                 <Pagination.Item
// //                   key={page}
// //                   active={page === currentPage}
// //                   onClick={() => setCurrentPage(page)}
// //                 >
// //                   {page}
// //                 </Pagination.Item>
// //               ))}
              
// //               <Pagination.Next 
// //                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
// //                 disabled={currentPage === totalPages}
// //               />
// //               <Pagination.Last 
// //                 onClick={() => setCurrentPage(totalPages)}
// //                 disabled={currentPage === totalPages}
// //               />
// //             </Pagination>
// //           </Col>
// //         </Row>
// //       )}

// //       {/* Add/Edit Modal */}
// //       <Modal show={showModal} onHide={handleCloseModal} size="lg">
// //         <Modal.Header closeButton>
// //           <Modal.Title>
// //             {editingState ? 'Edit State' : 'Add New State'}
// //           </Modal.Title>
// //         </Modal.Header>
// //         <Form onSubmit={handleSubmit}>
// //           <Modal.Body>
// //             <Row>
// //               <Col md={6}>
// //                 <Form.Group className="mb-3">
// //                   <Form.Label>State Name *</Form.Label>
// //                   <Form.Control
// //                     type="text"
// //                     name="statename"
// //                     value={formData.statename}
// //                     onChange={handleInputChange}
// //                     isInvalid={!!errors.statename}
// //                     placeholder="Enter state name"
// //                   />
// //                   <Form.Control.Feedback type="invalid">
// //                     {errors.statename}
// //                   </Form.Control.Feedback>
// //                 </Form.Group>
// //               </Col>
// //               <Col md={6}>
// //                 <Form.Group className="mb-3">
// //                   <Form.Label>State Code *</Form.Label>
// //                   <Form.Control
// //                     type="text"
// //                     name="statecode"
// //                     value={formData.statecode}
// //                     onChange={handleInputChange}
// //                     isInvalid={!!errors.statecode}
// //                     placeholder="e.g., CA, NY"
// //                     maxLength={2}
// //                   />
// //                   <Form.Control.Feedback type="invalid">
// //                     {errors.statecode}
// //                   </Form.Control.Feedback>
// //                 </Form.Group>
// //               </Col>
// //             </Row>
// //             <Row>
// //               <Col md={6}>
// //                 <Form.Group className="mb-3">
// //                   <Form.Label>Capital City</Form.Label>
// //                   <Form.Control
// //                     type="text"
// //                     name="statecapital"
// //                     value={formData.statecapital}
// //                     onChange={handleInputChange}
// //                     isInvalid={!!errors.statecapital}
// //                     placeholder="Enter capital city"
// //                   />
// //                   <Form.Control.Feedback type="invalid">
// //                     {errors.statecapital}
// //                   </Form.Control.Feedback>
// //                 </Form.Group>
// //               </Col>
// //               <Col md={6}>
// //                 <Form.Group className="mb-3">
// //                   <Form.Label>Country *</Form.Label>
// //                   <Form.Select
// //                     name="countryid"
// //                     value={formData.countryid}
// //                     onChange={handleInputChange}
// //                     isInvalid={!!errors.countryid}
// //                   >
// //                     <option value="">Select Country</option>
// //                     {countries.map(country => (
// //                       <option key={country.countryid} value={country.countryid}>
// //                         {country.countryname}
// //                       </option>
// //                     ))}
// //                   </Form.Select>
// //                   <Form.Control.Feedback type="invalid">
// //                     {errors.countryid}
// //                   </Form.Control.Feedback>
// //                 </Form.Group>
// //               </Col>
// //             </Row>
// //           </Modal.Body>
// //           <Modal.Footer>
// //             <Button variant="secondary" onClick={handleCloseModal}>
// //               Cancel
// //             </Button>
// //             <Button 
// //               variant="primary" 
// //               type="submit"
// //               disabled={loading}
// //             >
// //               {loading ? 'Saving...' : (editingState ? 'Update' : 'Save')}
// //             </Button>
// //           </Modal.Footer>
// //         </Form>
// //       </Modal>

// //       {/* Delete Confirmation Modal */}
// //       <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
// //         <Modal.Header closeButton>
// //           <Modal.Title>Confirm Delete</Modal.Title>
// //         </Modal.Header>
// //         <Modal.Body>
// //           Are you sure you want to delete <strong>{stateToDelete?.name}</strong>?
// //           This action cannot be undone.
// //         </Modal.Body>
// //         <Modal.Footer>
// //           <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
// //             Cancel
// //           </Button>
// //           <Button variant="danger" onClick={confirmDelete}>
// //             Delete
// //           </Button>
// //         </Modal.Footer>
// //       </Modal>
// //     </Container>
// //   );
// // };

// // export default StateMaster; 





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
//   Filter,
//   MapPin,
//   Building,
//   Flag
// } from 'lucide-react';
// import axios from 'axios';

// const StateMaster = () => {
//   // State management
//   const [states, setStates] = useState([]);
//   const [countries, setCountries] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [editingState, setEditingState] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [stateToDelete, setStateToDelete] = useState(null);

//   // Form state
//   const [formData, setFormData] = useState({
//     statename: '',
//     statecode: '',
//     statecapital: '',
//     countryid: ''
//   });

//   // Validation state
//   const [errors, setErrors] = useState({});

//   // Load data on component mount
//   useEffect(() => {
//     loadStates();
//     loadCountries();
//   }, []);

//   // Normalize API state item into a consistent shape used by this component
//   const normalizeState = (s) => ({
//     id: s?.stateid ?? null,
//     name: s?.statename ?? '',
//     code: s?.statecode ?? '',
//     capital: s?.statecapital ?? '',
//     country_id: s?.countryid ?? null,
//     country_name: s?.country_name ?? '',
//     status: s?.status ?? 1,
//     created_at: s?.created_date ?? null, // Updated to use created_date from backend
//   });

//   // Load states from API
//   const loadStates = async () => {
//     setLoading(true);
//     setError('');
    
//     try {
//       const response = await axios.get('http://localhost:3001/api/states');
//       console.log('Loaded states:', response.data);
//       console.log('Number of states:', response.data.length);
//       const normalized = Array.isArray(response.data)
//         ? response.data.map(normalizeState)
//         : [];
//       setStates(normalized);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to load states');
//       console.error('Error loading states:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load countries for dropdown
//   const loadCountries = async () => {
//     try {
//       const response = await axios.get('http://localhost:3001/api/countries');
//       setCountries(response.data);
//     } catch (err) {
//       console.error('Error loading countries:', err);
//     }
//   };

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
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
    
//     if (!formData.statename.trim()) {
//       newErrors.statename = 'State name is required';
//     }
    
//     if (!formData.statecode.trim()) {
//       newErrors.statecode = 'State code is required';
//     } else if (formData.statecode.length !== 2) {
//       newErrors.statecode = 'State code must be 2 characters';
//     }
    
//     if (!formData.countryid) {
//       newErrors.countryid = 'Country is required';
//     }
    
//     if (formData.statecapital && formData.statecapital.length < 2) {
//       newErrors.statecapital = 'Capital name must be at least 2 characters';
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
//       if (editingState) {
//         await axios.put(`http://localhost:3001/api/states/${editingState.id}`, formData);
//         await loadStates();
//       } else {
//         const response = await axios.post('http://localhost:3001/api/states', formData);
//         console.log('New state added:', response.data);
        
//         const normalizedState = {
//           id: response.data.state.stateid,
//           name: response.data.state.statename,
//           code: response.data.state.statecode,
//           capital: response.data.state.statecapital,
//           country_id: response.data.state.countryid,
//           country_name: response.data.state.country_name,
//           status: response.data.state.status,
//           created_at: response.data.state.created_date, // Updated to use created_date
//         };
//         if (response.data.state) {
//           setStates(prev => [normalizeState(response.data.state), ...prev]);
//         }
//       }
      
//       handleCloseModal();
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to save state');
//       console.error('Error saving state:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle edit
//   const handleEdit = (state) => {
//     setEditingState(state);
//     setFormData({
//       statename: state.name,
//       statecode: state.code,
//       statecapital: state.capital || '',
//       countryid: state.country_id
//     });
//     setShowModal(true);
//   };

//   // Handle delete
//   const handleDelete = (state) => {
//     setStateToDelete(state);
//     setShowDeleteModal(true);
//   };

//   // Confirm delete
//   const confirmDelete = async () => {
//     if (stateToDelete) {
//       try {
//         await axios.delete(`http://localhost:3001/api/states/${stateToDelete.id}`);
//         await loadStates();
//         setShowDeleteModal(false);
//         setStateToDelete(null);
//       } catch (err) {
//         setError(err.response?.data?.error || 'Failed to delete state');
//         console.error('Error deleting state:', err);
//       }
//     }
//   };

//   // Handle modal close
//   const handleCloseModal = () => {
//     setShowModal(false);
//     setEditingState(null);
//     setFormData({
//       statename: '',
//       statecode: '',
//       statecapital: '',
//       countryid: ''
//     });
//     setErrors({});
//   };

//   // Filter states based on search term
//   const normalizedSearch = (searchTerm || '').toString().toLowerCase();
//   const filteredStates = states.filter((state) => {
//     if (!state || typeof state !== 'object') return false;
//     const name = (state.name || '').toString().toLowerCase();
//     const code = (state.code || '').toString().toLowerCase();
//     const capital = (state.capital || '').toString().toLowerCase();
//     const countryName = (state.country_name || '').toString().toLowerCase();
//     return (
//       name.includes(normalizedSearch) ||
//       code.includes(normalizedSearch) ||
//       capital.includes(normalizedSearch) ||
//       countryName.includes(normalizedSearch)
//     );
//   });

//   // Pagination
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentStates = filteredStates.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredStates.length / itemsPerPage);

//   return (
//     <Container fluid className="py-4">
//       {/* Header */}
//       <Row className="mb-4">
//         <Col>
//           <div className="d-flex justify-content-between align-items-center">
//             <div>
//               <h2 className="mb-1">
//                 <MapPin className="me-2" size={24} />
//                 State Master
//               </h2>
//               <p className="text-muted mb-0">Manage states and their information</p>
//             </div>
//             <Button 
//               variant="primary" 
//               onClick={() => setShowModal(true)}
//               className="d-flex align-items-center gap-2"
//             >
//               <Plus size={18} />
//               Add State
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
//               placeholder="Search states..."
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
//               <Dropdown.Item>All States</Dropdown.Item>
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

//       {/* States Table */}
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
//                       <th style={{ minWidth: '200px' }}>State</th>
//                       <th style={{ minWidth: '100px' }}>Code</th>
//                       <th style={{ minWidth: '150px' }}>Capital</th>
//                       <th style={{ minWidth: '150px' }}>Country</th>
//                       <th style={{ minWidth: '100px' }}>Status</th>
//                       <th style={{ minWidth: '120px' }}>Created</th>
//                       <th style={{ minWidth: '120px' }}>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {currentStates.map((state, index) => (
//                       <tr key={state.id}>
//                         <td>{indexOfFirstItem + index + 1}</td>
//                         <td>
//                           <div className="d-flex align-items-center">
//                             <div className="me-2">
//                               <Building size={16} className="text-muted" />
//                             </div>
//                             <strong>{state.name}</strong>
//                           </div>
//                         </td>
//                         <td>
//                           <Badge bg="info" className="text-uppercase">
//                             {state.code}
//                           </Badge>
//                         </td>
//                         <td>
//                           {state.capital ? (
//                             <div className="d-flex align-items-center">
//                               <MapPin size={14} className="text-muted me-1" />
//                               {state.capital}
//                             </div>
//                           ) : (
//                             <span className="text-muted">-</span>
//                           )}
//                         </td>
//                         <td>
//                           {state.country_name ? (
//                             <div className="d-flex align-items-center">
//                               <Flag size={14} className="text-muted me-1" />
//                               {state.country_name}
//                             </div>
//                           ) : (
//                             <span className="text-muted">-</span>
//                           )}
//                         </td>
//                         <td>
//                           <Badge bg={state.status === 1 ? 'success' : 'secondary'}>
//                             {state.status === 1 ? 'Active' : 'Inactive'}
//                           </Badge>
//                         </td>
//                         <td>
//                           <small className="text-muted">
//                             {state.created_at ? new Date(state.created_at).toLocaleDateString() : '-'}
//                           </small>
//                         </td>
//                         <td>
//                           <div className="d-flex gap-1">
//                             <Button
//                               size="sm"
//                               variant="outline-info"
//                               onClick={() => handleEdit(state)}
//                               title="Edit"
//                             >
//                               <Edit size={14} />
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="outline-danger"
//                               onClick={() => handleDelete(state)}
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

//               {currentStates.length === 0 && (
//                 <div className="text-center py-5">
//                   <MapPin size={48} className="text-muted mb-3" />
//                   <h5 className="text-muted">No states found</h5>
//                   <p className="text-muted">
//                     {searchTerm ? 'Try adjusting your search terms' : 'Add your first state to get started'}
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
//             {editingState ? 'Edit State' : 'Add New State'}
//           </Modal.Title>
//         </Modal.Header>
//         <Form onSubmit={handleSubmit}>
//           <Modal.Body>
//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>State Name *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="statename"
//                     value={formData.statename}
//                     onChange={handleInputChange}
//                     isInvalid={!!errors.statename}
//                     placeholder="Enter state name"
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {errors.statename}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>State Code *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="statecode"
//                     value={formData.statecode}
//                     onChange={handleInputChange}
//                     isInvalid={!!errors.statecode}
//                     placeholder="e.g., CA, NY"
//                     maxLength={2}
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {errors.statecode}
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
//                     name="statecapital"
//                     value={formData.statecapital}
//                     onChange={handleInputChange}
//                     isInvalid={!!errors.statecapital}
//                     placeholder="Enter capital city"
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {errors.statecapital}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Country *</Form.Label>
//                   <Form.Select
//                     name="countryid"
//                     value={formData.countryid}
//                     onChange={handleInputChange}
//                     isInvalid={!!errors.countryid}
//                   >
//                     <option value="">Select Country</option>
//                     {countries.map(country => (
//                       <option key={country.countryid} value={country.countryid}>
//                         {country.countryname}
//                       </option>
//                     ))}
//                   </Form.Select>
//                   <Form.Control.Feedback type="invalid">
//                     {errors.countryid}
//                   </Form.Control.Feedback>
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
//               {loading ? 'Saving...' : (editingState ? 'Update' : 'Save')}
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
//           Are you sure you want to delete <strong>{stateToDelete?.name}</strong>?
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

// export default StateMaster;

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
  Flag
} from 'lucide-react';
import axios from 'axios';

const StateMaster = () => {
  // State management
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingState, setEditingState] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stateToDelete, setStateToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    statename: '',
    statecode: '',
    statecapital: '',
    countryid: ''
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Load data on component mount
  useEffect(() => {
    loadStates();
    loadCountries();
  }, []);

  // Normalize API state item into a consistent shape used by this component
  const normalizeState = (s) => ({
    id: s?.stateid ?? null,
    name: s?.statename ?? '',
    code: s?.statecode ?? '',
    capital: s?.statecapital ?? '',
    country_id: s?.countryid ?? null,
    country_name: s?.country_name ?? '',
    status: s?.status ?? 1,
    created_at: s?.created_date ?? null, // Maps to created_date from backend
  });

  // Load states from API
  const loadStates = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('http://localhost:3001/api/states');
      console.log('Loaded states:', response.data);
      const normalized = Array.isArray(response.data)
        ? response.data.map(normalizeState)
        : [];
      setStates(normalized);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load states');
      console.error('Error loading states:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load countries for dropdown
  const loadCountries = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/countries');
      setCountries(response.data);
    } catch (err) {
      console.error('Error loading countries:', err);
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
    
    if (!formData.statename.trim()) {
      newErrors.statename = 'State name is required';
    }
    
    if (!formData.statecode.trim()) {
      newErrors.statecode = 'State code is required';
    } else if (formData.statecode.length !== 2) {
      newErrors.statecode = 'State code must be 2 characters';
    }
    
    if (!formData.countryid) {
      newErrors.countryid = 'Country is required';
    }
    
    if (formData.statecapital && formData.statecapital.length < 2) {
      newErrors.statecapital = 'Capital name must be at least 2 characters';
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
      if (editingState) {
        const response = await axios.put(`http://localhost:3001/api/states/${editingState.id}`, formData);
        console.log('Updated state:', response.data.state);
        await loadStates(); // Reload to get updated data including created_date
      } else {
        const response = await axios.post('http://localhost:3001/api/states', formData);
        console.log('New state added:', response.data);
        
        const normalizedState = {
          id: response.data.state.stateid,
          name: response.data.state.statename,
          code: response.data.state.statecode,
          capital: response.data.state.statecapital,
          country_id: response.data.state.countryid,
          country_name: response.data.state.country_name,
          status: response.data.state.status,
          created_at: response.data.state.created_date,
        };
        if (response.data.state) {
          setStates(prev => [normalizeState(response.data.state), ...prev]);
        }
      }
      
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save state');
      console.error('Error saving state:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (state) => {
    setEditingState(state);
    setFormData({
      statename: state.name,
      statecode: state.code,
      statecapital: state.capital || '',
      countryid: state.country_id
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = (state) => {
    setStateToDelete(state);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (stateToDelete) {
      try {
        await axios.delete(`http://localhost:3001/api/states/${stateToDelete.id}`);
        await loadStates();
        setShowDeleteModal(false);
        setStateToDelete(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete state');
        console.error('Error deleting state:', err);
      }
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingState(null);
    setFormData({
      statename: '',
      statecode: '',
      statecapital: '',
      countryid: ''
    });
    setErrors({});
  };

  // Filter states based on search term
  const normalizedSearch = (searchTerm || '').toString().toLowerCase();
  const filteredStates = states.filter((state) => {
    if (!state || typeof state !== 'object') return false;
    const name = (state.name || '').toString().toLowerCase();
    const code = (state.code || '').toString().toLowerCase();
    const capital = (state.capital || '').toString().toLowerCase();
    const countryName = (state.country_name || '').toString().toLowerCase();
    return (
      name.includes(normalizedSearch) ||
      code.includes(normalizedSearch) ||
      capital.includes(normalizedSearch) ||
      countryName.includes(normalizedSearch)
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStates = filteredStates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStates.length / itemsPerPage);

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <MapPin className="me-2" size={24} />
                State Master
              </h2>
              <p className="text-muted mb-0">Manage states and their information</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <Plus size={18} />
              Add State
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
              placeholder="Search states..."
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
              <Dropdown.Item>All States</Dropdown.Item>
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

      {/* States Table */}
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
              <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <Table hover className="mb-0">
                  <thead className="table-light sticky-top bg-white" style={{ zIndex: 1 }}>
                    <tr>
                      <th style={{ minWidth: '50px' }}>#</th>
                      <th style={{ minWidth: '200px' }}>State</th>
                      <th style={{ minWidth: '100px' }}>Code</th>
                      <th style={{ minWidth: '150px' }}>Capital</th>
                      <th style={{ minWidth: '150px' }}>Country</th>
                      <th style={{ minWidth: '100px' }}>Status</th>
                      <th style={{ minWidth: '120px' }}>Created</th>
                      <th style={{ minWidth: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStates.map((state, index) => (
                      <tr key={state.id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              <Building size={16} className="text-muted" />
                            </div>
                            <strong>{state.name}</strong>
                          </div>
                        </td>
                        <td>
                          <Badge bg="info" className="text-uppercase">
                            {state.code}
                          </Badge>
                        </td>
                        <td>
                          {state.capital ? (
                            <div className="d-flex align-items-center">
                              <MapPin size={14} className="text-muted me-1" />
                              {state.capital}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {state.country_name ? (
                            <div className="d-flex align-items-center">
                              <Flag size={14} className="text-muted me-1" />
                              {state.country_name}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <Badge bg={state.status === 1 ? 'success' : 'secondary'}>
                            {state.status === 1 ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <small className="text-muted">
                            {state.created_at ? new Date(state.created_at).toLocaleDateString() : '-'}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => handleEdit(state)}
                              title="Edit"
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(state)}
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

              {currentStates.length === 0 && (
                <div className="text-center py-5">
                  <MapPin size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No states found</h5>
                  <p className="text-muted">
                    {searchTerm ? 'Try adjusting your search terms' : 'Add your first state to get started'}
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
            {editingState ? 'Edit State' : 'Add New State'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>State Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="statename"
                    value={formData.statename}
                    onChange={handleInputChange}
                    isInvalid={!!errors.statename}
                    placeholder="Enter state name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.statename}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>State Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="statecode"
                    value={formData.statecode}
                    onChange={handleInputChange}
                    isInvalid={!!errors.statecode}
                    placeholder="e.g., CA, NY"
                    maxLength={2}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.statecode}
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
                    name="statecapital"
                    value={formData.statecapital}
                    onChange={handleInputChange}
                    isInvalid={!!errors.statecapital}
                    placeholder="Enter capital city"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.statecapital}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Country *</Form.Label>
                  <Form.Select
                    name="countryid"
                    value={formData.countryid}
                    onChange={handleInputChange}
                    isInvalid={!!errors.countryid}
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country.countryid} value={country.countryid}>
                        {country.countryname}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.countryid}
                  </Form.Control.Feedback>
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
              {loading ? 'Saving...' : (editingState ? 'Update' : 'Save')}
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
          Are you sure you want to delete <strong>{stateToDelete?.name}</strong>?
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

export default StateMaster;