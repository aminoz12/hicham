export interface Product {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  nameIt: string;
  nameEs: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: ProductCategory;
  subcategory?: string;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  descriptionIt: string;
  descriptionEs: string;
  colors: string[];
  sizes: string[];
  inStock: boolean;
  isNew: boolean;
  newArrival: boolean;
  isBestSeller: boolean;
  isOnSale: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
}

export type ProductCategory = 'hijabs' | 'abayas' | 'ensemble' | 'boxes-cadeau';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface NewsletterSubscription {
  email: string;
  subscribed: boolean;
  preferences: {
    newArrivals: boolean;
    sales: boolean;
    general: boolean;
  };
}

export interface FilterOptions {
  category?: ProductCategory;
  subcategory?: string;
  priceRange?: [number, number];
  colors?: string[];
  sizes?: string[];
  inStock?: boolean;
  rating?: number;
  sortBy?: 'price-low' | 'price-high' | 'newest' | 'rating' | 'popular';
}

export interface SearchParams {
  query: string;
  filters: FilterOptions;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface NewsletterForm {
  email: string;
  preferences: {
    newArrivals: boolean;
    sales: boolean;
    general: boolean;
  };
}

export interface WishlistItem {
  id: string;
  product: Product;
  addedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
  featured?: boolean;
}

export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'pinterest';
  url: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  comment: string;
  product?: string;
  verified: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar: string;
  publishedAt: string;
  image: string;
  tags: string[];
  featured: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface SizeGuide {
  size: string;
  bust: string;
  waist: string;
  hips: string;
  length: string;
}

export interface ColorOption {
  name: string;
  hex: string;
  image: string;
  available: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  color: string;
  size: string;
  sku: string;
  price: number;
  stock: number;
  images: string[];
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  freeThreshold?: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'klarna' | 'afterpay';
  icon: string;
  enabled: boolean;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  orderUpdates: boolean;
  newArrivals: boolean;
  sales: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  language: string;
  notifications: NotificationSettings;
}

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
}
