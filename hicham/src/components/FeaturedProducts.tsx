import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { getFeaturedProducts } from '@/data/products';
import { formatPrice, calculateDiscount } from '@/utils';
import { useTranslation } from '@/hooks/useTranslation';

const FeaturedProducts: React.FC = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const { t } = useTranslation('home');
  const featuredProducts = getFeaturedProducts();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-serif text-[#0B0B0D] mb-2 tracking-tight">
            {t('featured.curatedSelection')}
          </h2>
          <Link 
            to="/products" 
            className="text-sm text-gray-600 hover:text-black transition-colors inline-block"
          >
            {t('featured.viewAll')} →
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group"
            >
              <Link 
                to={`/product/${product.id}`} 
                className="block"
                onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              >
                {/* Image Container */}
                <div className="relative overflow-hidden mb-4 bg-gray-50">
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
                  
                  {/* Minimal Badge - Only on Sale */}
                  {product.isOnSale && product.originalPrice && (
                    <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs font-medium">
                      -{calculateDiscount(product.originalPrice, product.price)}%
                    </div>
                  )}
                </div>

                {/* Content - Minimal */}
                <div>
                  {/* Product Name */}
                  <h3 className="text-base font-medium text-[#0B0B0D] mb-1 group-hover:opacity-70 transition-opacity">
                    {product.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <span className="text-base text-[#0B0B0D]">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;