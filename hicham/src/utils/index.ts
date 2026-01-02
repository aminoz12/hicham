import { Product, FilterOptions } from '@/types';

export const formatPrice = (price: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: currency,
  }).format(price);
};

export const calculateDiscount = (originalPrice: number, salePrice: number): number => {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

export const calculateItemPrice = (product: any, quantity: number): number => {
  // Special pricing for hijabs: 13 euro for 1, 25 euro for 2
  if (product.category === 'hijabs') {
    if (quantity >= 2) {
      // For 2 or more hijabs, use 25 euro for every 2 hijabs, then 13 euro for remaining
      const pairs = Math.floor(quantity / 2);
      const remaining = quantity % 2;
      return (pairs * 25) + (remaining * 13);
    } else {
      // For 1 hijab, use 13 euro
      return quantity * 13;
    }
  } else {
    // For other products (abayas), use regular pricing
    return product.price * quantity;
  }
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const filterProducts = (products: Product[], filters: FilterOptions): Product[] => {
  return products.filter(product => {
    // Category filter
    if (filters.category && product.category !== filters.category) {
      return false;
    }

    // Subcategory filter
    if (filters.subcategory && product.subcategory !== filters.subcategory) {
      return false;
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      if (product.price < min || product.price > max) {
        return false;
      }
    }

    // Color filter
    if (filters.colors && filters.colors.length > 0) {
      const hasMatchingColor = filters.colors.some(color => 
        product.colors.some(productColor => 
          productColor.toLowerCase().includes(color.toLowerCase())
        )
      );
      if (!hasMatchingColor) {
        return false;
      }
    }

    // Size filter
    if (filters.sizes && filters.sizes.length > 0) {
      const hasMatchingSize = filters.sizes.some(size => 
        product.sizes.includes(size)
      );
      if (!hasMatchingSize) {
        return false;
      }
    }

    // Stock filter
    if (filters.inStock !== undefined && product.inStock !== filters.inStock) {
      return false;
    }

    // Rating filter
    if (filters.rating && product.rating < filters.rating) {
      return false;
    }

    return true;
  });
};

export const sortProducts = (products: Product[], sortBy: string): Product[] => {
  const sorted = [...products];
  
  switch (sortBy) {
    case 'featured':
      // Featured products first (best sellers, new arrivals)
      return sorted.sort((a, b) => {
        if (a.isBestSeller && !b.isBestSeller) return -1;
        if (!a.isBestSeller && b.isBestSeller) return 1;
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return 0;
      });
    case 'popular':
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    case 'alphabetical-az':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'alphabetical-za':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'newest':
      return sorted.sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return 0;
      });
    case 'oldest':
      return sorted.sort((a, b) => {
        if (a.isNew && !b.isNew) return 1;
        if (!a.isNew && b.isNew) return -1;
        return 0;
      });
    default:
      return sorted;
  }
};

export const searchProducts = (products: Product[], query: string): Product[] => {
  if (!query.trim()) return products;
  
  const searchTerm = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    product.category.toLowerCase().includes(searchTerm) ||
    (product.subcategory && product.subcategory.toLowerCase().includes(searchTerm))
  );
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getRandomColor = (): string => {
  const colors = [
    '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
    '#EF4444', '#8B5A2B', '#6B7280', '#F97316', '#84CC16'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const isMobile = (): boolean => {
  return window.innerWidth < 768;
};

export const isTablet = (): boolean => {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isDesktop = (): boolean => {
  return window.innerWidth >= 1024;
};

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
};

export const scrollToTop = (): void => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

export const scrollToElement = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const parseQueryString = (queryString: string): Record<string, string> => {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);
  
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  
  return params;
};

export const buildQueryString = (params: Record<string, string | number | boolean>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
};
