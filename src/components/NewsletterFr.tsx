import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Gift, Bell } from 'lucide-react';

const NewsletterFr: React.FC = () => {

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          <span className="block">Restez informé</span>
          <span className="block text-indigo-100 text-xl font-normal mt-2">
            Accédez en avant-première aux nouvelles collections, offres spéciales et conseils de style.
          </span>
        </h2>
        
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="sm:flex">
              <a
                href="https://www.instagram.com/hijabinour_hn/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white"
              >
                S'abonner sur Instagram
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-center">
            <div className="flex-shrink-0 bg-white/20 rounded-md p-2">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <p className="ml-3 text-base text-white">15% de réduction</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex-shrink-0 bg-white/20 rounded-md p-2">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <p className="ml-3 text-base text-white">Mises à jour exclusives</p>
          </div>
        </div>
        
        <p className="mt-8 text-sm text-indigo-100">
          En vous inscrivant, vous acceptez notre Politique de confidentialité. Vous pouvez vous désinscrire à tout moment.
        </p>
      </div>
    </motion.section>
  );
};

export default NewsletterFr;
