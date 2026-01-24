import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Helmet>
        <title>Order Confirmed - HIJABI NOUR</title>
        <meta name="description" content="Your order has been successfully placed" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
      >
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been successfully placed and you will receive a confirmation email shortly.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/products')}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Continue Shopping</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="btn-secondary w-full flex items-center justify-center space-x-2"
          >
            <ArrowRight className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;








