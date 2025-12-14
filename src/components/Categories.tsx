import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

const Categories: React.FC = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  const { t } = useTranslation('home');

  const categories = [
    {
      id: 'hijabs',
      name: 'Hijabs',
      description: 'Premium hijabs in various fabrics and styles',
      image: '/hijabs.png',
      count: '4 items',
      featured: true,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'abayas',
      name: 'Abayas',
      description: 'Elegant abayas for every occasion',
      image: '/abaya.png',
      count: '4 items',
      featured: true,
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'accessories',
      name: 'Accessories',
      description: 'Essential hijab accessories',
      image: '/acc.png',
      count: '4 items',
      featured: true,
      gradient: 'from-pink-500 to-rose-500'
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

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    className="w-full h-[300px] sm:h-[350px] object-cover group-hover:opacity-95 transition-opacity duration-300"
                  />
                </div>

                {/* Content - Minimal */}
                <div>
                  <h3 className="text-base font-medium text-[#0B0B0D] mb-1 group-hover:opacity-70 transition-opacity">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {category.count.replace('items', t('categories.items'))}
                  </p>
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
