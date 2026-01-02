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

export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';

export interface OrderHistoryItem {
  id: string;
  date: string;
  total: number;
  items: string[];
  status: OrderStatus;
  customerName?: string;
}
