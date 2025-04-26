import React, { useState, useRef, useEffect } from 'react';
import { FiBell, FiMail, FiSettings, FiMapPin, FiChevronDown, FiMenu, FiUser, FiLogOut, FiShoppingCart } from 'react-icons/fi';
import { FaSearch } from 'react-icons/fa';
import Logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Jakarta');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const locations = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Yogyakarta'];

  return (
    <nav className="flex flex-wrap items-center justify-between px-4 md:px-8 lg:px-24 py-4 bg-white shadow-md">
      {/* Left section: Logo and App name */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <Link to="/" className="flex items-center gap-3">
          <img src={Logo} alt="Logo" className="w-8 h-8" />
          <h1 className="text-xl font-bold">Lumos</h1>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <FiMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile menu and search wrapper */}
      <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row w-full md:w-auto items-center gap-4 mt-4 md:mt-0`}>
        {/* Middle section: Search bar */}
        <div className="w-full md:flex-1 md:max-w-xl md:mx-8">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border rounded-full hover:border-orange-400 focus:border-orange-400 transition-colors group"
              >
                <FiMapPin className="w-5 h-5 text-gray-400 group-hover:text-orange-400" />
                <span className="text-gray-600">{selectedLocation}</span>
                <FiChevronDown className={`w-5 h-5 text-gray-400 group-hover:text-orange-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                  {locations.map((location) => (
                    <button
                      key={location}
                      onClick={() => {
                        setSelectedLocation(location);
                        setIsOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Cari produk pangan..."
                className="w-full px-6 py-2.5 pl-12 border rounded-full focus:outline-none focus:border-orange-400 transition-colors"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <Link to="/catalog" className="text-gray-600 hover:text-orange-500 cursor-pointer">
                <FiShoppingCart className="w-5 h-5" />
              </Link>
              
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 focus:outline-none cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-400 text-white flex items-center justify-center cursor-pointer">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-full h-full rounded-full" />
                    ) : (
                      <FiUser />
                    )}
                  </div>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-medium text-gray-800 truncate">{user.displayName || user.email}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link 
                        to="/profile" 
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FiUser className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link 
                        to="/orders" 
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FiShoppingCart className="w-4 h-4" />
                        <span>Orders</span>
                      </Link>
                      <button 
                        onClick={() => {
                          handleSignOut();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // User is not authenticated - show login/register buttons
            <div className="flex items-center gap-4">
              <Link to="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-4 py-2 text-orange-400 hover:text-orange-600 cursor-pointer">
                  Login
                </button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-4 py-2 text-white bg-orange-400 rounded-lg hover:bg-orange-600 cursor-pointer">
                  Register
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
