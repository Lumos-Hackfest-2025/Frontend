import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SellerNavbar from '../components/SellerNavbar';
import berasImage from '../assets/beras.png';
import { db, auth } from '../firebase/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

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
          fetchedProducts.push({
            id: doc.id,
            ...doc.data(),
            // Using a default image since we don't have real images yet
            image: berasImage
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
      
      <div className="container mx-auto px-24 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Produkmu</h1>
          <p className="text-gray-500 text-sm">Cek detail produk dan prediksi pasar</p>
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
                className="flex items-center justify-between p-4 border-b border-gray-100"
              >
                <div className="flex items-center">
                  <img 
                    src={product.image} 
                    alt={product.productName} 
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{product.productName}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-sm text-gray-500">Stok:</p>
                    <p className="font-medium">{product.stock}</p>
                  </div>

                  {product.isNormal && (
                    <div>
                      <p className="text-sm text-gray-500">Harga Normal:</p>
                      <p className="font-medium">Rp{product.normalPrice?.toLocaleString() || 0}</p>
                    </div>
                  )}
                  
                  {product.isBulk && (
                    <div>
                      <p className="text-sm text-gray-500">Harga Borongan:</p>
                      <p className="font-medium">Rp{product.bulkPrice?.toLocaleString() || 0}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-8">
                  </div>

                  <Link 
                    to={`/seller/product/${product.catalogId || product.id}`}
                    className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-900"
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
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 mb-4">Kamu belum memiliki produk</p>
            <Link 
              to="/seller/add-product"
              className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-900"
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
