import React from 'react';
import { Product } from '../types';

interface MenuItemProps {
  item: Product;
  onClick?: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors p-2 rounded-lg cursor-pointer"
    >
      <div className="flex flex-col justify-between h-full">
        <h3 className="font-semibold text-gray-800 text-base">{item.name}</h3>
        <p className="text-gray-400 font-medium text-sm mt-1">${item.price.toFixed(2)}</p>
      </div>
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
};
