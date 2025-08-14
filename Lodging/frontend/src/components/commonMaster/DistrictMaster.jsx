import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Spinner,
  Badge
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

const DistrictMaster = () => {
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [districtToDelete, setDistrictToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  // Fetch all districts
  const fetchDistricts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/districts`);
      setDistricts(response.data);
    } catch (error) {
      toast.error('Failed to fetch districts');
      console.error('Error fetching districts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all states for dropdown
  const fetchStates = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/states`);
      setStates(response.data);
    } catch (error) {
      toast.error('Failed to fetch states');
      console.error('Error fetching states:', error);
    }
  };

  useEffect(() => {
    fetchDistricts();
    fetchStates();
  }, []);

  // Open modal for create/edit
  const openModal = (mode = 'create', district = null) => {
    setModalMode(mode);
    setSelectedDistrict(district);
    
    if (mode === 'edit' && district) {
      reset({
        district_name: district.district_name || district.district_name,
        districtcode: district.districtcode,
        stateid: district.stateid,
        description: district.description || '',
        status: district.status || 1
      });
    } else {
      reset({
        district_name: '',
        districtcode: '',
        stateid: '',
        description: '',
        status: 1
      });
    }
    
    setModal(true);
  };

  // Close modal
  const closeModal = () => {
    setModal(false);
    reset();
    setSelectedDistrict(null);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setSubmitting(true);
    
    try {
      const payload = {
        district_name: data.district_name,
        districtcode: data.districtcode,
        stateid: parseInt(data.stateid),
        description: data.description,
        status: parseInt(data.status)
      };

      if (modalMode === 'create') {
        await axios.post(`${API_BASE_URL}/api/districts`, payload);
        toast.success('District created successfully!');
      } else {
        await axios.put(`${API_BASE_URL}/api/districts/${selectedDistrict.districtid}`, payload);
        toast.success('District updated successfully!');
      }
      
      closeModal();
      fetchDistricts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/districts/${districtToDelete.districtid}`);
      toast.success('District deleted successfully!');
      setDeleteModal(false);
      setDistrictToDelete(null);
      fetchDistricts();
    } catch (error) {
      toast.error('Failed to delete district');
      console.error('Error deleting district:', error);
    }
  };

  // Open delete confirmation
  const openDeleteModal = (district) => {
    setDistrictToDelete(district);
    setDeleteModal(true);
  };

  const getStatusBadge = (status) => {
    return status === 1 ? (
      <Badge color="success" className="me-1">Active</Badge>
    ) : (
      <Badge color="danger" className="me-1">Inactive</Badge>
    );
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">District Master</h5>
                <Button
                  color="primary"
                  onClick={() => openModal('create')}
                  className="btn-sm"
                >
                  <i className="ri-add-line me-1"></i>
                  Add District
                </Button>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div className="text-center py-4">
                    <Spinner color="primary" />
                    <p className="mt-2">Loading districts...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table className="table-nowrap align-middle">
                      <thead className="table-light">
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">District Name</th>
                          <th scope="col">District Code</th>
                          <th scope="col">State</th>
                          <th scope="col">Country</th>
                          <th scope="col">Status</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {districts.map((district, index) => (
                          <tr key={district.districtid}>
                            <td>{index + 1}</td>
                            <td>{district.district_name}</td>
                            <td>{district.districtcode}</td>
                            <td>{district.state_name}</td>
                            <td>{district.country_name}</td>
                            <td>{getStatusBadge(district.status)}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  color="info"
                                  size="sm"
                                  onClick={() => openModal('edit', district)}
                                  className="btn-sm"
                                >
                                  <i className="ri-edit-line"></i>
                                </Button>
                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() => openDeleteModal(district)}
                                  className="btn-sm"
                                >
                                  <i className="ri-delete-bin-line"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Create/Edit Modal */}
        <Modal isOpen={modal} toggle={closeModal} size="lg">
          <ModalHeader toggle={closeModal}>
            {modalMode === 'create' ? 'Add New District' : 'Edit District'}
          </ModalHeader>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="district_name">District Name <span className="text-danger">*</span></Label>
                    <Input
                      type="text"
                      id="district_name"
                      {...register('district_name', { required: 'District name is required' })}
                      invalid={errors.district_name ? true : false}
                    />
                    {errors.district_name && (
                      <FormFeedback>{errors.district_name.message}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="districtcode">District Code <span className="text-danger">*</span></Label>
                    <Input
                      type="text"
                      id="districtcode"
                      {...register('districtcode', { required: 'District code is required' })}
                      invalid={errors.districtcode ? true : false}
                    />
                    {errors.districtcode && (
                      <FormFeedback>{errors.districtcode.message}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="stateid">State <span className="text-danger">*</span></Label>
                    <Input
                      type="select"
                      id="stateid"
                      {...register('stateid', { required: 'State is required' })}
                      invalid={errors.stateid ? true : false}
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state.stateid} value={state.stateid}>
                          {state.statename}
                        </option>
                      ))}
                    </Input>
                    {errors.stateid && (
                      <FormFeedback>{errors.stateid.message}</FormFeedback>
                    )}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="status">Status</Label>
                    <Input
                      type="select"
                      id="status"
                      {...register('status')}
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <FormGroup>
                    <Label for="description">Description</Label>
                    <Input
                      type="textarea"
                      id="description"
                      rows={3}
                      {...register('description')}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={closeModal}>Cancel</Button>
              <Button color="primary" type="submit" disabled={submitting}>
                {submitting ? <Spinner size="sm" /> : modalMode === 'create' ? 'Add District' : 'Update District'}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
          <ModalHeader toggle={() => setDeleteModal(false)}>
            Confirm Delete
          </ModalHeader>
          <ModalBody>
            Are you sure you want to delete the district "{districtToDelete?.district_name}"?
            This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button color="danger" onClick={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </React.Fragment>
  );
};

export default DistrictMaster;
