import React, { useState, useRef, useEffect } from 'react';
import { Home, Coffee, User, MapPin, Search, ShoppingBag, Minus, Plus, X, Check, Lock, LayoutDashboard, Package, ListChecks, LogOut, Edit2, Trash2, Save, Image as ImageIcon, Loader2, Grid, Megaphone, RotateCw, UploadCloud, ChevronDown, ChevronRight } from 'lucide-react';
import { MENU_DATA, MOCK_HISTORY, INITIAL_ANNOUNCEMENTS } from './constants';
import { Product, Category, OrderHistoryItem, OrderStatus, Announcement } from './types';
import { MenuItem } from './components/MenuItem';
import { ProductDetail } from './components/ProductDetail';
import HistoryChart from './components/HistoryChart';
import * as LucideIcons from 'lucide-react';
import { supabase } from './lib/supabaseClient';

// --- Types ---

interface CartItem extends Product {
  cartId: string;
  quantity: number;
  note?: string;
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
            </div>
        </div>
    );
};

interface AdminDashboardProps {
    menuData: Category[];
    refreshData: () => void;
    orders: OrderHistoryItem[];
    announcements: Announcement[];
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ menuData, refreshData, orders, announcements, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories' | 'announcements'>('orders');
    const [loading, setLoading] = useState(false);

    // --- State for Products ---
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [prodFormName, setProdFormName] = useState("");
    const [prodFormPrice, setProdFormPrice] = useState("");
    const [prodFormCategory, setProdFormCategory] = useState("");
    const [prodFormImage, setProdFormImage] = useState("");
    const [prodImageFile, setProdImageFile] = useState<File | null>(null);
    const [prodImagePreview, setProdImagePreview] = useState("");

    // --- State for Categories ---
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [catFormName, setCatFormName] = useState("");
    const [catFormIcon, setCatFormIcon] = useState("Coffee");

    // --- State for Announcements ---
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
    const [annFormTitle, setAnnFormTitle] = useState("");
    const [annFormSubtitle, setAnnFormSubtitle] = useState("");
    const [annFormPrice, setAnnFormPrice] = useState("");
    const [annFormImage, setAnnFormImage] = useState("");
    const [annFormColor, setAnnFormColor] = useState("bg-amber-900");
    
    const statusColors: Record<OrderStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        preparing: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    // --- Product Handlers ---
    const openProductModal = (product?: Product, categoryId?: string) => {
        setProdImageFile(null);
        setProdImagePreview("");
        
        if (product) {
            setEditingProduct(product);
            setProdFormName(product.name);
            setProdFormPrice(product.price.toString());
            setProdFormCategory(categoryId || (menuData[0]?.id || ''));
            setProdFormImage(product.image);
        } else {
            setEditingProduct(null);
            setProdFormName("");
            setProdFormPrice("");
            setProdFormCategory(menuData[0]?.id || '');
            setProdFormImage(`https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`);
        }
        setIsProductModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProdImageFile(file);
            setProdImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSaveProduct = async () => {
        if (!prodFormName || !prodFormPrice || !prodFormCategory) return;
        setLoading(true);

        let imageUrl = prodFormImage;

        if (prodImageFile) {
            try {
                const fileExt = prodImageFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, prodImageFile);

                if (uploadError) {
                    console.error("Upload Error:", uploadError);
                    alert(`Failed to upload image: ${uploadError.message}\n\nPlease run the SQL provided in the chat to create the 'products' bucket and set permissions.`);
                    setLoading(false);
                    return;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath);
                
                imageUrl = publicUrl;
            } catch (error) {
                console.error("Error uploading image:", error);
                alert("An unexpected error occurred during image upload.");
                setLoading(false);
                return;
            }
        }

        const productData = {
            name: prodFormName,
            price: parseFloat(prodFormPrice),
            image: imageUrl,
            category_id: prodFormCategory,
        };

        try {
            if (editingProduct) {
                await supabase.from('products').update(productData).eq('id', editingProduct.id);
            } else {
                await supabase.from('products').insert(productData);
            }
            await refreshData();
            setIsProductModalOpen(false);
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!window.confirm("Delete this product?")) return;
        setLoading(true);
        try {
            await supabase.from('products').delete().eq('id', productId);
            await refreshData();
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete product.");
        } finally {
            setLoading(false);
        }
    };

    // --- Category Handlers ---
    const openCategoryModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setCatFormName(category.name);
            setCatFormIcon(category.iconName);
        } else {
            setEditingCategory(null);
            setCatFormName("");
            setCatFormIcon("Coffee");
        }
        setIsCategoryModalOpen(true);
    };

    const handleSaveCategory = async () => {
        if (!catFormName) return;
        setLoading(true);
        
        const categoryData = {
            name: catFormName,
            icon_name: catFormIcon,
            ...( !editingCategory ? { id: catFormName.toLowerCase().replace(/\s+/g, '-') } : {} )
        };

        try {
            if (editingCategory) {
                await supabase.from('categories').update({ name: catFormName, icon_name: catFormIcon }).eq('id', editingCategory.id);
            } else {
                await supabase.from('categories').insert(categoryData);
            }
            await refreshData();
            setIsCategoryModalOpen(false);
        } catch (error) {
             console.error("Error saving category:", error);
             alert("Failed to save category. Check if ID already exists.");
        } finally {
             setLoading(false);
        }
    };

    const handleDeleteCategory = async (catId: string) => {
        if (!window.confirm("Delete this category?")) return;
        setLoading(true);
        try {
             await supabase.from('categories').delete().eq('id', catId);
             await refreshData();
        } catch (error) {
             console.error("Error deleting category:", error);
             alert("Failed to delete category.");
        } finally {
             setLoading(false);
        }
    };

    // --- Announcement Handlers ---
    const openAnnouncementModal = (ann?: Announcement) => {
        if (ann) {
            setEditingAnnouncement(ann);
            setAnnFormTitle(ann.title);
            setAnnFormSubtitle(ann.subtitle);
            setAnnFormPrice(ann.priceTag || "");
            setAnnFormImage(ann.image);
            setAnnFormColor(ann.colorClass);
        } else {
            setEditingAnnouncement(null);
            setAnnFormTitle("");
            setAnnFormSubtitle("");
            setAnnFormPrice("");
            setAnnFormImage(`https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`);
            setAnnFormColor("bg-amber-900");
        }
        setIsAnnouncementModalOpen(true);
    };

    const handleSaveAnnouncement = async () => {
        if (!annFormTitle) return;
        setLoading(true);

        const annData = {
            title: annFormTitle,
            subtitle: annFormSubtitle,
            price_tag: annFormPrice,
            image: annFormImage,
            color_class: annFormColor
        };

        try {
            if (editingAnnouncement) {
                await supabase.from('announcements').update(annData).eq('id', editingAnnouncement.id);
            } else {
                await supabase.from('announcements').insert(annData);
            }
            await refreshData();
            setIsAnnouncementModalOpen(false);
        } catch (error) {
            console.error("Error saving announcement:", error);
            alert("Failed to save announcement.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAnnouncement = async (id: string) => {
        if (!window.confirm("Delete this announcement?")) return;
        setLoading(true);
        try {
            await supabase.from('announcements').delete().eq('id', id);
            await refreshData();
        } catch (error) {
            console.error("Error deleting announcement:", error);
            alert("Failed to delete announcement.");
        } finally {
            setLoading(false);
        }
    };

    // --- Order Handlers ---
    const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
        setLoading(true);
        try {
            await supabase.from('orders').update({ status }).eq('readable_id', orderId);
            await refreshData();
        } catch (error) {
            console.error("Error updating order:", error);
            try {
                 await supabase.from('orders').update({ status }).eq('id', orderId);
                 await refreshData();
            } catch (e) {
                 alert("Failed to update order status.");
            }
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'orders', label: 'Orders', icon: ListChecks },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'categories', label: 'Categories', icon: Grid },
        { id: 'announcements', label: 'News', icon: Megaphone },
    ];

    return (
        <div className="min-h-screen bg-gray-100 pb-20 md:pb-0 font-sans w-full relative">
            {loading && (
                <div className="fixed inset-0 z-[110] bg-white/50 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 size={48} className="animate-spin text-brand-yellow" />
                </div>
            )}

            {/* Admin Header */}
            <div className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="text-brand-yellow" size={24} />
                    <h1 className="font-bold text-xl text-gray-800">Admin Panel</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={refreshData} className="p-2 text-gray-500 hover:text-brand-yellow transition-colors" title="Refresh Data">
                        <RotateCw size={20} />
                    </button>
                    <button onClick={onLogout} className="text-gray-500 hover:text-red-500 transition-colors p-2">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-4 gap-2 max-w-7xl mx-auto overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 min-w-[100px] py-3 px-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm whitespace-nowrap ${activeTab === tab.id ? 'bg-brand-yellow text-white shadow-lg shadow-yellow-200' : 'bg-white text-gray-500 shadow-sm'}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
             <div className="px-4 max-w-7xl mx-auto w-full pb-10">
                {activeTab === 'orders' && (
                    <div className="animate-in fade-in space-y-6">
                         <HistoryChart orders={orders} />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {orders.length === 0 && <div className="col-span-full text-center p-10 text-gray-400">No orders found.</div>}
                            {orders.map(order => (
                                <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900 line-clamp-1 text-xs">{order.id}</span>
                                                <span className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-600 mt-1">{order.customerName || 'Walk-in'} {order.tableNumber && <span className="text-brand-yellow bg-yellow-50 px-2 py-0.5 rounded-full ml-2 border border-yellow-100">T-{order.tableNumber}</span>}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusColors[order.status]}`}>{order.status}</span>
                                    </div>
                                    <div className="border-t border-b border-gray-50 py-3 my-3 space-y-1 flex-1">
                                        {order.items.map((item, idx) => <p key={idx} className="text-sm text-gray-700 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>{item}</p>)}
                                    </div>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                        <span className="font-bold text-lg text-brand-yellow">${order.total.toFixed(2)}</span>
                                        <div className="flex gap-2">
                                            {order.status === 'pending' && <button onClick={() => handleUpdateOrderStatus(order.id, 'preparing')} className="btn-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded text-xs font-bold">Prepare</button>}
                                            {order.status === 'preparing' && <button onClick={() => handleUpdateOrderStatus(order.id, 'completed')} className="btn-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded text-xs font-bold">Done</button>}
                                            {order.status === 'pending' && <button onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')} className="btn-xs bg-red-50 text-red-500 hover:bg-red-100 px-2 py-1 rounded text-xs font-bold">Cancel</button>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'products' && (
                    <div className="animate-in fade-in">
                        <button onClick={() => openProductModal()} className="w-full md:w-auto px-6 py-3 mb-4 bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-700"><Plus size={20} /> Add Product</button>
                        <div className="space-y-6">
                            {menuData.map(cat => (
                                <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-yellow"></div><h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">{cat.name}</h3></div>
                                    <div className="divide-y divide-gray-50">
                                        {cat.items.map(item => (
                                            <div key={item.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                                                <div className="flex items-center gap-3"><img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" /><div><p className="font-semibold text-sm text-gray-900">{item.name}</p><p className="text-xs text-brand-yellow font-bold">${item.price.toFixed(2)}</p></div></div>
                                                <div className="flex gap-1"><button onClick={() => openProductModal(item, cat.id)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button><button onClick={() => handleDeleteProduct(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'categories' && (
                    <div className="animate-in fade-in">
                        <button onClick={() => openCategoryModal()} className="w-full md:w-auto px-6 py-3 mb-4 bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-700"><Plus size={20} /> Add Category</button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {menuData.map(cat => (
                                <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3"><div className="p-2 bg-brand-yellow/10 rounded-lg text-brand-yellow"><Coffee size={24} /></div><div><h3 className="font-bold text-gray-800">{cat.name}</h3><p className="text-xs text-gray-400">{cat.items.length} items</p></div></div>
                                    <div className="flex gap-1"><button onClick={() => openCategoryModal(cat)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button><button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'announcements' && (
                    <div className="animate-in fade-in">
                        <button onClick={() => openAnnouncementModal()} className="w-full md:w-auto px-6 py-3 mb-4 bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-700"><Plus size={20} /> New Post</button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {announcements.map(ann => (
                                <div key={ann.id} className={`${ann.colorClass} rounded-2xl overflow-hidden shadow-lg relative h-64 group`}>
                                    <img src={ann.image} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Promo" />
                                    <div className="relative z-10 p-6 flex flex-col justify-between h-full"><div className="text-white"><h2 className="text-2xl font-bold mb-1">{ann.title}</h2><p className="text-lg font-light opacity-90">{ann.subtitle}</p></div><div className="flex justify-between items-end"><button onClick={() => openAnnouncementModal(ann)} className="p-2 text-white hover:bg-white/20 rounded"><Edit2 size={16} /></button><button onClick={() => handleDeleteAnnouncement(ann.id)} className="p-2 text-white hover:bg-red-500/50 rounded"><Trash2 size={16} /></button></div></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </div>

             {/* Modals for Product, Category, Announcement */}
             {isProductModalOpen && <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"><h3 className="text-xl font-bold mb-4">{editingProduct ? 'Edit' : 'New'} Product</h3><input className="w-full p-2 border rounded mb-2" value={prodFormName} onChange={e => setProdFormName(e.target.value)} placeholder="Name"/><input className="w-full p-2 border rounded mb-2" type="number" value={prodFormPrice} onChange={e => setProdFormPrice(e.target.value)} placeholder="Price"/><div className="flex gap-2"><input className="w-full p-2 border rounded" value={prodFormImage} onChange={e => setProdFormImage(e.target.value)} placeholder="Image URL"/><input type="file" onChange={handleFileChange} /></div><button onClick={handleSaveProduct} className="w-full bg-brand-yellow p-3 rounded-xl mt-4 text-white font-bold">Save</button><button onClick={() => setIsProductModalOpen(false)} className="w-full mt-2 text-gray-500">Cancel</button></div></div>}
             {isCategoryModalOpen && <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl"><h3 className="text-xl font-bold mb-4">{editingCategory ? 'Edit' : 'New'} Category</h3><input className="w-full p-2 border rounded mb-2" value={catFormName} onChange={e => setCatFormName(e.target.value)} placeholder="Name"/><button onClick={handleSaveCategory} className="w-full bg-brand-yellow p-3 rounded-xl mt-4 text-white font-bold">Save</button><button onClick={() => setIsCategoryModalOpen(false)} className="w-full mt-2 text-gray-500">Cancel</button></div></div>}
             {isAnnouncementModalOpen && <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl"><h3 className="text-xl font-bold mb-4">{editingAnnouncement ? 'Edit' : 'New'} Post</h3><input className="w-full p-2 border rounded mb-2" value={annFormTitle} onChange={e => setAnnFormTitle(e.target.value)} placeholder="Title"/><button onClick={handleSaveAnnouncement} className="w-full bg-brand-yellow p-3 rounded-xl mt-4 text-white font-bold">Save</button><button onClick={() => setIsAnnouncementModalOpen(false)} className="w-full mt-2 text-gray-500">Cancel</button></div></div>}
        </div>
    );
};

// --- VIEW COMPONENTS ---

const HomeView: React.FC<{ onNavigateToMenu: () => void, announcements: Announcement[] }> = ({ onNavigateToMenu, announcements }) => {
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  return (
  <div className="h-full w-full overflow-y-auto pb-24 md:pb-8 scroll-smooth">
    {/* Header */}
    <div className="bg-sky-100 relative h-64 md:h-80 w-full overflow-hidden shadow-sm shrink-0">
       <img 
          src="https://z-p3-scontent.fpnh18-4.fna.fbcdn.net/v/t39.30808-6/547539350_122129795780913314_3610621525655581649_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeGFxo9L2bhZiGt9Zkc3YgnziUjq8geLEC6JSOryB4sQLsLwjJDjvK7QKZ2N9kpykpyAGhuywUS3H8pbgYGKtekM&_nc_ohc=wbsYXK4xn5MQ7kNvwGrNJ4c&_nc_oc=AdnwYa0vambkkoA1v6YDExPS9WqVCrhqQJEQwVhUr-XjGof3IMsCWrpF7n4_1bgLKxE&_nc_zt=23&_nc_ht=z-p3-scontent.fpnh18-4.fna&_nc_gid=8bP7DyoaLsf2xcpOZLXBXA&oh=00_AfphpFRnVu5ai4ULyYlEFw0NWthuxcrqWwJNpO2CatJVpw&oe=69617185" 
          className="w-full h-full object-cover"
          alt="KAINOR Coffee Branch"
       />
       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/40" />
       
       <div className="absolute bottom-8 left-6 md:left-12 text-white">
           <h2 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">{greeting}</h2>
           <p className="text-white/95 font-medium text-lg drop-shadow-md">Welcome to KAINOR Coffee & Food</p>
       </div>
    </div>

    <div className="px-4 md:px-12 mt-8 md:mt-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-gray-800">Latest News</h3>
        </div>
        
        {announcements.length === 0 ? (
             <div className="text-center py-10 text-gray-400 bg-gray-100 rounded-2xl border-dashed border-2 border-gray-200">
                 <p>No announcements yet.</p>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {announcements.map((ann) => (
                    <div 
                        key={ann.id} 
                        className={`${ann.colorClass} rounded-3xl overflow-hidden shadow-lg relative h-64 flex items-center justify-center group cursor-pointer transition-transform hover:scale-[1.02]`}
                        onClick={onNavigateToMenu}
                    >
                        <img 
                            src={ann.image} 
                            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105" 
                            alt={ann.title} 
                        />
                        <div className="relative z-10 text-center text-white p-6 w-full">
                            <h2 className="text-3xl font-bold mb-2 drop-shadow-md">{ann.title}</h2>
                            <p className="text-xl font-light opacity-90 drop-shadow-sm">{ann.subtitle}</p>
                            {ann.priceTag && (
                                <div className="mt-4 bg-brand-yellow text-brand-dark px-6 py-2 rounded-full font-bold inline-block shadow-lg">
                                    {ann.priceTag}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  </div>
);
};

const MenuView: React.FC<{ activeCategory: string, setActiveCategory: (id: string) => void, onProductClick: (product: Product) => void, menuData: Category[] }> = ({ activeCategory, setActiveCategory, onProductClick, menuData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const isManualScroll = useRef(false);

  const filteredMenu = React.useMemo(() => {
    if (!searchQuery.trim()) return menuData;
    return menuData.map(cat => ({
      ...cat,
      items: cat.items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    })).filter(cat => cat.items.length > 0);
  }, [searchQuery, menuData]);

  const scrollToCategory = (id: string) => {
      isManualScroll.current = true;
      setActiveCategory(id);
      const element = document.getElementById(`category-${id}`);
      const container = containerRef.current;
      
      if (element && container) {
          const topPos = element.offsetTop; 
          container.scrollTo({ top: topPos, behavior: 'smooth' });
          setTimeout(() => { isManualScroll.current = false; }, 800);
      }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
       if (isManualScroll.current) return;
       const triggerLine = container.scrollTop + 100;
       let currentId = activeCategory;
       for (const cat of filteredMenu) {
           const el = document.getElementById(`category-${cat.id}`);
           if (el) {
               const { offsetTop, offsetHeight } = el;
               if (triggerLine >= offsetTop && triggerLine < offsetTop + offsetHeight) {
                   currentId = cat.id;
                   break;
               }
           }
       }
       if (currentId !== activeCategory) {
           setActiveCategory(currentId);
       }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeCategory, filteredMenu]);

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-white z-20 shrink-0 shadow-sm">
           <div className="bg-gray-100 rounded-xl px-4 py-3 flex items-center max-w-2xl mx-auto w-full">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu..."
                className="bg-transparent border-none outline-none ml-2 text-base w-full font-medium text-gray-700 placeholder-gray-400"
              />
              {searchQuery && <button onClick={() => setSearchQuery("")}><X size={16} className="text-gray-400" /></button>}
           </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
          <div className="w-24 md:w-64 bg-gray-50 h-full overflow-y-auto no-scrollbar border-r border-gray-100 flex-shrink-0 pb-24">
              {filteredMenu.map((cat) => {
                  const IconComponent = (LucideIcons as any)[cat.iconName] || LucideIcons.Coffee;
                  const isActive = activeCategory === cat.id;
                  return (
                      <div 
                          key={cat.id}
                          onClick={() => scrollToCategory(cat.id)}
                          className={`flex flex-col md:flex-row md:gap-3 items-center md:px-6 py-4 px-2 cursor-pointer transition-all relative group ${isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                      >
                          {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-yellow" />}
                          <IconComponent size={24} className={`mb-1 md:mb-0 ${isActive ? 'text-brand-yellow' : ''}`} />
                          <span className={`text-[10px] md:text-sm text-center md:text-left font-bold leading-tight ${isActive ? 'text-gray-900' : ''}`}>{cat.name}</span>
                      </div>
                  );
              })}
          </div>

          <div ref={containerRef} className="flex-1 h-full overflow-y-auto scroll-smooth bg-white relative pb-24">
              {filteredMenu.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                   <p>No items found</p>
                </div>
              ) : (
                filteredMenu.map((cat) => {
                    const IconComponent = (LucideIcons as any)[cat.iconName] || LucideIcons.Coffee;
                    return (
                        <div key={cat.id} id={`category-${cat.id}`} className="relative">
                            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-4 py-3 md:px-8 border-b border-gray-50 shadow-sm flex items-center gap-2">
                                <IconComponent size={20} className="text-brand-yellow" />
                                <h2 className="font-bold text-gray-900 uppercase tracking-wide text-lg">{cat.name}</h2>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4 md:p-8">
                                {cat.items.map(item => (
                                    <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">
                                        <MenuItem item={item} onClick={() => onProductClick(item)} className="h-full" />
                                    </div>
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

const CartView: React.FC<{ items: CartItem[], onRemove: (id: string) => void, onCheckout: () => void, onNavigateToMenu: () => void }> = ({ items, onRemove, onCheckout, onNavigateToMenu }) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full pb-20 bg-gray-50">
                <div className="bg-gray-100 p-6 rounded-full mb-4"><ShoppingBag size={48} className="text-gray-300" /></div>
                <h3 className="text-lg font-bold text-gray-800">Your Cart is Empty</h3>
                <button onClick={onNavigateToMenu} className="mt-6 bg-brand-yellow text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-yellow-400 transition-colors">Go to Menu</button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-50 pb-24 md:pb-0 w-full">
             <div className="bg-white p-6 shadow-sm sticky top-0 z-10 border-b border-gray-100">
                 <h1 className="font-bold text-2xl max-w-4xl mx-auto">My Cart</h1>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3">
                 <div className="max-w-4xl mx-auto space-y-4">
                 {items.map(item => (
                     <div key={item.cartId} className="bg-white p-4 rounded-xl flex gap-4 shadow-sm border border-gray-100 items-start">
                         <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                             <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-start">
                                 <div>
                                     <h4 className="font-bold text-gray-800 text-lg line-clamp-1">{item.name}</h4>
                                     <p className="text-sm text-gray-500 mt-1">
                                        <span className="font-bold text-brand-yellow mr-1">{item.quantity}x</span> 
                                        Sugar: {item.customization.sugarLevel}
                                     </p>
                                     {item.note && (
                                         <p className="text-xs text-blue-500 italic mt-1 bg-blue-50 inline-block px-2 py-1 rounded border border-blue-100">
                                            Note: {item.note}
                                         </p>
                                     )}
                                 </div>
                                 <button onClick={() => onRemove(item.cartId)} className="text-gray-300 hover:text-red-500 p-2"><X size={18} /></button>
                             </div>
                             <div className="flex justify-between items-end mt-2">
                                 <span className="font-bold text-lg text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                             </div>
                         </div>
                     </div>
                 ))}
                 </div>
             </div>
             
             <div className="bg-white p-6 border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex justify-between items-center w-full md:w-auto md:gap-8">
                        <span className="text-gray-500 font-medium">Total Amount</span>
                        <span className="text-3xl font-bold text-brand-yellow">${total.toFixed(2)}</span>
                    </div>
                    <button onClick={onCheckout} className="w-full md:w-auto px-12 bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                        CHECKOUT <ChevronRight size={20} />
                    </button>
                </div>
             </div>
        </div>
    );
};

const AccountView = ({ onAdminLogin }: { onAdminLogin: () => void }) => (
  <div className="p-4 bg-white h-full pb-20 flex flex-col items-center pt-10 overflow-y-auto">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        <div className="w-28 h-28 bg-brand-yellow rounded-full p-1 mb-6 shadow-xl shadow-yellow-100">
            <img src="https://picsum.photos/200/200?random=99" className="w-full h-full rounded-full object-cover border-4 border-white" alt="Profile" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Coffee Lover</h2>
        <p className="text-gray-500 mb-8">+855 12 345 678</p>

        <div className="w-full space-y-3">
            <button onClick={onAdminLogin} className="w-full text-left p-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium flex justify-between items-center shadow-lg shadow-gray-200">
                <div className="flex items-center gap-3"><Lock size={20} /> <span>Admin Dashboard</span></div>
                <ChevronRight size={18} />
            </button>
            <div className="h-px bg-gray-100 my-4"></div>
            <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 font-medium flex justify-between items-center text-gray-700">
                <div className="flex items-center gap-3"><User size={20} /> <span>Profile Details</span></div>
                <ChevronRight size={18} className="text-gray-400" />
            </button>
            <button className="w-full text-left p-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 font-medium flex justify-between items-center mt-8">
                <div className="flex items-center gap-3"><LogOut size={20} /> <span>Log Out</span></div>
            </button>
        </div>
      </div>
  </div>
);

// --- MAIN APP ---

const App = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'cart' | 'account'>('home');
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  
  // Data State
  const [menuData, setMenuData] = useState<Category[]>(MENU_DATA);
  const [orders, setOrders] = useState<OrderHistoryItem[]>(MOCK_HISTORY);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  
  // Admin State
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const fetchData = async () => {
    setAppLoading(true);
    try {
        const [catRes, prodRes, annRes, ordRes] = await Promise.all([
            supabase.from('categories').select('*'),
            supabase.from('products').select('*'),
            supabase.from('announcements').select('*'),
            supabase.from('orders').select('*').order('created_at', { ascending: false })
        ]);

        if (catRes.data && prodRes.data) {
            const categories = catRes.data;
            const products = prodRes.data;
            const structuredMenu = categories.map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                iconName: cat.icon_name || 'Coffee',
                items: products.filter((p: any) => p.category_id === cat.id).map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    image: p.image,
                    description: p.description,
                    isBestSeller: p.is_best_seller
                }))
            }));
            if (structuredMenu.length > 0) {
                setMenuData(structuredMenu);
                setActiveCategory(structuredMenu[0].id);
            } else {
                setMenuData(MENU_DATA); // Fallback
                setActiveCategory(MENU_DATA[0].id);
            }
        }
        if (annRes.data && annRes.data.length > 0) {
            setAnnouncements(annRes.data.map((a: any) => ({
                id: a.id, title: a.title, subtitle: a.subtitle, image: a.image, priceTag: a.price_tag, colorClass: a.color_class
            })));
        }
        if (ordRes.data) {
            setOrders(ordRes.data.map((o: any) => ({
                id: o.readable_id || o.id, date: o.created_at, total: o.total, items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items, status: o.status, customerName: o.customer_name, tableNumber: o.table_number
            })));
        }
    } catch (error) {
        console.error("Fetch Error", error);
        setMenuData(MENU_DATA);
        setActiveCategory(MENU_DATA[0].id);
    } finally {
        setAppLoading(false);
    }
  };

  useEffect(() => {
      fetchData();
      const channels = supabase.channel('custom-all-channel').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchData()).subscribe();
      return () => { supabase.removeChannel(channels); }
  }, []);

  const handleAddToCart = (product: Product, quantity: number, customization: any, note?: string) => {
    setCartItems(prev => [...prev, { ...product, cartId: Math.random().toString(36).substr(2, 9), quantity, customization, note }]);
    setSelectedProduct(null);
  };

  const handleRemoveItem = (cartId: string) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const handleConfirmOrder = async () => {
    if (!selectedTable || isProcessingOrder) return;
    setIsProcessingOrder(true);

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Include notes in summary for DB
    const itemsSummary = cartItems.map(item => {
        let text = `${item.quantity}x ${item.name} (${item.customization.sugarLevel})`;
        if(item.note) text += ` [Note: ${item.note}]`;
        return text;
    });
    
    try {
        const { data, error } = await supabase.from('orders').insert({
            total: total,
            status: 'pending',
            customer_name: 'Coffee Lover',
            table_number: selectedTable,
            items: itemsSummary 
        }).select();

        if (error) throw error;
        
        fetchData();

        // --- TELEGRAM NOTIFICATION ---
        const telegramBotToken = '8409323996:AAHHvwR01FBpxAwR47jx4syId5_j3SD-0p4';
        const telegramChatId = '-1003526519769';
        
        const orderId = data[0]?.readable_id || data[0]?.id || 'NEW';
        const itemsList = cartItems.map(item => {
            let line = `- ${item.quantity}x ${item.name} (Sugar: ${item.customization.sugarLevel})`;
            if (item.note) line += `\n  <i>📝 Note: ${item.note}</i>`;
            return line;
        }).join('\n');

        const message = `<b>🔔 New Order Received!</b>\n\n` +
                        `<b>ID:</b> ${orderId}\n` +
                        `<b>Customer:</b> Coffee Lover\n` +
                        `<b>Table:</b> ${selectedTable}\n` +
                        `<b>Total:</b> $${total.toFixed(2)}\n\n` +
                        `<b>Items:</b>\n${itemsList}`;

        fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: telegramChatId, text: message, parse_mode: 'HTML' })
        }).catch(e => console.error("Telegram Error", e));
        // -----------------------------

        setShowCheckoutConfirm(false);
        setShowOrderSuccess(true);
        setCartItems([]);
        setSelectedTable(null);
        
        setTimeout(() => {
            setShowOrderSuccess(false);
            setActiveTab('home');
        }, 4000);

    } catch (error) {
        console.error("Order failed:", error);
        alert("Failed to place order. Please try again.");
    } finally {
        setIsProcessingOrder(false);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (appLoading) return <div className="h-screen w-full flex items-center justify-center bg-gray-50 flex-col gap-4"><Loader2 size={48} className="animate-spin text-brand-yellow" /><p className="text-gray-500 font-medium">Loading Menu...</p></div>;
  if (isAdminLoggedIn) return <AdminDashboard menuData={menuData} refreshData={fetchData} orders={orders} announcements={announcements} onLogout={() => setIsAdminLoggedIn(false)} />;

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-white border-r border-gray-100 z-30 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
         <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center text-brand-dark font-bold text-xl shadow-lg shadow-yellow-200">K</div>
            <div>
                <h1 className="font-bold text-xl tracking-tight text-gray-900 leading-none">KAINOR</h1>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">Coffee & Food</p>
            </div>
         </div>
         <nav className="flex-1 px-6 space-y-2 mt-4">
            {[ {id: 'home', icon: Home, label: 'Home'}, {id: 'menu', icon: Coffee, label: 'Menu'}, {id: 'cart', icon: ShoppingBag, label: 'Cart'}, {id: 'account', icon: User, label: 'Account'} ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 font-medium relative group ${isActive ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                        <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{tab.label}</span>
                        {tab.id === 'cart' && cartCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md shadow-red-200">{cartCount}</span>}
                    </button>
                )
            })}
         </nav>
         <div className="p-6">
             <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                 <img src="https://picsum.photos/200/200?random=99" alt="User" className="w-10 h-10 rounded-full object-cover" />
                 <div className="overflow-hidden">
                     <p className="text-sm font-bold truncate text-gray-900">Coffee Lover</p>
                     <p className="text-xs text-gray-400 truncate">Member</p>
                 </div>
             </div>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-gray-50">
        {activeTab === 'home' && <HomeView onNavigateToMenu={() => setActiveTab('menu')} announcements={announcements} />}
        {activeTab === 'menu' && <MenuView activeCategory={activeCategory} setActiveCategory={setActiveCategory} onProductClick={setSelectedProduct} menuData={menuData} />}
        {activeTab === 'cart' && <CartView items={cartItems} onRemove={handleRemoveItem} onCheckout={() => setShowCheckoutConfirm(true)} onNavigateToMenu={() => setActiveTab('menu')} />}
        {activeTab === 'account' && <AccountView onAdminLogin={() => setShowAdminLogin(true)} />}
      </main>

      {/* Admin Login Modal */}
      {showAdminLogin && <AdminLogin onLogin={() => { setIsAdminLoggedIn(true); setShowAdminLogin(false); }} onCancel={() => setShowAdminLogin(false)} />}

      {/* Product Detail Overlay */}
      {selectedProduct && <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden">
           <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-2xl shadow-black/10 p-2 relative overflow-hidden flex justify-between items-center px-6">
               {[ {id: 'home', icon: Home}, {id: 'menu', icon: Coffee}, {id: 'cart', icon: ShoppingBag, count: cartCount}, {id: 'account', icon: User} ].map((tab) => {
                   const isActive = activeTab === tab.id;
                   return (
                       <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`relative p-4 rounded-full transition-all duration-300 ${isActive ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>
                           <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                           {tab.count !== undefined && tab.count > 0 && <span className="absolute top-2 right-2 bg-red-500 w-3 h-3 rounded-full border-2 border-white"></span>}
                       </button>
                   );
               })}
           </div>
      </div>

      {/* Checkout Confirm Modal */}
      {showCheckoutConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-brand-yellow/20 text-yellow-600 rounded-full flex items-center justify-center mb-4 mx-auto"><ShoppingBag size={32} /></div>
                    <h2 className="text-2xl font-bold text-gray-900">Confirm Order</h2>
                </div>
                <div className="mb-6">
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Select Table Number <span className="text-red-500">*</span></h3>
                    <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <button key={num} onClick={() => setSelectedTable(num)} className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 ${selectedTable === num ? 'bg-brand-yellow text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{num}</button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowCheckoutConfirm(false)} className="flex-1 py-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                    <button onClick={handleConfirmOrder} disabled={!selectedTable || isProcessingOrder} className={`flex-1 py-4 rounded-xl font-bold text-white transition-colors shadow-lg flex items-center justify-center gap-2 ${selectedTable && !isProcessingOrder ? 'bg-gray-900 hover:bg-gray-800 shadow-gray-300' : 'bg-gray-300 cursor-not-allowed'}`}>
                         {isProcessingOrder ? <Loader2 size={20} className="animate-spin" /> : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Success Modal */}
      {showOrderSuccess && (
        <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center p-6 bg-white animate-in fade-in duration-300 text-center">
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300"><Check size={48} strokeWidth={3} /></div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Thank You!</h2>
            <p className="text-gray-500 max-w-xs mb-4 text-lg">Your order has been sent to the kitchen.</p>
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 mb-6 max-w-sm"><p className="text-yellow-800 font-medium">Please be patient while we prepare your delicious drinks!</p></div>
            <p className="font-bold text-2xl text-brand-yellow">Table {selectedTable}</p>
        </div>
      )}
    </div>
  );
};

export default App;