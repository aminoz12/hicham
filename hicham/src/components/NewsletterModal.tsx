import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, CheckCircle, Gift } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { toast } from 'react-hot-toast';

const NewsletterModal: React.FC = () => {
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState({
    newArrivals: true,
    sales: true,
    general: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const { toggleNewsletterModal } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
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
      preferences,
      subscribedAt: new Date().toISOString()
    });
    localStorage.setItem('newsletter-subscribers', JSON.stringify(subscribers));
    
    toast.success('Successfully subscribed to our newsletter!');
    
    // Close modal after 2 seconds
    setTimeout(() => {
      toggleNewsletterModal();
    }, 2000);
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (isSubscribed) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={toggleNewsletterModal}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute inset-0 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="h-8 w-8 text-green-600" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to our family!
            </h3>
            <p className="text-gray-600 mb-6">
              You've successfully subscribed to our newsletter. Check your email for a special welcome gift!
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleNewsletterModal}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Continue Shopping
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={toggleNewsletterModal}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="absolute inset-0 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Get 15% Off!
                </h2>
                <p className="text-sm text-gray-500">
                  Subscribe to our newsletter
                </p>
              </div>
            </div>
            <button
              onClick={toggleNewsletterModal}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Stay updated with our latest collections
            </h3>
            <p className="text-gray-600 text-sm">
              Be the first to know about new arrivals, exclusive sales, and styling tips. 
              Plus, get 15% off your first order!
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What would you like to hear about?
              </label>
              <div className="space-y-2">
                {[
                  { key: 'newArrivals', label: 'New Arrivals', description: 'Be first to see new products' },
                  { key: 'sales', label: 'Sales & Promotions', description: 'Get exclusive discount codes' },
                  { key: 'general', label: 'General Updates', description: 'News, tips, and company updates' }
                ].map((pref) => (
                  <label key={pref.key} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[pref.key as keyof typeof preferences]}
                      onChange={() => handlePreferenceChange(pref.key as keyof typeof preferences)}
                      className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pref.label}</div>
                      <div className="text-xs text-gray-500">{pref.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Subscribing...</span>
                </div>
              ) : (
                'Subscribe & Get 15% Off'
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center mt-4">
            By subscribing, you agree to our Privacy Policy. You can unsubscribe at any time.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default NewsletterModal;
