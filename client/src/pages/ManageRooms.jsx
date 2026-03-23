import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Loader2, Plus, Trash2, Edit, Save, X, Bed, Users } from 'lucide-react';
import { resolveImageUrl } from '../utils/urlHelper';

const ManageRooms = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    roomType: 'Single',
    price: '',
    capacity: 1,
    amenities: [],
    description: '',
    totalRooms: 1,
    images: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotelRes, roomsRes] = await Promise.all([
          API.get(`/api/hotels/${hotelId}`),
          API.get(`/api/rooms/${hotelId}`)
        ]);
        setHotel(hotelRes.data.data);
        setRooms(roomsRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hotelId]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);
    
    setUploadingImage(true);
    try {
      const res = await API.post('/api/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFormData({ ...formData, images: [...formData.images, res.data.url] });
    } catch (error) {
      alert(error.response?.data?.message || 'Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      if (editingRoom) {
        await API.put(`/api/rooms/${editingRoom._id}`, formData);
      } else {
        await API.post('/api/rooms', { ...formData, hotelId });
      }
      const { data } = await API.get(`/api/rooms/${hotelId}`);
      setRooms(data.data);
      closeModal();
    } catch (error) {
      alert(error.response?.data?.message || 'Error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room type?')) return;
    try {
      await API.delete(`/api/rooms/${id}`);
      setRooms(rooms.filter(r => r._id !== id));
    } catch (error) {
      alert('Error deleting room');
    }
  };

  const openModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        roomType: room.roomType,
        price: room.price,
        capacity: room.capacity,
        amenities: room.amenities || [],
        description: room.description || '',
        totalRooms: room.totalRooms,
        images: room.images || []
      });
    } else {
      setEditingRoom(null);
      setFormData({ roomType: 'Single', price: '', capacity: 1, amenities: [], description: '', totalRooms: 1, images: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-12 h-12 text-primary" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          <img 
            src={resolveImageUrl(hotel?.images?.[0]) || 'https://placehold.co/100?text=No+Hotel+Image'} 
            className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white" 
            alt={hotel?.name} 
          />
          <div>
            <h1 className="text-3xl font-bold text-dark mb-1">Manage Rooms: {hotel?.name}</h1>
            <p className="text-gray-400 text-sm font-medium">Add or edit room categories and pricing for this property.</p>
          </div>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center shrink-0">
          <Plus className="w-5 h-5 mr-2" />
          Add Room Type
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map(room => (
          <div key={room._id} className="premium-card p-0 overflow-hidden flex flex-col">
            <div className="h-48 relative overflow-hidden bg-gray-100">
               {room.images?.length > 0 ? (
                 <img src={resolveImageUrl(room.images[0])} className="w-full h-full object-cover" alt={room.roomType} />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Bed className="w-12 h-12" />
                 </div>
               )}
            </div>
            <div className="p-8 flex-grow">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-dark">{room.roomType}</h3>
                  <div className="text-primary font-bold text-lg mt-1">₹{room.price} <span className="text-sm text-gray-400 font-normal">/ night</span></div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => openModal(room)} className="p-2 text-gray-400 hover:text-primary transition-colors"><Edit className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete(room._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-3" />
                  <span>Up to {room.capacity} Guests</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Bed className="w-4 h-4 mr-3" />
                  <span>{room.totalRooms} Units Available</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 italic mb-6 line-clamp-2">"{room.description}"</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 md:p-8 border-b shrink-0 bg-white">
              <h2 className="text-2xl font-bold text-dark">{editingRoom ? 'Edit Room Type' : 'Add New Room Type'}</h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-dark hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 md:p-8 scroll-smooth">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-dark">Room Type</label>
                    <select 
                      className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                      value={formData.roomType}
                      onChange={(e) => setFormData({...formData, roomType: e.target.value})}
                    >
                      <option>Single</option>
                      <option>Double</option>
                      <option>Deluxe</option>
                      <option>Suite</option>
                      <option>Family</option>
                      <option>Penthouse</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-dark">Price per Night (₹)</label>
                    <input 
                      type="number" required
                      className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary transition-all"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="e.g. 5000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-dark">Guest Capacity</label>
                    <input 
                      type="number" required min="1"
                      className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary transition-all"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-dark">Number of Rooms</label>
                    <input 
                      type="number" required min="1"
                      className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary transition-all"
                      value={formData.totalRooms}
                      onChange={(e) => setFormData({...formData, totalRooms: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-dark">Room Images</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.images.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100 shadow-sm">
                        <img src={resolveImageUrl(url)} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                          <button 
                            type="button" 
                            onClick={() => removeImage(idx)}
                            className="bg-red-500 text-white p-2 rounded-xl scale-75 group-hover:scale-100 transition-transform hover:bg-red-600 shadow-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {uploadingImage ? (
                      <div className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center">
                         <Loader2 className="w-6 h-6 animate-spin text-primary" />
                         <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">Uploading</span>
                      </div>
                    ) : (
                      <label className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-primary/30 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-colors mb-2">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">Add Image</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-dark">Description</label>
                  <textarea 
                    rows="3" required
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the room features, view, etc."
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-dark">Amenities</label>
                  <div className="bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-2">
                      {['WiFi', 'TV', 'AC', 'Mini Bar', 'Ocean View', 'Balcony', 'Room Service'].map(amenity => (
                        <label key={amenity} className="flex items-center space-x-3 cursor-pointer group">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${formData.amenities.includes(amenity) ? 'bg-primary border-primary shadow-md shadow-primary/20' : 'bg-white border-gray-200 group-hover:border-primary/50'}`}>
                            {formData.amenities.includes(amenity) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <input 
                            type="checkbox"
                            className="hidden"
                            checked={formData.amenities.includes(amenity)}
                            onChange={(e) => {
                              if (e.target.checked) setFormData({...formData, amenities: [...formData.amenities, amenity]})
                              else setFormData({...formData, amenities: formData.amenities.filter(a => a !== amenity)})
                            }}
                          />
                          <span className="text-xs md:text-sm font-medium text-gray-600 transition-colors group-hover:text-dark">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 md:p-8 border-t bg-gray-50 shrink-0">
              <button 
                type="submit" 
                onClick={handleSubmit}
                disabled={saving || uploadingImage}
                className="w-full btn-primary py-4 flex items-center justify-center font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                {saving ? (
                  <><Loader2 className="animate-spin w-5 h-5 mr-3" /> Saving Changes...</>
                ) : (
                  <>{editingRoom ? 'Update Room Type' : 'Create Room Type'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
