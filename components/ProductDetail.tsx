import React, { useState } from 'react';
import { ArrowLeft, Heart, Minus, Plus, Check, Syringe } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Product } from '../types';
import { ImageWithSkeleton } from './ImageWithSkeleton';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number, customization: any, note?: string) => void;
  sugarIcons?: Record<string, string>;
  sugarTags?: Record<string, string>;
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
  { value: '0%', icon: Syringe, label: '0%', color: 'text-emerald-500', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', joke: "Healthy (Boring)" },
  { value: '25%', icon: Syringe, label: '25%', color: 'text-lime-500', bgColor: 'bg-lime-50', borderColor: 'border-lime-200', joke: "Safe Zone" },
  { value: '50%', icon: Syringe, label: '50%', color: 'text-yellow-500', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', joke: "Good Choice" },
  { value: '75%', icon: Syringe, label: '75%', color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', joke: "Sweet Baby" },
  { value: '100%', icon: Syringe, label: '100%', color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200', joke: "Call 911 🚑" },
];

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart, sugarIcons = {}, sugarTags = {} }) => {
  const [quantity, setQuantity] = useState(1);
  const [sugarLevel, setSugarLevel] = useState<SugarLevel>('50%');
  const [note, setNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Check if the product is food or pastry based on categoryId and name
  const isFood = React.useMemo(() => {
     const cat = product.categoryId?.toLowerCase() || '';
     const name = product.name.toLowerCase();
     const foodKeywords = ['pastry', 'food', 'bakery', 'cake', 'sandwich', 'meal', 'pizza', 'bread', 'croissant', 'toast', 'bagel', 'cookie', 'muffin', 'donut', 'snack'];
     
     // Check if category or name contains any food keywords
     return foodKeywords.some(k => cat.includes(k) || name.includes(k));
  }, [product.categoryId, product.name]);

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCartClick = () => {
    setIsAdding(true);
    setTimeout(() => {
      // Don't include sugar level if it's a food item
      const customization = isFood ? {} : { sugarLevel };
      onAddToCart(product, quantity, customization, note);
      setIsAdding(false);
    }, 400);
  };

  const subtotal = (product.price * quantity).toFixed(2);
  const selectedOption = SUGAR_OPTIONS.find(opt => opt.value === sugarLevel);
  const description = product.description || `${product.name} is a delicious choice from our menu, freshly prepared with high-quality ingredients to brighten your day.`;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto transition-opacity animate-in fade-in duration-300" onClick={onBack} />
      <div className="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-xl bg-white md:rounded-3xl flex flex-col overflow-hidden pointer-events-auto shadow-2xl animate-in slide-in-from-bottom-10 duration-300 relative">
        <div className="flex justify-between items-center p-4 absolute top-0 left-0 right-0 z-10">
          <button onClick={onBack} className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors shadow-sm ring-1 ring-black/5"><ArrowLeft className="text-gray-900" size={24} /></button>
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors shadow-sm ring-1 ring-black/5"><Heart className="text-brand-yellow fill-brand-yellow" size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto pb-32 no-scrollbar bg-white">
          <div className="w-full h-80 relative flex items-center justify-center pt-10 pb-4 overflow-hidden bg-gray-50">
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/10 to-transparent z-0"></div>
              <div className="w-56 h-56 rounded-full relative z-10 shadow-2xl shadow-brand-yellow/20 animate-in zoom-in duration-500 bg-white">
                  <ImageWithSkeleton 
                    src={product.image} 
                    alt={product.name} 
                    className="rounded-full border-4 border-white" 
                    containerClassName="w-full h-full rounded-full"
                  />
              </div>
          </div>

          <div className="px-6 -mt-6 relative z-20 bg-white rounded-t-3xl pt-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">{description}</p>

            {!isFood && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2"><h3 className="font-bold text-gray-800">Sugar Level</h3></div>
                    <div className={`text-xs font-bold px-3 py-1 rounded-full border transition-all duration-300 ${selectedOption?.bgColor} ${selectedOption?.color} ${selectedOption?.borderColor} shadow-sm`}>{sugarTags[sugarLevel] || selectedOption?.joke}</div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-3">
                    {SUGAR_OPTIONS.map((option) => {
                      const isSelected = sugarLevel === option.value;
                      const customIcon = sugarIcons[option.value];
                      const isImg = customIcon?.startsWith('http') || customIcon?.startsWith('data:');
                      const CustomLucideIcon = !isImg && customIcon && (LucideIcons as any)[customIcon] ? (LucideIcons as any)[customIcon] : null;
                      
                      return (
                        <button key={option.value} onClick={() => setSugarLevel(option.value)} className={`flex flex-col items-center justify-center py-3 px-1 rounded-2xl border-2 transition-all duration-300 relative ${isSelected ? `${option.bgColor} ${option.borderColor} shadow-lg -translate-y-1` : 'bg-white border-transparent hover:bg-gray-50'}`}>
                          <div className={`mb-2 transition-all duration-300 ${isSelected ? option.color : 'text-gray-300'} ${isSelected ? 'scale-110 drop-shadow-sm' : ''}`}>
                            {isImg ? (
                              <img src={customIcon} alt={option.label} className={`w-7 h-7 object-contain ${isSelected && option.value === '100%' ? 'animate-bounce' : ''}`} referrerPolicy="no-referrer" />
                            ) : CustomLucideIcon ? (
                              <CustomLucideIcon size={28} className={isSelected && option.value === '100%' ? 'animate-bounce' : ''} />
                            ) : (
                              <option.icon size={28} className={isSelected && option.value === '100%' ? 'animate-bounce' : ''} />
                            )}
                          </div>
                          <span className={`text-[10px] font-bold text-center transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>{option.label}</span>
                          {isSelected && <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${option.color.replace('text-', 'bg-')} border-2 border-white animate-in zoom-in duration-200`}></div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
            )}

            <div className="mb-8">
               <label className="block text-sm font-bold text-gray-800 mb-2">Special Instructions / Notes (Optional)</label>
               <textarea 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-yellow focus:outline-none resize-none placeholder-gray-400 transition-all"
                  rows={2}
                  placeholder="e.g. Less ice, extra straw..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
               />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 pb-8 md:pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
          <div className="flex justify-between items-end mb-4"><span className="font-bold text-gray-900 text-lg">Subtotal</span><span className="font-extrabold text-2xl text-brand-yellow">${subtotal}</span></div>
          <div className="flex gap-4">
            <div className="flex items-center gap-4 px-2 bg-gray-50 rounded-xl p-1">
              <button onClick={handleDecrement} className="w-10 h-10 flex items-center justify-center text-gray-600 font-bold text-xl hover:bg-white hover:shadow-sm rounded-lg transition-all"><Minus size={18} /></button>
              <span className="font-bold text-gray-900 w-4 text-center text-lg">{quantity}</span>
              <button onClick={handleIncrement} className="w-10 h-10 flex items-center justify-center text-gray-900 font-bold text-xl hover:bg-white hover:shadow-sm rounded-lg transition-all"><Plus size={18} /></button>
            </div>
            <button onClick={handleAddToCartClick} disabled={isAdding} className={`flex-1 font-bold py-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${isAdding ? 'bg-green-500 text-white scale-[0.98] shadow-green-200' : 'bg-gray-900 text-white shadow-gray-300 hover:bg-gray-800 active:scale-[0.98]'}`}>
              {isAdding ? <><Check size={20} className="animate-bounce" /><span>ADDED</span></> : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};