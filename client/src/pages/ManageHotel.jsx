import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Camera, MapPin, Save, ArrowLeft, Trash2 } from 'lucide-react';
import API from '../services/api';

import LocationSearch from '../components/hotel/LocationSearch';
import { toast } from 'react-hot-toast';
import { resolveImageUrl } from '../utils/urlHelper';

const ManageHotel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: { address: '', city: '', state: '', country: 'India', zipCode: '' },
    amenities: [],
    images: []
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const currentAmenities = [
    'Free Wi-Fi', 'Swimming Pool', 'Fitness Center', 'Restaurant', 
    'Room Service', 'Parking', 'Spa', 'Bar', 'Airport Shuttle',
    'Pet Friendly', 'Air Conditioning', 'Breakfast Included'
  ];

  useEffect(() => {
    if (isEdit) {
      const fetchHotel = async () => {
        try {
          const { data } = await API.get(`/api/hotels/${id}`);
          if (data.success) {
            setFormData(data.data);
          }
        } catch (error) {
          toast.error('Failed to fetch hotel details');
          navigate('/manager/dashboard');
        } finally {
          setLoading(false);
        }
      };
      fetchHotel();
    }
  }, [id, isEdit, navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (formData.images.length >= 6) {
      toast.error('Maximum 6 images allowed');
      return;
    }

    setUploadingImage(true);
    const imageData = new FormData();
    imageData.append('image', file);

    try {
      const { data } = await API.post('/api/upload', imageData);
      setFormData({ ...formData, images: [...formData.images, data.url] });
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Upload failed');
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
    e.preventDefault();
    if (formData.images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await API.put(`/api/hotels/${id}`, formData);
        toast.success('Hotel updated successfully');
      } else {
        await API.post('/api/hotels', formData);
        toast.success('Hotel created successfully');
      }
      navigate('/manager/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      
      <div className="max-w-5xl mx-auto px-4 mt-12">
        <button 
          onClick={() => navigate('/manager/dashboard')}
          className="flex items-center text-gray-400 hover:text-dark mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase text-xs tracking-widest">Back to Dashboard</span>
        </button>

        <div className="premium-card p-10">
          <h1 className="text-3xl font-black text-dark mb-10 tracking-tight">
            {isEdit ? 'Edit Hotel Profile' : 'Register New Hotel'}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-16">
            {/* Section 1: Basic Information */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-lg font-black shadow-sm">01</div>
                <div>
                  <h2 className="text-xl font-black text-dark tracking-tight">Basic Information</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Name and description of your property</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Property Name</label>
                  <input 
                    type="text" required
                    placeholder="e.g. The Grand Heritage"
                    className="w-full px-6 py-5 border border-gray-100 rounded-[2rem] bg-gray-50/50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-dark text-lg"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Description</label>
                  <textarea 
                    rows="5" required minLength={20}
                    placeholder="Describe the experience, history, and unique features..."
                    className="w-full px-6 py-5 border border-gray-100 rounded-[2rem] bg-gray-50/50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none resize-none transition-all leading-relaxed font-medium text-gray-600"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Location Details */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-lg font-black shadow-sm">02</div>
                <div>
                  <h2 className="text-xl font-black text-dark tracking-tight">Location Details</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Help guests find your property easily</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">City</label>
                  <LocationSearch 
                    value={formData.location?.city || ''}
                    onChange={(city) => setFormData({...formData, location: {...formData.location, city}})}
                    onSelect={(selected) => setFormData({...formData, location: {...formData.location, city: selected.name, state: selected.state}})}
                    placeholder="Search for city..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">State</label>
                  <input 
                    type="text" required readOnly
                    className="w-full px-6 py-5 border border-gray-100 rounded-[2rem] bg-gray-100/50 cursor-not-allowed outline-none font-bold text-gray-400"
                    placeholder="Auto-filled"
                    value={formData.location?.state || ''}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Zip</label>
                  <input 
                    type="text" required
                    placeholder="000000"
                    className="w-full px-6 py-5 border border-gray-100 rounded-[2rem] bg-gray-50/50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-dark"
                    value={formData.location?.zipCode || ''}
                    onChange={(e) => setFormData({...formData, location: {...formData.location, zipCode: e.target.value}})}
                  />
                </div>
                <div className="md:col-span-6">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Full Street Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" required
                      placeholder="e.g. 123 Landmark Street near City Center"
                      className="w-full pl-16 pr-6 py-5 border border-gray-100 rounded-[2rem] bg-gray-50/50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-dark"
                      value={formData.location?.address || ''}
                      onChange={(e) => setFormData({...formData, location: {...formData.location, address: e.target.value}})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Gallery */}
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg font-black shadow-sm">03</div>
                  <div>
                    <h2 className="text-xl font-black text-dark tracking-tight">Hotel Gallery</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Upload high-quality interior & exterior photos</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                  {formData.images.length} / 6 Images
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-[2rem] overflow-hidden shadow-sm group border-4 border-white ring-1 ring-gray-100">
                    <img src={resolveImageUrl(url)} alt={`Hotel ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <button type="button" onClick={() => removeImage(idx)} className="p-3 bg-white/20 hover:bg-red-500 text-white rounded-2xl transition-all">
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {formData.images.length < 6 && (
                  <label className={`aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50/50 cursor-pointer transition-all hover:border-primary hover:bg-primary/5 ${uploadingImage ? 'pointer-events-none opacity-50' : ''}`}>
                    {uploadingImage ? <Loader2 className="animate-spin text-primary w-8 h-8" /> : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Camera size={24} className="text-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Add Photo</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            {/* Section 4: Amenities */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg font-black shadow-sm">04</div>
                <div>
                  <h2 className="text-xl font-black text-dark tracking-tight">Amenities</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Select the services and facilities offered</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentAmenities.map(amenity => (
                  <label key={amenity} className={`group flex items-center space-x-3 p-5 border rounded-[2rem] cursor-pointer transition-all duration-300 ${formData.amenities.includes(amenity) ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}>
                    <input 
                      type="checkbox"
                      className="hidden"
                      checked={formData.amenities.includes(amenity)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({
                          ...formData,
                          amenities: checked 
                            ? [...formData.amenities, amenity]
                            : formData.amenities.filter(a => a !== amenity)
                        });
                      }}
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.amenities.includes(amenity) ? 'bg-white border-white' : 'bg-gray-50 border-gray-200 group-hover:border-primary'}`}>
                      {formData.amenities.includes(amenity) && <div className="w-3 h-3 bg-primary rounded-sm" />}
                    </div>
                    <span className="text-sm font-bold tracking-tight">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end items-center gap-8 pt-10 border-t border-gray-100">
               <button 
                 type="button" disabled={saving}
                 onClick={() => navigate('/manager/dashboard')}
                 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-dark transition-colors"
               >
                 Discard Changes
               </button>
               <button 
                 type="submit" disabled={saving}
                 className="px-12 py-5 bg-dark text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-dark/20 flex items-center justify-center min-w-[240px] hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50"
               >
                 {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5 mr-3" /> {isEdit ? 'Save Changes' : 'Publish Property'}</>}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageHotel;
