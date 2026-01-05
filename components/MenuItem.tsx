import React from 'react';
import { Product } from '../types';

interface MenuItemProps {
  item: Product;
  onClick?: () => void;
  className?: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item, onClick, className = "" }) => {
  return (
    <div 
      onClick={onClick}
      className={`flex justify-between items-center cursor-pointer group ${className}`}
    >
      <div className="flex flex-col justify-between h-full flex-1 pr-3">
        <h3 className="font-semibold text-gray-800 text-base group-hover:text-brand-yellow transition-colors">{item.name}</h3>
        <p className="text-gray-400 font-medium text-sm mt-1">${item.price.toFixed(2)}</p>
      </div>
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
    </div>
  );
};