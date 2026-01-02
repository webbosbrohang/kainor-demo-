import React, { useState } from 'react';
import { ArrowLeft, Heart, Minus, Plus, Check } from 'lucide-react';
import { Product } from '../types';

// Custom Crutch Icon Component
// Replicates the flat vector design provided: Rounded top cap, parallel struts, handle, converging lower body, and tip.
const Crutch = ({ size = 24, className, ...props }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className={className}
    {...props}
  >
    <g transform="rotate(45 12 12)">
      {/* Top Pad (Red part in image) */}
      <path d="M7 2.5C7 1.67 7.67 1 8.5 1H15.5C16.33 1 17 1.67 17 2.5V4.5H7V2.5Z" />
      
      {/* Upper Struts (Yellow bars) */}
      <rect x="8" y="5.5" width="2" height="9" />
      <rect x="14" y="5.5" width="2" height="9" />
      
      {/* Handle (Crossbar) */}
      <rect x="7" y="8" width="10" height="2.5" rx="0.5" />
      
      {/* Convergence (Where struts meet leg) */}
      <path d="M8 13.5H16L13.5 18H10.5L8 13.5Z" />
      
      {/* Bottom Stick */}
      <rect x="11" y="17" width="2" height="4" />
      
      {/* Tip (Rubber foot) - using opacity to distinguish it visually if monochrome */}
      <path d="M10.5 21H13.5V22.5C13.5 23.3 12.8 24 12 24C11.2 24 10.5 23.3 10.5 22.5V21Z" fillOpacity="0.6" />
    </g>
  </svg>
);

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number, customization: any) => void;
}

type SugarLevel = '0%' | '25%' | '50%' | '75%' | '100%';

const SUGAR_OPTIONS: { 
    value: SugarLevel; 
    icon: React.FC<any>; 
    label: string; 
    color: string; 
    bgColor: string;
    borderColor: string;
    joke: string;
}[] = [
  { value: '0%', icon: Crutch, label: '0%', color: 'text-emerald-500', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', joke: "Healthy (Boring)" },
  { value: '25%', icon: Crutch, label: '25%', color: 'text-lime-500', bgColor: 'bg-lime-50', borderColor: 'border-lime-200', joke: "Safe Zone" },
  { value: '50%', icon: Crutch, label: '50%', color: 'text-yellow-500', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', joke: "Good Choice" },
  { value: '75%', icon: Crutch, label: '75%', color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', joke: "Sweet Baby" },
  { value: '100%', icon: Crutch, label: '100%', color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200', joke: "លីហ្សា? 👩‍🦽" },
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
  const selectedOption = SUGAR_OPTIONS.find(opt => opt.value === sugarLevel);

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
              <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800">Sugar Level</h3>
              </div>
              <div className={`text-xs font-bold px-3 py-1 rounded-full border transition-all duration-300 ${selectedOption?.bgColor} ${selectedOption?.color} ${selectedOption?.borderColor} shadow-sm`}>
                {selectedOption?.joke}
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-3">
              {SUGAR_OPTIONS.map((option) => {
                const isSelected = sugarLevel === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSugarLevel(option.value)}
                    className={`flex flex-col items-center justify-center py-3 px-1 rounded-2xl border-2 transition-all duration-300 relative ${
                      isSelected 
                        ? `${option.bgColor} ${option.borderColor} shadow-lg -translate-y-1` 
                        : 'bg-white border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className={`mb-2 transition-all duration-300 ${isSelected ? option.color : 'text-gray-300'} ${isSelected ? 'scale-110 drop-shadow-sm' : ''}`}>
                      <option.icon 
                        size={28}
                        className={isSelected && option.value === '100%' ? 'animate-bounce' : ''}
                      />
                    </div>
                    <span className={`text-[10px] font-bold text-center transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${option.color.replace('text-', 'bg-')} border-2 border-white animate-in zoom-in duration-200`}></div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Disclaimer for 100% */}
            {sugarLevel === '100%' && (
                <p className="text-[10px] text-red-400 text-center mt-3 animate-in fade-in slide-in-from-top-1 italic">
                    *KAINOR takes no responsibility for sugar rush induced hyperactivity.
                </p>
            )}
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