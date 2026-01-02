import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, Gift, CheckCircle } from 'lucide-react';
// import { useUIStore } from '@/store/uiStore';
import { toast } from 'react-hot-toast';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  // const { toggleNewsletterModal } = useUIStore();

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

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
      subscribedAt: new Date().toISOString()
    });
    localStorage.setItem('newsletter-subscribers', JSON.stringify(subscribers));
    
    toast.success('Successfully subscribed to our newsletter!');
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
            Welcome to our family!
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            You've successfully subscribed to our newsletter. Check your email for a special welcome gift!
          </p>
          
          <button
            onClick={() => setIsSubscribed(false)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Subscribe another email
          </button>
        </div>
      </motion.section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Gift className="h-8 w-8 text-white" />
          </motion.div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Stay in the Loop
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get exclusive access to new arrivals, special offers, and styling tips. 
            Plus, enjoy 15% off your first order!
          </p>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="max-w-md mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  required
                />
              </div>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary-600 font-semibold py-4 px-8 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    <span>Subscribing...</span>
                  </div>
                ) : (
                  'Subscribe'
                )}
              </motion.button>
            </div>
          </motion.form>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
          >
            {[
              { icon: Gift, text: '15% Off First Order' },
              { icon: Mail, text: 'Exclusive Updates' },
              { icon: CheckCircle, text: 'No Spam, Ever' }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.text}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-white/90 font-medium">{benefit.text}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Privacy Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 1 }}
            className="text-white/70 text-sm mt-8"
          >
            By subscribing, you agree to our Privacy Policy. You can unsubscribe at any time.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
