import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import Categories from '@/components/Categories';
import VideoSection from '@/components/VideoSection';
import Testimonials from '@/components/Testimonials';
import Newsletter from '@/components/Newsletter';
import { useUIStore } from '@/store/uiStore';

const Home: React.FC = () => {
  const { setLoading } = useUIStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const springY = useSpring(y, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  return (
    <div ref={containerRef} className="relative">
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

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Video Section */}
      <VideoSection />

      {/* Testimonials */}
      <Testimonials />

      {/* Newsletter */}
      <Newsletter />

      {/* Parallax Background Elements */}
      <motion.div
        style={{ y: springY }}
        className="fixed inset-0 -z-10 pointer-events-none"
      >
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </motion.div>
    </div>
  );
};

export default Home;
