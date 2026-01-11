import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShoppingBag, 
  Package, 
  Euro, 
  Users,
  AlertCircle
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { sampleProducts } from '@/data/products';

// Mock data - replace with actual API calls
const fetchStats = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const totalProducts = sampleProducts.length;
  const totalOrders = 124; // Mock data
  const totalRevenue = 15234.50; // Mock data
  const totalUsers = 89; // Mock data
  const lowStockProducts = sampleProducts.filter(p => !p.inStock).length;
  
  return {
    totalProducts,
    totalOrders,
    totalRevenue,
    totalUsers,
    lowStockProducts,
    recentOrders: [],
  };
};

export function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchStats,
  });

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  const statCards = [
    {
      title: 'Produits',
      value: stats?.totalProducts || 0,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Commandes',
      value: stats?.totalOrders || 0,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Revenus',
      value: formatPrice(stats?.totalRevenue || 0),
      icon: Euro,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Utilisateurs',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre boutique
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats?.lowStockProducts && stats.lowStockProducts > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Produits en rupture de stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-800">
              {stats.lowStockProducts} produit(s) sont actuellement en rupture de stock.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Commandes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Aucune commande récente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Aucune activité récente
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

