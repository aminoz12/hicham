import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Menu, 
  ChevronDown,
  ShoppingCart
} from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { clsx } from 'clsx';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  const location = useLocation();
  const { itemCount } = useCartStore();
  const { t } = useTranslation('navigation');
  const { 
    toggleMobileMenu, 
    toggleCart
  } = useUIStore();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items
  const navigationItems = [
    {
      label: t('hijabs'),
      href: '/hijabs',
      children: [
        { label: t('modalHijabs'), href: '/hijabs?type=modal' },
        { label: t('jerseyHijabs'), href: '/hijabs?type=jersey' },
        { label: t('chiffonHijabs'), href: '/hijabs?type=chiffon' },
        { label: t('satinHijabs'), href: '/hijabs?type=satin' },
      ]
    },
    {
      label: t('abayas'),
      href: '/abayas',
      children: [
        { label: t('embroideredAbayas'), href: '/abayas?type=embroidered' },
        { label: t('pleatedAbayas'), href: '/abayas?type=pleated' },
        { label: t('openAbayas'), href: '/abayas?type=open' },
        { label: t('abayaDresses'), href: '/abayas?type=dress' },
      ]
    },
    {
      label: t('coords'),
      href: '/coords',
      children: [
        { label: t('topSkirtSets'), href: '/coords?type=top-skirt' },
        { label: t('topPantsSets'), href: '/coords?type=top-pants' },
        { label: t('knitwearSets'), href: '/coords?type=knitwear' },
      ]
    },
    {
      label: t('ensemble'),
      href: '/ensemble',
      children: [
        { label: t('topSkirtSets'), href: '/ensemble?type=top-skirt' },
        { label: t('topPantsSets'), href: '/ensemble?type=top-pants' },
        { label: t('knitwearSets'), href: '/ensemble?type=knitwear' },
      ]
    },
    {
      label: t('boxesCadeau'),
      href: '/boxes-cadeau',
    }
  ];

  return (
    <>
      {/* Main Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
        className={clsx(
          'sticky top-0 z-40 transition-all duration-300',
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
            : 'bg-white shadow-sm'
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 relative">
            
            {/* Left Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {navigationItems.map((item) => (
                <div key={item.label} className="relative group">
                  <Link
                    to={item.href}
                    className={clsx(
                      'flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors',
                      location.pathname === item.href
                        ? 'text-gray-900'
                        : 'text-gray-700 hover:text-gray-900'
                    )}
                  >
                    <span>{item.label}</span>
                    {item.children && <ChevronDown className="h-3 w-3" />}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.children && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                    >
                      {item.children?.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>

            {/* Centered Logo */}
            <Link 
              to="/" 
              className="absolute left-1/2 transform -translate-x-1/2 flex items-center group"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-8 lg:h-10 flex items-center justify-center"
              >
                <LazyLoadImage
                  src="/logo.png"
                  alt="Hijabi Inoor Logo"
                  effect="blur"
                  placeholderSrc="/logo.png"
                  width="auto"
                  height="100%"
                  className="h-full w-auto object-contain"
                />
              </motion.div>
            </Link>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="p-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors relative"
                aria-label="Shopping cart"
              >
                <span className="hidden lg:inline">Cart ({itemCount})</span>
                <div className="lg:hidden relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.header>
    </>
  );
};

export default Header;