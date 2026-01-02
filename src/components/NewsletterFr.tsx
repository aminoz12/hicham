import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Gift, Bell, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const NewsletterFr: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Veuillez entrer votre adresse e-mail');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubscribed(true);
    
    // Save to localStorage
    const subscribers = JSON.parse(localStorage.getItem('newsletter-subscribers') || '[]');
    subscribers.push({
      email,
      subscribedAt: new Date().toISOString()
    });
    localStorage.setItem('newsletter-subscribers', JSON.stringify(subscribers));
    
    toast.success('Inscription réussie à notre newsletter !');
  };

  if (isSubscribed) {
    return (
      <motion.section
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="py-20 bg-gradient-to-r from-green-50 to-emerald-50"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="h-10 w-10 text-green-600" />
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Bienvenue dans notre communauté !
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Vous êtes maintenant inscrit(e) à notre newsletter. Vérifiez votre e-mail pour recevoir votre cadeau de bienvenue !
          </p>
        </div>
      </motion.section>
    );
  }

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
            <form onSubmit={handleSubmit} className="sm:flex">
              <label htmlFor="email-address" className="sr-only">Adresse email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 border border-transparent rounded-md shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
                placeholder="Entrez votre email"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-3 w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white sm:mt-0 sm:ml-3 sm:flex-shrink-0`}
              >
                {isSubmitting ? 'Inscription en cours...' : "S'inscrire"}
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          <div className="flex items-center justify-center">
            <div className="flex-shrink-0 bg-white/20 rounded-md p-2">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <p className="ml-3 text-base text-white">Pas de spam, jamais</p>
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
