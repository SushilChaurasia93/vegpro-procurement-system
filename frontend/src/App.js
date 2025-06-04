import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [currentRole, setCurrentRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [hotelsRes, sellersRes, vegetablesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/hotels`),
        axios.get(`${API_BASE_URL}/api/sellers`),
        axios.get(`${API_BASE_URL}/api/vegetables`)
      ]);
      
      setHotels(hotelsRes.data);
      setSellers(sellersRes.data);
      setVegetables(vegetablesRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  // Landing Page with Role Selection
  const RoleSelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🥬 VegPro Manager</h1>
          <p className="text-xl text-gray-600">Hotel Chain Vegetable Procurement System</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div 
            onClick={() => setCurrentRole('admin')}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-purple-300"
          >
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👨‍💼</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Admin</h3>
              <p className="text-gray-600">Manage orders, hotels, and suppliers</p>
            </div>
          </div>
          
          <div 
            onClick={() => setCurrentRole('hotel-manager')}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-blue-300"
          >
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Hotel Manager</h3>
              <p className="text-gray-600">Manage your hotel's vegetable requirements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Admin Dashboard
  const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('matrix');
    const [dashboardData, setDashboardData] = useState(null);
    const [matrixData, setMatrixData] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Seller management states
    const [sellerForm, setSellerForm] = useState({ name: '', whatsapp: '' });
    const [editingSeller, setEditingSeller] = useState(null);

    // Hotel management states
    const [hotelForm, setHotelForm] = useState({ hotel_number: '', hotel_name: '', manager_name: '', whatsapp: '' });
    const [editingHotel, setEditingHotel] = useState(null);

    useEffect(() => {
      fetchDashboardData();
    }, [selectedDate]);

    const fetchDashboardData = async () => {
      try {
        const [dashboardRes, matrixRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/dashboard/admin`),
          axios.get(`${API_BASE_URL}/api/dashboard/admin/matrix?date=${selectedDate}`)
        ]);
        setDashboardData(dashboardRes.data);
        setMatrixData(matrixRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    const markHotelDelivered = async (hotelId) => {
      try {
        await axios.put(`${API_BASE_URL}/api/hotels/${hotelId}/mark-delivered?date=${selectedDate}`);
        fetchDashboardData();
      } catch (error) {
        console.error('Error marking hotel as delivered:', error);
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'delivered': return '✅';
        case 'pending': return '⏳';
        default: return '';
      }
    };

    // Seller management functions
    const saveSeller = async () => {
      try {
        const url = editingSeller 
          ? `${API_BASE_URL}/api/sellers/${editingSeller.id}`
          : `${API_BASE_URL}/api/sellers`;
        const method = editingSeller ? 'put' : 'post';
        
        await axios[method](url, sellerForm);
        
        setSellerForm({ name: '', whatsapp: '' });
        setEditingSeller(null);
        fetchInitialData();
      } catch (error) {
        console.error('Error saving seller:', error);
        alert('Error saving seller. Please try again.');
      }
    };

    const deleteSeller = async (sellerId) => {
      if (window.confirm('Are you sure you want to delete this seller? This will also delete all associated vegetables.')) {
        try {
          await axios.delete(`${API_BASE_URL}/api/sellers/${sellerId}`);
          fetchInitialData();
        } catch (error) {
          console.error('Error deleting seller:', error);
          alert('Error deleting seller. Please try again.');
        }
      }
    };

    const editSeller = (seller) => {
      setSellerForm({
        name: seller.name,
        whatsapp: seller.whatsapp
      });
      setEditingSeller(seller);
    };

    // Hotel management functions
    const saveHotel = async () => {
      try {
        const url = editingHotel 
          ? `${API_BASE_URL}/api/hotels/${editingHotel.id}`
          : `${API_BASE_URL}/api/hotels`;
        const method = editingHotel ? 'put' : 'post';
        
        await axios[method](url, hotelForm);
        
        setHotelForm({ hotel_number: '', hotel_name: '', manager_name: '', whatsapp: '' });
        setEditingHotel(null);
        fetchInitialData();
      } catch (error) {
        console.error('Error saving hotel:', error);
        if (error.response?.data?.detail === 'Hotel number already exists') {
          alert('Hotel number already exists. Please use a different hotel number.');
        } else {
          alert('Error saving hotel. Please try again.');
        }
      }
    };

    const deleteHotel = async (hotelId) => {
      if (window.confirm('Are you sure you want to delete this hotel? This will also delete all associated requirements.')) {
        try {
          await axios.delete(`${API_BASE_URL}/api/hotels/${hotelId}`);
          fetchInitialData();
        } catch (error) {
          console.error('Error deleting hotel:', error);
          alert('Error deleting hotel. Please try again.');
        }
      }
    };

    const editHotel = (hotel) => {
      setHotelForm({
        hotel_number: hotel.hotel_number,
        hotel_name: hotel.hotel_name,
        manager_name: hotel.manager_name,
        whatsapp: hotel.whatsapp
      });
      setEditingHotel(hotel);
    };

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <button 
              onClick={() => setCurrentRole(null)}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
            >
              Back to Home
            </button>
          </div>
          
          {/* Statistics Cards */}
          {dashboardData && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{dashboardData.total_hotels}</div>
                  <div className="text-gray-600">Hotels</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{dashboardData.total_sellers}</div>
                  <div className="text-gray-600">Sellers</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{dashboardData.total_vegetables}</div>
                  <div className="text-gray-600">Vegetables</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-lg mb-6">
            <div className="flex border-b">
              {[
                { id: 'matrix', label: 'Orders Matrix', icon: '📋' },
                { id: 'sellers', label: 'Manage Sellers', icon: '🚚' },
                { id: 'hotels', label: 'Manage Hotels', icon: '🏨' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id 
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Matrix Tab */}
          {activeTab === 'matrix' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Orders Matrix</h2>
                <div className="flex items-center gap-4">
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              
              {matrixData && matrixData.matrix_data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left p-3 font-semibold text-gray-700 bg-gray-50">Vegetable</th>
                        {matrixData.hotels.map(hotel => (
                          <th key={hotel.id} className="text-center p-3 font-semibold text-gray-700 bg-gray-50 min-w-24">
                            <div className="flex flex-col items-center gap-1">
                              <span>{getStatusIcon(matrixData.hotel_status[hotel.id])}</span>
                              <span className="text-sm">{hotel.hotel_number}</span>
                              <span className="text-xs text-gray-500">{hotel.hotel_name}</span>
                              {matrixData.hotel_status[hotel.id] === 'pending' && (
                                <button 
                                  onClick={() => markHotelDelivered(hotel.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                                >
                                  Deliver
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrixData.matrix_data.map(row => (
                        <tr key={row.vegetable_id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-900 bg-gray-50">
                            <div>
                              <div>{row.vegetable_name}</div>
                              <div className="text-xs text-gray-500">({row.unit})</div>
                            </div>
                          </td>
                          {matrixData.hotels.map(hotel => {
                            const quantity = row.hotel_quantities[hotel.id];
                            return (
                              <td key={hotel.id} className="p-3 text-center">
                                {quantity > 0 ? (
                                  <div className="font-semibold text-green-600">{quantity}</div>
                                ) : (
                                  <div className="text-gray-300">-</div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <p className="text-gray-500 text-lg">No requirements for this date</p>
                </div>
              )}
            </div>
          )}

          {/* Sellers Management Tab */}
          {activeTab === 'sellers' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Seller Form */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingSeller ? 'Edit Seller' : 'Add New Seller'}
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Seller Name"
                    value={sellerForm.name}
                    onChange={(e) => setSellerForm(prev => ({...prev, name: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="WhatsApp Number (e.g., +919876543210)"
                    value={sellerForm.whatsapp}
                    onChange={(e) => setSellerForm(prev => ({...prev, whatsapp: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveSeller}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      {editingSeller ? 'Update' : 'Add'} Seller
                    </button>
                    {editingSeller && (
                      <button
                        onClick={() => {
                          setEditingSeller(null);
                          setSellerForm({ name: '', whatsapp: '' });
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Sellers List */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Sellers List</h2>
                <div className="space-y-3">
                  {sellers.map(seller => (
                    <div key={seller.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium">{seller.name}</div>
                        <div className="text-sm text-gray-600">WhatsApp: {seller.whatsapp}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editSeller(seller)}
                          className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSeller(seller.id)}
                          className="text-red-600 hover:text-red-800 px-2 py-1 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Hotels Management Tab */}
          {activeTab === 'hotels' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Hotel Form */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Hotel Number (e.g., HTL001)"
                    value={hotelForm.hotel_number}
                    onChange={(e) => setHotelForm(prev => ({...prev, hotel_number: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Hotel Name"
                    value={hotelForm.hotel_name}
                    onChange={(e) => setHotelForm(prev => ({...prev, hotel_name: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Manager Name"
                    value={hotelForm.manager_name}
                    onChange={(e) => setHotelForm(prev => ({...prev, manager_name: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="WhatsApp Number (e.g., +919876543210)"
                    value={hotelForm.whatsapp}
                    onChange={(e) => setHotelForm(prev => ({...prev, whatsapp: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveHotel}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      {editingHotel ? 'Update' : 'Add'} Hotel
                    </button>
                    {editingHotel && (
                      <button
                        onClick={() => {
                          setEditingHotel(null);
                          setHotelForm({ hotel_number: '', hotel_name: '', manager_name: '', whatsapp: '' });
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Hotels List */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Hotels List</h2>
                <div className="space-y-3">
                  {hotels.map(hotel => (
                    <div key={hotel.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium">{hotel.hotel_number} - {hotel.hotel_name}</div>
                        <div className="text-sm text-gray-600">Manager: {hotel.manager_name}</div>
                        <div className="text-sm text-gray-600">WhatsApp: {hotel.whatsapp}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editHotel(hotel)}
                          className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteHotel(hotel.id)}
                          className="text-red-600 hover:text-red-800 px-2 py-1 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Hotel Selection
  const HotelSelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => setCurrentRole(null)}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg mr-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Select Your Hotel</h1>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map(hotel => (
            <div 
              key={hotel.id}
              onClick={() => setSelectedUser(hotel)}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-blue-300"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{hotel.hotel_number}</h3>
              <h4 className="text-md font-medium text-gray-700 mb-1">{hotel.hotel_name}</h4>
              <p className="text-gray-600 text-sm">Manager: {hotel.manager_name}</p>
              <p className="text-gray-600 text-sm">WhatsApp: {hotel.whatsapp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Hotel Manager Dashboard
  const HotelManagerDashboard = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [vegetableQuantities, setVegetableQuantities] = useState({});
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
      fetchRequirements();
    }, [selectedDate]);

    const fetchRequirements = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/requirements?hotel_id=${selectedUser.id}&date=${selectedDate}`);
        const requirements = response.data;
        
        const quantities = {};
        requirements.forEach(req => {
          quantities[req.vegetable_id] = req.quantity;
        });
        setVegetableQuantities(quantities);
      } catch (error) {
        console.error('Error fetching requirements:', error);
      }
    };

    const saveAllRequirements = async () => {
      try {
        const requirementsToSave = Object.entries(vegetableQuantities)
          .filter(([_, quantity]) => quantity > 0)
          .map(([vegetable_id, quantity]) => ({
            hotel_id: selectedUser.id,
            vegetable_id,
            quantity: parseFloat(quantity),
            unit: 'kg',
            date: selectedDate
          }));
        
        if (requirementsToSave.length === 0) {
          setSaveMessage('❌ No quantities to save');
          return;
        }
        
        await axios.post(`${API_BASE_URL}/api/requirements/bulk`, requirementsToSave);
        setSaveMessage('✅ Requirements saved successfully!');
        fetchRequirements();
      } catch (error) {
        console.error('Error saving requirements:', error);
        setSaveMessage('❌ Error saving requirements');
      }
      setTimeout(() => setSaveMessage(''), 3000);
    };

    const handleQuantityChange = (vegetableId, quantity) => {
      setVegetableQuantities(prev => ({
        ...prev,
        [vegetableId]: quantity === '' ? 0 : parseFloat(quantity)
      }));
    };

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{selectedUser.hotel_number} - {selectedUser.hotel_name}</h1>
              <p className="text-gray-600">Manager: {selectedUser.manager_name}</p>
              <p className="text-gray-600">WhatsApp: {selectedUser.whatsapp}</p>
            </div>
            <button 
              onClick={() => {setCurrentRole(null); setSelectedUser(null);}}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
            >
              Back to Home
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Daily Vegetable Requirements</h2>
              <div className="flex items-center gap-4">
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
                <button 
                  onClick={saveAllRequirements}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  💾 Save All
                </button>
              </div>
            </div>
            
            {saveMessage && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-800">
                {saveMessage}
              </div>
            )}
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vegetables
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(vegetable => (
                  <div key={vegetable.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{vegetable.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">Unit: {vegetable.unit}</p>
                    <input 
                      type="number" 
                      min="0"
                      step="0.1"
                      value={vegetableQuantities[vegetable.id] || ''}
                      onChange={(e) => handleQuantityChange(vegetable.id, e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-center"
                      placeholder="0"
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render logic
  if (!currentRole) {
    return <RoleSelection />;
  }

  if (currentRole === 'admin') {
    return <AdminDashboard />;
  }

  if (currentRole === 'hotel-manager' && !selectedUser) {
    return <HotelSelection />;
  }

  if (currentRole === 'hotel-manager' && selectedUser) {
    return <HotelManagerDashboard />;
  }

  return null;
}

export default App;
