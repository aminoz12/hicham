import { supabase } from '@/lib/supabase';
import { Product, ProductCategory } from '@/types';

// Mapper les données Supabase vers le format Product
function mapSupabaseProductToProduct(supabaseProduct: any): Product {
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
    images: supabaseProduct.images || [supabaseProduct.image],
    category: supabaseProduct.category?.slug || supabaseProduct.category_slug || 'hijabs',
    subcategory: supabaseProduct.subcategory,
    description: supabaseProduct.description || '',
    descriptionAr: supabaseProduct.description_ar || supabaseProduct.description || '',
    descriptionFr: supabaseProduct.description_fr || supabaseProduct.description || '',
    descriptionIt: supabaseProduct.description_it || supabaseProduct.description || '',
    descriptionEs: supabaseProduct.description_es || supabaseProduct.description || '',
    colors: supabaseProduct.colors || [],
    sizes: supabaseProduct.sizes || [],
    inStock: supabaseProduct.in_stock !== false,
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
    // Essayer d'abord avec la relation category
    let { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(slug, name)
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

    const products = (data || []).map(mapSupabaseProductToProduct);
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
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', product.category)
        .single();
      
      categoryId = category?.id || null;
    }

    const productData: any = {
      name: product.name,
      name_ar: product.nameAr || product.name,
      name_fr: product.nameFr || product.name,
      name_it: product.nameIt || product.name,
      name_es: product.nameEs || product.name,
      price: product.price,
      original_price: product.originalPrice || null,
      image: product.image,
      images: product.images || [product.image],
      category_id: categoryId,
      subcategory: product.subcategory || null,
      description: product.description || '',
      description_ar: product.descriptionAr || product.description || '',
      description_fr: product.descriptionFr || product.description || '',
      description_it: product.descriptionIt || product.description || '',
      description_es: product.descriptionEs || product.description || '',
      colors: product.colors || [],
      sizes: product.sizes || [],
      in_stock: product.inStock !== false,
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

