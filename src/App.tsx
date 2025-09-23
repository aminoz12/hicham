import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import '@/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/components/Cart';
import MobileMenu from '@/components/MobileMenu';
import SearchModal from '@/components/SearchModal';
import NewsletterModal from '@/components/NewsletterModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Toaster } from 'react-hot-toast';

function App() {
  const { 
    isCartOpen, 
    isMobileMenuOpen, 
    isSearchOpen, 
    isNewsletterModalOpen,
    isLoading,
    loadingMessage,
    closeAllModals 
  } = useUIStore();

  // Close modals on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeAllModals]);

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (isCartOpen || isMobileMenuOpen || isSearchOpen || isNewsletterModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen, isMobileMenuOpen, isSearchOpen, isNewsletterModalOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Helmet>
        <title>Hijabi Inoor - Premium Modest Fashion</title>
        <meta name="description" content="Discover elegant abayas and hijabs designed for the modern Muslim woman. Premium quality, beautiful designs, and exceptional comfort." />
        <meta name="keywords" content="hijab, abaya, modest fashion, muslim clothing, islamic wear, hijabi, modest dress, premium hijabs" />
        <meta property="og:title" content="Hijabi Inoor - Premium Modest Fashion" />
        <meta property="og:description" content="Discover elegant abayas and hijabs designed for the modern Muslim woman. Premium quality, beautiful designs." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hijabiinoor.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hijabi Inoor - Premium Modest Fashion" />
        <meta name="twitter:description" content="Discover elegant abayas and hijabs designed for the modern Muslim woman. Premium quality, beautiful designs." />
      </Helmet>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="relative">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:category" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/hijabs" element={<Products />} />
            <Route path="/abayas" element={<Products />} />
            <Route path="/dresses" element={<Products />} />
            <Route path="/accessories" element={<Products />} />
            <Route path="/coords" element={<Products />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals and Overlays */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
          >
            <Cart />
          </motion.div>
        )}

        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
          >
            <MobileMenu />
          </motion.div>
        )}

        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
          >
            <SearchModal />
          </motion.div>
        )}

        {isNewsletterModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
          >
            <NewsletterModal />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <LoadingSpinner message={loadingMessage} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1F2937',
            color: '#F9FAFB',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#F9FAFB',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#F9FAFB',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
