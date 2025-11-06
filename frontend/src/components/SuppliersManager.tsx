import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Phone, Mail, MapPin, Plus, Edit, Trash2 } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  category: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  orders: number;
  totalPurchases: number;
}

export function SuppliersManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/suppliers')
      .then(r => r.json())
      .then(setSuppliers)
      .finally(() => setLoading(false));
  }, []);

  // ==== Création ====
  const createSupplier = async (newSupp: Omit<Supplier,'id'>) => {
    const resp = await fetch('http://localhost:3000/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(newSupp)
    });
    const created = await resp.json();
    setSuppliers(prev => [...prev, created]);
  };

  // ==== Modification ====
  const updateSupplier = async (id: string, upd: Partial<Supplier>) => {
    const resp = await fetch(`http://localhost:3000/api/suppliers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(upd)
    });
    const updated = await resp.json();
    setSuppliers(prev => prev.map(s => s.id === id ? updated : s));
  };

  // ==== Suppression ====
  const deleteSupplier = async (id: string) => {
    await fetch(`http://localhost:3000/api/suppliers/${id}`, { method: 'DELETE' });
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  if (loading) return <p>Chargement...</p>;

  // Calcul des statistiques
  const activeCount = suppliers.filter(s => s.status === 'active').length;
  const monthlyOrders = suppliers.reduce((sum, s) => sum + s.orders, 0);
  const totalPurchases = suppliers.reduce((sum, s) => sum + s.totalPurchases, 0);
  const pendingPayments = 12450; // À remplacer par un calcul réel ou API

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2>Fournisseurs</h2>
          <p className="text-gray-600 mt-1">{suppliers.length} fournisseurs enregistrés</p>
        </div>
        <Button asChild className="gap-2">
          <a href="/NewsSuppliers">
            <Plus className="w-4 h-4" />
            Nouveau fournisseur
          </a>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600">Fournisseurs actifs</p>
          <p className="mt-2">{activeCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Commandes ce mois</p>
          <p className="mt-2">{monthlyOrders}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Total achats</p>
          <p className="mt-2">{totalPurchases.toLocaleString()} €</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Paiements en attente</p>
          <p className="mt-2">{pendingPayments.toLocaleString()} €</p>
        </Card>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3>{supplier.name}</h3>
                <Badge variant="outline" className="mt-2">
                  {supplier.category}
                </Badge>
              </div>
              <Badge
                variant={supplier.status === 'active' ? 'default' : 'secondary'}
              >
                {supplier.status === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{supplier.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{supplier.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{supplier.address}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Commandes</p>
                  <p>{supplier.orders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total achats</p>
                  <p>{supplier.totalPurchases.toLocaleString()} €</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    // TODO: Ouvrir modal updateSupplier
                    const updates = {
                      // Collecter depuis le form
                    };
                    updateSupplier(supplier.id, updates);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    if (confirm('Voulez-vous vraiment supprimer ce fournisseur ?')) {
                      deleteSupplier(supplier.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
                <Button size="sm" className="flex-1">
                  Nouvelle commande
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
