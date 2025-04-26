import React from 'react';
import Logo from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-16">
      <div className="container mx-auto px-24">
        <div className="flex flex-wrap justify-between">
          {/* Logo and Title Column */}
          <div className="w-full md:w-1/5 mb-8 md:mb-0">
          <div className='flex gap-2'> 
            <img src={Logo} alt="Lumos Logo" className="h-12 mb-4" />
            <h2 className="text-2xl font-bold mt-1">Lumos</h2>
          </div>
          <p className="text-gray-400">Your trusted marketplace for digital products</p>
          </div>

          {/* Company Column */}
          <div className="w-full md:w-1/5 mb-8 md:mb-0">
            <h3 className="text-lg font-semibold mb-4">COMPANY</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-400 hover:text-white">About</a></li>
              <li><a href="/features" className="text-gray-400 hover:text-white">Features</a></li>
              <li><a href="/works" className="text-gray-400 hover:text-white">Works</a></li>
            </ul>
          </div>

          {/* Help Column */}
          <div className="w-full md:w-1/5 mb-8 md:mb-0">
            <h3 className="text-lg font-semibold mb-4">HELP</h3>
            <ul className="space-y-2">
              <li><a href="/support" className="text-gray-400 hover:text-white">Customer Support</a></li>
              <li><a href="/delivery" className="text-gray-400 hover:text-white">Delivery Details</a></li>
              <li><a href="/terms" className="text-gray-400 hover:text-white">Terms & Conditions</a></li>
              <li><a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>

          {/* FAQ Column */}
          <div className="w-full md:w-1/5 mb-8 md:mb-0">
            <h3 className="text-lg font-semibold mb-4">FAQ</h3>
            <ul className="space-y-2">
              <li><a href="/account" className="text-gray-400 hover:text-white">Account</a></li>
              <li><a href="/deliveries" className="text-gray-400 hover:text-white">Manage Deliveries</a></li>
              <li><a href="/orders" className="text-gray-400 hover:text-white">Orders</a></li>
              <li><a href="/payments" className="text-gray-400 hover:text-white">Payments</a></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="w-full md:w-1/5 mb-8 md:mb-0">
            <h3 className="text-lg font-semibold mb-4">RESOURCES</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  Youtube
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
