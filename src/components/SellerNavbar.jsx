import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiPlus, FiBell, FiMessageSquare, FiSettings, FiLogOut } from 'react-icons/fi';
import Logo from '../assets/logo.png';

const SellerNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-md py-3 px-4 md:px-6 lg:px-12">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={Logo} alt="Lumos Logo" className="w-10 h-10" />
          <h1 className="text-xl font-bold text-gray-800">Lumos</h1>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Cari produk..."
              className="w-full px-4 py-2 pl-10 border rounded-full focus:outline-none focus:border-green-600"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Add Product Button */}
          <Link 
            to="/seller/add-product" 
            className="flex items-center gap-1 bg-green-700 text-white px-3 py-2 rounded-lg hover:bg-green-800 transition-colors"
          >
            <FiPlus className="text-lg" />
            <span className="hidden sm:inline">Produk</span>
          </Link>

          <Link to="/seller" className="p-1 hover:bg-gray-100 rounded-full hidden sm:block">
            <FiMessageSquare className="w-6 h-6 text-gray-700" />
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
              className="flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200">
                <img 
                  src="https://randomuser.me/api/portraits/men/35.jpg" 
                  alt="Seller Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                <div className="p-3 border-b">
                  <p className="font-medium text-gray-800">Anton Petani</p>
                  <p className="text-sm text-gray-500">anton@gmail.com</p>
                </div>
                <div className="py-1">
                  <Link to="/seller/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FiSettings className="text-gray-500" />
                    Pengaturan
                  </Link>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    <FiLogOut className="text-red-500" />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SellerNavbar;
