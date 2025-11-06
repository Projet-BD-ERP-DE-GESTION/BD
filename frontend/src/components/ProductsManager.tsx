import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Search, Edit, Trash2, Barcode } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  barcode: string;
  stock: number;
  minStock: number;
}

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // ==== Chargement ====
  useEffect(() => {
    fetch('http://localhost:3000/api/products')
      .then(r => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // ==== Filtre (local) ====
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.includes(searchTerm)
  );

  // ==== Création ====
  const createProduct = async (newProd: Omit<Product,'id'>) => {
    const resp = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(newProd)
    });
    const created = await resp.json();
    setProducts(prev => [...prev, created]);
    setIsAddDialogOpen(false);
  };

  // ==== Modification ====
  const updateProduct = async (id: string, upd: Partial<Product>) => {
    const resp = await fetch(`http://localhost:3000/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(upd)
    });
    const updated = await resp.json();
    setProducts(prev => prev.map(p => p.id === id ? updated : p));
  };

  // ==== Suppression ====
  const deleteProduct = async (id: string) => {
    await fetch(`http://localhost:3000/api/products/${id}`, { method: 'DELETE' });
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const categories = ['Boulangerie', 'Produits laitiers', 'Fruits & Légumes', 'Viandes', 'Boissons', 'Épicerie'];

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher par nom ou code-barres..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau produit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau produit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit</Label>
                <Input id="name" placeholder="Ex: Pain Complet 500g" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix de vente (€)</Label>
                  <Input id="price" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Prix d'achat (€)</Label>
                  <Input id="cost" type="number" step="0.01" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Code-barres</Label>
                <div className="flex gap-2">
                  <Input id="barcode" placeholder="3760123456789" />
                  <Button variant="outline" size="icon">
                    <BarCode className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock initial</Label>
                  <Input id="stock" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Stock minimum</Label>
                  <Input id="minStock" type="number" placeholder="0" />
                </div>
              </div>
              <Button 
                className="w-full"
                onClick={() => {
                  // TODO: Collect form data and call createProduct
                  const newProduct = {
                    name: '',  // Get from form
                    category: '',
                    price: 0,
                    cost: 0,
                    barcode: '',
                    stock: 0,
                    minStock: 0
                  };
                  createProduct(newProduct);
                }}
              >
                Ajouter le produit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-gray-600">Produit</th>
                <th className="text-left py-3 px-4 text-gray-600">Catégorie</th>
                <th className="text-left py-3 px-4 text-gray-600">Code-barres</th>
                <th className="text-left py-3 px-4 text-gray-600">Prix vente</th>
                <th className="text-left py-3 px-4 text-gray-600">Prix achat</th>
                <th className="text-left py-3 px-4 text-gray-600">Marge</th>
                <th className="text-left py-3 px-4 text-gray-600">Stock</th>
                <th className="text-left py-3 px-4 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const margin = ((product.price - product.cost) / product.price) * 100;
                const isLowStock = product.stock < product.minStock;
                return (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{product.category}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{product.barcode}</td>
                    <td className="py-3 px-4">{product.price.toFixed(2)} €</td>
                    <td className="py-3 px-4">{product.cost.toFixed(2)} €</td>
                    <td className="py-3 px-4 text-green-600">{margin.toFixed(1)}%</td>
                    <td className="py-3 px-4">
                      <Badge variant={isLowStock ? 'destructive' : 'default'}>
                        {product.stock}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            // TODO: Open edit dialog
                            const updates = {};
                            updateProduct(product.id, updates);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
                              deleteProduct(product.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
