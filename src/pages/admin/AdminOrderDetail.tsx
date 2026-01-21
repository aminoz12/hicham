import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatPrice } from '@/lib/utils';
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Truck, 
  CreditCard,
  RefreshCw,
  Save,
  Printer,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  getOrderById,
  updateOrder,
  Order,
  OrderStatus,
  PaymentStatus,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
} from '@/services/orderService';

export function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Editable fields
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const loadOrder = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const data = await getOrderById(id);
      if (data) {
        setOrder(data);
        setStatus(data.status);
        setPaymentStatus(data.payment_status);
        setTrackingNumber(data.tracking_number || '');
        setAdminNotes(data.admin_notes || '');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Erreur lors du chargement de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleSave = async () => {
    if (!order?.id) return;
    
    setIsSaving(true);
    try {
      const updates: Partial<Order> = {
        status,
        payment_status: paymentStatus,
        tracking_number: trackingNumber || undefined,
        admin_notes: adminNotes || undefined,
      };

      // Auto-set timestamps
      if (status === 'shipped' && order.status !== 'shipped') {
        updates.shipped_at = new Date().toISOString();
      }
      if (status === 'delivered' && order.status !== 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }

      await updateOrder(order.id, updates);
      toast.success('Commande mise à jour avec succès');
      setEditMode(false);
      loadOrder();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Commande non trouvée</h2>
        <p className="text-gray-500 mb-4">Cette commande n'existe pas ou a été supprimée.</p>
        <Button asChild>
          <Link to="/admin/orders">Retour aux commandes</Link>
        </Button>
      </div>
    );
  }

  const shippingAddress = order.shipping_address || {};

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Package className="h-6 w-6" />
              Commande {order.reference}
            </h1>
            <p className="text-muted-foreground">
              Créée le {order.created_at && format(new Date(order.created_at), 'PPP à HH:mm', { locale: fr })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Enregistrer
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>
              Modifier
            </Button>
          )}
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-bold">Hijabi Inoor</h1>
        <p className="text-lg">Commande {order.reference}</p>
        <p className="text-sm text-gray-500">
          {order.created_at && format(new Date(order.created_at), 'PPP', { locale: fr })}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Articles commandés ({order.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.png';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.product_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.selected_color && `Couleur: ${item.selected_color}`}
                        {item.selected_color && item.selected_size && ' • '}
                        {item.selected_size && `Taille: ${item.selected_size}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.unit_price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="font-semibold text-right">
                      {formatPrice(item.total_price)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction {order.promotion_code && `(${order.promotion_code})`}</span>
                    <span>-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>{order.shipping_cost === 0 ? 'Gratuite' : formatPrice(order.shipping_cost)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>Notes internes</CardTitle>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-3 border rounded-lg min-h-[100px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ajoutez des notes internes sur cette commande..."
                />
              ) : (
                <p className="text-gray-600">
                  {order.admin_notes || 'Aucune note'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Info */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Statut de la commande
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Statut commande</label>
                {editMode ? (
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OrderStatus)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="processing">En traitement</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                    <option value="refunded">Remboursée</option>
                  </select>
                ) : (
                  <Badge className={`${ORDER_STATUS_COLORS[order.status]} border-0 text-sm`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                )}
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Statut paiement</label>
                {editMode ? (
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="pending">En attente</option>
                    <option value="paid">Payé</option>
                    <option value="failed">Échoué</option>
                    <option value="refunded">Remboursé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                ) : (
                  <Badge className={`${PAYMENT_STATUS_COLORS[order.payment_status]} border-0 text-sm`}>
                    {PAYMENT_STATUS_LABELS[order.payment_status]}
                  </Badge>
                )}
              </div>

              {order.payment_method && (
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Méthode de paiement</label>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {order.payment_method === 'sumup_card' ? 'Carte bancaire (SumUp)' : order.payment_method}
                    </span>
                  </div>
                </div>
              )}

              {order.shipped_at && (
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Date d'expédition</label>
                  <p className="text-sm">{format(new Date(order.shipped_at), 'PPP à HH:mm', { locale: fr })}</p>
                </div>
              )}

              {order.delivered_at && (
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Date de livraison</label>
                  <p className="text-sm">{format(new Date(order.delivered_at), 'PPP à HH:mm', { locale: fr })}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking */}
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Suivi de livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Numéro de suivi..."
                />
              ) : (
                <p className="text-sm">
                  {order.tracking_number || 'Pas encore de numéro de suivi'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href={`mailto:${order.customer_email}`} className="text-primary-600 hover:underline">
                  {order.customer_email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a href={`tel:${order.customer_phone}`} className="text-primary-600 hover:underline">
                  {order.customer_phone}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adresse de livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  {shippingAddress.firstName} {shippingAddress.lastName}
                </p>
                <p>{shippingAddress.address}</p>
                {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                <p>
                  {shippingAddress.postalCode} {shippingAddress.city}
                </p>
                <p className="font-medium">{shippingAddress.countryName || shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>Historique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créée</span>
                <span>{order.created_at && format(new Date(order.created_at), 'PPp', { locale: fr })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mise à jour</span>
                <span>{order.updated_at && format(new Date(order.updated_at), 'PPp', { locale: fr })}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
