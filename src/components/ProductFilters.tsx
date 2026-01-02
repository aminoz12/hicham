import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
  onSearchChange: _onSearchChange,
  searchQuery: _searchQuery,
  onClearFilters: _onClearFilters,
  activeFiltersCount: _activeFiltersCount
}) => {
  const [isExpanded, setIsExpanded] = useState({
    search: false,
    category: false,
    price: true,
    color: true,
    size: true,
    rating: false
  });

  const toggleSection = (section: keyof typeof isExpanded) => {
    setIsExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Get unique values for filters
  // const subcategories = [...new Set(products.map(p => p.subcategory).filter(Boolean))];
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

  return (
    <div className="bg-white sticky top-8">
      <div className="space-y-6">

        {/* Price Range - Minimal */}
        <div>
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-black mb-3"
          >
            <span>Price</span>
            {isExpanded.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {isExpanded.price && (
            <div className="space-y-2">
              <div className="text-sm text-black mb-2">
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

        {/* Colors - Minimal like Merrachi */}
        <div>
          <button
            onClick={() => toggleSection('color')}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-black mb-3"
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
                      ? 'text-black font-medium'
                      : 'text-gray-600 hover:text-black'
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

        {/* Sizes - Minimal like Merrachi */}
        <div>
          <button
            onClick={() => toggleSection('size')}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-black mb-3"
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
                      ? 'border-black text-black'
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
