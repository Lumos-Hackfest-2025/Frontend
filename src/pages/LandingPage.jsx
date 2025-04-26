import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "../firebase/auth";
import UserNavbar from "../components/UserNavbar";
import SellerNavbar from "../components/SellerNavbar";
import Footer from "../components/Footer";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Import images
import heroImage from "../assets/hero.jpg";
import vegetablesImage from "../assets/sayur.jpg";
import fishImage from "../assets/ikan.jpg";
import fruitsImage from "../assets/buah.jpg";

function Home() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is a seller
        const sellerDoc = await getDoc(doc(db, "sellers", user.uid));
        if (sellerDoc.exists()) {
          setUserType("seller");
          setLoading(false);
          return;
        }

        // Check if user is a buyer
        const buyerDoc = await getDoc(doc(db, "buyers", user.uid));
        if (buyerDoc.exists()) {
          setUserType("buyer");
          setLoading(false);
          return;
        }

        // Default to buyer if no specific role found
        setUserType("buyer");
      } else {
        // Not authenticated, default to buyer view
        setUserType("buyer");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {userType === "seller" ? <SellerNavbar /> : <UserNavbar />}
      
      {/* Hero Section */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 mb-8">
        <img 
          src={heroImage} 
          alt="Farmer with fresh produce" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-4 sm:px-12 md:px-24">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2">
            Tingkatkan Kesejahteraan<br className="hidden sm:block" />
            Petani Indonesia
          </h1>
          <p className="text-white/80 text-sm sm:text-base md:text-lg max-w-xl">
            Platform yang menghubungkan petani dengan pembeli untuk hasil panen yang lebih adil
          </p>
        </div>
      </div>

      {/* Categories Section */}
      <div className="container mx-auto mb-8 sm:mb-16 px-4 sm:px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Vegetables Card */}
          <div 
            className="relative rounded-xl overflow-hidden shadow-md cursor-pointer group h-64 sm:h-72 md:h-80"
            onClick={() => navigate(userType === "seller" ? '/seller' : '/catalog?category=vegetables')}
          >
            <img 
              src={vegetablesImage} 
              alt="Sayur Sehat" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 sm:p-6">
              <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-1 text-sm text-gray-700 font-medium">
                {userType === "seller" ? 'Kelola Produk' : 'Lihat Produk'}
              </div>
              <div className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-700 transform group-hover:translate-x-1 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Sayur Sehat</h3>
            </div>
          </div>

          {/* Fish Card */}
          <div 
            className="relative rounded-xl overflow-hidden shadow-md cursor-pointer group h-64 sm:h-72 md:h-80"
            onClick={() => navigate(userType === "seller" ? '/seller/dashboard' : '/catalog?category=fish')}
          >
            <img 
              src={fishImage} 
              alt="Ikan Sehat" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 sm:p-6">
              <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-1 text-sm text-gray-700 font-medium">
                {userType === "seller" ? 'Kelola Produk' : 'Lihat Produk'}
              </div>
              <div className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-700 transform group-hover:translate-x-1 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Ikan Sehat</h3>
            </div>
          </div>

          {/* Fruits Card */}
          <div 
            className="relative rounded-xl overflow-hidden shadow-md cursor-pointer group h-64 sm:h-72 md:h-80"
            onClick={() => navigate(userType === "seller" ? '/seller/dashboard' : '/catalog?category=fruits')}
          >
            <img 
              src={fruitsImage} 
              alt="Buah Sehat" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 sm:p-6">
              <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-1 text-sm text-gray-700 font-medium">
                {userType === "seller" ? 'Kelola Produk' : 'Lihat Produk'}
              </div>
              <div className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-700 transform group-hover:translate-x-1 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Buah Sehat</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-8 sm:py-12 md:py-16 mb-8">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">Mengapa Memilih Nusatani?</h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              Platform kami membantu petani mendapatkan harga yang lebih baik dan pembeli mendapatkan produk berkualitas langsung dari sumbernya.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Harga Adil</h3>
              <p className="text-gray-600">Harga yang transparan dan adil bagi petani dan pembeli</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Kualitas Terjamin</h3>
              <p className="text-gray-600">Produk segar langsung dari petani lokal terpercaya</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Dukung Petani Lokal</h3>
              <p className="text-gray-600">Bersama-sama meningkatkan kesejahteraan petani Indonesia</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24 mb-8 sm:mb-16">
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 md:p-8 lg:p-12">
          <div className="flex flex-col md:flex-row items-start mb-6 md:mb-8">
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Frequently Asked Questions</h2>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">Pertanyaan yang sering ditanyakan</p>
            </div>
            <div className="w-full md:w-2/3 md:pl-8 lg:pl-12">
              {/* FAQ Item 1 - Opened */}
              <div className="mb-4 border-b border-gray-200 pb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Bagaimana cara memastikan produk benar-benar langsung dari petani/nelayan?</h3>
                  <button className="text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2 text-gray-600 text-sm">
                  <p>Produk dijamin langsung dari petani/nelayan melalui verifikasi dokumen kepemilikan, foto aktivitas produksi, pelacakan GPS, dan opsi chat langsung dengan produsen.</p>
                </div>
              </div>

              {/* FAQ Item 2 - Closed */}
              <div className="mb-4 border-b border-gray-200 pb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Apa keuntungan beli di sini dibanding pasar biasa?</h3>
                  <button className="text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* FAQ Item 3 - Closed */}
              <div className="mb-4 border-b border-gray-200 pb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Bagaimana jika produk rusak/tidak segar saat sampai?</h3>
                  <button className="text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* FAQ Item 4 - Closed */}
              <div className="mb-4 border-b border-gray-200 pb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Bagaimana cara petani/nelayan bergabung?</h3>
                  <button className="text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24 mb-8 sm:mb-16">
        <div className="bg-green-50 rounded-xl p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 mb-6 md:mb-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2 sm:mb-4">Bergabunglah dengan Kami</h2>
              <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
                {userType === "seller" 
                  ? "Mulai kelola produk dan pantau harga sekarang" 
                  : "Belanja produk segar langsung dari petani dengan harga terbaik"}
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <button 
                  onClick={() => navigate(userType === "seller" ? '/seller/add-product' : '/register')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-green-700 transition"
                >
                  {userType === "seller" ? 'Tambah Produk' : 'Daftar Sekarang'}
                </button>
                <button 
                  onClick={() => navigate(userType === "seller" ? '/seller/dashboard' : '/catalog')}
                  className="px-4 sm:px-6 py-2 sm:py-3 border border-green-600 text-green-600 text-sm sm:text-base font-medium rounded-lg hover:bg-green-50 transition"
                >
                  {userType === "seller" ? 'Lihat Dashboard' : 'Jelajahi Produk'}
                </button>
              </div>
            </div>
            <div className="w-full md:w-1/2 md:pl-6 lg:pl-8">
              <img 
                src={userType === "seller" ? heroImage : fruitsImage} 
                alt="Fresh produce" 
                className="w-full h-48 sm:h-64 object-cover rounded-lg"
                onClick={() => navigate(userType === "seller" ? '/seller/dashboard' : '/catalog')}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
