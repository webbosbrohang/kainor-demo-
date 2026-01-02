import { Category, OrderHistoryItem } from './types';

export const MENU_DATA: Category[] = [
  {
    id: 'best-sellers',
    name: 'Best Sellers',
    iconName: 'Star',
    items: [
      { id: '1', name: 'Coconut Cream Latte', price: 2.43, image: 'https://picsum.photos/200/200?random=1', isBestSeller: true },
      { id: '2', name: 'Iced Thnol Coffee', price: 2.43, image: 'https://picsum.photos/200/200?random=2' },
      { id: '3', name: 'Fresh Passion Juice', price: 2.43, image: 'https://picsum.photos/200/200?random=3' },
    ]
  },
  {
    id: 'signature',
    name: 'Signature',
    iconName: 'Coffee',
    items: [
      { id: '4', name: 'Iced Thnol Coffee', price: 2.43, image: 'https://picsum.photos/200/200?random=4' },
      { id: '5', name: 'KAINOR Signature Blend', price: 2.80, image: 'https://picsum.photos/200/200?random=5' },
    ]
  },
  {
    id: 'iced-coffee',
    name: 'Iced Coffee',
    iconName: 'CupSoda',
    items: [
      { id: '6', name: 'Iced Americano', price: 2.07, image: 'https://picsum.photos/200/200?random=6' },
      { id: '7', name: 'Coconut Cream Latte', price: 2.43, image: 'https://picsum.photos/200/200?random=7' },
      { id: '8', name: 'Iced Latte', price: 2.43, image: 'https://picsum.photos/200/200?random=8' },
      { id: '9', name: 'Iced Mocha', price: 2.60, image: 'https://picsum.photos/200/200?random=9' },
    ]
  },
  {
    id: 'hot-coffee',
    name: 'Hot Coffee',
    iconName: 'Coffee',
    items: [
      { id: '10', name: 'Hot Matcha Latte', price: 2.43, image: 'https://picsum.photos/200/200?random=10' },
      { id: '11', name: 'Hot Americano', price: 2.07, image: 'https://picsum.photos/200/200?random=11' },
      { id: '12', name: 'Hot Latte', price: 2.43, image: 'https://picsum.photos/200/200?random=12' },
      { id: '13', name: 'Hot Cappuccino', price: 2.43, image: 'https://picsum.photos/200/200?random=13' },
      { id: '14', name: 'Hot Thnol Coffee', price: 2.43, image: 'https://picsum.photos/200/200?random=14' },
      { id: '15', name: 'Hot Mocha', price: 2.43, image: 'https://picsum.photos/200/200?random=15' },
      { id: '16', name: 'Hot Caramel Latte', price: 2.80, image: 'https://picsum.photos/200/200?random=16' },
      { id: '17', name: 'Hot Vanilla Latte', price: 2.80, image: 'https://picsum.photos/200/200?random=17' },
    ]
  },
  {
    id: 'frappe',
    name: 'Frappe',
    iconName: 'IceCream', // Closest match
    items: [
      { id: '18', name: 'Vanilla Frappe', price: 2.99, image: 'https://picsum.photos/200/200?random=18' },
      { id: '19', name: 'Chocolate Frappe', price: 2.99, image: 'https://picsum.photos/200/200?random=19' },
    ]
  },
  {
    id: 'pastry',
    name: 'Pastry',
    iconName: 'Croissant',
    items: [
      { id: '20', name: 'Mini Croissant', price: 2.00, image: 'https://picsum.photos/200/200?random=20' },
      { id: '21', name: 'Pastry Mix', price: 2.00, image: 'https://picsum.photos/200/200?random=21' },
      { id: '22', name: 'Mini Chocolate Tin', price: 2.00, image: 'https://picsum.photos/200/200?random=22' },
      { id: '23', name: 'Mini Almond Croissant', price: 2.00, image: 'https://picsum.photos/200/200?random=23' },
      { id: '24', name: 'Mini Raisin Roll', price: 2.00, image: 'https://picsum.photos/200/200?random=24' },
    ]
  },
];

export const MOCK_HISTORY: OrderHistoryItem[] = [
  { id: 'ORD-001', date: '2023-10-01', total: 5.86, items: ['Hot Latte', 'Mini Croissant'], status: 'completed', customerName: 'John Doe' },
  { id: 'ORD-002', date: '2023-10-03', total: 2.43, items: ['Iced Americano'], status: 'completed', customerName: 'Jane Smith' },
  { id: 'ORD-003', date: '2023-10-05', total: 4.86, items: ['Hot Matcha Latte', 'Iced Latte'], status: 'completed', customerName: 'Bob Brown' },
  { id: 'ORD-004', date: '2023-10-10', total: 2.99, items: ['Vanilla Frappe'], status: 'pending', customerName: 'Alice Green' },
  { id: 'ORD-005', date: '2023-10-12', total: 6.00, items: ['Pastry Mix', 'Mini Croissant', 'Mini Chocolate Tin'], status: 'preparing', customerName: 'Tom White' },
];