import React, { useState, useEffect } from 'react';
import Navbar from '../components/UserNavbar';
import CardItem from '../components/CardItem';
import Footer from '../components/Footer';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useAuthCheck } from '../utils/authUtils';

// Import product images
import berasImage from '../assets/beras.png';
import ikanImage from '../assets/ikan.jpg';
import sayurImage from '../assets/sayur.jpg';
import buahImage from '../assets/buah.jpg';

const Catalog = () => {
  // Add authentication check for buyer role
  const { user, loading: authLoading, error: authError } = useAuthCheck('buyer');
  
  const [priceRange, setPriceRange] = useState({
    min: 10000,
    max: 100000
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyerType, setBuyerType] = useState(null); // 'bulk' or 'normal'

  // Determine buyer type from Firestore
  useEffect(() => {
    if (authLoading || authError || !user) return;

    const fetchBuyerType = async () => {
      try {
        const buyerDoc = await getDoc(doc(db, "buyers", user.uid));
        if (buyerDoc.exists()) {
          const buyerData = buyerDoc.data();
          // Check buyer role - if 'bulk' then they're a bulk buyer, otherwise normal
          setBuyerType(buyerData.buyerrole === 'bulk' ? 'bulk' : 'normal');
        } else {
          // Default to normal buyer if data not found
          setBuyerType('normal');
        }
      } catch (error) {
        console.error("Error determining buyer type:", error);
        // Default to normal buyer in case of error
        setBuyerType('normal');
      }
    };

    fetchBuyerType();
  }, [authLoading, authError, user]);

  // Fetch filtered products based on buyer type
  useEffect(() => {
    // Only fetch products if user authentication is complete and buyer type is determined
    if (authLoading || authError || !buyerType) return;
    
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Create a query based on buyer type
        let productsQuery;
        
        if (buyerType === 'bulk') {
          // For bulk buyers, show products with isBulk = true or priceType = 'bulk'
          productsQuery = query(
            collection(db, "catalog"),
            where("priceType", "==", "bulk")
          );
        } else {
          // For normal buyers, show products with isNormal = true or priceType = 'normal'
          productsQuery = query(
            collection(db, "catalog"),
            where("priceType", "==", "normal")
          );
        }
        
        const querySnapshot = await getDocs(productsQuery);
        const fetchedProducts = [];
        
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setProducts(fetchedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [authLoading, authError, user, buyerType]);

  const handlePriceChange = (type, value) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: Number(value)
    }));
  };

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
              ? "You don't have permission to access this page." 
              : "There was an error verifying your account."}
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container px-4 md:px-8 lg:px-24 py-8">
        {buyerType && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md">
            <p className="text-sm">
              {buyerType === 'bulk' 
                ? "You are viewing the catalog in bulk pricing mode." 
                : "You are viewing the catalog in normal pricing mode."}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
          {/* Filter Section */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm h-fit border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button className="text-gray-300 hover:text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
            <div className="border-b border-gray-100 -mx-6 mb-6"></div>
            
            <div className="space-y-6">
              {/* Category Section */}
              <div>
                <h3 className="font-medium mb-3 text-gray-700">Category</h3>
                <div className="space-y-2">
                  {['Beras', 'Ikan', 'Sayur', 'Buah', 'Daging'].map((category) => (
                    <label key={category} className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-200 text-orange-400 focus:ring-orange-400"
                      />
                      <span className="ml-2 text-gray-400 font-light">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Section */}
              <div>
                <h3 className="font-medium mb-3">Price</h3>
                <div className="space-y-4">
                  <div className="relative h-5">
                    <div className="absolute w-full top-1/2 h-2 -translate-y-1/2 bg-gray-200 rounded-lg"></div>
                    <input
                      type="range"
                      min="10000"
                      max="100000"
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange('min', Math.min(e.target.value, priceRange.max - 1000))}
                      className="absolute w-full h-5 appearance-none bg-transparent z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-30"
                    />
                    <input
                      type="range"
                      min="10000"
                      max="100000"
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange('max', Math.max(e.target.value, priceRange.min + 1000))}
                      className="absolute w-full h-5 appearance-none bg-transparent z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Rp {priceRange.min.toLocaleString()}</span>
                    <span>Rp {priceRange.max.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Apply Filter Button */}
              <button className="w-full py-2.5 bg-orange-400 text-white rounded-full hover:bg-orange-500 transition-colors font-normal text-sm cursor-pointer">
                Apply Filter
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="lg:col-span-3 xl:col-span-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">All Items</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {loading ? (
                  <span>Loading products...</span>
                ) : (
                  <span>Showing {products.length} Products</span>
                )}
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map(product => (
                  <CardItem 
                    key={product.id}
                    id={product.id}
                    name={product.productName}
                    price={product.price || (product.priceType === 'normal' ? product.normalPrice : product.bulkPrice)}
                    isBulk={product.isBulk || product.priceType === 'bulk'}
                    product={product} // Pass the entire product object in case CardItem needs more data
                    image={getProductImage(product.productName)} // Pass the appropriate image based on product name
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No products found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog;
