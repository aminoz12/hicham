import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Truck, 
  MessageCircle, 
  Heart, 
  RotateCcw, 
  Headphones, 
  Award,
  Zap,
  Globe
} from 'lucide-react';

const Features: React.FC = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  const { t } = useTranslation('home');

  const features = [
    {
      icon: Truck,
      title: 'Free & Fast Shipping',
      description: 'Free shipping on orders over $75. Express delivery available.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: MessageCircle,
      title: t('hero.features.orderViaWhatsApp'),
      description: 'Easy ordering through WhatsApp. Quick and convenient.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Heart,
      title: 'Satisfaction Guaranteed',
      description: 'Love your purchase or return it within 30 days.',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: 'Hassle-free returns and exchanges within 30 days.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Our customer service team is here to help you.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Handpicked materials and expert craftsmanship.',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Quick processing and same-day shipping available.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Globe,
      title: 'Worldwide Shipping',
      description: 'We ship to over 50 countries worldwide.',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

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
            Why Choose Hijabi Inoor?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to providing you with the best shopping experience, 
            from premium quality products to exceptional customer service.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg transition-all duration-300`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </motion.div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-3xl p-8 lg:p-12"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { number: '10K+', label: 'Happy Customers' },
              { number: '50+', label: 'Countries Served' },
              { number: '99%', label: 'Satisfaction Rate' },
              { number: '24/7', label: 'Customer Support' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="group"
              >
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2 group-hover:scale-110 transition-transform">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
