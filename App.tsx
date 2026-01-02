import React, { useState, useRef, useEffect } from 'react';
import { Home, Coffee, User, MapPin, Search, ShoppingBag, Minus, Plus, X, Check, Lock, LayoutDashboard, Package, ListChecks, LogOut, Edit2, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import { MENU_DATA, MOCK_HISTORY } from './constants';
import { Product, Category, OrderHistoryItem, OrderStatus } from './types';
import { MenuItem } from './components/MenuItem';
import { ProductDetail } from './components/ProductDetail';
import * as LucideIcons from 'lucide-react';

// --- Types ---

interface CartItem extends Product {
  cartId: string;
  quantity: number;
  customization: {
    sugarLevel: string;
  };
}

// --- Admin Components ---

const AdminLogin = ({ onLogin, onCancel }: { onLogin: () => void, onCancel: () => void }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Hardcoded credentials for demo purposes
        if (username === 'admin' && password === 'CoffeeMaster2024') {
            onLogin();
        } else {
            setError("Invalid credentials");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-yellow">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
                    <p className="text-gray-500 text-sm">Manage products and orders</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input 
                            type="text" 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-yellow outline-none transition-all"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-yellow outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    
                    <button type="submit" className="w-full bg-brand-yellow text-white font-bold py-3 rounded-xl shadow-lg shadow-yellow-200 hover:bg-yellow-400 transition-colors mt-4">
                        Login
                    </button>
                    <button type="button" onClick={onCancel} className="w-full text-gray-400 text-sm font-medium py-2 hover:text-gray-600 transition-colors">
                        Back to App
                    </button>
                </form>
                
                <div className="mt-8 bg-blue-50 p-4 rounded-lg text-xs text-blue-800 border border-blue-100">
                    <p className="font-bold mb-1">Demo Credentials:</p>
                    <p>Username: admin</p>
                    <p>Password: CoffeeMaster2024</p>
                </div>
            </div>
        </div>
    );
};

interface AdminDashboardProps {
    menuData: Category[];
    setMenuData: React.Dispatch<React.SetStateAction<Category[]>>;
    orders: OrderHistoryItem[];
    setOrders: React.Dispatch<React.SetStateAction<OrderHistoryItem[]>>;
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ menuData, setMenuData, orders, setOrders, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'products' | 'orders'>('orders');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    
    // Form State for Products
    const [formName, setFormName] = useState("");
    const [formPrice, setFormPrice] = useState("");
    const [formCategory, setFormCategory] = useState(menuData[0].id);
    const [formImage, setFormImage] = useState("");
    
    const statusColors: Record<OrderStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        preparing: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    const handleEditClick = (product: Product, categoryId: string) => {
        setEditingProduct(product);
        setFormName(product.name);
        setFormPrice(product.price.toString());
        setFormCategory(categoryId);
        setFormImage(product.image);
        setIsAdding(true);
    };

    const handleAddNewClick = () => {
        setEditingProduct(null);
        setFormName("");
        setFormPrice("");
        setFormCategory(menuData[0].id);
        setFormImage(`https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`);
        setIsAdding(true);
    };

    const handleSaveProduct = () => {
        if (!formName || !formPrice) return;

        const newProduct: Product = {
            id: editingProduct ? editingProduct.id : Math.random().toString(36).substr(2, 9),
            name: formName,
            price: parseFloat(formPrice),
            image: formImage,
            isBestSeller: false
        };

        setMenuData(prev => {
            const newData = prev.map(cat => ({...cat, items: [...cat.items]}));
            
            // Remove from old category if editing and category changed
            if (editingProduct) {
                 newData.forEach(cat => {
                     cat.items = cat.items.filter(i => i.id !== editingProduct.id);
                 });
            }

            // Add to target category
            const targetCat = newData.find(c => c.id === formCategory);
            if (targetCat) {
                targetCat.items.push(newProduct);
            }
            
            return newData;
        });

        setIsAdding(false);
    };

    const handleDeleteProduct = (productId: string) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        setMenuData(prev => prev.map(cat => ({
            ...cat,
            items: cat.items.filter(item => item.id !== productId)
        })));
    };

    const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    };

    return (
        <div className="min-h-screen bg-gray-100 pb-20 md:pb-0 font-sans">
            {/* Admin Header */}
            <div className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="text-brand-yellow" size={24} />
                    <h1 className="font-bold text-xl text-gray-800">Admin Panel</h1>
                </div>
                <button onClick={onLogout} className="text-gray-500 hover:text-red-500 transition-colors p-2">
                    <LogOut size={20} />
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-4 gap-4">
                <button 
                    onClick={() => setActiveTab('orders')}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'orders' ? 'bg-brand-yellow text-white shadow-lg shadow-yellow-200' : 'bg-white text-gray-500 shadow-sm'}`}
                >
                    <ListChecks size={20} />
                    Orders
                </button>
                <button 
                    onClick={() => setActiveTab('products')}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'products' ? 'bg-brand-yellow text-white shadow-lg shadow-yellow-200' : 'bg-white text-gray-500 shadow-sm'}`}
                >
                    <Package size={20} />
                    Products
                </button>
            </div>

            {/* Main Content */}
            <div className="px-4">
                {activeTab === 'orders' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{order.id}</span>
                                            <span className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-600 mt-1">{order.customerName || 'Walk-in Customer'}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusColors[order.status]}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="border-t border-b border-gray-50 py-3 my-3 space-y-1">
                                    {order.items.map((item, idx) => (
                                        <p key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                            {item}
                                        </p>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="font-bold text-lg text-brand-yellow">${order.total.toFixed(2)}</span>
                                    <div className="flex gap-2">
                                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                                            <>
                                                {order.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                                                        className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded hover:bg-blue-200 transition-colors"
                                                    >
                                                        Start Preparing
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                                    className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded hover:bg-green-200 transition-colors"
                                                >
                                                    Complete
                                                </button>
                                            </>
                                        )}
                                        {order.status === 'pending' && (
                                            <button 
                                                onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                                className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded hover:bg-red-100 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <button 
                            onClick={handleAddNewClick}
                            className="w-full py-3 mb-4 bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-700 transition-all"
                        >
                            <Plus size={20} /> Add New Product
                        </button>

                        <div className="space-y-6">
                            {menuData.map(cat => (
                                <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-brand-yellow"></div>
                                        <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">{cat.name}</h3>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {cat.items.map(item => (
                                            <div key={item.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                                    <div>
                                                        <p className="font-semibold text-sm text-gray-900 line-clamp-1">{item.name}</p>
                                                        <p className="text-xs text-brand-yellow font-bold">${item.price.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button 
                                                        onClick={() => handleEditClick(item, cat.id)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteProduct(item.id)}
                                                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit/Add Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                            <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={24} /></button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input 
                                    type="text" 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="e.g. Vanilla Latte"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                    value={formPrice}
                                    onChange={(e) => setFormPrice(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow appearance-none"
                                    value={formCategory}
                                    onChange={(e) => setFormCategory(e.target.value)}
                                >
                                    {menuData.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                                        value={formImage}
                                        onChange={(e) => setFormImage(e.target.value)}
                                    />
                                    <button 
                                        onClick={() => setFormImage(`https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`)}
                                        className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200"
                                        title="Generate Random Image"
                                    >
                                        <ImageIcon size={20} className="text-gray-600" />
                                    </button>
                                </div>
                                {formImage && (
                                    <div className="mt-2 h-32 w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                                        <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveProduct}
                            className="w-full mt-6 bg-brand-yellow text-white font-bold py-3 rounded-xl shadow-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            Save Product
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-components ---

interface HomeViewProps {
  onNavigateToMenu: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigateToMenu }) => (
  <div className="pb-24">
    {/* Header */}
    <div className="bg-sky-100 relative h-64 md:h-80 w-full overflow-hidden">
       <img 
          src="https://picsum.photos/800/600?random=100" 
          className="w-full h-full object-cover"
          alt="KAINOR Coffee Branch"
       />
       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/20" />
       
       <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
           <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 text-sm font-semibold shadow-sm cursor-pointer">
               <MapPin size={14} className="text-brand-yellow" />
               <span>Serei Saophoan</span>
               <LucideIcons.ChevronDown size={14} />
           </div>
       </div>
       
       <div className="absolute bottom-4 left-4 text-white">
           <h2 className="text-3xl font-bold mb-1 drop-shadow-lg">Good Morning</h2>
           <p className="text-white/90 font-medium drop-shadow-md">Welcome to KAINOR</p>
       </div>
    </div>

    <div className="px-4 mt-8">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Announcements</h3>
            <span className="text-brand-yellow text-sm font-semibold cursor-pointer">See All</span>
        </div>
        
        <div className="bg-amber-900 rounded-2xl overflow-hidden shadow-md relative h-64 flex items-center justify-center">
           <img src="https://picsum.photos/600/400?random=103" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Promo" />
           <div className="relative z-10 text-center text-white p-6">
               <h2 className="text-3xl font-bold mb-2">Coconut Cream Latte</h2>
               <p className="text-xl font-light">Soft Opening Special</p>
               <div className="mt-4 bg-brand-yellow text-brand-dark px-4 py-2 rounded-full font-bold inline-block">
                   10,000៛
               </div>
           </div>
        </div>
    </div>
  </div>
);

interface MenuViewProps {
  activeCategory: string;
  setActiveCategory: (id: string) => void;
  onProductClick: (product: Product) => void;
  menuData: Category[];
}

const MenuView: React.FC<MenuViewProps> = ({ activeCategory, setActiveCategory, onProductClick, menuData }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter menu data based on search query
  const filteredMenu = React.useMemo(() => {
    if (!searchQuery.trim()) return menuData;
    
    return menuData.map(cat => ({
      ...cat,
      items: cat.items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(cat => cat.items.length > 0);
  }, [searchQuery, menuData]);

  // Sync sidebar with active category (only if no search or if active category still exists)
  useEffect(() => {
      if (isScrollingRef.current) return;
      const sidebarElement = document.getElementById(`sidebar-cat-${activeCategory}`);
      if (sidebarElement) {
          sidebarElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
  }, [activeCategory]);

  const scrollToCategory = (id: string) => {
      isScrollingRef.current = true;
      setActiveCategory(id);
      
      const element = document.getElementById(`category-${id}`);
      if (element && scrollRef.current) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => {
              isScrollingRef.current = false;
          }, 800);
      }
  };

  const handleScroll = () => {
      if (isScrollingRef.current || !scrollRef.current) return;
      
      const container = scrollRef.current;
      const scrollTop = container.scrollTop;
      
      let newActiveId = activeCategory;
      const offset = 100; // Increased offset due to sticky header
      
      for (const cat of filteredMenu) {
          const element = document.getElementById(`category-${cat.id}`);
          if (element) {
             if (element.offsetTop - offset <= scrollTop) {
                 newActiveId = cat.id;
             }
          }
      }

      if (newActiveId !== activeCategory && filteredMenu.some(c => c.id === newActiveId)) {
          setActiveCategory(newActiveId);
      }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Bar with Search */}
      <div className="px-4 pt-4 pb-2 bg-white flex flex-col shadow-sm z-20 relative">
          <div className="flex items-center gap-2 mb-2">
               <div className="flex items-center gap-1 text-brand-yellow font-bold text-sm whitespace-nowrap">
                   <MapPin size={14} />
                   <span>Poi Pet</span>
                   <LucideIcons.ChevronDown size={14} />
               </div>
               
               {/* Search Bar */}
               <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
                  <Search size={16} className="text-gray-400" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search menu..."
                    className="bg-transparent border-none outline-none ml-2 text-base w-full font-medium text-gray-700 placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")}>
                      <LucideIcons.X size={14} className="text-gray-400" />
                    </button>
                  )}
               </div>
          </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Categories (Hide if searching and no categories match well, or just keep) */}
          <div className="w-1/4 md:w-1/5 bg-gray-50 h-full overflow-y-auto no-scrollbar py-2">
              {filteredMenu.map((cat) => {
                  const IconComponent = (LucideIcons as any)[cat.iconName] || LucideIcons.Coffee;
                  const isActive = activeCategory === cat.id;

                  return (
                      <div 
                          key={cat.id}
                          id={`sidebar-cat-${cat.id}`}
                          onClick={() => scrollToCategory(cat.id)}
                          className={`flex flex-col items-center justify-center py-6 px-1 cursor-pointer transition-colors relative ${isActive ? 'bg-white' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                          {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-brand-yellow rounded-r-md" />
                          )}
                          <IconComponent 
                              size={24} 
                              className={`mb-2 ${isActive ? 'text-gray-900' : 'opacity-70'}`} 
                              strokeWidth={isActive ? 2.5 : 1.5}
                          />
                          <span className={`text-[10px] md:text-xs text-center font-semibold leading-tight ${isActive ? 'text-gray-900' : ''}`}>
                              {cat.name.toUpperCase()}
                          </span>
                      </div>
                  );
              })}
          </div>

          {/* Menu Items */}
          <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="w-3/4 md:w-4/5 h-full overflow-y-auto px-4 pb-24 scroll-smooth bg-white relative"
          >
              {filteredMenu.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Search size={48} className="mb-4 opacity-20" />
                  <p>No items found</p>
                </div>
              ) : (
                filteredMenu.map((cat) => {
                    const IconComponent = (LucideIcons as any)[cat.iconName] || LucideIcons.Coffee;
                    return (
                        <div key={cat.id} id={`category-${cat.id}`} className="mb-2">
                            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-3 mb-2 flex items-center gap-2 border-b border-gray-100 -mx-4 px-4 shadow-sm">
                                <IconComponent size={18} className="text-brand-yellow" />
                                <h2 className="font-bold text-gray-900 uppercase tracking-wide text-sm">{cat.name}</h2>
                            </div>
                            <div className="space-y-1 pt-1">
                                {cat.items.map(item => (
                                    <MenuItem 
                                      key={item.id} 
                                      item={item} 
                                      onClick={() => onProductClick(item)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })
              )}
          </div>
      </div>
    </div>
  );
};

const AccountView = ({ onAdminLogin }: { onAdminLogin: () => void }) => (
  <div className="p-4 bg-white min-h-screen pb-20 flex flex-col items-center pt-10">
      <div className="w-24 h-24 bg-brand-yellow rounded-full p-1 mb-4">
          <img src="https://picsum.photos/200/200?random=99" className="w-full h-full rounded-full object-cover border-4 border-white" alt="Profile" />
      </div>
      <h2 className="text-2xl font-bold">Coffee Lover</h2>
      <p className="text-gray-500 mb-8">+855 12 345 678</p>

      <div className="w-full max-w-md space-y-2">
          {['Profile Details', 'Address Book', 'Payment Methods', 'Notifications', 'Help & Support'].map((item) => (
              <button key={item} className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 font-medium flex justify-between items-center">
                  {item}
                  <LucideIcons.ChevronRight size={18} className="text-gray-400" />
              </button>
          ))}
          <button 
            onClick={onAdminLogin}
            className="w-full text-left p-4 bg-gray-800 text-white rounded-xl hover:bg-gray-900 font-medium mt-4 flex justify-between items-center shadow-lg"
          >
              <span>Admin Dashboard</span>
              <Lock size={16} />
          </button>
          <button className="w-full text-left p-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 font-medium mt-2">
              Log Out
          </button>
      </div>
  </div>
);

interface CartViewProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  onNavigateToMenu: () => void;
}

const CartView: React.FC<CartViewProps> = ({ items, onUpdateQuantity, onRemove, onCheckout, onNavigateToMenu }) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full pb-20 bg-gray-50">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <ShoppingBag size={48} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Your Cart is Empty</h3>
                <p className="text-gray-400 text-sm mb-6">Looks like you haven't added anything yet.</p>
                <button 
                  onClick={onNavigateToMenu}
                  className="bg-brand-yellow text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-yellow-400 transition-colors"
                >
                  Go to Menu
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-50 pb-24">
             <div className="bg-white p-4 shadow-sm sticky top-0 z-10 text-center">
                 <h1 className="font-bold text-lg">My Cart</h1>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                 {items.map(item => (
                     <div key={item.cartId} className="bg-white p-3 rounded-xl flex gap-3 shadow-sm border border-gray-100">
                         <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                             <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 flex flex-col justify-between py-1">
                             <div className="flex justify-between items-start">
                                 <div>
                                     <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h4>
                                     <p className="text-xs text-gray-500 mt-1 font-medium bg-gray-50 inline-block px-2 py-1 rounded text-brand-dark/70">
                                       Sugar: {item.customization.sugarLevel}
                                     </p>
                                 </div>
                                 <button onClick={() => onRemove(item.cartId)} className="text-gray-300 hover:text-red-500 p-1">
                                     <X size={16} />
                                 </button>
                             </div>
                             <div className="flex justify-between items-end mt-2">
                                 <span className="font-bold text-brand-yellow">${(item.price * item.quantity).toFixed(2)}</span>
                                 <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                                     <button onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)} disabled={item.quantity <= 1} className={`text-gray-600 ${item.quantity <= 1 ? 'opacity-30' : ''}`}>
                                         <Minus size={14} />
                                     </button>
                                     <span className="text-xs font-bold w-3 text-center">{item.quantity}</span>
                                     <button onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)} className="text-gray-600">
                                         <Plus size={14} />
                                     </button>
                                 </div>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
             <div className="bg-white p-6 border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-t-3xl">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 font-medium">Total</span>
                    <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
                </div>
                <button onClick={onCheckout} className="w-full bg-brand-yellow text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-200 hover:bg-yellow-400 transition-colors">
                    CHECKOUT
                </button>
             </div>
        </div>
    );
};

const App = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'cart' | 'account'>('home');
  const [activeCategory, setActiveCategory] = useState(MENU_DATA[0].id);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  
  // Admin & Data State
  const [menuData, setMenuData] = useState<Category[]>(MENU_DATA);
  const [orders, setOrders] = useState<OrderHistoryItem[]>(MOCK_HISTORY);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (product: Product, quantity: number, customization: any) => {
    const newItem: CartItem = {
      ...product,
      cartId: Math.random().toString(36).substr(2, 9),
      quantity,
      customization
    };
    setCartItems(prev => [...prev, newItem]);
    setSelectedProduct(null);
  };

  const handleUpdateQuantity = (cartId: string, newQty: number) => {
    if (newQty < 1) return;
    setCartItems(prev => prev.map(item => item.cartId === cartId ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveItem = (cartId: string) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const handleCheckout = () => {
    setShowCheckoutConfirm(true);
  };

  const handleConfirmOrder = async () => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderId = `ORD-${Math.floor(Math.random() * 10000)}`;
    const newOrder: OrderHistoryItem = {
        id: orderId,
        date: new Date().toISOString(),
        total: total,
        items: cartItems.map(item => `${item.quantity}x ${item.name}`),
        status: 'pending',
        customerName: 'Coffee Lover'
    };
    
    // --- TELEGRAM NOTIFICATION LOGIC ---
    const telegramBotToken = '8409323996:AAHHvwR01FBpxAwR47jx4syId5_j3SD-0p4';
    const telegramChatId = '-5200077567';
    
    // Construct the message text
    const itemsList = cartItems.map(item => 
        `- ${item.quantity}x ${item.name} (Sugar: ${item.customization.sugarLevel})`
    ).join('\n');

    const message = `<b>🔔 New Order Received!</b>\n\n` +
                    `<b>ID:</b> ${orderId}\n` +
                    `<b>Customer:</b> ${newOrder.customerName}\n` +
                    `<b>Total:</b> $${total.toFixed(2)}\n\n` +
                    `<b>Items:</b>\n${itemsList}`;

    try {
        await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: telegramChatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (error) {
        console.error("Failed to send Telegram notification:", error);
    }
    // -----------------------------------

    setOrders(prev => [newOrder, ...prev]);

    setShowCheckoutConfirm(false);
    setShowOrderSuccess(true);
    setCartItems([]);
    setTimeout(() => {
        setShowOrderSuccess(false);
        setActiveTab('home');
    }, 2500);
  };

  const tabs: ('home' | 'menu' | 'cart' | 'account')[] = ['home', 'menu', 'cart', 'account'];
  const activeIndex = tabs.indexOf(activeTab);

  // Admin Flow
  if (isAdminLoggedIn) {
      return (
          <AdminDashboard 
            menuData={menuData} 
            setMenuData={setMenuData} 
            orders={orders}
            setOrders={setOrders}
            onLogout={() => setIsAdminLoggedIn(false)} 
          />
      );
  }

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

  return (
    <div className="max-w-md mx-auto md:max-w-4xl min-h-screen bg-gray-50 md:shadow-2xl md:border-x md:border-gray-200 relative">
      
      {/* Admin Login Modal */}
      {showAdminLogin && (
          <AdminLogin 
            onLogin={() => {
                setIsAdminLoggedIn(true);
                setShowAdminLogin(false);
            }} 
            onCancel={() => setShowAdminLogin(false)} 
          />
      )}

      {/* Product Detail Overlay */}
      {selectedProduct && (
        <ProductDetail 
          product={selectedProduct} 
          onBack={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Content */}
      <main className="h-full">
        {activeTab === 'home' && <HomeView onNavigateToMenu={() => setActiveTab('menu')} />}
        {activeTab === 'menu' && (
          <MenuView 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory}
            onProductClick={handleProductClick}
            menuData={menuData}
          />
        )}
        {activeTab === 'cart' && (
          <CartView 
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
            onCheckout={handleCheckout}
            onNavigateToMenu={() => setActiveTab('menu')}
          />
        )}
        {activeTab === 'account' && <AccountView onAdminLogin={() => setShowAdminLogin(true)} />}
      </main>

      {/* Bottom Navigation (Hide when product detail is open) */}
      {!selectedProduct && (
        <div className="fixed bottom-6 left-4 right-4 md:absolute md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-[90%] md:max-w-3xl z-50">
           <div className="bg-white/80 backdrop-blur-3xl border border-white/50 rounded-[2rem] shadow-2xl shadow-black/5 p-2 relative overflow-hidden">
               {/* Sliding Indicator */}
               <div 
                 className="absolute top-2 bottom-2 left-2 w-[calc(25%-4px)] bg-brand-yellow rounded-[1.5rem] shadow-lg shadow-yellow-200/50 z-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                 style={{ transform: `translateX(${activeIndex * 100}%)` }}
               />
               
               {/* Nav Items */}
               <div className="relative z-10 grid grid-cols-4 w-full">
                   {tabs.map((tab) => {
                       const isActive = activeTab === tab;
                       let Icon, label, count;
                       
                       switch(tab) {
                           case 'home': Icon = Home; label = "Home"; break;
                           case 'menu': Icon = Coffee; label = "Menu"; break;
                           case 'cart': Icon = ShoppingBag; label = "Cart"; count = cartCount; break;
                           case 'account': Icon = User; label = "Account"; break;
                           default: Icon = Home; label = ""; 
                       }
                       
                       return (
                           <button
                               key={tab}
                               onClick={() => setActiveTab(tab)}
                               className="flex flex-col items-center justify-center py-2.5 transition-colors duration-300 relative group"
                           >
                               <div className={`transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isActive ? '-translate-y-0.5 scale-110' : 'scale-100'}`}>
                                   <Icon 
                                        size={24} 
                                        strokeWidth={isActive ? 2.5 : 2} 
                                        className={`transition-colors duration-300 ${isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`} 
                                   />
                               </div>
                               {count !== undefined && count > 0 && (
                                   <div className={`absolute top-1 right-1/4 translate-x-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                                     {count}
                                   </div>
                               )}
                               {/* Label (Optional: uncomment to show label) */}
                               {/* <span className={`text-[10px] font-bold mt-1 transition-all duration-300 ${isActive ? 'text-gray-900 opacity-100' : 'text-gray-400 opacity-0 h-0 overflow-hidden'}`}>{label}</span> */}
                           </button>
                       );
                   })}
               </div>
            </div>
        </div>
      )}

      {/* Checkout Confirmation Modal */}
      {showCheckoutConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                <div className="flex flex-col items-center text-center mb-4 shrink-0">
                    <div className="w-16 h-16 bg-brand-yellow/20 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Confirm Order</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Please review your order before confirming.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto mb-6 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <ul className="space-y-3">
                    {cartItems.map((item) => (
                      <li key={item.cartId} className="flex justify-between items-start text-sm">
                        <div className="flex gap-3">
                           <div className="w-8 h-8 rounded bg-gray-200 overflow-hidden shrink-0">
                              <img src={item.image} className="w-full h-full object-cover" alt={item.name}/>
                           </div>
                           <div className="text-left">
                              <div className="font-bold text-gray-800">
                                <span className="text-brand-yellow mr-1">{item.quantity}x</span>
                                {item.name}
                              </div>
                              <div className="text-xs text-gray-500">Sugar: {item.customization.sugarLevel}</div>
                           </div>
                        </div>
                        <span className="font-semibold text-gray-700">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="font-bold text-gray-600">Total Amount</span>
                      <span className="font-bold text-xl text-brand-yellow">${cartTotal}</span>
                  </div>
                </div>

                <div className="flex gap-3 shrink-0">
                    <button 
                        onClick={() => setShowCheckoutConfirm(false)}
                        className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirmOrder}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-brand-yellow hover:bg-yellow-400 shadow-lg shadow-yellow-200 transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Success Modal */}
      {showOrderSuccess && (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center p-4 bg-white animate-in fade-in duration-300">
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                <Check size={48} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
            <p className="text-gray-500 text-center max-w-xs">
                Your order has been successfully placed. We'll start brewing immediately!
            </p>
        </div>
      )}

    </div>
  );
};

export default App;