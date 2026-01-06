import React, { useState, useRef, useEffect } from 'react';
import { Home, Coffee, User, MapPin, Search, ShoppingBag, Minus, Plus, X, Check, Lock, LayoutDashboard, Package, ListChecks, LogOut, Edit2, Trash2, Save, Image as ImageIcon, Loader2, Grid, Megaphone, RotateCw, UploadCloud } from 'lucide-react';
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
                
                // Try upload
                let { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, prodImageFile);

                // If bucket not found, try to create it (best effort)
                if (uploadError && (uploadError.message.includes("Bucket not found") || (uploadError as any).error === 'Bucket not found' || (uploadError as any).statusCode === '404')) {
                     console.log("Bucket 'products' not found. Attempting to create...");
                     const { error: createBucketError } = await supabase.storage.createBucket('products', {
                        public: true
                     });
                     
                     if (!createBucketError) {
                         // Retry upload if bucket creation succeeded
                         const retry = await supabase.storage.from('products').upload(filePath, prodImageFile);
                         uploadError = retry.error;
                     } else {
                         console.error("Failed to create bucket automatically:", createBucketError);
                     }
                }

                if (uploadError) {
                    console.error("Upload Error:", uploadError);
                    alert(`Failed to upload image: ${uploadError.message}\n\nIf the error is "Bucket not found", please manually create a public storage bucket named 'products' in your Supabase dashboard, as the API key may not have permissions to create it.`);
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
            alert("Failed to save product. Please check console.");
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
        if (!window.confirm("Delete this category? All items in it will also be deleted (cascade) or orphaned.")) return;
        setLoading(true);
        try {
             await supabase.from('categories').delete().eq('id', catId);
             await refreshData();
        } catch (error) {
             console.error("Error deleting category:", error);
             alert("Failed to delete category. It might not be empty.");
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
                        {/* Chart Section */}
                         <HistoryChart orders={orders} />

                        {/* Orders Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {orders.length === 0 && <div className="col-span-full text-center p-10 text-gray-400">No orders found.</div>}
                            {orders.map(order => (
                                <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900 line-clamp-1 text-xs" title={order.id}>{order.id}</span>
                                                <span className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-600 mt-1">{order.customerName || 'Walk-in'} {order.tableNumber && <span className="text-brand-yellow bg-yellow-50 px-2 py-0.5 rounded-full ml-2 border border-yellow-100">T-{order.tableNumber}</span>}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusColors[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="border-t border-b border-gray-50 py-3 my-3 space-y-1 flex-1">
                                        {order.items.map((item, idx) => (
                                            <p key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                                {item}
                                            </p>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                        <span className="font-bold text-lg text-brand-yellow">${order.total.toFixed(2)}</span>
                                        <div className="flex gap-2">
                                            {order.status !== 'completed' && order.status !== 'cancelled' && (
                                                <>
                                                    {order.status === 'pending' && <button onClick={() => handleUpdateOrderStatus(order.id, 'preparing')} className="btn-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded text-xs font-bold">Prepare</button>}
                                                    <button onClick={() => handleUpdateOrderStatus(order.id, 'completed')} className="btn-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded text-xs font-bold">Done</button>
                                                </>
                                            )}
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
                        <button onClick={() => openProductModal()} className="w-full md:w-auto px-6 py-3 mb-4 bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-700">
                            <Plus size={20} /> Add Product
                        </button>
                        <div className="space-y-6">
                            {menuData.map(cat => (
                                <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-brand-yellow"></div>
                                        <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">{cat.name}</h3>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {cat.items.length === 0 && <p className="p-4 text-sm text-gray-400 text-center">No items in this category.</p>}
                                        {cat.items.map(item => (
                                            <div key={item.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                                    <div>
                                                        <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                                                        <p className="text-xs text-brand-yellow font-bold">${item.price.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => openProductModal(item, cat.id)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDeleteProduct(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                                </div>
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
                        <button onClick={() => openCategoryModal()} className="w-full md:w-auto px-6 py-3 mb-4 bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-700">
                            <Plus size={20} /> Add Category
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {menuData.map(cat => {
                                const Icon = (LucideIcons as any)[cat.iconName] || LucideIcons.Circle;
                                return (
                                    <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-brand-yellow/10 rounded-lg text-brand-yellow">
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800">{cat.name}</h3>
                                                <p className="text-xs text-gray-400">{cat.items.length} items</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => openCategoryModal(cat)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'announcements' && (
                    <div className="animate-in fade-in">
                        <button onClick={() => openAnnouncementModal()} className="w-full md:w-auto px-6 py-3 mb-4 bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-700">
                            <Plus size={20} /> New Post
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {announcements.map(ann => (
                                <div key={ann.id} className={`${ann.colorClass} rounded-2xl overflow-hidden shadow-lg relative h-64 group`}>
                                    <img src={ann.image} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" alt="Promo" />
                                    <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                                        <div className="text-white">
                                            <h2 className="text-2xl font-bold mb-1">{ann.title}</h2>
                                            <p className="text-lg font-light opacity-90">{ann.subtitle}</p>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            {ann.priceTag && (
                                                <span className="bg-brand-yellow text-brand-dark px-4 py-1.5 rounded-full font-bold shadow-lg text-sm">
                                                    {ann.priceTag}
                                                </span>
                                            )}
                                            <div className="flex gap-2 bg-white/20 backdrop-blur-md p-1 rounded-lg">
                                                <button onClick={() => openAnnouncementModal(ann)} className="p-2 text-white hover:bg-white/20 rounded"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDeleteAnnouncement(ann.id)} className="p-2 text-white hover:bg-red-500/50 rounded"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODALS --- */}

            {/* Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                            <button onClick={() => setIsProductModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="e.g. Iced Latte" value={prodFormName} onChange={e => setProdFormName(e.target.value)} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                    <input type="number" className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="0.00" value={prodFormPrice} onChange={e => setProdFormPrice(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select className="w-full p-3 bg-gray-50 rounded-xl border" value={prodFormCategory} onChange={e => setProdFormCategory(e.target.value)}>
                                        {menuData.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                                <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center gap-3">
                                    {prodImagePreview || prodFormImage ? (
                                        <div className="w-24 h-24 rounded-lg overflow-hidden relative shadow-md bg-white">
                                            <img src={prodImagePreview || prodFormImage} alt="Preview" className="w-full h-full object-cover" />
                                            {prodImageFile && (
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">New File</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                    
                                    <div className="flex flex-col items-center w-full">
                                        <label htmlFor="file-upload" className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded-lg text-sm inline-flex items-center gap-2 mb-2 shadow-sm">
                                            <UploadCloud size={16} />
                                            <span>{prodImageFile ? 'Change File' : 'Upload Image'}</span>
                                        </label>
                                        <input 
                                            id="file-upload" 
                                            type="file" 
                                            accept="image/*"
                                            className="hidden" 
                                            onChange={handleFileChange}
                                        />
                                        <p className="text-xs text-gray-400">or paste URL below</p>
                                    </div>
                                    
                                    <div className="w-full flex gap-2">
                                        <input 
                                            type="text" 
                                            className="flex-1 p-2 bg-white rounded-lg border text-sm" 
                                            placeholder="https://..." 
                                            value={prodFormImage} 
                                            onChange={e => {
                                                setProdFormImage(e.target.value);
                                                if(!prodImageFile) setProdImagePreview("");
                                            }} 
                                        />
                                        <button onClick={() => {
                                            const randomUrl = `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`;
                                            setProdFormImage(randomUrl);
                                            setProdImageFile(null);
                                            setProdImagePreview("");
                                        }} className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300" title="Random Image">
                                            <RotateCw size={18} className="text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleSaveProduct} className="w-full mt-6 bg-brand-yellow text-white font-bold py-3 rounded-xl shadow-lg hover:bg-yellow-400 transition-colors">Save Product</button>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                            <button onClick={() => setIsCategoryModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="Category Name" value={catFormName} onChange={e => setCatFormName(e.target.value)} />
                            <div>
                                <label className="text-sm text-gray-500 mb-1 block">Icon Name (Lucide React)</label>
                                <select className="w-full p-3 bg-gray-50 rounded-xl border" value={catFormIcon} onChange={e => setCatFormIcon(e.target.value)}>
                                    <option value="Coffee">Coffee</option>
                                    <option value="CupSoda">CupSoda</option>
                                    <option value="IceCream">IceCream</option>
                                    <option value="Croissant">Croissant</option>
                                    <option value="Star">Star</option>
                                    <option value="Utensils">Utensils</option>
                                    <option value="Pizza">Pizza</option>
                                    <option value="Beer">Beer</option>
                                    <option value="Wine">Wine</option>
                                    <option value="Sandwich">Sandwich</option>
                                    <option value="Cake">Cake</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={handleSaveCategory} className="w-full mt-6 bg-brand-yellow text-white font-bold py-3 rounded-xl">Save Category</button>
                    </div>
                </div>
            )}

            {/* Announcement Modal */}
            {isAnnouncementModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editingAnnouncement ? 'Edit Post' : 'New Post'}</h3>
                            <button onClick={() => setIsAnnouncementModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="Title (e.g. Summer Sale)" value={annFormTitle} onChange={e => setAnnFormTitle(e.target.value)} />
                            <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="Subtitle" value={annFormSubtitle} onChange={e => setAnnFormSubtitle(e.target.value)} />
                            <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border" placeholder="Price/Tag (e.g. 50% OFF)" value={annFormPrice} onChange={e => setAnnFormPrice(e.target.value)} />
                            
                            <div className="flex gap-2">
                                <input type="text" className="flex-1 p-3 bg-gray-50 rounded-xl border text-sm" placeholder="Image URL" value={annFormImage} onChange={e => setAnnFormImage(e.target.value)} />
                                <button onClick={() => setAnnFormImage(`https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`)} className="p-3 bg-gray-100 rounded-xl"><ImageIcon size={20} /></button>
                            </div>
                            
                            <div>
                                <label className="text-sm text-gray-500 mb-1 block">Background Theme</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['bg-amber-900', 'bg-emerald-900', 'bg-blue-900', 'bg-red-900', 'bg-gray-800', 'bg-purple-900', 'bg-pink-900', 'bg-indigo-900'].map(color => (
                                        <button 
                                            key={color} 
                                            onClick={() => setAnnFormColor(color)}
                                            className={`h-10 rounded-lg border-2 ${color} ${annFormColor === color ? 'border-brand-yellow scale-110' : 'border-transparent'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={handleSaveAnnouncement} className="w-full mt-6 bg-brand-yellow text-white font-bold py-3 rounded-xl">Save Post</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-components ---

// HomeView, MenuView, AccountView, CartView, ProductDetail (imported)
// No changes needed for these presentation components, except data passed to them.

interface HomeViewProps {
  onNavigateToMenu: () => void;
  announcements: Announcement[];
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigateToMenu, announcements }) => {
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  return (
  <div className="h-full w-full overflow-y-auto pb-24 md:pb-8 scroll-smooth">
    {/* Header */}
    <div className="bg-sky-100 relative h-64 md:h-96 w-full overflow-hidden md:rounded-b-3xl shadow-sm shrink-0">
       <img 
          src="https://z-p3-scontent.fpnh18-4.fna.fbcdn.net/v/t39.30808-6/547539350_122129795780913314_3610621525655581649_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeGFxo9L2bhZiGt9Zkc3YgnziUjq8geLEC6JSOryB4sQLsLwjJDjvK7QKZ2N9kpykpyAGhuywUS3H8pbgYGKtekM&_nc_ohc=wbsYXK4xn5MQ7kNvwGrNJ4c&_nc_oc=AdnwYa0vambkkoA1v6YDExPS9WqVCrhqQJEQwVhUr-XjGof3IMsCWrpF7n4_1bgLKxE&_nc_zt=23&_nc_ht=z-p3-scontent.fpnh18-4.fna&_nc_gid=8bP7DyoaLsf2xcpOZLXBXA&oh=00_AfphpFRnVu5ai4ULyYlEFw0NWthuxcrqWwJNpO2CatJVpw&oe=69617185" 
          className="w-full h-full object-cover"
          alt="KAINOR Coffee Branch"
       />
       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/30" />
       
       <div className="absolute top-4 left-4 right-4 flex justify-between items-start md:max-w-7xl md:mx-auto">
           <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 text-sm font-semibold shadow-sm cursor-pointer">
               <MapPin size={14} className="text-brand-yellow" />
               <span>Serei Saophoan</span>
               <LucideIcons.ChevronDown size={14} />
           </div>
       </div>
       
       <div className="absolute bottom-6 left-6 md:left-12 text-white">
           <h2 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">{greeting}</h2>
           <p className="text-white/95 font-medium text-lg drop-shadow-md">Welcome to KAINOR Coffee & Food</p>
       </div>
    </div>

    <div className="px-4 md:px-12 mt-8 md:mt-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-gray-800">Latest News</h3>
            <span className="text-brand-yellow text-sm font-semibold cursor-pointer hover:underline">See All</span>
        </div>
        
        {/* Dynamic Grid of Announcements */}
        {announcements.length === 0 ? (
             <div className="text-center py-10 text-gray-400 bg-gray-100 rounded-2xl border-dashed border-2 border-gray-200">
                 <p>No announcements yet.</p>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {announcements.map((ann) => (
                    <div 
                        key={ann.id} 
                        className={`${ann.colorClass} rounded-3xl overflow-hidden shadow-lg relative h-64 md:h-72 flex items-center justify-center group cursor-pointer`}
                        onClick={onNavigateToMenu}
                    >
                        <img 
                            src={ann.image} 
                            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105" 
                            alt={ann.title} 
                        />
                        <div className="relative z-10 text-center text-white p-6 w-full">
                            <h2 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-md">{ann.title}</h2>
                            <p className="text-xl md:text-2xl font-light opacity-90 drop-shadow-sm">{ann.subtitle}</p>
                            {ann.priceTag && (
                                <div className="mt-4 bg-brand-yellow text-brand-dark px-6 py-2 rounded-full font-bold inline-block shadow-lg hover:bg-yellow-400 transition-colors">
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

// Reuse MenuView, CartView, AccountView from previous iteration
// (Assuming they are available in scope or defined below)

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

  const filteredMenu = React.useMemo(() => {
    if (!searchQuery.trim()) return menuData;
    
    return menuData.map(cat => ({
      ...cat,
      items: cat.items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(cat => cat.items.length > 0);
  }, [searchQuery, menuData]);

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
    <div className="h-full flex flex-col bg-white">
      {/* Top Bar with Search */}
      <div className="px-4 pt-4 pb-2 bg-white flex flex-col shadow-sm z-20 relative md:px-8">
          <div className="flex items-center gap-2 mb-2 max-w-7xl mx-auto w-full">
               
               {/* Search Bar */}
               <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center max-w-xl mx-auto">
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
               <div className="w-20 hidden md:block"></div>
          </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Categories */}
          <div className="w-1/4 md:w-64 bg-gray-50 h-full overflow-y-auto no-scrollbar py-2 border-r border-gray-100">
              {filteredMenu.map((cat) => {
                  const IconComponent = (LucideIcons as any)[cat.iconName] || LucideIcons.Coffee;
                  const isActive = activeCategory === cat.id;

                  return (
                      <div 
                          key={cat.id}
                          id={`sidebar-cat-${cat.id}`}
                          onClick={() => scrollToCategory(cat.id)}
                          className={`flex flex-col md:flex-row md:gap-3 items-center md:px-6 py-6 md:py-4 px-1 cursor-pointer transition-colors relative ${isActive ? 'bg-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'}`}
                      >
                          {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-brand-yellow rounded-r-md" />
                          )}
                          <IconComponent 
                              size={24} 
                              className={`mb-2 md:mb-0 ${isActive ? 'text-gray-900' : 'opacity-70'}`} 
                              strokeWidth={isActive ? 2.5 : 1.5}
                          />
                          <span className={`text-[10px] md:text-sm text-center md:text-left font-semibold leading-tight ${isActive ? 'text-gray-900' : ''}`}>
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
              className="flex-1 h-full overflow-y-auto px-4 md:px-8 pb-24 md:pb-8 scroll-smooth bg-white relative"
          >
              <div className="max-w-6xl mx-auto">
              {filteredMenu.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 pt-20">
                  <Search size={48} className="mb-4 opacity-20" />
                  <p>No items found</p>
                </div>
              ) : (
                filteredMenu.map((cat) => {
                    const IconComponent = (LucideIcons as any)[cat.iconName] || LucideIcons.Coffee;
                    return (
                        <div key={cat.id} id={`category-${cat.id}`} className="mb-6">
                            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-4 mb-4 flex items-center gap-2 border-b border-gray-100 -mx-4 px-4 md:-mx-8 md:px-8 shadow-sm">
                                <IconComponent size={20} className="text-brand-yellow" />
                                <h2 className="font-bold text-gray-900 uppercase tracking-wide text-lg">{cat.name}</h2>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 pt-1">
                                {cat.items.map(item => (
                                    <div key={item.id} className="md:bg-white md:border md:border-gray-100 md:rounded-2xl md:p-3 md:shadow-sm md:hover:shadow-md md:transition-all">
                                        <MenuItem 
                                          item={item} 
                                          onClick={() => onProductClick(item)}
                                          className="py-4 border-b border-gray-50 md:border-none md:py-0 md:h-full"
                                        />
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
    </div>
  );
};

const AccountView = ({ onAdminLogin }: { onAdminLogin: () => void }) => (
  <div className="p-4 bg-white h-full pb-20 flex flex-col items-center pt-10 overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-24 h-24 bg-brand-yellow rounded-full p-1 mb-4">
            <img src="https://picsum.photos/200/200?random=99" className="w-full h-full rounded-full object-cover border-4 border-white" alt="Profile" />
        </div>
        <h2 className="text-2xl font-bold">Coffee Lover</h2>
        <p className="text-gray-500 mb-8">+855 12 345 678</p>

        <div className="w-full grid gap-2">
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
  </div>
);

interface CartViewProps {
  items: CartItem[];
  onUpdateQuantity: (cartId: string, newQty: number) => void;
  onRemove: (cartId: string) => void;
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
        <div className="h-full flex flex-col bg-gray-50 pb-24 md:pb-0 w-full">
             <div className="bg-white p-4 shadow-sm sticky top-0 z-10 text-center md:text-left md:px-8 border-b border-gray-100">
                 <h1 className="font-bold text-lg md:text-2xl max-w-4xl mx-auto">My Cart</h1>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3">
                 <div className="max-w-4xl mx-auto space-y-3">
                 {items.map(item => (
                     <div key={item.cartId} className="bg-white p-3 rounded-xl flex gap-3 shadow-sm border border-gray-100 md:p-4">
                         <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 md:w-24 md:h-24">
                             <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 flex flex-col justify-between py-1">
                             <div className="flex justify-between items-start">
                                 <div>
                                     <h4 className="font-bold text-gray-800 text-sm md:text-lg line-clamp-1">{item.name}</h4>
                                     <p className="text-xs text-gray-500 mt-1 font-medium bg-gray-50 inline-block px-2 py-1 rounded text-brand-dark/70">
                                       Sugar: {item.customization.sugarLevel}
                                     </p>
                                 </div>
                                 <button onClick={() => onRemove(item.cartId)} className="text-gray-300 hover:text-red-500 p-1">
                                     <X size={16} />
                                 </button>
                             </div>
                             <div className="flex justify-between items-end mt-2">
                                 <span className="font-bold text-brand-yellow md:text-lg">${(item.price * item.quantity).toFixed(2)}</span>
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
             </div>
             
             <div className="bg-white p-6 border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-t-3xl md:rounded-none md:shadow-none md:border-t">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 font-medium">Total</span>
                        <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
                    </div>
                    <button onClick={onCheckout} className="w-full bg-brand-yellow text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-200 hover:bg-yellow-400 transition-colors md:w-auto md:px-12 md:float-right">
                        CHECKOUT
                    </button>
                </div>
             </div>
        </div>
    );
};

// --- Main App ---

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
  const [menuData, setMenuData] = useState<Category[]>([]);
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  // Admin State
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // --- Fetch Data ---
  const fetchData = async () => {
    setAppLoading(true);
    try {
        // Attempt to fetch from Supabase
        const [catRes, prodRes, annRes, ordRes] = await Promise.all([
            supabase.from('categories').select('*'),
            supabase.from('products').select('*'),
            supabase.from('announcements').select('*'),
            supabase.from('orders').select('*').order('created_at', { ascending: false })
        ]);

        // 1. Handle Menu Data (Categories & Products)
        if (catRes.error || prodRes.error) {
            console.warn("Using mock menu data due to Supabase error:", catRes.error || prodRes.error);
            setMenuData(MENU_DATA);
            if (MENU_DATA.length > 0) setActiveCategory(MENU_DATA[0].id);
        } else {
            const categories = catRes.data || [];
            const products = prodRes.data || [];

            if (categories.length === 0) {
                 // Fallback to Mocks if categories are empty to ensure UI looks good.
                 console.warn("Supabase returned empty categories, using mock data.");
                 setMenuData(MENU_DATA);
                 if (MENU_DATA.length > 0) setActiveCategory(MENU_DATA[0].id);
            } else {
                const structuredMenu: Category[] = categories.map((cat: any) => ({
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
                setMenuData(structuredMenu);
                if (structuredMenu.length > 0) setActiveCategory(structuredMenu[0].id);
            }
        }

        // 2. Handle Announcements
        if (annRes.error) {
            console.warn("Using mock announcements due to Supabase error:", annRes.error);
            setAnnouncements(INITIAL_ANNOUNCEMENTS);
        } else {
             if (annRes.data && annRes.data.length > 0) {
                 setAnnouncements(annRes.data.map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    subtitle: a.subtitle,
                    image: a.image,
                    priceTag: a.price_tag,
                    colorClass: a.color_class
                })));
             } else {
                 setAnnouncements([]); 
             }
        }

        // 3. Handle Orders
        if (ordRes.error) {
            console.warn("Using mock orders due to Supabase error:", ordRes.error);
            setOrders(MOCK_HISTORY);
        } else {
             if (ordRes.data) {
                setOrders(ordRes.data.map((o: any) => ({
                    id: o.readable_id || o.id,
                    date: o.created_at,
                    total: o.total,
                    items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
                    status: o.status,
                    customerName: o.customer_name,
                    tableNumber: o.table_number
                })));
             }
        }

    } catch (error) {
        console.error("Critical error in fetchData, falling back to mocks:", error);
        setMenuData(MENU_DATA);
        setActiveCategory(MENU_DATA[0]?.id || "");
        setAnnouncements(INITIAL_ANNOUNCEMENTS);
        setOrders(MOCK_HISTORY);
    } finally {
        setAppLoading(false);
    }
  };

  useEffect(() => {
      fetchData();
  }, []);

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
    if (!selectedTable || isProcessingOrder) return;
    setIsProcessingOrder(true);

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Simple item summary for DB
    const itemsSummary = cartItems.map(item => `${item.quantity}x ${item.name} (${item.customization.sugarLevel})`);
    
    try {
        const { data, error } = await supabase.from('orders').insert({
            total: total,
            status: 'pending',
            customer_name: 'Coffee Lover', // hardcoded for user for now
            table_number: selectedTable,
            items: itemsSummary // storing as array of strings
        }).select();

        if (error) throw error;
        
        // Refresh orders if admin is looking, or just for local history if we had one
        // For now, re-fetch data to be sure
        fetchData();

        // --- TELEGRAM NOTIFICATION LOGIC ---
        const telegramBotToken = '8409323996:AAHHvwR01FBpxAwR47jx4syId5_j3SD-0p4';
        const telegramChatId = '-5200077567';
        
        const orderId = data[0]?.readable_id || data[0]?.id || 'NEW';
        const itemsList = cartItems.map(item => 
            `- ${item.quantity}x ${item.name} (Sugar: ${item.customization.sugarLevel})`
        ).join('\n');

        const message = `<b>🔔 New Order Received!</b>\n\n` +
                        `<b>ID:</b> ${orderId}\n` +
                        `<b>Customer:</b> Coffee Lover\n` +
                        `<b>Table:</b> ${selectedTable}\n` +
                        `<b>Total:</b> $${total.toFixed(2)}\n\n` +
                        `<b>Items:</b>\n${itemsList}`;

        fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: telegramChatId,
                text: message,
                parse_mode: 'HTML'
            })
        }).catch(e => console.error("Telegram Error", e));
        // -----------------------------------

        setShowCheckoutConfirm(false);
        setShowOrderSuccess(true);
        setCartItems([]);
        setSelectedTable(null);
        
        setTimeout(() => {
            setShowOrderSuccess(false);
            setActiveTab('home');
        }, 2500);

    } catch (error) {
        console.error("Order failed:", error);
        alert("Failed to place order. Please try again.");
    } finally {
        setIsProcessingOrder(false);
    }
  };

  const tabs: ('home' | 'menu' | 'cart' | 'account')[] = ['home', 'menu', 'cart', 'account'];
  const activeIndex = tabs.indexOf(activeTab);

  if (appLoading) {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-gray-50 flex-col gap-4">
              <Loader2 size={48} className="animate-spin text-brand-yellow" />
              <p className="text-gray-500 font-medium">Loading Menu...</p>
          </div>
      );
  }

  // Admin Flow
  if (isAdminLoggedIn) {
      return (
          <AdminDashboard 
            menuData={menuData} 
            refreshData={fetchData}
            orders={orders}
            announcements={announcements}
            onLogout={() => setIsAdminLoggedIn(false)} 
          />
      );
  }

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200 z-30 shrink-0">
         <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-yellow-200">K</div>
            <h1 className="font-bold text-xl tracking-tight text-gray-900">KAINOR</h1>
         </div>
         <nav className="flex-1 px-4 space-y-2 mt-4">
            {tabs.map(tab => {
                const isActive = activeTab === tab;
                let Icon, label;
                switch(tab) {
                   case 'home': Icon = Home; label = "Home"; break;
                   case 'menu': Icon = Coffee; label = "Menu"; break;
                   case 'cart': Icon = ShoppingBag; label = "Cart"; break;
                   case 'account': Icon = User; label = "Account"; break;
                   default: Icon = Home; label = ""; 
                }
                return (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                            isActive 
                                ? 'bg-brand-yellow text-white shadow-lg shadow-yellow-100' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{label}</span>
                        {tab === 'cart' && cartCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </button>
                )
            })}
         </nav>
         <div className="p-4 border-t border-gray-100">
             <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
                 <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                     <img src="https://picsum.photos/200/200?random=99" alt="User" />
                 </div>
                 <div className="overflow-hidden">
                     <p className="text-sm font-bold truncate">Coffee Lover</p>
                     <p className="text-xs text-gray-400 truncate">+855 12 345 678</p>
                 </div>
             </div>
         </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        {activeTab === 'home' && <HomeView onNavigateToMenu={() => setActiveTab('menu')} announcements={announcements} />}
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

      {/* Product Detail Overlay (Handles its own responsive layout internally) */}
      {selectedProduct && (
        <ProductDetail 
          product={selectedProduct} 
          onBack={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Mobile Bottom Navigation (Hidden on Desktop) */}
      {!selectedProduct && (
        <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden">
           <div className="bg-white/80 backdrop-blur-3xl border border-white/50 rounded-[2rem] shadow-2xl shadow-black/5 p-2 relative overflow-hidden max-w-md mx-auto">
               {/* Sliding Indicator */}
               <div 
                 className="absolute top-2 bottom-2 left-2 w-[calc(25%-4px)] bg-brand-yellow rounded-[1.5rem] shadow-lg shadow-yellow-200/50 z-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                 style={{ transform: `translateX(${activeIndex * 100}%)` }}
               />
               
               {/* Nav Items */}
               <div className="relative z-10 grid grid-cols-4 w-full">
                   {tabs.map((tab) => {
                       const isActive = activeTab === tab;
                       let Icon, count;
                       
                       switch(tab) {
                           case 'home': Icon = Home; break;
                           case 'menu': Icon = Coffee; break;
                           case 'cart': Icon = ShoppingBag; count = cartCount; break;
                           case 'account': Icon = User; break;
                           default: Icon = Home;
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
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="flex flex-col items-center text-center mb-4 shrink-0">
                    <div className="w-16 h-16 bg-brand-yellow/20 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Confirm Order</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Please review your order before confirming.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
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

                {/* Table Selection */}
                <div className="mb-6 shrink-0">
                    <h3 className="font-bold text-gray-800 mb-2 text-sm">Select Table Number <span className="text-red-500">*</span></h3>
                    <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <button
                                key={num}
                                onClick={() => setSelectedTable(num)}
                                className={`py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                                    selectedTable === num
                                        ? 'bg-brand-yellow text-white shadow-md scale-105'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                    {!selectedTable && <p className="text-xs text-red-400 mt-2 text-center">Please select a table to proceed</p>}
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
                        disabled={!selectedTable || isProcessingOrder}
                        className={`flex-1 py-3 rounded-xl font-bold text-white transition-colors shadow-lg flex items-center justify-center gap-2 ${
                            selectedTable && !isProcessingOrder
                                ? 'bg-brand-yellow hover:bg-yellow-400 shadow-yellow-200 cursor-pointer' 
                                : 'bg-gray-300 cursor-not-allowed shadow-gray-200'
                        }`}
                    >
                         {isProcessingOrder ? (
                             <>
                                <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing...</span>
                             </>
                        ) : 'Confirm'}
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
            <p className="text-gray-500 text-center max-w-xs mb-1">
                Your order has been sent to the kitchen.
            </p>
            <p className="font-bold text-brand-yellow">Table {selectedTable}</p>
        </div>
      )}

    </div>
  );
};

export default App;