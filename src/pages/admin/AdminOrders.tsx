import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatPrice } from '@/lib/utils';

// Mock data - replace with actual API calls
const fetchOrders = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    {
      id: '1',
      orderNumber: 'ORD-001',
      customerEmail: 'client@example.com',
      customerName: 'Marie Dupont',
      createdAt: new Date(),
      total: 129.99,
      status: 'processing',
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      customerEmail: 'another@example.com',
      customerName: 'Sophie Martin',
      createdAt: new Date(Date.now() - 86400000),
      total: 89.99,
      status: 'shipped',
    },
  ];
};

export function AdminOrders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: fetchOrders,
  });

  const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    processing: 'default',
    shipped: 'default',
    delivered: 'default',
    cancelled: 'destructive',
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    processing: 'En traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };

  if (isLoading) {
    return <div>Chargement des commandes...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
        <p className="text-muted-foreground">
          Gérez les commandes et suivez les expéditions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commandes récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link to={`/admin/orders/${order.id}`} className="hover:underline">
                      #{order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), 'PP', { locale: fr })}
                  </TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[order.status] || 'outline'}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/orders/${order.id}`}>Voir</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

