import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import Categories from '@/components/Categories';
import Testimonials from '@/components/Testimonials';
import Newsletter from '@/components/Newsletter';
import { useUIStore } from '@/store/uiStore';

const Home: React.FC = () => {
  const { setLoading } = useUIStore();

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  return (
    <div className="relative bg-white">
      <Helmet>
        <title>Hijabi Inoor - Premium Modest Fashion | Elegant Abayas & Hijabs</title>
        <meta name="description" content="Discover our curated collection of premium abayas, hijabs, and modest fashion. Elegant designs, exceptional quality, and perfect for the modern Muslim woman." />
        <meta name="keywords" content="hijab, abaya, modest fashion, muslim clothing, islamic wear, hijabi, elegant abayas, premium hijabs" />
        <meta property="og:title" content="Hijabi Inoor - Premium Modest Fashion" />
        <meta property="og:description" content="Discover our curated collection of premium abayas, hijabs, and modest fashion. Elegant designs, exceptional quality." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hijabiinoor.com" />
      </Helmet>

      {/* Hero Section */}
      <Hero />

      {/* Categories Section */}
      <Categories />

      {/* Featured Products / Curated Selection */}
      <FeaturedProducts />

      {/* Testimonials */}
      <Testimonials />

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
};

export default Home;
