import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/types';
import { supabase } from '@/lib/supabase';
import { fetchProductById, saveProduct as saveProductService, deleteProduct as deleteProductService } from '@/services/productService';
import toast from 'react-hot-toast';

const fetchProduct = async (id: string): Promise<Product | null> => {
  return await fetchProductById(id);
};

const saveProduct = async (product: Partial<Product>): Promise<Product> => {
  return await saveProductService(product);
};

const deleteProduct = async (_id: string): Promise<void> => {
  await deleteProductService(_id);
};

export function AdminProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const { data: product, isLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => fetchProduct(id!),
    enabled: !isNew && !!id,
  });

  const saveMutation = useMutation({
    mutationFn: saveProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(isNew ? 'Produit créé avec succès' : 'Produit mis à jour');
      navigate('/admin/products');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Produit supprimé');
      navigate('/admin/products');
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    nameFr: '',
    price: '',
    image: '',
    category: 'hijabs' as Product['category'],
    description: '',
    descriptionFr: '',
    inStock: true,
    isNew: false,
    isOnSale: false,
    originalPrice: '',
    sizes: [] as string[],
    colors: [] as string[],
    promotionType: 'none' as 'none' | 'buy2get1' | 'buy2' | 'buy3' | 'percentage',
    promotionValue: '',
  });
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product && !isNew) {
      setFormData({
        name: product.name,
        nameFr: product.nameFr,
        price: product.price.toString(),
        image: product.image,
        category: product.category,
        description: product.description,
        descriptionFr: product.descriptionFr,
        inStock: product.inStock,
        isNew: product.isNew,
        isOnSale: product.isOnSale,
        originalPrice: product.originalPrice?.toString() || '',
        sizes: product.sizes || [],
        colors: product.colors || [],
        promotionType: (product as any).promotionType || 'none',
        promotionValue: (product as any).promotionValue || '',
      });
      setImagePreview(product.image);
    }
  }, [product, isNew]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner un fichier image');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5MB');
        return;
      }
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Check if bucket exists first
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        throw new Error('Impossible de vérifier les buckets de stockage');
      }

      const productsBucket = buckets?.find(b => b.name === 'products');
      if (!productsBucket) {
        toast.error(
          'Le bucket "products" n\'existe pas. Veuillez le créer dans votre dashboard Supabase.',
          { duration: 6000 }
        );
        throw new Error('Bucket "products" not found. Please create it in Supabase Storage.');
      }

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        // Provide more specific error messages
        if (error.message.includes('Bucket not found')) {
          toast.error(
            'Le bucket "products" n\'existe pas. Créez-le dans Supabase Storage > Storage > New bucket',
            { duration: 6000 }
          );
        } else if (error.message.includes('new row violates row-level security')) {
          toast.error(
            'Erreur de permissions. Vérifiez les politiques RLS du bucket.',
            { duration: 6000 }
          );
        } else {
          toast.error(`Erreur: ${error.message}`, { duration: 5000 });
        }
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      toast.success('Image téléchargée avec succès');
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      // Error toast already shown above
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = formData.image;
    
    // Upload image if a new file was selected
    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile);
      } catch (error) {
        return; // Stop submission if upload fails
      }
    }

    saveMutation.mutate({
      id: isNew ? Date.now().toString() : id,
      ...formData,
      image: imageUrl,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      sizes: formData.sizes,
      colors: formData.colors,
      promotionType: formData.promotionType === 'none' ? undefined : formData.promotionType,
      promotionValue: formData.promotionType === 'none' ? undefined : formData.promotionValue,
    } as any);
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteMutation.mutate(id!);
    }
  };

  if (isLoading && !isNew) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isNew ? 'Nouveau produit' : 'Modifier le produit'}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? 'Ajouter un nouveau produit' : 'Modifier les informations du produit'}
            </p>
          </div>
        </div>
        {!isNew && (
          <Button variant="destructive" onClick={handleDelete}>
            <X className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom (EN)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameFr">Nom (FR)</Label>
                <Input
                  id="nameFr"
                  value={formData.nameFr}
                  onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Product['category'] })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  required
                >
                  <option value="hijabs">Hijabs</option>
                  <option value="abayas">Abayas</option>
                  <option value="ensemble">Ensemble</option>
                  <option value="boxes-cadeau">Boxes Cadeau</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image du produit</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <div className="space-y-3">
                  {imagePreview && (
                    <div className="relative w-full h-96 border-2 border-dashed border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setImageFile(null);
                          setFormData({ ...formData, image: '' });
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Upload className="mr-2 h-4 w-4 animate-spin" />
                        Téléchargement...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {imagePreview ? 'Changer l\'image' : 'Télécharger une image'}
                      </>
                    )}
                  </Button>
                  <div className="text-sm text-slate-500 text-center pt-2 border-t">
                    Ou utilisez une URL
                  </div>
                  <Input
                    id="image-url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      if (e.target.value && !imageFile) {
                        setImagePreview(e.target.value);
                      } else if (!e.target.value && !imageFile) {
                        setImagePreview('');
                      }
                    }}
                    disabled={!!imageFile}
                  />
                  {imageFile && (
                    <p className="text-xs text-blue-600 text-center">
                      Un fichier est sélectionné. L'URL sera ignorée.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prix et disponibilité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Prix original (optionnel)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="rounded"
                  />
                  <span>En stock</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="rounded"
                  />
                  <span>Nouveau produit</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isOnSale}
                    onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
                    className="rounded"
                  />
                  <span>En promotion</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Promotion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="promotionType">Type de promotion</Label>
                <select
                  id="promotionType"
                  value={formData.promotionType}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      promotionType: e.target.value as any,
                      promotionValue: e.target.value === 'none' ? '' : formData.promotionValue,
                    });
                  }}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="none">Aucune promotion</option>
                  <option value="buy2get1">Achetez 2, obtenez 1 gratuit</option>
                  <option value="buy2">2 au prix de X</option>
                  <option value="buy3">3 au prix de X</option>
                  <option value="percentage">Réduction en pourcentage</option>
                </select>
              </div>

              {formData.promotionType === 'buy2' && (
                <div className="space-y-2">
                  <Label htmlFor="promotionValue">Prix pour 2 articles (€)</Label>
                  <Input
                    id="promotionValue"
                    type="number"
                    step="0.01"
                    value={formData.promotionValue}
                    onChange={(e) => setFormData({ ...formData, promotionValue: e.target.value })}
                    placeholder="Ex: 59.99"
                  />
                  <p className="text-xs text-slate-500">
                    Les clients paieront ce prix pour 2 articles au lieu de {formData.price ? (parseFloat(formData.price) * 2).toFixed(2) : '0.00'} €
                  </p>
                </div>
              )}

              {formData.promotionType === 'buy3' && (
                <div className="space-y-2">
                  <Label htmlFor="promotionValue">Prix pour 3 articles (€)</Label>
                  <Input
                    id="promotionValue"
                    type="number"
                    step="0.01"
                    value={formData.promotionValue}
                    onChange={(e) => setFormData({ ...formData, promotionValue: e.target.value })}
                    placeholder="Ex: 79.99"
                  />
                  <p className="text-xs text-slate-500">
                    Les clients paieront ce prix pour 3 articles au lieu de {formData.price ? (parseFloat(formData.price) * 3).toFixed(2) : '0.00'} €
                  </p>
                </div>
              )}

              {formData.promotionType === 'percentage' && (
                <div className="space-y-2">
                  <Label htmlFor="promotionValue">Pourcentage de réduction (%)</Label>
                  <Input
                    id="promotionValue"
                    type="number"
                    step="1"
                    min="1"
                    max="100"
                    value={formData.promotionValue}
                    onChange={(e) => setFormData({ ...formData, promotionValue: e.target.value })}
                    placeholder="Ex: 20"
                  />
                  <p className="text-xs text-slate-500">
                    Réduction de {formData.promotionValue || '0'}% sur le prix ({formData.price ? (parseFloat(formData.price) * (1 - (parseFloat(formData.promotionValue || '0') / 100))).toFixed(2) : '0.00'} €)
                  </p>
                </div>
              )}

              {formData.promotionType === 'buy2get1' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Offre spéciale:</strong> Les clients recevront 1 article gratuit pour chaque 2 articles achetés.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tailles et Couleurs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sizes */}
            <div className="space-y-3">
              <Label>Tailles disponibles</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.sizes.map((size, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          sizes: formData.sizes.filter((_, i) => i !== index),
                        });
                      }}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <select
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  className="flex h-10 w-48 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner une taille</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="One Size">One Size</option>
                </select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (sizeInput && !formData.sizes.includes(sizeInput)) {
                      setFormData({
                        ...formData,
                        sizes: [...formData.sizes, sizeInput],
                      });
                      setSizeInput('');
                    }
                  }}
                  disabled={!sizeInput || formData.sizes.includes(sizeInput)}
                >
                  Ajouter
                </Button>
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <Label>Couleurs disponibles</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.colors.map((color, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          colors: formData.colors.filter((_, i) => i !== index),
                        });
                      }}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Noir, Beige, Marron..."
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (colorInput.trim() && !formData.colors.includes(colorInput.trim())) {
                        setFormData({
                          ...formData,
                          colors: [...formData.colors, colorInput.trim()],
                        });
                        setColorInput('');
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (colorInput.trim() && !formData.colors.includes(colorInput.trim())) {
                      setFormData({
                        ...formData,
                        colors: [...formData.colors, colorInput.trim()],
                      });
                      setColorInput('');
                    }
                  }}
                  disabled={!colorInput.trim() || formData.colors.includes(colorInput.trim())}
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description (EN)</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionFr">Description (FR)</Label>
              <textarea
                id="descriptionFr"
                value={formData.descriptionFr}
                onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" asChild>
            <Link to="/admin/products">Annuler</Link>
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
}

