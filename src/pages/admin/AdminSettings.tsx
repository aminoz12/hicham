import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

export function AdminSettings() {
  const handleSave = () => {
    toast.success('Paramètres sauvegardés');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres de votre boutique
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>
            Configurez les informations de base de votre boutique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store-name">Nom de la boutique</Label>
            <Input id="store-name" defaultValue="HIJABI NOUR" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-email">Email de contact</Label>
            <Input id="store-email" type="email" defaultValue="contact@hijabiinoor.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-phone">Téléphone</Label>
            <Input id="store-phone" type="tel" defaultValue="+33 1 23 45 67 89" />
          </div>
          <Button onClick={handleSave}>Sauvegarder</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres de livraison</CardTitle>
          <CardDescription>
            Configurez les options de livraison
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shipping-cost">Coût de livraison standard</Label>
            <Input id="shipping-cost" type="number" defaultValue="9.99" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="free-shipping">Seuil de livraison gratuite</Label>
            <Input id="free-shipping" type="number" defaultValue="50" />
          </div>
          <Button onClick={handleSave}>Sauvegarder</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres de paiement</CardTitle>
          <CardDescription>
            Configurez les méthodes de paiement acceptées
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Méthodes de paiement</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked />
                <span>Carte bancaire</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked />
                <span>PayPal</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" />
                <span>Virement bancaire</span>
              </label>
            </div>
          </div>
          <Button onClick={handleSave}>Sauvegarder</Button>
        </CardContent>
      </Card>
    </div>
  );
}

