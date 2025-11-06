<<<<<<< HEAD
/* ---------------------------------------------------------------------------
   SuppliersManager –  Gestion des fournisseurs + Ajout via Dialog
-------------------------------------------------------------------------- */
import { useEffect, useState } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Plus, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';


/* --------------------------- Types --------------------------- */
interface Supplier {
  id: number;
  name: string;
  category: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  orders?: number;          // optionnel – pas utilisé à l’ajout
  totalPurchases?: number;  // optionnel – idem
}

/* --------------------------- Component --------------------------- */
export function Suppliers() {
  /* ---------- état local ---------- */
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  /* ---------- formulaire ---------- */
  const [form, setForm] = useState<Partial<Supplier>>({
    name: '',
    category: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
  });

  /* ---------- fetch fournisseurs ---------- */
  useEffect(() => {
    fetch('http://localhost:3000/api/suppliers')
      .then(r => r.json())
      .then(setSuppliers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  /* ---------- helpers ---------- */
  const handleChange = (field: keyof Supplier) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      category: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      status: 'active',
    });
  };

  /* ---------- ajout fournisseur ---------- */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    // validation ultra‑simple
    if (!form.name?.trim() || !form.category?.trim()) {
      alert('Le nom et la catégorie sont obligatoires.');
      return;
    }

    try {
      const resp = await fetch('http://localhost:3000/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Erreur serveur');
      }

      const created: Supplier = await resp.json();
      setSuppliers(prev => [...prev, created]);   // mise à jour UI
      setDialogOpen(false);
      resetForm();
    } catch (err: any) {
      alert(err.message);
    }
  };

  /* ---------- suppression (facultatif) ---------- */
  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce fournisseur ?')) return;

    await fetch(`http://localhost:3000/api/suppliers/${id}`, {
      method: 'DELETE',
    });
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  /* ---------- rendu ---------- */
  if (loading) return <p className="text-center py-8">Chargement des fournisseurs…</p>;
  if (error)   return <p className="text-center text-red-600 py-8">{error}</p>;

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex justify-between items-center">
        <div>
          <h2>Fournisseurs</h2>
          <p className="text-gray-600 mt-1">{suppliers.length} fournisseurs enregistrés</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau fournisseur
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau fournisseur</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAdd} className="space-y-4 py-4">
              {/* ---- Nom ---- */}
              <div className="space-y-2">
                <Label htmlFor="name">Nom du fournisseur</Label>
                <Input
                  id="name"
                  required
                  value={form.name ?? ''}
                  onChange={handleChange('name')}
                  placeholder="Ex : Bio Fruits & Légumes SA"
                />
              </div>

              {/* ---- Catégorie ---- */}
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie d’activité</Label>
                <Input
                  id="category"
                  required
                  value={form.category ?? ''}
                  onChange={handleChange('category')}
                  placeholder="Ex : Fruits & Légumes"
                />
              </div>

              {/* ---- Contact ---- */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact (nom)</Label>
                  <Input
                    id="contact"
                    value={form.contact ?? ''}
                    onChange={handleChange('contact')}
                    placeholder="Pierre Durand"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone ?? ''}
                    onChange={handleChange('phone')}
                    placeholder="01 23 45 67 89"
                  />
                </div>
              </div>

              {/* ---- Email ---- */}
              <div className="space-y-2">
                <Label htmlFor="email">E‑mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email ?? ''}
                  onChange={handleChange('email')}
                  placeholder="contact@exemple.fr"
                />
              </div>

              {/* ---- Adresse ---- */}
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={form.address ?? ''}
                  onChange={handleChange('address')}
                  placeholder="15 Rue des Maraîchers, 75012 Paris"
                />
              </div>

              {/* ---- Boutons ----------
               * On garde le même style que vos autres dialogs */}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Ajouter le fournisseur</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ---------- Statistiques (unchanged) ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600">Fournisseurs actifs</p>
          <p className="mt-2">{suppliers.filter(s => s.status === 'active').length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Commandes ce mois</p>
          <p className="mt-2">…</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Total achats</p>
          <p className="mt-2">…</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Paiements en attente</p>
          <p className="mt-2">…</p>
        </Card>
      </div>

      {/* ---------- Grille fournisseurs ---------- */}
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
              <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
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

            <div className="border-t border-gray-200 pt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => alert('TODO : formulaire d’édition')}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>

              <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDelete(supplier.id!)}>Supprimer</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
=======
/* ---------------------------------------------------------------------------
   SuppliersManager –  Gestion des fournisseurs + Ajout via Dialog
-------------------------------------------------------------------------- */
import { useEffect, useState } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Plus, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';


/* --------------------------- Types --------------------------- */
interface Supplier {
  id: number;
  name: string;
  category: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  orders?: number;          // optionnel – pas utilisé à l’ajout
  totalPurchases?: number;  // optionnel – idem
}

/* --------------------------- Component --------------------------- */
export function Suppliers() {
  /* ---------- état local ---------- */
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  /* ---------- formulaire ---------- */
  const [form, setForm] = useState<Partial<Supplier>>({
    name: '',
    category: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
  });

  /* ---------- fetch fournisseurs ---------- */
  useEffect(() => {
    fetch('http://localhost:3000/api/suppliers')
      .then(r => r.json())
      .then(setSuppliers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  /* ---------- helpers ---------- */
  const handleChange = (field: keyof Supplier) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      category: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      status: 'active',
    });
  };

  /* ---------- ajout fournisseur ---------- */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    // validation ultra‑simple
    if (!form.name?.trim() || !form.category?.trim()) {
      alert('Le nom et la catégorie sont obligatoires.');
      return;
    }

    try {
      const resp = await fetch('http://localhost:3000/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Erreur serveur');
      }

      const created: Supplier = await resp.json();
      setSuppliers(prev => [...prev, created]);   // mise à jour UI
      setDialogOpen(false);
      resetForm();
    } catch (err: any) {
      alert(err.message);
    }
  };

  /* ---------- suppression (facultatif) ---------- */
  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce fournisseur ?')) return;

    await fetch(`http://localhost:3000/api/suppliers/${id}`, {
      method: 'DELETE',
    });
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  /* ---------- rendu ---------- */
  if (loading) return <p className="text-center py-8">Chargement des fournisseurs…</p>;
  if (error)   return <p className="text-center text-red-600 py-8">{error}</p>;

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex justify-between items-center">
        <div>
          <h2>Fournisseurs</h2>
          <p className="text-gray-600 mt-1">{suppliers.length} fournisseurs enregistrés</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau fournisseur
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau fournisseur</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAdd} className="space-y-4 py-4">
              {/* ---- Nom ---- */}
              <div className="space-y-2">
                <Label htmlFor="name">Nom du fournisseur</Label>
                <Input
                  id="name"
                  required
                  value={form.name ?? ''}
                  onChange={handleChange('name')}
                  placeholder="Ex : Bio Fruits & Légumes SA"
                />
              </div>

              {/* ---- Catégorie ---- */}
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie d’activité</Label>
                <Input
                  id="category"
                  required
                  value={form.category ?? ''}
                  onChange={handleChange('category')}
                  placeholder="Ex : Fruits & Légumes"
                />
              </div>

              {/* ---- Contact ---- */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact (nom)</Label>
                  <Input
                    id="contact"
                    value={form.contact ?? ''}
                    onChange={handleChange('contact')}
                    placeholder="Pierre Durand"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone ?? ''}
                    onChange={handleChange('phone')}
                    placeholder="01 23 45 67 89"
                  />
                </div>
              </div>

              {/* ---- Email ---- */}
              <div className="space-y-2">
                <Label htmlFor="email">E‑mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email ?? ''}
                  onChange={handleChange('email')}
                  placeholder="contact@exemple.fr"
                />
              </div>

              {/* ---- Adresse ---- */}
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={form.address ?? ''}
                  onChange={handleChange('address')}
                  placeholder="15 Rue des Maraîchers, 75012 Paris"
                />
              </div>

              {/* ---- Boutons ----------
               * On garde le même style que vos autres dialogs */}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Ajouter le fournisseur</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ---------- Statistiques (unchanged) ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600">Fournisseurs actifs</p>
          <p className="mt-2">{suppliers.filter(s => s.status === 'active').length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Commandes ce mois</p>
          <p className="mt-2">…</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Total achats</p>
          <p className="mt-2">…</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Paiements en attente</p>
          <p className="mt-2">…</p>
        </Card>
      </div>

      {/* ---------- Grille fournisseurs ---------- */}
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
              <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
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

            <div className="border-t border-gray-200 pt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => alert('TODO : formulaire d’édition')}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>

              <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDelete(supplier.id!)}>Supprimer</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
>>>>>>> 2845e41692162b969f30320f9c10272d966a8b14
