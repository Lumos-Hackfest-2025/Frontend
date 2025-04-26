import React from 'react';
import { Link } from 'react-router-dom';
import beras from "../assets/beras.png";

const CardItem = ({ id, name, price, fairPrice, isBulk, image }) => {
  // Use fixed rating for now
  const rating = 4.5;
  
  return (
    <Link to={`/catalog/${id}`}>
      <div className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
        <img 
          src={image || beras} 
          alt={name} 
          className="w-full h-48 object-cover"
        />
        <div className="p-3">
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-sm">★</span>
            ))}
            <span className="text-gray-400 text-xs ml-1">{rating}/5</span>
          </div>
          <h3 className="text-base font-medium text-gray-800">{name}</h3>
          <div className="flex flex-col">
            <p className="text-orange-500 font-medium">
              Rp{price?.toLocaleString()}
              {isBulk && <span className="text-xs text-gray-400 ml-1">(Harga Borongan)</span>}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CardItem;
