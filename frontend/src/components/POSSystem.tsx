import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useSales, SaleItem } from '../context/SalesContext';
import { Plus, Minus, Trash2, ShoppingCart, Barcode, CreditCard, Banknote } from 'lucide-react';
import { toast } from 'sonner';

// products will be loaded from the API

const CASHIERS = [
  { id: '1', name: 'Marie Dubois' },
  { id: '2', name: 'Jean Martin' },
  { id: '3', name: 'Sophie Lefebvre' },
];

export function POSSystem() {
  const { addSale } = useSales();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [barcode, setBarcode] = useState('');
  const [selectedCashier, setSelectedCashier] = useState(CASHIERS[0]);

  // ==== Chargement du catalogue ====
  useEffect(() => {
    fetch('http://localhost:3000/api/products')
      .then(r => r.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        total: product.price,
      }]);
    }
    toast.success(`${product.name} ajouté au panier`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity, total: newQuantity * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setBarcode('');
    } else {
      toast.error('Produit non trouvé');
    }
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const processSale = async (paymentMethod: string) => {
    if (cart.length === 0) {
      toast.error('Le panier est vide');
      return;
    }

    const { subtotal, tax, total } = calculateTotal();
    const now = new Date();
    const saleId = `VNT-${now.getFullYear()}-${String(now.getTime()).slice(-6)}`;
    
    // Détermine le département principal de la vente
    const departmentCounts: Record<string, number> = {};
    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        departmentCounts[product.department] = (departmentCounts[product.department] || 0) + item.total;
      }
    });
    const mainDepartment = Object.keys(departmentCounts).reduce((a, b) => 
      departmentCounts[a] > departmentCounts[b] ? a : b
    );

    const payload = {
      id: saleId,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0,5),
      subtotal,
      tax,
      total,
      payment: paymentMethod,
      cashierId: selectedCashier.id,
      department: mainDepartment,
      items: cart.map(i => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        price: i.price,
        total: i.total
      }))
    };

    // Envoi au serveur
    try {
      const resp = await fetch('http://localhost:3000/api/sales', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        setCart([]);
        toast.success(`Vente ${saleId} enregistrée`);
        // Rafraîchir le catalogue après vente (optionnel si serveur met à jour le stock)
        fetch('http://localhost:3000/api/products')
          .then(r => r.json())
          .then(setProducts)
          .catch(console.error);
      } else {
        const err = await resp.json();
        toast.error(err.error || 'Erreur serveur');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur réseau');
    }
  };

  const { subtotal, tax, total } = calculateTotal();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-6">
        {/* Barcode Scanner */}
        <Card className="p-6">
          <form onSubmit={handleBarcodeScan} className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Scanner le code-barres..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Scanner</Button>
          </form>
        </Card>

        {/* Products Grid */}
        <Card className="p-6">
          <h3 className="mb-4">Produits disponibles</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
              >
                <p className="text-sm truncate">{product.name}</p>
                <p className="text-green-600 mt-2">{product.price.toFixed(2)} €</p>
                <Badge variant="outline" className="mt-2 text-xs">
                  {product.category}
                </Badge>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Cart Section */}
      <div className="space-y-6">
        {/* Cashier Selection */}
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-2">Caissier(ère)</p>
          <select
            value={selectedCashier.id}
            onChange={(e) => {
              const cashier = CASHIERS.find(c => c.id === e.target.value);
              if (cashier) setSelectedCashier(cashier);
            }}
            className="w-full p-2 border border-gray-200 rounded-lg"
          >
            {CASHIERS.map((cashier) => (
              <option key={cashier.id} value={cashier.id}>
                {cashier.name}
              </option>
            ))}
          </select>
        </Card>

        {/* Cart */}
        <Card className="p-6 flex flex-col h-[calc(100vh-300px)]">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5" />
            <h3>Panier ({cart.length})</h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Panier vide</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-600">{item.price.toFixed(2)} € × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.productId, -1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.productId, 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="w-16 text-right">{item.total.toFixed(2)} €</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => removeFromCart(item.productId)}
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sous-total:</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">TVA (10%):</span>
              <span>{tax.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span className="text-green-600">{total.toFixed(2)} €</span>
            </div>
          </div>

          {/* Payment Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button
              onClick={() => processSale('Espèces')}
              className="gap-2"
              disabled={cart.length === 0}
            >
              <Banknote className="w-4 h-4" />
              Espèces
            </Button>
            <Button
              onClick={() => processSale('Carte bancaire')}
              className="gap-2"
              disabled={cart.length === 0}
            >
              <CreditCard className="w-4 h-4" />
              Carte
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
