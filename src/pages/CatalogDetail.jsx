import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import beras from '../assets/beras.png';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthCheck } from '../utils/authUtils';

const CatalogDetail = () => {
  // Add authentication check for buyer role
  const { user, loading: authLoading, error: authError } = useAuthCheck('buyer');
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch product if authentication is complete and successful
    if (authLoading || authError) return;
    
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productDoc = await getDoc(doc(db, 'catalog', id));
        
        if (productDoc.exists()) {
          setProduct({
            id: productDoc.id,
            ...productDoc.data()
          });
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError('Failed to load product data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, authLoading, authError, user]);

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
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
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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
      <div className="min-h-screen">
        <Navbar />
        <div className="py-12 max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg">Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Show product error state
  if (error || !product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="py-12 max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg text-red-500">{error || 'Product not found'}</p>
          <button
            onClick={() => window.location.href = '/catalog'}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Back to Catalog
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="py-12 max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left: Product Image */}
            <div>
              <img 
                src= {beras} 
                alt="Beras" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Right: Product Details */}
            <div className="p-8 space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">Beras</h2>
              
              {/* Rating */}
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <span key={index} className={`text-xl ${index < 4 ? 'text-amber-400' : 'text-amber-300'}`}>★</span>
                ))}
                <span className="ml-2 text-gray-600">4.5/5</span>
              </div>
              
              {/* Price */}
              <div className="mt-2">
                <h3 className="text-2xl font-bold">Rp.10,000</h3>
                <span className="text-gray-500 text-sm">Per 1 Kilogram</span>
              </div>
              
              {/* Description */}
              <div className="py-2">
                <p className="text-gray-600 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus varius diam maximus 
                  sem facilisis, vel rutrum odio sodales. Mauris sodales eleifend sagittis. Cras non purus eu elit 
                  eleifend lacus. Quisque ante eros, volutpat bibendum imperdiet non, sollicitudin 
                  bibendum lacus a aliquet lorem. Cras tempor massa tortor id porta. Cras et nunc 
                  in nisi molestie femoreli et vitae justo. Vestibulum lacinia imperdiet semper.
                </p>
              </div>
              
              {/* Stock & Date Info */}
              <div className="space-y-1 pt-1">
                <p><span className="text-gray-500">Stok total:</span> <span className="font-medium">243</span></p>
                <p><span className="text-gray-500">Tanggal di panen:</span> <span className="font-medium">26 April 2025</span></p>
              </div>
              
              {/* Seller Info */}
              <div className="flex items-center space-x-3 pt-3">
                <img 
                  src="/seller-avatar.jpg" 
                  alt="Seller" 
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">Anton</p>
                  <div className="flex items-center">
                    <span className="text-amber-400 text-sm">★</span>
                    <span className="text-gray-500 text-sm ml-1">4.5/5</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border rounded-md px-2">
                  <button 
                    onClick={handleDecrement}
                    className="px-3 py-2 text-lg text-gray-700 cursor-pointer"
                  >−</button>
                  <span className="w-8 text-center">{quantity}</span>
                  <button 
                    onClick={handleIncrement}
                    className="px-3 py-2 text-lg text-gray-700 cursor-pointer"
                  >+</button>
                </div>
                <div className="flex flex-1 gap-4">
                  <button className="flex-1 py-3 px-4 bg-white border border-gray-300 text-gray-800 rounded-md hover:bg-gray-50 transition-colors">
                    Beli Langsung
                  </button>
                  <button className="flex-1 py-3 px-4 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors">
                    Tambah ke Keranjang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">All Reviews <span className="text-gray-500 text-sm">(451)</span></h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center border rounded-md px-3 py-1.5">
                <span className="mr-2 text-gray-600">Latest</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
              <button className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-900 whitespace-nowrap">Write a Review</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Review 1 */}
            <div className="border rounded-md p-3 sm:p-4">
              <div className="flex justify-between">
                <div className="flex items-center gap-1 mb-1 flex-wrap">
                  {[1, 2, 3, 4].map((star) => (
                    <svg key={star} className="w-4 sm:w-5 h-4 sm:h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  ))}
                  <svg className="w-4 sm:w-5 h-4 sm:h-5 text-amber-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                </div>
                <button className="text-gray-400 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                </button>
              </div>
              
              <div className="flex items-center mb-2 flex-wrap">
                <span className="font-medium">Samantha D.</span>
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                </span>
              </div>
              
              <p className="text-gray-600 mb-2 text-sm sm:text-base break-words">"I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite go-to shirt."</p>
              <p className="text-xs sm:text-sm text-gray-500">Posted on August 14, 2023</p>
            </div>
            
            {/* Review 2 */}
            <div className="border rounded-md p-3 sm:p-4">
              <div className="flex justify-between">
                <div className="flex items-center gap-1 mb-1 flex-wrap">
                  {[1, 2, 3, 4].map((star) => (
                    <svg key={star} className="w-4 sm:w-5 h-4 sm:h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  ))}
                </div>
                <button className="text-gray-400 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                </button>
              </div>
              
              <div className="flex items-center mb-2 flex-wrap">
                <span className="font-medium">Alex M.</span>
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                </span>
              </div>
              
              <p className="text-gray-600 mb-2 text-sm sm:text-base break-words">"The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me."</p>
              <p className="text-xs sm:text-sm text-gray-500">Posted on August 15, 2023</p>
            </div>
            
            {/* More reviews can be added in the same format */}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CatalogDetail;
