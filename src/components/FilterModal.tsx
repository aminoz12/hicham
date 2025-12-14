import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { FilterOptions } from '@/types';
import { products } from '@/data/products';

interface FilterModalProps {
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onClearFilters: () => void;
  activeFiltersCount: number;
  isOpen: boolean;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  filters,
  onFilterChange,
  onSearchChange,
  searchQuery,
  onClearFilters,
  activeFiltersCount,
  isOpen,
  onClose
}) => {
  const [isExpanded, setIsExpanded] = useState({
    price: true,
    color: true,
    size: true
  });

  const toggleSection = (section: keyof typeof isExpanded) => {
    setIsExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Get unique values for filters
  const colors = [...new Set(products.flatMap(p => p.colors))];
  const sizes = [...new Set(products.flatMap(p => p.sizes))];

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

  // Helper function to get color values
  const getColorValue = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      'Black': '#000000',
      'White': '#FFFFFF',
      'Navy': '#1e3a8a',
      'Burgundy': '#800020',
      'Forest Green': '#228b22',
      'Gray': '#808080',
      'Grey': '#808080',
      'Beige': '#f5f5dc',
      'Mauve': '#e0b0ff',
      'Rose Gold': '#e8b4b8',
      'Gold': '#ffd700',
      'Silver': '#c0c0c0',
      'Champagne': '#f7e7ce',
      'Pearl': '#f8f6f0',
      'Emerald': '#50c878',
      'Royal Blue': '#4169e1',
      'Brown': '#8b4513',
      'Charcoal': '#36454f',
      'Sage Green': '#9caf88',
      'Dusty Rose': '#d4a5a5',
      'Teal': '#008080',
      'Coral': '#ff7f50'
    };
    return colorMap[colorName] || '#6b7280';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Filter Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-medium text-[#0B0B0D]">Filter</h2>
              <div className="flex items-center gap-4">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={onClearFilters}
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close filter"
                >
                  <X className="h-5 w-5 text-[#0B0B0D]" />
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className="p-6 space-y-6">
              {/* Price Range */}
              <div>
                <button
                  onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full text-left text-sm font-medium text-[#0B0B0D] mb-3"
                >
                  <span>Price</span>
                  {isExpanded.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {isExpanded.price && (
                  <div className="space-y-2">
                    <div className="text-sm text-[#0B0B0D] mb-2">
                      €{filters.priceRange?.[0] || 0} - €{filters.priceRange?.[1] || 12900}
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12900"
                      value={filters.priceRange?.[1] || 12900}
                      onChange={(e) => handlePriceRangeChange([filters.priceRange?.[0] || 0, parseInt(e.target.value)] as [number, number])}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Colors */}
              <div>
                <button
                  onClick={() => toggleSection('color')}
                    className="flex items-center justify-between w-full text-left text-sm font-medium text-[#0B0B0D] mb-3"
                >
                  <span>Color</span>
                  {isExpanded.color ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {isExpanded.color && (
                  <div className="space-y-2">
                    {colors.slice(0, 10).map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                    className={`w-full flex items-center space-x-2 text-sm transition-colors ${
                      filters.colors?.includes(color)
                        ? 'text-[#0B0B0D] font-medium'
                        : 'text-gray-600 hover:text-[#0B0B0D]'
                    }`}
                      >
                        <div
                          className="w-4 h-4 border border-gray-300"
                          style={{ backgroundColor: getColorValue(color) }}
                        />
                        <span className="lowercase">{color.toLowerCase()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sizes */}
              <div>
                <button
                  onClick={() => toggleSection('size')}
                    className="flex items-center justify-between w-full text-left text-sm font-medium text-[#0B0B0D] mb-3"
                >
                  <span>Size</span>
                  {isExpanded.size ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {isExpanded.size && (
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                    className={`px-3 py-1 text-sm border transition-colors ${
                      filters.sizes?.includes(size)
                        ? 'border-[#0B0B0D] text-[#0B0B0D]'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer with Apply Button */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button
                onClick={onClose}
                className="w-full btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterModal;

