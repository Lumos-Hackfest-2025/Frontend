import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SellerNavbar from '../components/SellerNavbar';
import { db, auth } from '../firebase/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Import product images
import berasImage from '../assets/beras.png';
import ikanImage from '../assets/ikan.jpg';
import sayurImage from '../assets/sayur.jpg';
import buahImage from '../assets/buah.jpg';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  // Check authentication and user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          // Not authenticated
          setAuthError("Please log in to access this page");
          navigate('/login');
          return;
        }
        
        // Check if user is a seller
        const sellerDoc = await getDoc(doc(db, "sellers", currentUser.uid));
        if (!sellerDoc.exists()) {
          // User is not a seller
          setAuthError("Access denied. Seller account required.");
          navigate('/catalog'); // Redirect to buyer page
          return;
        }
        
        // User is authenticated and is a seller
        setUser(currentUser);
        setAuthLoading(false);
      } catch (error) {
        console.error("Authentication check error:", error);
        setAuthError("Error verifying your account");
        setAuthLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);
  
  // Helper function to determine which image to use based on product name
  const getProductImage = (productName) => {
    if (!productName) return berasImage;
    
    const name = productName.toLowerCase();
    
    if (name.includes('ikan') || name.includes('fish')) {
      return ikanImage;
    } else if (name.includes('sayur') || name.includes('vegetable') || name.includes('veggies')) {
      return sayurImage;
    } else if (name.includes('buah') || name.includes('fruit') || name.includes('apel') || 
               name.includes('Apel') || name.includes('apel') || name.includes('orange')) {
      return buahImage;
    } else if (name.includes('daging') || name.includes('meat')) {
      return dagingImage || berasImage; // Fallback to beras if daging image isn't available
    }
    
    // Default to beras image
    return berasImage;
  };
  
  // Fetch products for the authenticated seller
  useEffect(() => {
    // Only fetch products if user is authenticated and is a seller
    if (authLoading || !user) return;
    
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Create a query against the catalog collection using the authenticated user's UID
        const q = query(
          collection(db, "catalog"),
          where("sellerId", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedProducts = [];
        
        querySnapshot.forEach((doc) => {
          const productData = doc.data();
          fetchedProducts.push({
            id: doc.id,
            ...productData,
            image: getProductImage(productData.productName)
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
  }, [user, authLoading]);

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
          <p className="text-xl text-red-600 mb-2">Access Error</p>
          <p className="text-gray-700 mb-4">{authError}</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-900"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerNavbar />
      
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Produkmu</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Cek detail produk dan prediksi pasar</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">Memuat data produk...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-100 gap-4"
              >
                <div className="flex items-center w-full sm:w-auto">
                  <img 
                    src={product.image} 
                    alt={product.productName} 
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">{product.productName}</h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-8 w-full sm:w-auto">
                  <div className="min-w-[80px]">
                    <p className="text-xs sm:text-sm text-gray-500">Stok:</p>
                    <p className="font-medium text-sm sm:text-base">{product.stock}</p>
                  </div>

                  {product.priceType == "normal" && (
                    <div className="min-w-[120px]">
                      <p className="text-xs sm:text-sm text-gray-500">Harga Normal:</p>
                      <p className="font-medium text-sm sm:text-base">Rp{product.price?.toLocaleString() || 0}</p>
                    </div>
                  )}
                  
                  {product.priceType == "bulk" && (
                    <div className="min-w-[120px]">
                      <p className="text-xs sm:text-sm text-gray-500">Harga Borongan:</p>
                      <p className="font-medium text-sm sm:text-base">Rp{product.price?.toLocaleString() || 0}</p>
                    </div>
                  )}

                  <Link 
                    to={`/seller/product/${product.catalogId || product.id}`}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-800 text-white text-sm rounded-md hover:bg-green-900 ml-auto sm:ml-0"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state if no products */}
        {!loading && products.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8 text-center">
            <p className="text-gray-500 mb-4">Kamu belum memiliki produk</p>
            <Link 
              to="/seller/add-product"
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-800 text-white rounded-md hover:bg-green-900 text-sm"
            >
              Tambah Produk
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
