import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useTranslation } from '@/hooks/useTranslation';
import { fetchAllProducts } from '@/services/productService';
import type { Product } from '@/types';

const Categories: React.FC = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  const { t } = useTranslation('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const all = await fetchAllProducts();
        setProducts(all);
      } catch (e) {
        console.error('Error loading products for categories section', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const getCountForCategory = (categoryId: string) => {
    if (!products.length) return '';
    const count = products.filter(p => p.category === categoryId).length;
    if (count === 0) return '';
    return `${count} ${t('categories.items')}`;
  };

  const categories = [
    {
      id: 'hijabs',
      name: 'Hijabs',
      description: 'Hijabs de qualité supérieure en différents tissus et styles',
      image: '/hijabs.png',
      featured: true,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'abayas',
      name: 'Abayas',
      description: 'Abayas élégantes pour toutes les occasions',
      image: '/abaya.png',
      featured: true,
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'ensemble',
      name: 'Ensemble',
      description: 'Ensembles élégants et raffinés',
      image: '/c1.png',
      featured: true,
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      id: 'boxes-cadeau',
      name: 'Boxes Cadeau',
      description: 'Boxes cadeau élégantes et personnalisées',
      image: '/cofferet.jpeg',
      featured: true,
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-serif text-[#0B0B0D] mb-2 tracking-tight">
            {t('categories.shopByCategory')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group"
            >
              <Link to={`/${category.id}`} className="block">
                {/* Image */}
                <div className="relative overflow-hidden mb-4 bg-gray-50">
                  <LazyLoadImage
                    src={category.image}
                    alt={category.name}
                    effect="blur"
                    placeholderSrc="/logo.png"
                    width="100%"
                    height="100%"
                    className="w-full h-[300px] sm:h-[350px] object-cover group-hover:opacity-95 transition-opacity duration-300"
                  />
                </div>

                {/* Content - Minimal */}
                <div>
                  <h3 className="text-base font-medium text-[#0B0B0D] mb-1 group-hover:opacity-70 transition-opacity">
                    {category.name}
                  </h3>
                  {!isLoading && (
                    <p className="text-sm text-gray-600">
                      {getCountForCategory(category.id)}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;