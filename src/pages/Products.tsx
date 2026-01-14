import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductGrid from '@/components/ProductGrid';
import FilterModal from '@/components/FilterModal';
import { fetchAllProducts } from '@/services/productService';
import { filterProducts, sortProducts, searchProducts } from '@/utils';
import { Product, FilterOptions, ProductCategory } from '@/types';

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortBy] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode] = useState<'grid' | 'list'>('grid');
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4>(4);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [, setIsLoading] = useState(true);

  // Load products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        console.log('Loading products from Supabase...');
        const products = await fetchAllProducts();
        console.log('Products loaded:', products.length, products);
        setAllProducts(products);
        if (products.length === 0) {
          console.warn('No products found in database. Make sure you have created products in the admin panel or run the migration script.');
        }
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to empty array
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Get category from URL
  const category = searchParams.get('category') as ProductCategory | null;
  const search = searchParams.get('search');

  useEffect(() => {
    // Initialize filters from URL params
    const initialFilters: FilterOptions = {};
    
    if (category) {
      initialFilters.category = category as any;
    }
    
    if (search) {
      setSearchQuery(search);
    }

    setFilters(initialFilters);
  }, [category, search]);

  // Filter and sort products
  useEffect(() => {
    let result = allProducts;

    // Apply search
    if (searchQuery.trim()) {
      result = searchProducts(result, searchQuery);
    }

    // Apply filters
    result = filterProducts(result, filters);

    // Apply sorting
    result = sortProducts(result, sortBy);

    setFilteredProducts(result);
  }, [filters, sortBy, searchQuery, allProducts]);

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };


  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== null && value !== ''
  ).length + (searchQuery ? 1 : 0);

  // Get all unique categories from products
  const allCategories = ['All', ...new Set(allProducts.map((p: Product) => p.category))] as string[];
  const currentCategory = category || 'All';

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>
          {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} - Hijabi Inoor` : 'All Products - Hijabi Inoor'}
        </title>
        <meta name="description" content={`Browse our collection of ${category || 'premium modest fashion'} products. High quality, elegant designs for the modern Muslim woman.`} />
      </Helmet>

      {/* Full Width Sticky Toolbar */}
      <div className="w-full border-b border-gray-200 sticky top-0 bg-white z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 gap-4">
            {/* Left: Grid Selector */}
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600 mr-2">Grid</span>
              {[2, 3, 4].map((cols) => (
                <button
                  key={cols}
                  onClick={() => setGridColumns(cols as 2 | 3 | 4)}
                    className={`px-2 py-1 text-sm border transition-colors ${
                      gridColumns === cols
                        ? 'border-[#0B0B0D] text-[#0B0B0D]'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                >
                  {cols}
                </button>
              ))}
            </div>

            {/* Middle: Categories */}
            <div className="flex-1 flex items-center justify-center overflow-x-auto px-4">
              <div className="flex items-center gap-4 whitespace-nowrap">
                {allCategories.map((cat: string) => (
                  <button
                    key={cat}
                    onClick={() => {
                      if (cat === 'All') {
                        setFilters(prev => ({ ...prev, category: undefined }));
                      } else {
                        setFilters(prev => ({ ...prev, category: cat as any }));
                      }
                    }}
                    className={`text-sm transition-colors ${
                      (cat === 'All' && currentCategory === 'All') || 
                      (cat !== 'All' && currentCategory === cat)
                        ? 'text-[#0B0B0D] font-medium'
                        : 'text-gray-600 hover:text-[#0B0B0D]'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Filter Button */}
            <div className="flex items-center">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="text-sm text-[#0B0B0D] border border-[#0B0B0D] px-4 py-2 hover:bg-[#0B0B0D] hover:text-white transition-colors whitespace-nowrap"
              >
                {activeFiltersCount > 0 ? `Filter + (${activeFiltersCount})` : 'Filter +'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Products */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Products Grid */}
          <ProductGrid
            products={filteredProducts}
            viewMode={viewMode}
            columns={gridColumns}
          />

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-lg font-medium text-black mb-2">
                No products found
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Try adjusting your filters
              </p>
              <button
                onClick={clearFilters}
                className="btn-secondary text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        searchQuery={searchQuery}
        onClearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
};

export default Products;
