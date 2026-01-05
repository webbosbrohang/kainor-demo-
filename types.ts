
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  isBestSeller?: boolean;
}

export interface Category {
  id: string;
  name: string;
  iconName: string; // Used to map to Lucide icons
  items: Product[];
}

export interface Announcement {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  priceTag?: string; // Optional price or tag text
  colorClass: string; // e.g., 'bg-amber-900'
}

export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';

export interface OrderHistoryItem {
  id: string;
  date: string;
  total: number;
  items: string[];
  status: OrderStatus;
  customerName?: string;
  tableNumber?: number;
}
