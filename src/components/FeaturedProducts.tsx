import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Eye, ArrowRight } from 'lucide-react';
import { getFeaturedProducts } from '@/data/products';
import { formatPrice, calculateDiscount } from '@/utils';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { toast } from 'react-hot-toast';

const FeaturedProducts: React.FC = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const { addItem } = useCartStore();
  const { openProductModal } = useUIStore();
  const featuredProducts = getFeaturedProducts();

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem(product, product.colors[0], product.sizes[0]);
    toast.success(`${product.name} added to cart!`);
  };

  const handleQuickView = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    openProductModal(product);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our most loved pieces, carefully selected for their quality, style, and customer satisfaction.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Link to={`/product/${product.id}`} className="block">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Image Container */}
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {product.images && product.images[1] && (
                      <img
                        src={product.images[1]}
                        alt={product.name}
                        className="absolute inset-0 w-full h-96 object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      />
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                      {product.isOnSale && product.originalPrice && (
                        <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          -{calculateDiscount(product.originalPrice, product.price)}%
                        </div>
                      )}
                      {product.isNew && (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          New
                        </div>
                      )}
                      {product.isBestSeller && (
                        <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Best Seller
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      <button
                        onClick={(e) => handleQuickView(e, product)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                        aria-label="Quick view"
                      >
                        <Eye className="h-4 w-4 text-gray-700" />
                      </button>
                      <button
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                        aria-label="Add to wishlist"
                      >
                        <Heart className="h-4 w-4 text-gray-700" />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category */}
                    <div className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-2">
                      {product.category}
                    </div>

                    {/* Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center space-x-1 mb-3">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.floor(product.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({product.reviewCount})</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Colors */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Colors:</span>
                      <div className="flex space-x-1">
                        {product.colors.slice(0, 3).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border-2 border-gray-200"
                            style={{ backgroundColor: getColorValue(color) }}
                          />
                        ))}
                        {product.colors.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{product.colors.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            to="/products"
            className="btn-primary inline-flex items-center space-x-2 group"
          >
            <span>View All Products</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
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

export default FeaturedProducts;
