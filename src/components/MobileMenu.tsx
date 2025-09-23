import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { X, ChevronRight, User, Heart, ShoppingBag } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import LanguageSwitcher from './LanguageSwitcher';

const MobileMenu: React.FC = () => {
  const location = useLocation();
  const { toggleMobileMenu } = useUIStore();
  const { itemCount } = useCartStore();

  const navigationItems = [
    {
      label: 'Hijabs',
      href: '/hijabs',
      children: [
        { label: 'Modal Hijabs', href: '/hijabs?type=modal' },
        { label: 'Jersey Hijabs', href: '/hijabs?type=jersey' },
        { label: 'Chiffon Hijabs', href: '/hijabs?type=chiffon' },
        { label: 'Satin Hijabs', href: '/hijabs?type=satin' },
      ]
    },
    {
      label: 'Abayas',
      href: '/abayas',
      children: [
        { label: 'Embroidered Abayas', href: '/abayas?type=embroidered' },
        { label: 'Pleated Abayas', href: '/abayas?type=pleated' },
        { label: 'Open Abayas', href: '/abayas?type=open' },
        { label: 'Dresses', href: '/abayas?type=dress' },
      ]
    },
    {
      label: 'Coords',
      href: '/coords',
      children: [
        { label: 'Top & Skirt Sets', href: '/coords?type=top-skirt' },
        { label: 'Top & Pants Sets', href: '/coords?type=top-pants' },
        { label: 'Knitwear Sets', href: '/coords?type=knitwear' },
      ]
    },
    {
      label: 'Accessories',
      href: '/accessories',
      children: [
        { label: 'Hijab Caps', href: '/accessories?type=caps' },
        { label: 'Magnets', href: '/accessories?type=magnets' },
        { label: 'Hair Ties', href: '/accessories?type=hair-ties' },
        { label: 'Neck Covers', href: '/accessories?type=neck-covers' },
      ]
    }
  ];

  const quickLinks = [
    { label: 'New Arrivals', href: '/products?filter=new' },
    { label: 'Sale', href: '/products?filter=sale' },
    { label: 'Best Sellers', href: '/products?filter=bestsellers' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={toggleMobileMenu}
      />

      {/* Menu Panel */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute left-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Menu</h2>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Menu Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Language Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Language
              </h3>
              <div className="p-3">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Account Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Account
              </h3>
              <div className="space-y-2">
                <Link
                  to="/account"
                  onClick={toggleMobileMenu}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900">My Account</span>
                </Link>
                <Link
                  to="/wishlist"
                  onClick={toggleMobileMenu}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Heart className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900">Wishlist</span>
                </Link>
                <Link
                  to="/cart"
                  onClick={toggleMobileMenu}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors relative"
                >
                  <ShoppingBag className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900">Cart</span>
                  {itemCount > 0 && (
                    <span className="ml-auto bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Shop
              </h3>
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <div key={item.label}>
                    <Link
                      to={item.href}
                      onClick={toggleMobileMenu}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        location.pathname === item.href
                          ? 'bg-primary-50 text-primary-600'
                          : 'hover:bg-gray-50 text-gray-900'
                      }`}
                    >
                      <span className="font-medium">{item.label}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    
                    {/* Submenu */}
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children?.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href}
                          onClick={toggleMobileMenu}
                          className="block p-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Quick Links
              </h3>
              <div className="space-y-1">
                {quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={toggleMobileMenu}
                    className="block p-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Stay Updated
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Get 15% off your first order and exclusive updates
              </p>
              <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 Hijabi Inoor</p>
            <p className="mt-1">Premium Modest Fashion</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MobileMenu;
