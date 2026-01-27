import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Product } from '@/types';
import { formatPrice } from '@/utils';

interface ProductGridProps {
  products: Product[];
  viewMode: 'grid' | 'list';
  columns?: 2 | 3 | 4;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, viewMode: _viewMode, columns = 4 }) => {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Get grid columns class based on columns prop
  const getGridCols = () => {
    switch (columns) {
      case 2: return 'grid-cols-2 sm:grid-cols-2';
      case 3: return 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default: return 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  // Format product name with color variant (like Merrachi: "Shawl Dress | Dark Cherry")
  const formatProductName = (product: Product) => {
    if (product.colors && product.colors.length > 0) {
      return `${product.name} | ${product.colors[0]}`;
    }
    return product.name;
  };

  return (
    <div className={`grid ${getGridCols()} gap-6 lg:gap-8 w-full`}>
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.03 }}
          className="group"
          onMouseEnter={() => setHoveredProduct(product.id)}
          onMouseLeave={() => setHoveredProduct(null)}
        >
          <Link 
            to={`/product/${product.id}`} 
            className="block"
            onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
          >
            {/* Image Container */}
            <div className="relative overflow-hidden mb-3 bg-gray-50">
              <LazyLoadImage
                src={product.image}
                alt={product.name}
                effect="blur"
                placeholderSrc="/logo.png"
                width="100%"
                height="100%"
                className="w-full h-[300px] sm:h-[400px] lg:h-[450px] object-cover group-hover:opacity-95 transition-opacity duration-300"
              />
              {product.images && product.images[1] && (
                <LazyLoadImage
                  src={product.images[1]}
                  alt={product.name}
                  effect="blur"
                  placeholderSrc="/logo.png"
                  width="100%"
                  height="100%"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              )}
              
              {/* Size Options - Show on Hover (like Merrachi) */}
              {hoveredProduct === product.id && product.sizes && product.sizes.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <div
                      key={size}
                      className="bg-white px-3 py-1 text-xs font-medium text-[#0B0B0D]"
                    >
                      {size}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Content - Minimal (like Merrachi) */}
            <div>
              {/* Product Name with Color */}
              <h3 className="text-sm font-medium text-[#0B0B0D] mb-1 group-hover:opacity-70 transition-opacity">
                {formatProductName(product)}
              </h3>
              
              {/* Price */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-[#0B0B0D] font-luxury font-semibold">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through font-luxury">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default ProductGrid;