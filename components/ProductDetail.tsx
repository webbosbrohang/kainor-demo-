import React, { useState } from 'react';
import { ArrowLeft, Heart, Minus, Plus, Leaf, Sun, Zap, Candy, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number, customization: any) => void;
}

type SugarLevel = '0%' | '25%' | '50%' | '75%' | '100%';

const SUGAR_OPTIONS: { value: SugarLevel; icon: React.FC<any>; label: string; color: string; size?: number; bgColor: string }[] = [
  { value: '0%', icon: Leaf, label: '0%', color: 'text-green-600', bgColor: 'bg-green-50' },
  { value: '25%', icon: Sun, label: '25%', color: 'text-amber-500', bgColor: 'bg-amber-50' },
  { value: '50%', icon: Heart, label: '50%', color: 'text-rose-500', bgColor: 'bg-rose-50' },
  { value: '75%', icon: Zap, label: '75%', color: 'text-violet-500', bgColor: 'bg-violet-50' },
  { value: '100%', icon: Candy, label: '100%', color: 'text-orange-500', bgColor: 'bg-orange-50', size: 28 },
];

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [sugarLevel, setSugarLevel] = useState<SugarLevel>('50%');
  const [isAdding, setIsAdding] = useState(false);

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCartClick = () => {
    setIsAdding(true);
    // Delay the actual action to let the animation play
    setTimeout(() => {
      onAddToCart(product, quantity, { sugarLevel });
      setIsAdding(false);
    }, 400);
  };

  const subtotal = (product.price * quantity).toFixed(2);

  // Fallback description if none exists
  const description = product.description || `${product.name} is a delicious choice from our menu, freshly prepared with high-quality ingredients to brighten your day.`;

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col h-full overflow-hidden animate-in slide-in-from-bottom-10 duration-200">
      {/* Header */}
      <div className="flex justify-between items-center p-4 absolute top-0 left-0 right-0 z-10">
        <button 
          onClick={onBack}
          className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors shadow-sm"
        >
          <ArrowLeft className="text-gray-900" size={24} />
        </button>
        <button className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors shadow-sm">
          <Heart className="text-brand-yellow fill-brand-yellow" size={24} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        {/* Product Image */}
        <div className="w-full h-80 relative flex items-center justify-center pt-10 pb-4 overflow-hidden bg-gray-50">
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/10 to-transparent z-0"></div>
            <div className="w-56 h-56 rounded-full relative z-10 shadow-2xl shadow-brand-yellow/20 animate-in zoom-in duration-500">
                 <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover rounded-full border-4 border-white"
                 />
            </div>
        </div>

        <div className="px-6 -mt-6 relative z-20 bg-white rounded-t-3xl pt-8">
          {/* Title & Desc */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            {description}
          </p>

          {/* Sugar Level */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Sugar Level</h3>
              <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Required</span>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {SUGAR_OPTIONS.map((option) => {
                const isSelected = sugarLevel === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSugarLevel(option.value)}
                    className={`flex flex-col items-center justify-center py-3 px-1 rounded-2xl border transition-all duration-300 ${
                      isSelected 
                        ? `${option.bgColor} border-${option.color.split('-')[1]}-200 shadow-md scale-105` 
                        : 'bg-white border-transparent hover:bg-gray-50 hover:scale-105'
                    }`}
                  >
                    <div className={`mb-2 transition-all duration-300 ${isSelected ? option.color : 'text-gray-300'} ${isSelected ? 'scale-110 drop-shadow-sm' : ''}`}>
                      <option.icon 
                        size={option.size || 22} 
                        strokeWidth={isSelected ? 2.5 : 2} 
                        fill={isSelected && option.value !== '0%' ? "currentColor" : "none"} 
                        fillOpacity={0.2} 
                      />
                    </div>
                    <span className={`text-[10px] font-bold text-center transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
        <div className="flex justify-between items-end mb-4">
            <span className="font-bold text-gray-900 text-lg">Subtotal</span>
            <span className="font-extrabold text-2xl text-brand-yellow">${subtotal}</span>
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-4 px-2 bg-gray-50 rounded-xl p-1">
             <button 
                onClick={handleDecrement}
                className="w-10 h-10 flex items-center justify-center text-gray-600 font-bold text-xl hover:bg-white hover:shadow-sm rounded-lg transition-all"
             >
                <Minus size={18} />
             </button>
             <span className="font-bold text-gray-900 w-4 text-center text-lg">{quantity}</span>
             <button 
                onClick={handleIncrement}
                className="w-10 h-10 flex items-center justify-center text-gray-900 font-bold text-xl hover:bg-white hover:shadow-sm rounded-lg transition-all"
             >
                <Plus size={18} />
             </button>
          </div>
          
          <button 
            onClick={handleAddToCartClick}
            disabled={isAdding}
            className={`flex-1 font-bold py-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              isAdding 
                ? 'bg-green-500 text-white scale-[0.98] shadow-green-200' 
                : 'bg-brand-yellow text-white shadow-yellow-200 hover:bg-yellow-400 hover:shadow-yellow-300 active:scale-[0.98]'
            }`}
          >
            {isAdding ? (
              <>
                <Check size={20} className="animate-bounce" />
                <span>ADDED</span>
              </>
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};