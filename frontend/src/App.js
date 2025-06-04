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
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState(null);
    const [matrixData, setMatrixData] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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
                { id: 'dashboard', label: 'Overview', icon: '📊' },
                { id: 'matrix', label: 'Orders Matrix', icon: '📋' }
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

          {/* Tab Content */}
          {activeTab === 'dashboard' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Welcome Admin!</h2>
              <p className="text-gray-600 mb-4">Manage your vegetable procurement system from this dashboard.</p>
              
              {dashboardData && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800">Pending Orders</h3>
                    <p className="text-2xl font-bold text-yellow-600">{dashboardData.pending_count}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800">Delivered Orders</h3>
                    <p className="text-2xl font-bold text-green-600">{dashboardData.delivered_count}</p>
                  </div>
                </div>
              )}
            </div>
          )}

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
                              <span className="text-sm">{hotel.name}</span>
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
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{hotel.name}</h3>
              <p className="text-gray-600 text-sm">Manager: {hotel.manager_name}</p>
              <p className="text-gray-600 text-sm">Phone: {hotel.manager_phone}</p>
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
              <h1 className="text-3xl font-bold text-gray-800">{selectedUser.name}</h1>
              <p className="text-gray-600">Manager: {selectedUser.manager_name}</p>
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
