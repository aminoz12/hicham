import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  name_fr?: string;
  slug: string;
  count?: number;
}

// Mock function - replace with actual Supabase call
const fetchCategories = async (): Promise<Category[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // In production: const { data } = await supabase.from('categories').select('*').order('name');
  return [
    { id: 'hijabs', name: 'Hijabs', name_fr: 'Hijabs', slug: 'hijabs', count: 45 },
    { id: 'abayas', name: 'Abayas', name_fr: 'Abayas', slug: 'abayas', count: 32 },
    { id: 'ensemble', name: 'Ensemble', name_fr: 'Ensemble', slug: 'ensemble', count: 18 },
    { id: 'boxes-cadeau', name: 'Boxes Cadeau', name_fr: 'Boxes Cadeau', slug: 'boxes-cadeau', count: 12 },
  ];
};

const createCategory = async (name: string): Promise<Category> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // In production:
  // const slug = name.toLowerCase().replace(/\s+/g, '-');
  // const { data, error } = await supabase
  //   .from('categories')
  //   .insert([{ name, name_fr: name, slug, is_active: true }])
  //   .select()
  //   .single();
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return { id: Date.now().toString(), name, name_fr: name, slug, count: 0 };
};

const deleteCategory = async (_id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // In production: await supabase.from('categories').delete().eq('id', id);
};

export function AdminCategories() {
  const [newCategory, setNewCategory] = useState('');
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: fetchCategories,
  });

  // Update local state when query data changes
  useEffect(() => {
    if (categories && categories.length > 0) {
      setCategoriesList(categories as Category[]);
    }
  }, [categories]);

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (newCat) => {
      setCategoriesList([...categoriesList, newCat]);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Catégorie ajoutée avec succès');
      setNewCategory('');
    },
    onError: () => {
      toast.error('Erreur lors de l\'ajout de la catégorie');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_, deletedId) => {
      setCategoriesList(categoriesList.filter(cat => cat.id !== deletedId));
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Catégorie supprimée');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      createMutation.mutate(newCategory.trim());
    } else {
      toast.error('Veuillez entrer un nom de catégorie');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${name}" ?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catégories</h1>
          <p className="text-muted-foreground">
            Gérez les catégories de produits
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter une catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Nom de la catégorie"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
            />
            <Button 
              onClick={handleAddCategory}
              disabled={createMutation.isPending || !newCategory.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              {createMutation.isPending ? 'Ajout...' : 'Ajouter'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catégories existantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categoriesList.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{category.name}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {category.count} produit(s)
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

