import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ProductSortProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

const ProductSort: React.FC<ProductSortProps> = ({ sortBy, onSortChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'popular', label: 'Best selling' },
    { value: 'alphabetical-az', label: 'Alphabetically, A-Z' },
    { value: 'alphabetical-za', label: 'Alphabetically, Z-A' },
    { value: 'price-low', label: 'Price, low to high' },
    { value: 'price-high', label: 'Price, high to low' },
    { value: 'newest', label: 'Date, new to old' },
    { value: 'oldest', label: 'Date, old to new' }
  ];

  const currentOption = sortOptions.find(option => option.value === sortBy) || sortOptions[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 text-sm text-[#0B0B0D] border border-[#0B0B0D] px-4 py-2 hover:bg-[#0B0B0D] hover:text-white transition-colors"
      >
        <span>Sort by</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown - Minimal like Merrachi */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 z-20"
          >
            <div className="py-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    sortBy === option.value
                      ? 'bg-[#0B0B0D] text-white'
                      : 'text-[#0B0B0D] hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default ProductSort;
