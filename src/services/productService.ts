import { supabase } from '@/lib/supabase';
import { Product, ProductCategory } from '@/types';

// Mapper les données Supabase vers le format Product
function mapSupabaseProductToProduct(supabaseProduct: any): Product {
  const stockQuantity = supabaseProduct.stock_quantity ?? 0;
  // Ensure images array has max 3 items and at least the main image
  const images = supabaseProduct.images && Array.isArray(supabaseProduct.images) 
    ? supabaseProduct.images.slice(0, 3).filter((img: string) => img) // Limit to 3 and filter empty
    : supabaseProduct.image 
      ? [supabaseProduct.image] 
      : [];
  
  // Ensure main image is in images array
  if (supabaseProduct.image && !images.includes(supabaseProduct.image)) {
    images.unshift(supabaseProduct.image);
    // Keep only first 3
    if (images.length > 3) images.pop();
  }
  
  return {
    id: supabaseProduct.id,
    name: supabaseProduct.name,
    nameAr: supabaseProduct.name_ar || supabaseProduct.name,
    nameFr: supabaseProduct.name_fr || supabaseProduct.name,
    nameIt: supabaseProduct.name_it || supabaseProduct.name,
    nameEs: supabaseProduct.name_es || supabaseProduct.name,
    price: parseFloat(supabaseProduct.price),
    originalPrice: supabaseProduct.original_price ? parseFloat(supabaseProduct.original_price) : undefined,
    image: supabaseProduct.image,
    images: images,
    category: supabaseProduct.category?.slug || supabaseProduct.category_slug || (supabaseProduct.category_id ? 'hijabs' : 'hijabs'),
    subcategory: supabaseProduct.subcategory_info?.slug || supabaseProduct.subcategory || '',
    description: supabaseProduct.description || '',
    descriptionAr: supabaseProduct.description_ar || supabaseProduct.description || '',
    descriptionFr: supabaseProduct.description_fr || supabaseProduct.description || '',
    descriptionIt: supabaseProduct.description_it || supabaseProduct.description || '',
    descriptionEs: supabaseProduct.description_es || supabaseProduct.description || '',
    colors: supabaseProduct.colors || [],
    sizes: supabaseProduct.sizes || [],
    stockQuantity: stockQuantity,
    inStock: stockQuantity > 0, // Calculate from stockQuantity
    isNew: supabaseProduct.is_new || false,
    newArrival: supabaseProduct.new_arrival || false,
    isBestSeller: supabaseProduct.is_best_seller || false,
    isOnSale: supabaseProduct.is_on_sale || false,
    rating: supabaseProduct.rating || 0,
    reviewCount: supabaseProduct.review_count || 0,
    tags: supabaseProduct.tags || [],
  };
}

// Récupérer tous les produits
export async function fetchAllProducts(): Promise<Product[]> {
  try {
    // Essayer d'abord avec la relation category et subcategory
    let { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(slug, name),
        subcategory_info:subcategories(slug, name, name_fr)
      `)
      .order('created_at', { ascending: false });

    // Si erreur de relation, essayer sans relation
    if (error) {
      const errorMsg = error?.message || String(error) || '';
      if (errorMsg.includes('relation') || errorMsg.includes('foreign key')) {
        console.warn('Category relation error, trying without relation:', errorMsg);
        const result = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        data = result.data;
        error = result.error;
      }
    }

    if (error) {
      // Gérer les erreurs de certificat SSL
      const errorMessage = error?.message || String(error) || '';
      if (errorMessage.includes('certificate') || errorMessage.includes('SSL') || errorMessage.includes('ERR_PROXY')) {
        console.error('SSL/Certificate error connecting to Supabase. Please check your network/proxy settings.');
        return [];
      }
      console.error('Error fetching products:', error);
      throw error;
    }

    console.log('Raw data from Supabase:', data?.length || 0, data);
    const products = (data || []).map(mapSupabaseProductToProduct);
    console.log('Mapped products:', products.length);
    return products;
  } catch (error: any) {
    // Gérer les erreurs de certificat SSL
    const errorMessage = error?.message || String(error) || '';
    if (errorMessage.includes('certificate') || errorMessage.includes('SSL') || errorMessage.includes('ERR_PROXY')) {
      console.error('SSL/Certificate error connecting to Supabase. Please check your network/proxy settings.');
      return [];
    }
    console.error('Error in fetchAllProducts:', error);
    return [];
  }
}

// Récupérer un produit par ID (peut être UUID, SKU, ou slug)
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    // Essayer d'abord par ID (UUID)
    let { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(slug, name)
      `)
      .eq('id', id)
      .single();

    // Si erreur de relation, essayer sans relation
    const errorMessage = error?.message || String(error) || '';
    if (error && (errorMessage.includes('relation') || errorMessage.includes('foreign key'))) {
      console.warn('Category relation error, trying without relation:', errorMessage);
      const result = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (!error && data) {
      return mapSupabaseProductToProduct(data);
    }

    // Si pas trouvé par ID, essayer par SKU (ex: "PROD-19")
    if (error && (error.code === 'PGRST116' || error.message?.includes('No rows'))) {
      const { data: dataBySku, error: errorBySku } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(slug, name)
        `)
        .eq('sku', id)
        .maybeSingle();

      if (!errorBySku && dataBySku) {
        return mapSupabaseProductToProduct(dataBySku);
      }

      // Si l'ID est un nombre (ancien format), essayer avec "PROD-" prefix
      if (/^\d+$/.test(id)) {
        const sku = `PROD-${id}`;
        const { data: dataBySku2, error: errorBySku2 } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(slug, name)
          `)
          .eq('sku', sku)
          .maybeSingle();

        if (!errorBySku2 && dataBySku2) {
          return mapSupabaseProductToProduct(dataBySku2);
        }
      }

      // Essayer par slug
      const { data: dataBySlug, error: errorBySlug } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(slug, name)
        `)
        .eq('slug', id)
        .maybeSingle();

      if (!errorBySlug && dataBySlug) {
        return mapSupabaseProductToProduct(dataBySlug);
      }
    }

    return null;
  } catch (error: any) {
    // Gérer les erreurs de certificat SSL
    const errorMessage = error?.message || String(error) || '';
    if (errorMessage.includes('certificate') || errorMessage.includes('SSL') || errorMessage.includes('ERR_PROXY')) {
      console.error('SSL/Certificate error connecting to Supabase. Please check your network/proxy settings.');
      return null;
    }
    console.error('Error in fetchProductById:', error);
    return null;
  }
}

// Récupérer les produits par catégorie
export async function fetchProductsByCategory(category: ProductCategory): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories!inner(slug, name)
      `)
      .eq('categories.slug', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }

    return (data || []).map(mapSupabaseProductToProduct);
  } catch (error) {
    console.error('Error in fetchProductsByCategory:', error);
    return [];
  }
}

// Récupérer les produits en vedette
export async function fetchFeaturedProducts(limit: number = 8): Promise<Product[]> {
  try {
    // Essayer d'abord avec la relation category
    let { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(slug, name)
      `)
      .or('is_new.eq.true,is_best_seller.eq.true,is_featured.eq.true')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Si erreur de relation, essayer sans relation
    const errorMessage = error?.message || String(error) || '';
    if (error && (errorMessage.includes('relation') || errorMessage.includes('foreign key'))) {
      console.warn('Category relation error, trying without relation:', errorMessage);
      const result = await supabase
        .from('products')
        .select('*')
        .or('is_new.eq.true,is_best_seller.eq.true,is_featured.eq.true')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      // Gérer les erreurs de certificat SSL
      const errorMsg = error?.message || String(error) || '';
      if (errorMsg.includes('certificate') || errorMsg.includes('SSL') || errorMsg.includes('ERR_PROXY')) {
        console.error('SSL/Certificate error connecting to Supabase. Please check your network/proxy settings.');
        return [];
      }
      console.error('Error fetching featured products:', error);
      throw error;
    }

    const products = (data || []).map(mapSupabaseProductToProduct);
    return products;
  } catch (error: any) {
    // Gérer les erreurs de certificat SSL
    const errorMessage = error?.message || String(error) || '';
    if (errorMessage.includes('certificate') || errorMessage.includes('SSL') || errorMessage.includes('ERR_PROXY')) {
      console.error('SSL/Certificate error connecting to Supabase. Please check your network/proxy settings.');
      return [];
    }
    console.error('Error in fetchFeaturedProducts:', error);
    return [];
  }
}

// Rechercher des produits
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(slug, name)
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,name_fr.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching products:', error);
      throw error;
    }

    return (data || []).map(mapSupabaseProductToProduct);
  } catch (error) {
    console.error('Error in searchProducts:', error);
    return [];
  }
}

// Créer ou mettre à jour un produit (pour l'admin)
export async function saveProduct(product: Partial<Product>): Promise<Product> {
  try {
    // Obtenir l'ID de la catégorie
    let categoryId: string | null = null;
    if (product.category) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', product.category)
        .single();
      
      if (categoryError) {
        console.error('Error fetching category:', categoryError);
      }
      
      categoryId = category?.id || null;
    }

    // Obtenir l'ID de la sous-catégorie si fournie (slug -> id)
    let subcategoryId: string | null = null;
    if (product.subcategory && product.category === 'hijabs') {
      const { data: subcategory, error: subcategoryError } = await supabase
        .from('subcategories')
        .select('id')
        .eq('slug', product.subcategory)
        .single();
      
      if (subcategoryError) {
        console.error('Error fetching subcategory:', subcategoryError);
      }
      
      subcategoryId = subcategory?.id || null;
    }

    // Générer un slug unique (seulement pour les nouveaux produits)
    let slug: string = '';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    
    if (product.id) {
      // Pour la mise à jour, récupérer le slug existant
      const { data: existingProduct } = await supabase
        .from('products')
        .select('slug')
        .eq('id', product.id)
        .single();
      slug = existingProduct?.slug || '';
    }
    
    // Si pas de slug (nouveau produit ou produit existant sans slug), en générer un
    if (!slug) {
      const generateSlug = (text: string): string => {
        return text
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      };

      const baseSlug = generateSlug(product.name || 'product');
      slug = `${baseSlug}-${timestamp}-${randomStr}`;
    }

    // Générer un SKU unique si pas fourni
    const sku = (product as any).sku || `PROD-${timestamp}-${randomStr}`;

    // Ensure images array has max 3 items
    const images = product.images && Array.isArray(product.images)
      ? product.images.slice(0, 3).filter((img: string) => img) // Limit to 3 and filter empty
      : product.image 
        ? [product.image] 
        : [];
    
    // Ensure main image is in images array
    if (product.image && !images.includes(product.image)) {
      images.unshift(product.image);
      // Keep only first 3
      if (images.length > 3) images.pop();
    }

    const stockQuantity = (product as any).stockQuantity ?? 0;

    const productData: any = {
      name: product.name,
      name_ar: product.nameAr || product.name,
      name_fr: product.nameFr || product.name,
      name_it: product.nameIt || product.name,
      name_es: product.nameEs || product.name,
      slug: slug,
      sku: sku,
      price: product.price,
      original_price: product.originalPrice || null,
      image: product.image,
      images: images,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      subcategory: product.subcategory || null, // Keep for backward compatibility
      description: product.description || '',
      description_ar: product.descriptionAr || product.description || '',
      description_fr: product.descriptionFr || product.description || '',
      description_it: product.descriptionIt || product.description || '',
      description_es: product.descriptionEs || product.description || '',
      colors: product.colors || [],
      sizes: product.sizes || [],
      stock_quantity: stockQuantity,
      in_stock: stockQuantity > 0, // Calculate from stockQuantity
      is_new: product.isNew || false,
      new_arrival: product.newArrival || false,
      is_best_seller: product.isBestSeller || false,
      is_on_sale: product.isOnSale || false,
      rating: product.rating || 0,
      review_count: product.reviewCount || 0,
      tags: product.tags || [],
    };

    // Ajouter les champs de promotion si présents
    if ((product as any).promotionType) {
      productData.promotion_type = (product as any).promotionType === 'none' ? null : (product as any).promotionType;
      productData.promotion_value = (product as any).promotionValue || null;
    }

    if (product.id) {
      // Mise à jour
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id)
        .select(`
          *,
          category:categories(slug, name)
        `)
        .single();

      if (error) throw error;
      return mapSupabaseProductToProduct(data);
    } else {
      // Création
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select(`
          *,
          category:categories(slug, name)
        `)
        .single();

      if (error) throw error;
      return mapSupabaseProductToProduct(data);
    }
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
}

// Supprimer un produit (pour l'admin)
export async function deleteProduct(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

