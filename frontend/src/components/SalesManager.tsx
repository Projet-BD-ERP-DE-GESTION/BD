import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Download, Eye, Filter } from 'lucide-react';
// switched to API-driven data (fetch)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

export function SalesManager() {
  const [period, setPeriod] = useState<'day'|'month'|'year'>('day');
  const [sales, setSales] = useState<any[]>([]);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // ==== Chargement selon la période ====
  useEffect(() => {
    fetch(`http://localhost:3000/api/sales?period=${period}`)
      .then(r => r.json())
      .then(setSales)
      .catch(console.error);
  }, [period]);

  const calculatePeriodStats = () => {
    const periodSales = sales;
    const total = periodSales.reduce((sum, sale) => sum + (sale.total ?? 0), 0);
    const items = periodSales.reduce((sum, sale) => 
      sum + (sale.items?.reduce((itemSum:any, item:any) => itemSum + (item.quantity ?? 0), 0) ?? 0), 0
    );
    const avgTicket = periodSales.length > 0 ? total / periodSales.length : 0;
    
    const cardPayments = periodSales.filter((s:any) => s.payment === 'Carte bancaire').length;
    const cashPayments = periodSales.filter((s:any) => s.payment === 'Espèces').length;
    
    return {
      total,
      transactions: periodSales.length,
      items,
      avgTicket,
      cardPayments,
      cashPayments,
    };
  };

  const stats = calculatePeriodStats();

  const getPaymentBadge = (payment: string) => {
    if (payment === 'Carte bancaire') {
      return <Badge className="bg-blue-100 text-blue-800">Carte</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Espèces</Badge>;
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'day': return "Aujourd'hui";
      case 'month': return 'Ce mois';
      case 'year': return 'Cette année';
    }
  };

  // ==== Détails d’une vente ====
  const viewDetails = async (id: string) => {
    try {
      const resp = await fetch(`http://localhost:3000/api/sales/${id}`);
      const data = await resp.json();
      setSelectedSale(data);
      setDetailOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
  <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
          <TabsList>
            <TabsTrigger value="day">Aujourd'hui</TabsTrigger>
            <TabsTrigger value="month">Ce mois</TabsTrigger>
            <TabsTrigger value="year">Cette année</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600">Ventes {getPeriodLabel().toLowerCase()}</p>
          <p className="mt-2">{stats.transactions}</p>
          <p className="text-sm text-green-600 mt-1">+12%</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Montant total</p>
          <p className="mt-2">{stats.total.toFixed(2)} €</p>
          <p className="text-sm text-green-600 mt-1">+8%</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Ticket moyen</p>
          <p className="mt-2">{stats.avgTicket.toFixed(2)} €</p>
          <p className="text-sm text-red-600 mt-1">-3%</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Articles vendus</p>
          <p className="mt-2">{stats.items}</p>
          <p className="text-sm text-green-600 mt-1">+15%</p>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-gray-600">N° Vente</th>
                <th className="text-left py-3 px-4 text-gray-600">Date & Heure</th>
                <th className="text-left py-3 px-4 text-gray-600">Articles</th>
                <th className="text-left py-3 px-4 text-gray-600">Montant</th>
                <th className="text-left py-3 px-4 text-gray-600">Paiement</th>
                <th className="text-left py-3 px-4 text-gray-600">Caissier(ère)</th>
                <th className="text-left py-3 px-4 text-gray-600">Rayon</th>
                <th className="text-left py-3 px-4 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    Aucune vente pour cette période
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{sale.id}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {sale.date} à {sale.time}
                    </td>
                    <td className="py-3 px-4">
                      {sale.items?.reduce((sum:any, item:any) => sum + (item.quantity ?? 0), 0) ?? 0}
                    </td>
                    <td className="py-3 px-4">{sale.total.toFixed(2)} €</td>
                    <td className="py-3 px-4">{getPaymentBadge(sale.payment)}</td>
                    <td className="py-3 px-4">{sale.cashierName}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{sale.department}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewDetails(sale.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="mb-4">Répartition des paiements</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Carte bancaire</span>
              <span>{stats.cardPayments} ({stats.transactions > 0 ? ((stats.cardPayments / stats.transactions) * 100).toFixed(0) : 0}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${stats.transactions > 0 ? (stats.cardPayments / stats.transactions) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Espèces</span>
              <span>{stats.cashPayments} ({stats.transactions > 0 ? ((stats.cashPayments / stats.transactions) * 100).toFixed(0) : 0}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${stats.transactions > 0 ? (stats.cashPayments / stats.transactions) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4">Horaires de vente</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Matin (6h-12h)</span>
              <span>0 ventes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Après-midi (12h-18h)</span>
              <span>{sales.length} ventes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Soir (18h-22h)</span>
              <span>0 ventes</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ventes totales</span>
              <span className="text-green-600">{stats.total.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Articles/vente</span>
              <span>{stats.transactions > 0 ? (stats.items / stats.transactions).toFixed(1) : 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Objectif du {getPeriodLabel().toLowerCase()}</span>
              <span className="text-orange-600">15,000 €</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Sale Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la vente {selectedSale?.id}</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Date et heure</p>
                  <p>{selectedSale.date} à {selectedSale.time}</p>
                </div>
                <div>
                  <p className="text-gray-600">Caissier(ère)</p>
                  <p>{selectedSale.cashierName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Mode de paiement</p>
                  <p>{selectedSale.payment}</p>
                </div>
                <div>
                  <p className="text-gray-600">Rayon principal</p>
                  <p>{selectedSale.department}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-3">Articles</h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p>{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          {item.price.toFixed(2)} € × {item.quantity}
                        </p>
                      </div>
                      <p>{item.total.toFixed(2)} €</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total:</span>
                  <span>{selectedSale.subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TVA (10%):</span>
                  <span>{selectedSale.tax.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-green-600">{selectedSale.total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
