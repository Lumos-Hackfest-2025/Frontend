import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { useParams } from 'react-router-dom';
import Navbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import SellerNavbar from '../components/SellerNavbar';
import { FiEdit } from 'react-icons/fi';
import { useAuthCheck } from '../utils/authUtils';
import { db } from '../firebase/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Import product images
import berasImage from '../assets/beras.png';
import ikanImage from '../assets/ikan.jpg';
import sayurImage from '../assets/sayur.jpg';
import buahImage from '../assets/buah.jpg';

const SellerProduct = () => {
  // Add authentication check for seller role
  const { user, loading: authLoading, error: authError } = useAuthCheck('seller');
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [priceData, setPriceData] = useState([]);
  const [bulkPriceData, setBulkPriceData] = useState([]);  // New state for bulk price data
  const [supplyData, setSupplyData] = useState([]);
  const [demandData, setDemandData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supplyDemandView, setSupplyDemandView] = useState('supply'); // Toggle between supply and demand
  const [priceView, setPriceView] = useState('normal');  // New state for toggling between normal and bulk price view
  const [fairPrice, setFairPrice] = useState({ normal: 0, bulk: 0 });  // Store fair prices from product collection

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Fetch product data and forecasts when authentication is complete
  useEffect(() => {
    if (authLoading || authError) return;
    
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Use a query to find documents with matching catalogId
        const q = query(
          collection(db, "catalog"),
          where("catalogId", "==", id)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Get the first document (there should ideally be just one matching the catalogId)
          const doc = querySnapshot.docs[0];
          const productData = {
            id: doc.id,
            ...doc.data()
          };
          
          // Check if this product belongs to the current seller
          if (productData.sellerId === user.uid) {
            setProduct(productData);
            
            // Fetch forecast data based on product name
            await fetchForecastData(productData.productName);
          } else {
            setError('You do not have permission to view this product');
          }
        } else {
          // If no match with catalogId, try fetching by document ID for backwards compatibility
          const productDoc = await getDoc(doc(db, 'catalog', id));
          
          if (productDoc.exists()) {
            const productData = {
              id: productDoc.id,
              ...productDoc.data()
            };
            
            // Check if this product belongs to the current seller
            if (productData.sellerId === user.uid) {
              setProduct(productData);
              
              // Fetch forecast data based on product name
              await fetchForecastData(productData.productName);
            } else {
              setError('You do not have permission to view this product');
            }
          } else {
            setError('Product not found');
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError('Failed to load product data');
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch forecast data for price, supply and demand
    const fetchForecastData = async (productName) => {
      try {
        // Fetch data from the product collection instead of forecasts
        const productQuery = query(
          collection(db, "product"),
          where("productName", "==", productName)
        );
        
        const productSnapshot = await getDocs(productQuery);
        
        if (!productSnapshot.empty) {
          const productDoc = productSnapshot.docs[0].data();
          
          // Get fair prices from the product document
          setFairPrice({
            normal: productDoc.thisMonthFairPrice || 0,
            bulk: productDoc.thisMonthBulkFairPrice || 0
          });
          
          // Process normal price data
          if (productDoc.normalPrice && Array.isArray(productDoc.normalPrice)) {
            const formattedPriceData = productDoc.normalPrice.map(item => ({
              date: formatDate(item.date),
              forecast: item.forecast,
              lower_bound: item.lower_bound,
              upper_bound: item.upper_bound
            }));
            setPriceData(formattedPriceData);
          }
          
          // Process bulk price data
          if (productDoc.bulkPrice && Array.isArray(productDoc.bulkPrice)) {
            const formattedBulkPriceData = productDoc.bulkPrice.map(item => ({
              date: formatDate(item.date),
              forecast: item.forecast,
              lower_bound: item.lower_bound,
              upper_bound: item.upper_bound
            }));
            setBulkPriceData(formattedBulkPriceData);
          }
          
          // Process supply data
          if (productDoc.supply && Array.isArray(productDoc.supply)) {
            const formattedSupplyData = productDoc.supply.map(item => ({
              date: formatDate(item.date),
              forecast: item.forecast,
              lower_bound: item.lower_bound,
              upper_bound: item.upper_bound
            }));
            setSupplyData(formattedSupplyData);
          }
          
          // Process demand data
          if (productDoc.demand && Array.isArray(productDoc.demand)) {
            const formattedDemandData = productDoc.demand.map(item => ({
              date: formatDate(item.date),
              forecast: item.forecast,
              lower_bound: item.lower_bound,
              upper_bound: item.upper_bound
            }));
            setDemandData(formattedDemandData);
          }
        }
      } catch (err) {
        console.error("Error fetching forecast data:", err);
      }
    };
    
    if (id) {
      fetchProductData();
    }
  }, [id, user, authLoading, authError]);

  // Configuration for the price chart
  const priceConfig = {
    title: `Prediksi Harga ${priceView === 'normal' ? 'Normal' : 'Borongan'} ${product?.productName || ''}`,
    yAxisLabel: 'Harga (Rp)',
    yAxisTickFormatter: (value) => `Rp${(value/1000).toFixed(0)}k`,
    tooltipFormatter: (value) => `Rp${value.toLocaleString()}`,
    infoType: priceView === 'normal' ? 'Harga Normal' : 'Harga Borongan',
    color: priceView === 'normal' ? '#166534' : '#9d174d', // Green for normal, Pink for bulk
    boundColor: priceView === 'normal' ? '#86efac' : '#fbcfe8'
  };

  // Configuration for the supply/demand chart
  const getSupplyDemandConfig = () => {
    return supplyDemandView === 'supply' ? {
      title: `Prediksi Pasokan ${product?.productName || ''}`,
      yAxisLabel: 'Jumlah (Ton)',
      yAxisTickFormatter: (value) => `${value.toFixed(1)}T`,
      tooltipFormatter: (value) => `${value.toFixed(2)} Ton`,
      infoType: 'Supply',
      color: '#1e40af', // Blue
      boundColor: '#93c5fd'
    } : {
      title: `Prediksi Permintaan ${product?.productName || ''}`,
      yAxisLabel: 'Jumlah (Ton)',
      yAxisTickFormatter: (value) => `${value.toFixed(1)}T`,
      tooltipFormatter: (value) => `${value.toFixed(2)} Ton`,
      infoType: 'Demand',
      color: '#9f1239', // Red
      boundColor: '#fda4af'
    };
  };

  const supplyDemandConfig = getSupplyDemandConfig();
  const supplyDemandData = supplyDemandView === 'supply' ? supplyData : demandData;
  const currentPriceData = priceView === 'normal' ? priceData : bulkPriceData;

  // Helper function to determine which image to use based on product name
  const getProductImage = (productName) => {
    if (!productName) return berasImage;
    
    const name = productName.toLowerCase();
    
    if (name.includes('ikan') || name.includes('fish')) {
      return ikanImage;
    } else if (name.includes('sayur') || name.includes('vegetable') || name.includes('veggies')) {
      return sayurImage;
    } else if (name.includes('buah') || name.includes('fruit') || name.includes('apel') || 
               name.includes('apple') || name.includes('jeruk') || name.includes('orange')) {
      return buahImage;
    } else if (name.includes('daging') || name.includes('meat')) {
      return dagingImage || berasImage; // Fallback to beras if daging image isn't available
    }
    
    // Default to beras image
    return berasImage;
  };

  // Show authentication loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md mx-auto bg-white rounded-xl shadow-md">
          <p className="text-xl text-gray-800 mb-2">Verifying your access...</p>
          <p className="text-gray-500">Please wait while we check your credentials.</p>
        </div>
      </div>
    );
  }
  
  // Show authentication error state
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md mx-auto bg-white rounded-xl shadow-md">
          <p className="text-xl text-red-600 mb-2">Authentication Error</p>
          <p className="text-gray-700 mb-4">
            {authError === "UNAUTHORIZED_ROLE" 
              ? "Only sellers can access this page." 
              : "There was an error verifying your account."}
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-900"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }
  
  // Show product loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SellerNavbar />
        <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg">Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Show product error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SellerNavbar />
        <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/seller/dashboard'}
            className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-900"
          >
            Back to Dashboard
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // If no product yet (shouldn't happen with the loading state above, but just for safety)
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SellerNavbar />
        <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-red-500">Product not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerNavbar />
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Product Details Section */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Detail Produk</h1>
          <p className="text-xs sm:text-sm text-gray-500">Detail produk anda</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex justify-between">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Product Image */}
              <div className="w-full md:w-64 h-64 overflow-hidden rounded-lg">
                <img 
                  src={getProductImage(product.productName)} 
                  alt={product.productName} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Product Info */}
              <div className="flex flex-col">
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-bold text-gray-900">{product.productName}</h2>
                </div>
                
                <div className="flex items-center mt-2">
                  {[1, 2, 3, 4].map(i => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                  <span className="text-yellow-300 text-xl">★</span>
                  <span className="ml-2 text-gray-600">4.5/5</span>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Rp{product.price?.toLocaleString() || 
                      (product.priceType === 'normal' ? product.normalPrice?.toLocaleString() : product.bulkPrice?.toLocaleString())}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Per 1 Kilogram
                    {(product.isBulk || product.priceType === 'bulk') && 
                      <span className="ml-2 text-green-600">(Harga Borongan)</span>
                    }
                  </p>
                </div>
                
                <div className="mt-4 space-y-1">
                  <p className="text-gray-600">
                    <span className="font-medium">Stok total:</span> {product.stock}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Tanggal di panen:</span> {
                      product.harvestDate ? new Date(product.harvestDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'Tidak tersedia'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fair Price Section - Made responsive */}
        <div className="flex flex-col md:flex-row bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-8">
          <div className="w-full md:w-1/3 md:border-r md:pr-6 mb-4 md:mb-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Fair Price</h3>
            <p className="text-xs sm:text-sm text-gray-500">Harga yang direkomendasikan untuk menjual produk anda</p>
          </div>
          <div className="w-full md:w-2/3 md:pl-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-green-600">
                  Rp{fairPrice.normal.toLocaleString()}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">Harga Normal per Kilogram</p>
              </div>
              <div className="sm:ml-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-pink-600">
                  Rp{fairPrice.bulk.toLocaleString()}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">Harga Borongan per Kilogram</p>
              </div>
            </div>
          </div>
        </div>

        {/* Price Chart - Improved responsiveness */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">{priceConfig.title}</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setPriceView('normal')} 
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${priceView === 'normal' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600'}`}>
                Harga Normal
              </button>
              <button 
                onClick={() => setPriceView('bulk')} 
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${priceView === 'bulk' ? 'bg-pink-100 text-pink-800 border border-pink-300' : 'bg-gray-100 text-gray-600'}`}>
                Harga Borongan
              </button>
            </div>
          </div>

          {currentPriceData.length > 0 ? (
            <div className="h-60 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentPriceData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis 
                    domain={['dataMin - 100', 'dataMax + 100']} 
                    tickFormatter={priceConfig.yAxisTickFormatter}
                    label={{ value: priceConfig.yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }} 
                    tick={{ fontSize: 10 }}
                    width={50}
                  />
                  <Tooltip formatter={priceConfig.tooltipFormatter} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke={priceConfig.color} 
                    strokeWidth={2} 
                    activeDot={{ r: 8 }} 
                    name="Prediksi"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="upper_bound" 
                    stroke={priceConfig.boundColor} 
                    strokeDasharray="5 5" 
                    strokeWidth={1} 
                    dot={false}
                    name="Batas Atas" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lower_bound" 
                    stroke={priceConfig.boundColor} 
                    strokeDasharray="5 5" 
                    strokeWidth={1} 
                    dot={false}
                    name="Batas Bawah" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 sm:h-80 flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">
                Data prediksi {priceView === 'normal' ? 'harga normal' : 'harga borongan'} tidak tersedia
              </p>
            </div>
          )}

          <div className="mt-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Terakhir Diperbarui:</span> {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Supply/Demand Chart - Improved responsiveness */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">{supplyDemandConfig.title}</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setSupplyDemandView('supply')} 
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${supplyDemandView === 'supply' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-600'}`}>
                Pasokan
              </button>
              <button 
                onClick={() => setSupplyDemandView('demand')} 
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${supplyDemandView === 'demand' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-gray-100 text-gray-600'}`}>
                Permintaan
              </button>
            </div>
          </div>

          {supplyDemandData.length > 0 ? (
            <div className="h-60 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={supplyDemandData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis 
                    domain={['dataMin - 50', 'dataMax + 50']} 
                    tickFormatter={supplyDemandConfig.yAxisTickFormatter}
                    label={{ value: supplyDemandConfig.yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }} 
                    tick={{ fontSize: 10 }}
                    width={50}
                  />
                  <Tooltip formatter={supplyDemandConfig.tooltipFormatter} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke={supplyDemandConfig.color} 
                    fill={supplyDemandConfig.boundColor} 
                    activeDot={{ r: 8 }} 
                    name={`Prediksi ${supplyDemandView === 'supply' ? 'Pasokan' : 'Permintaan'}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="upper_bound" 
                    stroke={supplyDemandConfig.boundColor} 
                    fill={supplyDemandConfig.boundColor} 
                    fillOpacity={0.3}
                    strokeDasharray="5 5" 
                    dot={false}
                    name="Batas Atas" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lower_bound" 
                    stroke={supplyDemandConfig.boundColor} 
                    fill={supplyDemandConfig.boundColor} 
                    fillOpacity={0.3}
                    strokeDasharray="5 5" 
                    dot={false}
                    name="Batas Bawah" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 sm:h-80 flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">Data prediksi {supplyDemandView === 'supply' ? 'pasokan' : 'permintaan'} tidak tersedia</p>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Informasi Prediksi</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Periode Prediksi:</span> 6 bulan ke depan
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Tipe Data:</span> {supplyDemandConfig.infoType}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Terakhir Diperbarui:</span> {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SellerProduct;
