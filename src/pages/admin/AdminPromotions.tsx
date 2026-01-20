import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Tag, Percent, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import {
  fetchPromotions,
  savePromotion,
  deletePromotion,
  type Promotion
} from '@/services/promotionService';

export function AdminPromotions() {
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const queryClient = useQueryClient();

  const { data: promotions = [], isLoading, error } = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: fetchPromotions,
  });

  const saveMutation = useMutation({
    mutationFn: savePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
      toast.success('Promotion enregistrée avec succès');
      setShowForm(false);
      setEditingPromotion(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
      toast.success('Promotion supprimée');
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    start_date: '',
    end_date: '',
    is_active: true,
    min_purchase_amount: '',
    max_discount_amount: '',
    usage_limit: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      start_date: '',
      end_date: '',
      is_active: true,
      min_purchase_amount: '',
      max_discount_amount: '',
      usage_limit: '',
    });
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      code: promotion.code || '',
      description: promotion.description,
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value.toString(),
      start_date: promotion.start_date.split('T')[0],
      end_date: promotion.end_date.split('T')[0],
      is_active: promotion.is_active,
      min_purchase_amount: promotion.min_purchase_amount?.toString() || '',
      max_discount_amount: promotion.max_discount_amount?.toString() || '',
      usage_limit: promotion.usage_limit?.toString() || '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.discount_value || !formData.start_date || !formData.end_date) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    saveMutation.mutate({
      id: editingPromotion?.id,
      name: formData.name,
      code: formData.code || undefined,
      description: formData.description,
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
      is_active: formData.is_active,
      min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount) : undefined,
      max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : undefined,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : undefined,
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
      deleteMutation.mutate(id);
    }
  };

  const isPromotionActive = (promotion: Promotion) => {
    if (!promotion.is_active) return false;
    const now = new Date();
    const start = new Date(promotion.start_date);
    const end = new Date(promotion.end_date);
    return now >= start && now <= end;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur lors du chargement des promotions</p>
        <p className="text-sm text-gray-500 mt-2">Vérifiez que la table "promotions" existe dans Supabase</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
          <p className="text-muted-foreground">
            Gérez les offres promotionnelles et codes promo
          </p>
        </div>
        <Button onClick={() => {
          setShowForm(!showForm);
          setEditingPromotion(null);
          resetForm();
        }}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Annuler' : 'Nouvelle promotion'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {editingPromotion ? 'Modifier la promotion' : 'Nouvelle promotion'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la promotion *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Soldes d'été"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code promo (optionnel)</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: SUMMER20"
                    className="uppercase"
                  />
                  <p className="text-xs text-gray-500">
                    Laissez vide pour une promotion automatique
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de la promotion"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_type">Type de réduction *</Label>
                  <select
                    id="discount_type"
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (€)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    {formData.discount_type === 'percentage' ? 'Pourcentage (%)' : 'Montant (€)'} *
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    step="0.01"
                    min="0"
                    max={formData.discount_type === 'percentage' ? '100' : undefined}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_date">Date de début *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Date de fin *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_purchase_amount">Montant minimum d'achat (€)</Label>
                  <Input
                    id="min_purchase_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.min_purchase_amount}
                    onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                    placeholder="0 = pas de minimum"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_discount_amount">Réduction maximum (€)</Label>
                  <Input
                    id="max_discount_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.max_discount_amount}
                    onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                    placeholder="0 = pas de maximum"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usage_limit">Limite d'utilisation</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    min="0"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    placeholder="0 = illimité"
                  />
                </div>
                <div className="space-y-2 flex items-end">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium">Promotion active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingPromotion(null);
                  resetForm();
                }}>
                  Annuler
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des promotions</CardTitle>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune promotion créée</p>
              <p className="text-sm">Cliquez sur "Nouvelle promotion" pour en créer une</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Utilisations</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell className="font-medium">
                      <div>
                        {promotion.name}
                        {promotion.description && (
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">
                            {promotion.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {promotion.code ? (
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {promotion.code}
                        </code>
                      ) : (
                        <span className="text-gray-400 text-sm">Auto</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        {promotion.discount_type === 'percentage' ? (
                          <Percent className="h-3 w-3" />
                        ) : (
                          <DollarSign className="h-3 w-3" />
                        )}
                        {promotion.discount_type === 'percentage' ? 'Pourcentage' : 'Montant fixe'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {promotion.discount_type === 'percentage' 
                        ? `${promotion.discount_value}%`
                        : `${promotion.discount_value}€`
                      }
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(promotion.start_date), 'dd/MM/yyyy', { locale: fr })}</div>
                        <div className="text-muted-foreground">
                          au {format(new Date(promotion.end_date), 'dd/MM/yyyy', { locale: fr })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {promotion.usage_count || 0}
                        {promotion.usage_limit ? ` / ${promotion.usage_limit}` : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isPromotionActive(promotion) ? 'default' : 'secondary'}>
                        {isPromotionActive(promotion) ? 'Active' : 
                          !promotion.is_active ? 'Désactivée' : 'Expirée'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(promotion)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(promotion.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
