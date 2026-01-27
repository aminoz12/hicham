import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Star, Heart, Share2, Truck, RotateCcw, MessageCircle, Plus, Minus, ShoppingCart } from 'lucide-react';
import { fetchProductById, fetchProductsByCategory } from '@/services/productService';
import { formatPrice, calculateDiscount } from '@/utils';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Product } from '@/types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { addItem, updateQuantity } = useCartStore();
  const { t: tHome } = useTranslation('home');
  const { t } = useTranslation('products');

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        setIsLoading(true);
        const productData = await fetchProductById(id);
        setProduct(productData);
        setIsLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]);
      setSelectedSize(product.sizes[0]);
      
      // Load related products from the same category
      const loadRelatedProducts = async () => {
        try {
          const categoryProducts = await fetchProductsByCategory(product.category as any);
          // Filter out current product and randomly select 5
          const filtered = categoryProducts.filter(p => p.id !== product.id);
          const shuffled = filtered.sort(() => 0.5 - Math.random());
          setRelatedProducts(shuffled.slice(0, 5));
        } catch (error) {
          console.error('Error loading related products:', error);
          setRelatedProducts([]);
        }
      };
      
      loadRelatedProducts();
    }
    // Scroll to top when product loads
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('productNotFound')}</h1>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            {t('backToProducts')}
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      toast.error(t('selectColorSize'));
      return;
    }

    addItem(product, selectedColor, selectedSize);
    
    // If quantity is more than 1, update it
    if (quantity > 1) {
      const itemId = `${product.id}-${selectedColor}-${selectedSize}`;
      updateQuantity(itemId, quantity);
    }
    
    toast.success(`${product.name} ${t('itemAdded')}`);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? t('removedFromWishlist') : t('addedToWishlist'));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('linkCopied'));
    }
  };

  const features = [
    { icon: Truck, text: t('freeShipping') + ' sur les commandes de plus de 69€' },
    { icon: RotateCcw, text: 'Retours sous 30 jours' },
    { icon: MessageCircle, text: tHome('hero.features.orderViaWhatsApp') }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{product.name} - HIJABI NOUR</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.images[0]} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
          
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-xl bg-gray-50 shadow-sm">
              <LazyLoadImage
                src={product.images[selectedImage]}
                alt={product.name}
                effect="blur"
                placeholderSrc="/logo.png"
                width="100%"
                height="100%"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden rounded-md transition-all duration-200 ${
                      selectedImage === index
                        ? 'ring-2 ring-gray-900 shadow-sm'
                        : 'hover:ring-2 hover:ring-gray-300 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <LazyLoadImage
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      effect="blur"
                      placeholderSrc="/logo.png"
                      width="100%"
                      height="100%"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-8"
          >
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 font-medium mb-2">
              <span className="hover:text-gray-700 transition-colors">{t('home')}</span> / <span className="hover:text-gray-700 transition-colors">{t('products')}</span> / <span className="text-gray-900 font-semibold">{product.category}</span>
            </nav>

            {/* Title */}
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight tracking-tight">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600 font-medium">({product.reviewCount} {t('reviews')})</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-gray-900 font-serif">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through font-medium">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="bg-red-50 text-red-700 px-3 py-1 rounded-md text-sm font-semibold border border-red-200">
                    -{calculateDiscount(product.originalPrice, product.price)}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-base text-gray-700 leading-relaxed font-sans">{product.description}</p>

            {/* Colors */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide text-sm">{t('color')}: <span className="normal-case font-medium text-gray-700">{selectedColor}</span></h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-5 py-2.5 rounded-md border-2 transition-all duration-200 font-medium text-sm ${
                      selectedColor === color
                        ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide text-sm">{t('size')}: <span className="normal-case font-medium text-gray-700">{selectedSize}</span></h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 rounded-md border-2 flex items-center justify-center font-semibold text-sm transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide text-sm">{t('quantity')}</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-md overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 py-3 font-semibold text-gray-900 min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {product.inStock ? t('inStock') : t('outOfStock')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base py-4"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>{t('addToCart')}</span>
                </button>
                <button
                  onClick={handleWishlist}
                  className={`p-4 rounded-md border-2 transition-all duration-200 ${
                    isWishlisted
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                  aria-label="Add to wishlist"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-4 rounded-md border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 bg-white"
                  aria-label="Share product"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <feature.icon className="h-5 w-5 text-gray-700 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 leading-relaxed">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">{t('tags')}</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 pt-16 border-t border-gray-200"
          >
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-10">Vous pourriez aussi aimer</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group"
                >
                  <Link 
                    to={`/product/${relatedProduct.id}`} 
                    className="block"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden mb-3 bg-gray-50">
                      <LazyLoadImage
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        effect="blur"
                        placeholderSrc="/logo.png"
                        width="100%"
                        height="100%"
                        className="w-full h-[250px] sm:h-[300px] object-cover group-hover:opacity-95 transition-opacity duration-300"
                      />
                      {relatedProduct.images && relatedProduct.images[1] && (
                        <LazyLoadImage
                          src={relatedProduct.images[1]}
                          alt={relatedProduct.name}
                          effect="blur"
                          placeholderSrc="/logo.png"
                          width="100%"
                          height="100%"
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                      )}
                      
                      {/* Sale Badge */}
                      {relatedProduct.isOnSale && relatedProduct.originalPrice && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          -{calculateDiscount(relatedProduct.originalPrice, relatedProduct.price)}%
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1 group-hover:opacity-70 transition-opacity line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(relatedProduct.price)}
                        </span>
                        {relatedProduct.originalPrice && (
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(relatedProduct.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
