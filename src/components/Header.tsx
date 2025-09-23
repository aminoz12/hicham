import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Menu, 
  Heart, 
  User,
  ChevronDown,
  ShoppingCart
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { clsx } from 'clsx';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const location = useLocation();
  const { itemCount } = useCartStore();
  const { t } = useTranslation('navigation');
  const { 
    toggleMobileMenu, 
    toggleCart, 
    toggleSearch,
    setSearchQuery: setGlobalSearchQuery 
  } = useUIStore();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setGlobalSearchQuery(searchQuery);
      toggleSearch();
    }
  };

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
      label: t('accessories'),
      href: '/accessories',
      children: [
        { label: t('hijabCaps'), href: '/accessories?type=caps' },
        { label: t('magnets'), href: '/accessories?type=magnets' },
        { label: t('hairTies'), href: '/accessories?type=hair-ties' },
        { label: t('neckCovers'), href: '/accessories?type=neck-covers' },
      ]
    }
  ];

  return (
    <>
      {/* Top Bar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-primary-600 text-white py-2 px-4 text-center text-sm"
      >
        <p className="font-medium">
          🎉 Free shipping in Canada & US! Use code 'Welcome10' for 10% off your first order!
        </p>
      </motion.div>

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>

            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center group"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 flex items-center justify-center"
              >
                <img
                  src="/logo.png"
                  alt="Hijabi Inoor Logo"
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 ml-16">
              {navigationItems.map((item) => (
                <div key={item.label} className="relative group">
                  <Link
                    to={item.href}
                    className={clsx(
                      'flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-colors',
                      location.pathname === item.href
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    )}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Link>

                  {/* Dropdown Menu */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                  >
                    {item.children?.map((child) => (
                      <Link
                        key={child.label}
                        to={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </motion.div>
                </div>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder', { ns: 'common' })}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className={clsx(
                      'w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none transition-all duration-200',
                      isSearchFocused
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-300 hover:border-gray-400'
                    )}
                  />
                </div>
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              
              {/* Language Switcher */}
              <LanguageSwitcher />
              
              {/* Mobile Search Button */}
              <button
                onClick={toggleSearch}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search className="h-6 w-6 text-gray-700" />
              </button>

              {/* Wishlist */}
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="h-6 w-6 text-gray-700" />
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </button>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-6 w-6 text-gray-700" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </button>

              {/* User Account */}
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="User account"
              >
                <User className="h-6 w-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>
    </>
  );
};

export default Header;
