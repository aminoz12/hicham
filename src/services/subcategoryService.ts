import { supabase } from '@/lib/supabase';

export interface Subcategory {
  id: string;
  name: string;
  nameFr?: string;
  slug: string;
  categoryId?: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
}

// Fetch all subcategories for a category
export async function fetchSubcategoriesByCategory(categorySlug: string): Promise<Subcategory[]> {
  try {
    const { data, error } = await supabase
      .from('subcategories')
      .select(`
        *,
        category:categories!inner(slug)
      `)
      .eq('categories.slug', categorySlug)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      // Try without relation if it fails
      const errorMessage = error?.message || String(error) || '';
      if (errorMessage.includes('relation') || errorMessage.includes('foreign key')) {
        console.warn('Category relation error, trying without relation:', errorMessage);
        // Get category ID first
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();
        
        if (category) {
          const result = await supabase
            .from('subcategories')
            .select('*')
            .eq('category_id', category.id)
            .eq('is_active', true)
            .order('display_order', { ascending: true });
          
          if (result.error) throw result.error;
          return (result.data || []).map(mapSupabaseToSubcategory);
        }
      }
      throw error;
    }

    return (data || []).map(mapSupabaseToSubcategory);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return [];
  }
}

// Fetch all hijab subcategories
export async function fetchHijabSubcategories(): Promise<Subcategory[]> {
  return fetchSubcategoriesByCategory('hijabs');
}

// Fetch a subcategory by slug
export async function fetchSubcategoryBySlug(slug: string): Promise<Subcategory | null> {
  try {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows
      throw error;
    }

    return data ? mapSupabaseToSubcategory(data) : null;
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    return null;
  }
}

// Map Supabase data to Subcategory interface
function mapSupabaseToSubcategory(data: any): Subcategory {
  return {
    id: data.id,
    name: data.name,
    nameFr: data.name_fr || data.name,
    slug: data.slug,
    categoryId: data.category_id,
    description: data.description,
    isActive: data.is_active !== false,
    displayOrder: data.display_order || 0,
  };
}










