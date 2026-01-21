import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem, Product } from '@/types';

interface CartStore extends Cart {
  addItem: (product: Product, selectedColor: string, selectedSize: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (product, selectedColor, selectedSize) => {
        const items = get().items;
        const existingItem = items.find(
          item => 
            item.product.id === product.id && 
            item.selectedColor === selectedColor && 
            item.selectedSize === selectedSize
        );

        if (existingItem) {
          set(state => ({
            items: state.items.map(item =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          }));
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${selectedColor}-${selectedSize}`,
            product,
            quantity: 1,
            selectedColor,
            selectedSize,
          };
          set(state => ({
            items: [...state.items, newItem],
          }));
        }

        // Recalculate totals
        const newItems = get().items;
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const total = get().getTotal();

        set({ itemCount, total });
      },

      removeItem: (itemId) => {
        set(state => ({
          items: state.items.filter(item => item.id !== itemId),
        }));

        // Recalculate totals
        const newItems = get().items;
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const total = get().getTotal();

        set({ itemCount, total });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set(state => ({
          items: state.items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));

        // Recalculate totals
        const newItems = get().items;
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const total = get().getTotal();

        set({ itemCount, total });
      },

      clearCart: () => {
        set({ items: [], total: 0, itemCount: 0 });
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotal: () => {
        return get().items.reduce((sum, item) => {
          // Special pricing ONLY for hijabs priced at 13€: 2 for 25€
          if (item.product.category === 'hijabs' && item.product.price === 13) {
            if (item.quantity >= 2) {
              // For 2 or more 13€ hijabs: 25€ for every 2, then 13€ for remaining
              const pairs = Math.floor(item.quantity / 2);
              const remaining = item.quantity % 2;
              return sum + (pairs * 25) + (remaining * 13);
            } else {
              return sum + (item.quantity * 13);
            }
          } else {
            // For all other products, use regular pricing
            return sum + (item.product.price * item.quantity);
          }
        }, 0);
      },

      isInCart: (productId) => {
        return get().items.some(item => item.product.id === productId);
      },
    }),
    {
      name: 'hijabi-inoor-cart',
      version: 1,
    }
  )
);
