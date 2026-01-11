import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatPrice } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

// Mock function - replace with actual API call
const fetchOrder = async (orderId: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    id: orderId,
    orderNumber: `ORD-${orderId.padStart(3, '0')}`,
    customerEmail: 'client@example.com',
    customerName: 'Marie Dupont',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'processing',
    paymentStatus: 'paid',
    subtotal: 99.99,
    shipping: 9.99,
    tax: 21.99,
    total: 131.97,
    shippingAddress: {
      name: 'Marie Dupont',
      street: '123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
    },
    items: [
      {
        id: '1',
        name: 'Hijab en soie',
        price: 49.99,
        quantity: 2,
        image: '/images/hijab-soie.jpg',
      },
    ],
  };
};

export function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => fetchOrder(id!),
    enabled: !!id,
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
    return <div>Chargement de la commande...</div>;
  }

  if (error || !order) {
    return <div>Erreur lors du chargement de la commande</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Commande #{order.orderNumber}
          </h1>
          <p className="text-muted-foreground">
            Passée le {format(new Date(order.createdAt), 'PP', { locale: fr })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Articles commandés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Quantité: {item.quantity}
                      </p>
                    </div>
                    <div className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span>{formatPrice(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-2 border-t mt-2">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statut de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Statut</p>
                <Badge variant={statusVariant[order.status] || 'outline'}>
                  {statusLabels[order.status] || order.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Paiement</p>
                <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}>
                  {order.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Dernière mise à jour</p>
                <p>{format(new Date(order.updatedAt), 'PPpp', { locale: fr })}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adresse de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.postalCode} {order.shippingAddress.city}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

