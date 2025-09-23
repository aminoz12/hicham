import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUIStore } from '@/store/uiStore';
import { searchProducts } from '@/utils';
import { products } from '@/data/products';
import { formatPrice } from '@/utils';

const SearchModal: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(products.slice(0, 6));
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { toggleSearch } = useUIStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Handle search
  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true);
      const results = searchProducts(products, query);
      setSearchResults(results.slice(0, 8));
      setIsSearching(false);
    } else {
      setSearchResults(products.slice(0, 6));
    }
  }, [query]);

  // Save search to recent searches
  const saveSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recent-searches', JSON.stringify(updated));
    }
  };

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveSearch(query);
      toggleSearch();
    }
  };

  // Handle recent search click
  const handleRecentSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    saveSearch(searchQuery);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  };

  // Popular searches
  const popularSearches = [
    'Modal Hijab',
    'Butterfly Abaya',
    'Jersey Hijab',
    'Pleated Abaya',
    'Chiffon Dress',
    'Hijab Caps'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={toggleSearch}
      />

      {/* Search Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute top-0 left-0 right-0 bg-white shadow-2xl max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <form onSubmit={handleSearch}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for hijabs, abayas, and more..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </form>
          </div>
          <button
            onClick={toggleSearch}
            className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close search"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() ? (
            // Search Results
            <div className="p-4">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-gray-600">Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Search Results ({searchResults.length})
                  </h3>
                  <div className="grid gap-3">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={toggleSearch}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gray-500 capitalize">
                            {product.category} • {product.subcategory}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm font-semibold text-primary-600">
                              {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-xs text-gray-500 line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">{product.rating}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  {searchResults.length >= 8 && (
                    <Link
                      to={`/products?search=${encodeURIComponent(query)}`}
                      onClick={toggleSearch}
                      className="block w-full text-center py-3 text-primary-600 hover:text-primary-700 font-medium border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                    >
                      View all results for "{query}"
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-500">
                    Try searching with different keywords
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Search Suggestions
            <div className="p-4 space-y-6">
              
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Recent Searches
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearch(search)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 flex items-center mb-3">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearch(search)}
                      className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm hover:bg-primary-100 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Categories */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Browse Categories
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Hijabs', href: '/hijabs', count: '24 items' },
                    { name: 'Abayas', href: '/abayas', count: '18 items' },
                    { name: 'Dresses', href: '/dresses', count: '12 items' },
                    { name: 'Accessories', href: '/accessories', count: '8 items' },
                  ].map((category) => (
                    <Link
                      key={category.name}
                      to={category.href}
                      onClick={toggleSearch}
                      className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{category.name}</div>
                      <div className="text-xs text-gray-500">{category.count}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SearchModal;
