import { create } from 'zustand';
import { FilterOptions, ProductCategory } from '@/types';

interface UIStore {
  // Navigation
  isMobileMenuOpen: boolean;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  
  // Product filters and search
  searchQuery: string;
  filters: FilterOptions;
  selectedCategory: ProductCategory | null;
  
  // Product view
  viewMode: 'grid' | 'list';
  sortBy: 'price-low' | 'price-high' | 'newest' | 'rating' | 'popular';
  
  // Modals and overlays
  isProductModalOpen: boolean;
  selectedProduct: any | null;
  isWishlistOpen: boolean;
  isNewsletterModalOpen: boolean;
  
  // Loading states
  isLoading: boolean;
  loadingMessage: string;
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
  }>;
  
  // Actions
  toggleMobileMenu: () => void;
  toggleCart: () => void;
  toggleSearch: () => void;
  closeAllModals: () => void;
  
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setSelectedCategory: (category: ProductCategory | null) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSortBy: (sort: 'price-low' | 'price-high' | 'newest' | 'rating' | 'popular') => void;
  
  openProductModal: (product: any) => void;
  closeProductModal: () => void;
  toggleWishlist: () => void;
  toggleNewsletterModal: () => void;
  
  setLoading: (loading: boolean, message?: string) => void;
  addNotification: (notification: Omit<UIStore['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Reset
  resetUI: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  // Initial state
  isMobileMenuOpen: false,
  isCartOpen: false,
  isSearchOpen: false,
  
  searchQuery: '',
  filters: {},
  selectedCategory: null,
  
  viewMode: 'grid',
  sortBy: 'newest',
  
  isProductModalOpen: false,
  selectedProduct: null,
  isWishlistOpen: false,
  isNewsletterModalOpen: false,
  
  isLoading: false,
  loadingMessage: '',
  
  notifications: [],
  
  // Actions
  toggleMobileMenu: () => set(state => ({ 
    isMobileMenuOpen: !state.isMobileMenuOpen,
    isCartOpen: false,
    isSearchOpen: false,
  })),
  
  toggleCart: () => set(state => ({ 
    isCartOpen: !state.isCartOpen,
    isMobileMenuOpen: false,
    isSearchOpen: false,
  })),
  
  toggleSearch: () => set(state => ({ 
    isSearchOpen: !state.isSearchOpen,
    isMobileMenuOpen: false,
    isCartOpen: false,
  })),
  
  closeAllModals: () => set({
    isMobileMenuOpen: false,
    isCartOpen: false,
    isSearchOpen: false,
    isProductModalOpen: false,
    isWishlistOpen: false,
    isNewsletterModalOpen: false,
    selectedProduct: null,
  }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setFilters: (newFilters) => set(state => ({
    filters: { ...state.filters, ...newFilters }
  })),
  
  setSelectedCategory: (category) => set({ 
    selectedCategory: category,
    filters: { ...get().filters, category: category || undefined }
  }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setSortBy: (sort) => set({ sortBy: sort }),
  
  openProductModal: (product) => set({ 
    isProductModalOpen: true, 
    selectedProduct: product 
  }),
  
  closeProductModal: () => set({ 
    isProductModalOpen: false, 
    selectedProduct: null 
  }),
  
  toggleWishlist: () => set(state => ({ 
    isWishlistOpen: !state.isWishlistOpen,
    isCartOpen: false,
    isMobileMenuOpen: false,
  })),
  
  toggleNewsletterModal: () => set(state => ({ 
    isNewsletterModalOpen: !state.isNewsletterModalOpen 
  })),
  
  setLoading: (loading, message = '') => set({ 
    isLoading: loading, 
    loadingMessage: message 
  }),
  
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    set(state => ({
      notifications: [...state.notifications, { ...notification, id }]
    }));
    
    // Auto remove after duration
    const duration = notification.duration || 5000;
    setTimeout(() => {
      get().removeNotification(id);
    }, duration);
  },
  
  removeNotification: (id) => set(state => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  resetUI: () => set({
    isMobileMenuOpen: false,
    isCartOpen: false,
    isSearchOpen: false,
    searchQuery: '',
    filters: {},
    selectedCategory: null,
    viewMode: 'grid',
    sortBy: 'newest',
    isProductModalOpen: false,
    selectedProduct: null,
    isWishlistOpen: false,
    isNewsletterModalOpen: false,
    isLoading: false,
    loadingMessage: '',
    notifications: [],
  }),
}));
