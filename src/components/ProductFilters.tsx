import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { FilterOptions } from '@/types';
import { products } from '@/data/products';

interface ProductFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  onSearchChange,
  searchQuery,
  onClearFilters,
  activeFiltersCount
}) => {
  const [isExpanded, setIsExpanded] = useState({
    search: true,
    category: true,
    price: true,
    color: true,
    size: true,
    rating: true
  });

  const toggleSection = (section: keyof typeof isExpanded) => {
    setIsExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Get unique values for filters
  const categories = [...new Set(products.map(p => p.category))];
  // const subcategories = [...new Set(products.map(p => p.subcategory).filter(Boolean))];
  const colors = [...new Set(products.flatMap(p => p.colors))];
  const sizes = [...new Set(products.flatMap(p => p.sizes))];

  const priceRanges = [
    { label: 'Under $25', value: [0, 25] as [number, number] },
    { label: '$25 - $50', value: [25, 50] as [number, number] },
    { label: '$50 - $100', value: [50, 100] as [number, number] },
    { label: '$100 - $150', value: [100, 150] as [number, number] },
    { label: 'Over $150', value: [150, 1000] as [number, number] }
  ];

  const handlePriceRangeChange = (range: [number, number]) => {
    onFilterChange({ priceRange: range });
  };

  const handleColorChange = (color: string) => {
    const currentColors = filters.colors || [];
    const newColors = currentColors.includes(color)
      ? currentColors.filter(c => c !== color)
      : [...currentColors, color];
    onFilterChange({ colors: newColors.length > 0 ? newColors : undefined });
  };

  const handleSizeChange = (size: string) => {
    const currentSizes = filters.sizes || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];
    onFilterChange({ sizes: newSizes.length > 0 ? newSizes : undefined });
  };

  const handleRatingChange = (rating: number) => {
    onFilterChange({ rating: filters.rating === rating ? undefined : rating });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <button
            onClick={() => toggleSection('search')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
          >
            <span>Search</span>
            {isExpanded.search ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {isExpanded.search && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </motion.div>
          )}
        </div>

        {/* Category */}
        <div>
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
          >
            <span>Category</span>
            {isExpanded.category ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {isExpanded.category && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <button
                onClick={() => onFilterChange({ category: undefined })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  !filters.category
                    ? 'bg-primary-100 text-primary-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onFilterChange({ category: category as any })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors capitalize ${
                    filters.category === category
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Price Range */}
        <div>
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
          >
            <span>Price Range</span>
            {isExpanded.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {isExpanded.price && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {priceRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => handlePriceRangeChange(range.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    JSON.stringify(filters.priceRange) === JSON.stringify(range.value)
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Colors */}
        <div>
          <button
            onClick={() => toggleSection('color')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
          >
            <span>Colors</span>
            {isExpanded.color ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {isExpanded.color && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {colors.slice(0, 10).map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    filters.colors?.includes(color)
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: getColorValue(color) }}
                  />
                  <span>{color}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Sizes */}
        <div>
          <button
            onClick={() => toggleSection('size')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
          >
            <span>Sizes</span>
            {isExpanded.size ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {isExpanded.size && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-3 gap-2"
            >
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.sizes?.includes(size)
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Rating */}
        <div>
          <button
            onClick={() => toggleSection('rating')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
          >
            <span>Rating</span>
            {isExpanded.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {isExpanded.rating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    filters.rating === rating
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`h-3 w-3 ${
                          star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </div>
                    ))}
                  </div>
                  <span>& Up</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Stock Status */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={filters.inStock || false}
              onChange={(e) => onFilterChange({ inStock: e.target.checked || undefined })}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">In Stock Only</span>
          </label>
        </div>
      </div>
    </div>
  );
};

// Helper function to get color values
const getColorValue = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    'Black': '#000000',
    'White': '#FFFFFF',
    'Navy': '#1e3a8a',
    'Burgundy': '#800020',
    'Mauve': '#e0b0ff',
    'Rose Gold': '#e8b4b8',
    'Gold': '#ffd700',
    'Silver': '#c0c0c0',
    'Champagne': '#f7e7ce',
    'Pearl': '#f8f6f0',
    'Emerald': '#50c878',
    'Royal Blue': '#4169e1',
    'Forest Green': '#228b22',
    'Brown': '#8b4513',
    'Charcoal': '#36454f',
    'Beige': '#f5f5dc',
    'Sage Green': '#9caf88',
    'Dusty Rose': '#d4a5a5',
    'Teal': '#008080',
    'Coral': '#ff7f50'
  };
  return colorMap[colorName] || '#6b7280';
};

export default ProductFilters;
