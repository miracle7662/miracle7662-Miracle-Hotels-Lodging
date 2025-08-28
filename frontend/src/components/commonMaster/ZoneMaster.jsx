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
//   Flag,
//   Navigation,
//   Globe
// } from 'lucide-react';
// import axios from 'axios';

// const ZoneMaster = () => {
//   // State management
//   const [zones, setZones] = useState([]);
//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [districts, setDistricts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [editingZone, setEditingZone] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [zoneToDelete, setZoneToDelete] = useState(null);

//   // Form state
//   const [formData, setFormData] = useState({
//     zonename: '',
//     zonecode: '',
//     districtid: '',
//     description: ''
//   });

//   // Validation state
//   const [errors, setErrors] = useState({});

//   // Load data on component mount
//   useEffect(() => {
//     loadZones();
//     loadCountries();
//   }, []);

//   // Load zones from API
//   const loadZones = async () => {
//     setLoading(true);
//     setError('');
    
//     try {
//       const response = await axios.get('http://localhost:3001/api/zones');
//       console.log('Loaded zones:', response.data);
//       console.log('Number of zones:', response.data.length);
//       setZones(response.data);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to load zones');
//       console.error('Error loading zones:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load countries for dropdown
//   const loadCountries = async () => {
//     try {
//       console.log('Loading countries...');
//       const response = await axios.get('http://localhost:3001/api/countries');
//       console.log('Countries response:', response.data);
//       setCountries(response.data);
//     } catch (err) {
//       console.error('Error loading countries:', err);
//     }
//   };

//   // Load states by country
//   const loadStatesByCountry = async (countryId) => {
//     if (!countryId) {
//       setStates([]);
//       setDistricts([]);
//       return;
//     }
    
//     try {
//       console.log('Loading states for country:', countryId);
//       const response = await axios.get(`http://localhost:3001/api/states/country/${countryId}`);
//       console.log('States response:', response.data);
//       setStates(response.data);
//     } catch (err) {
//       console.error('Error loading states:', err);
//       setStates([]);
//     }
//   };

//   // Load districts by state
//   const loadDistrictsByState = async (stateId) => {
//     if (!stateId) {
//       setDistricts([]);
//       return;
//     }
    
//     try {
//       console.log('Loading districts for state:', stateId);
//       const response = await axios.get(`http://localhost:3001/api/districts/by-state/${stateId}`);
//       console.log('Districts response:', response.data);
//       setDistricts(response.data);
//     } catch (err) {
//       console.error('Error loading districts:', err);
//       setDistricts([]);
//     }
//   };

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     // If country changes, load states for that country
//     if (name === 'country_id') {
//       loadStatesByCountry(value);
//       // Reset state_id and districtid when country changes
//       setFormData(prev => ({
//         ...prev,
//         state_id: '',
//         districtid: ''
//       }));
//     }
    
//     // If state changes, load districts for that state
//     if (name === 'state_id') {
//       loadDistrictsByState(value);
//       // Reset districtid when state changes
//       setFormData(prev => ({
//         ...prev,
//         districtid: ''
//       }));
//     }
    
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
    
//     if (!formData.zonename.trim()) {
//       newErrors.zonename = 'Zone name is required';
//     }
    
//     if (!formData.zonecode.trim()) {
//       newErrors.zonecode = 'Zone code is required';
//     } else if (formData.zonecode.length !== 2) {
//       newErrors.zonecode = 'Zone code must be 2 characters';
//     }
    
//     if (!formData.districtid) {
//       newErrors.districtid = 'District is required';
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
//       if (editingZone) {
//         // Update existing zone
//         await axios.put(`http://localhost:3001/api/zones/${editingZone.zoneid}`, formData);
//         // Reload zones to get updated data
//         await loadZones();
//       } else {
//         // Add new zone
//         const response = await axios.post('http://localhost:3001/api/zones', formData);
//         console.log('New zone added:', response.data);
        
//         // Add the new zone to the list immediately
//         if (response.data.zone) {
//           setZones(prev => [response.data.zone, ...prev]);
//         }
//       }
      
//       handleCloseModal();
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to save zone');
//       console.error('Error saving zone:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle edit
//   const handleEdit = (zone) => {
//     setEditingZone(zone);
//     setFormData({
//       zonename: zone.zonename,
//       zonecode: zone.zonecode,
//       districtid: zone.districtid,
//       description: zone.description || ''
//     });
//     setShowModal(true);
//   };

//   // Handle delete
//   const handleDelete = (zone) => {
//     setZoneToDelete(zone);
//     setShowDeleteModal(true);
//   };

//   // Confirm delete
//   const confirmDelete = async () => {
//     if (zoneToDelete) {
//       try {
//         await axios.delete(`http://localhost:3001/api/zones/${zoneToDelete.zoneid}`);
//         // Reload zones to get updated data
//         await loadZones();
//         setShowDeleteModal(false);
//         setZoneToDelete(null);
//       } catch (err) {
//         setError(err.response?.data?.error || 'Failed to delete zone');
//         console.error('Error deleting zone:', err);
//       }
//     }
//   };

//   // Handle modal close
//   const handleCloseModal = () => {
//     setShowModal(false);
//     setEditingZone(null);
//     setFormData({
//       zonename: '',
//       zonecode: '',
//       districtid: '',
//       description: ''
//     });
//     setErrors({});
//   };

//   // Filter zones based on search term
//   const filteredZones = zones.filter(zone =>
//     zone.zonename.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     zone.zonecode.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (zone.description && zone.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (zone.district_name && zone.district_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (zone.state_name && zone.state_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (zone.country_name && zone.country_name.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   // Pagination
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentZones = filteredZones.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredZones.length / itemsPerPage);

//   return (
//     <Container fluid className="py-4">
//       {/* Header */}
//       <Row className="mb-4">
//         <Col>
//           <div className="d-flex justify-content-between align-items-center">
//             <div>
//               <h2 className="mb-1">
//                 <Globe className="me-2" size={24} />
//                 Zone Master
//               </h2>
//               <p className="text-muted mb-0">Manage zones and their information</p>
//             </div>
//             <Button 
//               variant="primary" 
//               onClick={() => setShowModal(true)}
//               className="d-flex align-items-center gap-2"
//             >
//               <Plus size={16} />
//               Add Zone
//             </Button>
//           </div>
//         </Col>
//       </Row>

//       {/* Error Alert */}
//       {error && (
//         <Alert variant="danger" dismissible onClose={() => setError('')}>
//           {error}
//         </Alert>
//       )}

//       {/* Search and Filters */}
//       <Row className="mb-4">
//         <Col md={6}>
//           <InputGroup>
//             <InputGroup.Text>
//               <Search size={16} />
//             </InputGroup.Text>
//             <Form.Control
//               type="text"
//               placeholder="Search zones..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </InputGroup>
//         </Col>
//         <Col md={6} className="text-end">
//           <Badge bg="info" className="me-2">
//             Total: {filteredZones.length}
//           </Badge>
//           <Badge bg="success">
//             Active: {filteredZones.filter(zone => zone.status === 1).length}
//           </Badge>
//         </Col>
//       </Row>

//       {/* Zones Table */}
//       <Card>
//         <Card.Body>
//           {loading ? (
//             <div className="text-center py-4">
//               <div className="spinner-border" role="status">
//                 <span className="visually-hidden">Loading...</span>
//               </div>
//             </div>
//           ) : (
//             <>
//               <Table responsive hover>
//                 <thead>
//                   <tr>
//                     <th>Zone Name</th>
//                     <th>Zone Code</th>
//                     <th>District</th>
//                     <th>State</th>
//                     <th>Country</th>
//                     <th>Description</th>
//                     <th>Status</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentZones.map((zone) => (
//                     <tr key={zone.zoneid}>
//                       <td>
//                         <strong>{zone.zonename}</strong>
//                       </td>
//                       <td>
//                         <Badge bg="secondary">{zone.zonecode}</Badge>
//                       </td>
//                       <td>
//                         <span className="d-flex align-items-center">
//                           <MapPin size={14} className="me-1" />
//                           {zone.district_name || 'N/A'}
//                         </span>
//                       </td>
//                       <td>
//                         <span className="d-flex align-items-center">
//                           <Building size={14} className="me-1" />
//                           {zone.state_name || 'N/A'}
//                         </span>
//                       </td>
//                       <td>
//                         <span className="d-flex align-items-center">
//                           <Flag size={14} className="me-1" />
//                           {zone.country_name || 'N/A'}
//                         </span>
//                       </td>
//                       <td>
//                         {zone.description ? (
//                           <span className="text-muted">{zone.description}</span>
//                         ) : (
//                           <span className="text-muted">No description</span>
//                         )}
//                       </td>
//                       <td>
//                         <Badge bg={zone.status === 1 ? 'success' : 'danger'}>
//                           {zone.status === 1 ? 'Active' : 'Inactive'}
//                         </Badge>
//                       </td>
//                       <td>
//                         <div className="d-flex gap-2">
//                           <Button
//                             variant="outline-primary"
//                             size="sm"
//                             onClick={() => handleEdit(zone)}
//                           >
//                             <Edit size={14} />
//                           </Button>
//                           <Button
//                             variant="outline-danger"
//                             size="sm"
//                             onClick={() => handleDelete(zone)}
//                           >
//                             <Trash2 size={14} />
//                           </Button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="d-flex justify-content-center mt-4">
//                   <Pagination>
//                     <Pagination.First 
//                       onClick={() => setCurrentPage(1)}
//                       disabled={currentPage === 1}
//                     />
//                     <Pagination.Prev 
//                       onClick={() => setCurrentPage(currentPage - 1)}
//                       disabled={currentPage === 1}
//                     />
                    
//                     {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
//                       <Pagination.Item
//                         key={page}
//                         active={page === currentPage}
//                         onClick={() => setCurrentPage(page)}
//                       >
//                         {page}
//                       </Pagination.Item>
//                     ))}
                    
//                     <Pagination.Next 
//                       onClick={() => setCurrentPage(currentPage + 1)}
//                       disabled={currentPage === totalPages}
//                     />
//                     <Pagination.Last 
//                       onClick={() => setCurrentPage(totalPages)}
//                       disabled={currentPage === totalPages}
//                     />
//                   </Pagination>
//                 </div>
//               )}
//             </>
//           )}
//         </Card.Body>
//       </Card>

//       {/* Add/Edit Zone Modal */}
//       <Modal show={showModal} onHide={handleCloseModal} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editingZone ? 'Edit Zone' : 'Add New Zone'}
//           </Modal.Title>
//         </Modal.Header>
//         <Form onSubmit={handleSubmit}>
//           <Modal.Body>
//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Zone Name *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="zonename"
//                     value={formData.zonename}
//                     onChange={handleInputChange}
//                     isInvalid={!!errors.zonename}
//                     placeholder="Enter zone name"
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {errors.zonename}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Zone Code *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="zonecode"
//                     value={formData.zonecode}
//                     onChange={handleInputChange}
//                     isInvalid={!!errors.zonecode}
//                     placeholder="Enter 2-character code"
//                     maxLength={2}
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {errors.zonecode}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Row>
//               <Col md={4}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Country</Form.Label>
//                   <Form.Select
//                     name="country_id"
//                     value={formData.country_id || ''}
//                     onChange={handleInputChange}
//                   >
//                     <option value="">Select Country</option>
//                     {countries.map(country => (
//                       <option key={country.countryid} value={country.countryid}>
//                         {country.countryname}
//                       </option>
//                     ))}
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//               <Col md={4}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>State</Form.Label>
//                   <Form.Select
//                     name="state_id"
//                     value={formData.state_id || ''}
//                     onChange={handleInputChange}
//                     disabled={!formData.country_id}
//                   >
//                     <option value="">Select State</option>
//                     {states.map(state => (
//                       <option key={state.stateid} value={state.stateid}>
//                         {state.state_name}
//                       </option>
//                     ))}
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//               <Col md={4}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>District *</Form.Label>
//                   <Form.Select
//                     name="districtid"
//                     value={formData.districtid || ''}
//                     onChange={handleInputChange}
//                     isInvalid={!!errors.districtid}
//                     disabled={!formData.state_id}
//                   >
//                     <option value="">Select District</option>
//                     {districts.map(district => (
//                       <option key={district.districtid} value={district.districtid}>
//                         {district.district_name}
//                       </option>
//                     ))}
//                   </Form.Select>
//                   <Form.Control.Feedback type="invalid">
//                     {errors.districtid}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Form.Group className="mb-3">
//               <Form.Label>Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 name="description"
//                 value={formData.description}
//                 onChange={handleInputChange}
//                 placeholder="Enter zone description (optional)"
//               />
//             </Form.Group>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleCloseModal}>
//               Cancel
//             </Button>
//             <Button variant="primary" type="submit" disabled={loading}>
//               {loading ? 'Saving...' : (editingZone ? 'Update Zone' : 'Add Zone')}
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
//           Are you sure you want to delete the zone "{zoneToDelete?.zonename}"? This action cannot be undone.
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="danger" onClick={confirmDelete}>
//             Delete Zone
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// };

// export default ZoneMaster; 


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
  Flag,
  Navigation,
  Globe
} from 'lucide-react';
import axios from 'axios';

const ZoneMaster = () => {
  // State management
  const [zones, setZones] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    zonename: '',
    zonecode: '',
    country_id: '',
    state_id: '',
    districtid: '',
    description: ''
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Load data on component mount
  useEffect(() => {
    loadZones();
    loadCountries();
  }, []);

  // Normalize API zone item into a consistent shape
  const normalizeZone = (z) => ({
    zoneid: z?.zoneid ?? null,
    zonename: z?.zonename ?? '',
    zonecode: z?.zonecode ?? '',
    districtid: z?.districtid ?? null,
    district_name: z?.district_name ?? '',
    state_name: z?.state_name ?? '',
    country_name: z?.country_name ?? '',
    description: z?.description ?? '',
    status: z?.status ?? 1,
    created_date: z?.created_date ?? null,
    updated_date: z?.updated_date ?? null
  });

  // Load zones from API
  const loadZones = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('http://localhost:3001/api/zones');
      console.log('Loaded zones:', response.data);
      console.log('Number of zones:', response.data.length);
      const normalized = Array.isArray(response.data)
        ? response.data.map(normalizeZone)
        : [];
      setZones(normalized);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load zones');
      console.error('Error loading zones:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load countries for dropdown
  const loadCountries = async () => {
    try {
      console.log('Loading countries...');
      const response = await axios.get('http://localhost:3001/api/countries');
      console.log('Countries response:', response.data);
      setCountries(response.data);
    } catch (err) {
      console.error('Error loading countries:', err);
      setError('Failed to load countries');
      setCountries([]);
    }
  };

  // Load states by country
  const loadStatesByCountry = async (countryId) => {
    if (!countryId) {
      setStates([]);
      setDistricts([]);
      setFormData(prev => ({ ...prev, state_id: '', districtid: '' }));
      return;
    }
    
    try {
      console.log('Loading states for country:', countryId);
      const response = await axios.get(`http://localhost:3001/api/states/country/${countryId}`);
      console.log('States response:', response.data);
      setStates(response.data);
      setDistricts([]);
      setFormData(prev => ({ ...prev, state_id: '', districtid: '' }));
    } catch (err) {
      console.error('Error loading states:', err);
      setError('Failed to load states');
      setStates([]);
    }
  };

  // Load districts by state
  const loadDistrictsByState = async (stateId) => {
    if (!stateId) {
      setDistricts([]);
      setFormData(prev => ({ ...prev, districtid: '' }));
      return;
    }
    
    try {
      console.log('Loading districts for state:', stateId);
      const response = await axios.get(`http://localhost:3001/api/districts/by-state/${stateId}`);
      console.log('Districts response:', response.data);
      const normalizedDistricts = response.data.map(d => ({
        districtid: d.distrcitid,
        district_name: d.distrcitname,
        ditcrictcode: d.ditcrictcode
      }));
      setDistricts(normalizedDistricts);
      setFormData(prev => ({ ...prev, districtid: '' }));
    } catch (err) {
      console.error('Error loading districts:', err);
      setError('Failed to load districts');
      setDistricts([]);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If country changes, load states for that country
    if (name === 'country_id') {
      loadStatesByCountry(value);
    }
    
    // If state changes, load districts for that state
    if (name === 'state_id') {
      loadDistrictsByState(value);
    }
    
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
    
    if (!formData.zonename.trim()) {
      newErrors.zonename = 'Zone name is required';
    }
    
    if (!formData.zonecode.trim()) {
      newErrors.zonecode = 'Zone code is required';
    } else if (formData.zonecode.length !== 2) {
      newErrors.zonecode = 'Zone code must be 2 characters';
    }
    
    if (!formData.districtid) {
      newErrors.districtid = 'District is required';
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
      const payload = {
        zonename: formData.zonename.trim(),
        zonecode: formData.zonecode.trim().toUpperCase(),
        districtid: formData.districtid,
        description: formData.description || null
      };
      if (editingZone) {
        await axios.put(`http://localhost:3001/api/zones/${editingZone.zoneid}`, payload);
        await loadZones();
      } else {
        const response = await axios.post('http://localhost:3001/api/zones', payload);
        console.log('New zone added:', response.data);
        if (response.data.zone) {
          setZones(prev => [normalizeZone(response.data.zone), ...prev]);
        }
      }
      
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save zone');
      console.error('Error saving zone:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      zonename: zone.zonename,
      zonecode: zone.zonecode,
      country_id: '',
      state_id: '',
      districtid: zone.districtid ? zone.districtid.toString() : '',
      description: zone.description || ''
    });
    // Load states and districts for the selected zone
    if (zone.country_name) {
      loadStatesByCountry(zone.country_name ? countries.find(c => c.countryname === zone.country_name)?.countryid : '');
      if (zone.state_name) {
        loadDistrictsByState(zone.state_name ? states.find(s => s.statename === zone.state_name)?.stateid : '');
      }
    }
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = (zone) => {
    setZoneToDelete(zone);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (zoneToDelete) {
      try {
        await axios.delete(`http://localhost:3001/api/zones/${zoneToDelete.zoneid}`);
        await loadZones();
        setShowDeleteModal(false);
        setZoneToDelete(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete zone');
        console.error('Error deleting zone:', err);
      }
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingZone(null);
    setFormData({
      zonename: '',
      zonecode: '',
      country_id: '',
      state_id: '',
      districtid: '',
      description: ''
    });
    setErrors({});
    setStates([]);
    setDistricts([]);
  };

  // Filter zones based on search term
  const filteredZones = zones.filter(zone =>
    (zone.zonename || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (zone.zonecode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (zone.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (zone.district_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (zone.state_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (zone.country_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentZones = filteredZones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredZones.length / itemsPerPage);

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <Globe className="me-2" size={24} />
                Zone Master
              </h2>
              <p className="text-muted mb-0">Manage zones and their information</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <Plus size={16} />
              Add Zone
            </Button>
          </div>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <Search size={16} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search zones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="text-end">
          <Badge bg="info" className="me-2">
            Total: {filteredZones.length}
          </Badge>
          <Badge bg="success">
            Active: {filteredZones.filter(zone => zone.status === 1).length}
          </Badge>
        </Col>
      </Row>

      {/* Zones Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Zone Name</th>
                    <th>Zone Code</th>
                    <th>District</th>
                    <th>State</th>
                    <th>Country</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentZones.map((zone) => (
                    <tr key={zone.zoneid}>
                      <td>
                        <strong>{zone.zonename}</strong>
                      </td>
                      <td>
                        <Badge bg="secondary">{zone.zonecode}</Badge>
                      </td>
                      <td>
                        <span className="d-flex align-items-center">
                          <MapPin size={14} className="me-1" />
                          {zone.district_name || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="d-flex align-items-center">
                          <Building size={14} className="me-1" />
                          {zone.state_name || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="d-flex align-items-center">
                          <Flag size={14} className="me-1" />
                          {zone.country_name || 'N/A'}
                        </span>
                      </td>
                      <td>
                        {zone.description ? (
                          <span className="text-muted">{zone.description}</span>
                        ) : (
                          <span className="text-muted">No description</span>
                        )}
                      </td>
                      <td>
                        <Badge bg={zone.status === 1 ? 'success' : 'danger'}>
                          {zone.status === 1 ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(zone)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(zone)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {currentZones.length === 0 && (
                <div className="text-center py-5">
                  <Globe size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No zones found</h5>
                  <p className="text-muted">
                    {searchTerm ? 'Try adjusting your search terms' : 'Add your first zone to get started'}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => setCurrentPage(currentPage - 1)}
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
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last 
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Zone Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingZone ? 'Edit Zone' : 'Add New Zone'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Zone Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="zonename"
                    value={formData.zonename}
                    onChange={handleInputChange}
                    isInvalid={!!errors.zonename}
                    placeholder="Enter zone name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.zonename}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Zone Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="zonecode"
                    value={formData.zonecode}
                    onChange={handleInputChange}
                    isInvalid={!!errors.zonecode}
                    placeholder="Enter 2-character code"
                    maxLength={2}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.zonecode}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Select
                    name="country_id"
                    value={formData.country_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country.countryid} value={country.countryid}>
                        {country.countryname}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Select
                    name="state_id"
                    value={formData.state_id}
                    onChange={handleInputChange}
                    disabled={!formData.country_id}
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state.stateid} value={state.stateid}>
                        {state.statename}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>District *</Form.Label>
                  <Form.Select
                    name="districtid"
                    value={formData.districtid}
                    onChange={handleInputChange}
                    isInvalid={!!errors.districtid}
                    disabled={!formData.state_id}
                  >
                    <option value="">Select District</option>
                    {districts.map(district => (
                      <option key={district.districtid} value={district.districtid}>
                        {district.district_name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.districtid}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter zone description (optional)"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : (editingZone ? 'Update Zone' : 'Add Zone')}
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
          Are you sure you want to delete the zone "{zoneToDelete?.zonename}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete Zone
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ZoneMaster;