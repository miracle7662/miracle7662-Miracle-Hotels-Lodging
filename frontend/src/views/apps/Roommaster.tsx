

import React, { useState, useEffect } from 'react';
import { Button, Card, Stack, Table, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { apiCore } from '@/common/api/apiCore';
import { 
  fetchCurrentUserHotel, 
  fetchFloorsByHotel,
  fetchBlocksByHotel,
  HotelItem,
  FloorItem,
  BlockItem
} from '@/utils/commonfunction';

interface RoomMaster {
  room_id?: number;
  room_no: string;
  room_name: string;
  display_name: string;
  category_id: number;
  room_ext_no?: string;
  room_status: string;
  department_id?: number;
  blockid?: number;
  floorid?: number;
  hotel_id?: number;
  hotel_name?: string;
  created_date?: string;
  updated_date?: string;
}

interface CreateRoomRequest {
  room_no: string;
  room_name: string;
  display_name: string;
  category_id: number;
  room_ext_no?: string;
  room_status: string;
  department_id?: number;
  blockid?: number;
  floorid?: number;
  hotel_id?: number;
}

const RoomMasterComponent: React.FC = () => {
  const [rooms, setRooms] = useState<RoomMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomMaster | null>(null);
  const [currentHotel, setCurrentHotel] = useState<string>('');
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [floors, setFloors] = useState<FloorItem[]>([]);
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<number | undefined>();

  // Form state
  const [formData, setFormData] = useState<CreateRoomRequest>({
    room_no: '',
    room_name: '',
    display_name: '',
    category_id: 0,
    room_ext_no: '',
    room_status: 'available',
    department_id: undefined,
    blockid: undefined,
    floorid: undefined,
    hotel_id: undefined
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load floors and blocks when hotel changes
  useEffect(() => {
    if (selectedHotel) {
      fetchFloorsByHotel(selectedHotel).then(setFloors);
      fetchBlocksByHotel(selectedHotel).then(setBlocks);
    } else {
      setFloors([]);
      setBlocks([]);
    }
  }, [selectedHotel]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch rooms
      try {
        const response = await apiCore.get('/room-masters', {});
        setRooms(response.data || []);
      } catch (err) {
        // Silently ignore for now; master endpoints may not be ready
        setRooms([]);
      }

      const hotelsData = await fetchCurrentUserHotel();
      setHotels(hotelsData);
      
      // Set hotels data and current hotel
      if (hotelsData.length > 0) {
        setCurrentHotel(hotelsData[0].hotel_name);
        setSelectedHotel(hotelsData[0].hotelid);
        setFormData(prev => ({
          ...prev,
          hotel_id: hotelsData[0].hotelid
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'category_id' || name === 'department_id' || name === 'blockid' || name === 'floorid' || name === 'hotel_id' ? Number(value) || undefined : value
    }));

    if (name === 'hotel_id') {
      const hotelId = Number(value);
      setSelectedHotel(hotelId);
      const selected = hotels.find(h => h.hotelid === hotelId);
      if (selected) {
        setCurrentHotel(selected.hotel_name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await apiCore.update(`/room-masters/${editingRoom.room_id}`, formData);
        toast.success('Room updated successfully!');
      } else {
        await apiCore.create('/room-masters', formData);
        toast.success('Room created successfully!');
      }
      
      setShowModal(false);
      setEditingRoom(null);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error saving room:', error);
      toast.error('Error saving room');
    }
  };

  const handleEdit = (room: RoomMaster) => {
    setEditingRoom(room);
    setFormData({
      room_no: room.room_no,
      room_name: room.room_name,
      display_name: room.display_name,
      category_id: room.category_id,
      room_ext_no: room.room_ext_no || '',
      room_status: room.room_status,
      department_id: room.department_id,
      blockid: room.blockid,
      floorid: room.floorid,
      hotel_id: room.hotel_id
    });
    setSelectedHotel(room.hotel_id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await apiCore.delete(`/room-masters/${id}`);
        toast.success('Room deleted successfully!');
        await loadData();
      } catch (error) {
        console.error('Error deleting room:', error);
        toast.error('Error deleting room');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      room_no: '',
      room_name: '',
      display_name: '',
      category_id: 0,
      room_ext_no: '',
      room_status: 'available',
      department_id: undefined,
      blockid: undefined,
      floorid: undefined,
      hotel_id: undefined
    });
    setSelectedHotel(undefined);
  };

  const openAddModal = () => {
    setEditingRoom(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Card>
        <Card.Header>
          <Stack direction="horizontal" className="justify-content-between">
            <div>
              <h4 className="mb-0">Room Master</h4>
              {currentHotel && (
                <small className="text-muted">
                  Current Hotel: {currentHotel}
                </small>
              )}
            </div>
            <Button variant="primary" onClick={openAddModal}>
              <FiPlus className="me-2" />
              Add New Room
            </Button>
          </Stack>
        </Card.Header>
        <Card.Body>
          <Table responsive striped>
            <thead>
              <tr>
                <th>#</th>
                <th>Room No</th>
                <th>Room Name</th>
                <th>Display Name</th>
                <th>Category</th>
                <th>Extension No</th>
                <th>Status</th>
                <th>Department</th>
                <th>Block</th>
                <th>Floor</th>
                <th>Hotel</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center">No rooms found</td>
                </tr>
              ) : (
                rooms.map((room, index) => (
                  <tr key={room.room_id}>
                    <td>{index + 1}</td>
                    <td>{room.room_no}</td>
                    <td>{room.room_name}</td>
                    <td>{room.display_name}</td>
                    <td>{room.category_id}</td>
                    <td>{room.room_ext_no || 'N/A'}</td>
                    <td>
                      <Badge bg={room.room_status === 'available' ? 'success' : 'secondary'}>
                        {room.room_status}
                      </Badge>
                    </td>
                    <td>{room.department_id || 'N/A'}</td>
                    <td>{blocks.find(b => b.blockid === room.blockid)?.block_name || 'N/A'}</td>
                    <td>{floors.find(f => f.floorid === room.floorid)?.floor_name || 'N/A'}</td>
                    <td>{room.hotel_name || 'N/A'}</td>
                    <td>{room.created_date ? new Date(room.created_date).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <Stack direction="horizontal" gap={2}>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(room)}
                        >
                          <FiEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(room.room_id!)}
                        >
                          <FiTrash2 />
                        </Button>
                      </Stack>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingRoom ? 'Edit Room' : 'Add New Room'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Room Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="room_no"
                    value={formData.room_no}
                    onChange={handleInputChange}
                    placeholder="Enter room number"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Room Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="room_name"
                    value={formData.room_name}
                    onChange={handleInputChange}
                    placeholder="Enter room name"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Display Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    placeholder="Enter display name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category ID *</Form.Label>
                  <Form.Control
                    type="number"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    placeholder="Enter category ID"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Extension Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="room_ext_no"
                    value={formData.room_ext_no}
                    onChange={handleInputChange}
                    placeholder="Enter extension number"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Room Status</Form.Label>
                  <Form.Select
                    name="room_status"
                    value={formData.room_status}
                    onChange={handleInputChange}
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="cleaning">Cleaning</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department ID</Form.Label>
                  <Form.Control
                    type="number"
                    name="department_id"
                    value={formData.department_id || ''}
                    onChange={handleInputChange}
                    placeholder="Enter department ID"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hotel</Form.Label>
                  <Form.Select
                    name="hotel_id"
                    value={formData.hotel_id || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Hotel</option>
                    {hotels.map(hotel => (
                      <option key={hotel.hotelid} value={hotel.hotelid}>
                        {hotel.hotel_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Block</Form.Label>
                  <Form.Select
                    name="blockid"
                    value={formData.blockid || ''}
                    onChange={handleInputChange}
                    disabled={!selectedHotel}
                  >
                    <option value="">Select Block</option>
                    {blocks.map(block => (
                      <option key={block.blockid} value={block.blockid}>
                        {block.block_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Floor</Form.Label>
                  <Form.Select
                    name="floorid"
                    value={formData.floorid || ''}
                    onChange={handleInputChange}
                    disabled={!selectedHotel}
                  >
                    <option value="">Select Floor</option>
                    {floors.map(floor => (
                      <option key={floor.floorid} value={floor.floorid}>
                        {floor.floor_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingRoom ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default RoomMasterComponent;