import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertTriangle, Package, TrendingDown, TrendingUp } from 'lucide-react';

export function InventoryManager() {
  const inventoryData = [
    {
      id: '1',
      name: 'Pain Complet 500g',
      category: 'Boulangerie',
      stock: 245,
      minStock: 50,
      maxStock: 300,
      status: 'ok',
      lastRestock: '2025-10-22',
      movement: '+50',
    },
    {
      id: '2',
      name: 'Lait Entier 1L',
      category: 'Produits laitiers',
      stock: 189,
      minStock: 100,
      maxStock: 250,
      status: 'ok',
      lastRestock: '2025-10-23',
      movement: '+80',
    },
    {
      id: '3',
      name: 'Tomates (kg)',
      category: 'Fruits & Légumes',
      stock: 25,
      minStock: 30,
      maxStock: 100,
      status: 'low',
      lastRestock: '2025-10-20',
      movement: '-15',
    },
    {
      id: '4',
      name: 'Poulet Fermier (kg)',
      category: 'Viandes',
      stock: 12,
      minStock: 20,
      maxStock: 50,
      status: 'critical',
      lastRestock: '2025-10-21',
      movement: '-8',
    },
    {
      id: '5',
      name: 'Eau Minérale 6x1.5L',
      category: 'Boissons',
      stock: 285,
      minStock: 80,
      maxStock: 250,
      status: 'overstocked',
      lastRestock: '2025-10-24',
      movement: '+120',
    },
  ];

  const stats = [
    {
      label: 'Produits en stock',
      value: '8,542',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Stock faible',
      value: '23',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Rupture de stock',
      value: '5',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Sur-stocké',
      value: '12',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return <Badge className="bg-green-100 text-green-800">OK</Badge>;
      case 'low':
        return <Badge className="bg-orange-100 text-orange-800">Stock faible</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critique</Badge>;
      case 'overstocked':
        return <Badge className="bg-purple-100 text-purple-800">Sur-stocké</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Inventory Tabs */}
      <Card className="p-6">
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Tous les produits</TabsTrigger>
            <TabsTrigger value="low">Stock faible</TabsTrigger>
            <TabsTrigger value="critical">Critique</TabsTrigger>
            <TabsTrigger value="overstocked">Sur-stocké</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600">Produit</th>
                    <th className="text-left py-3 px-4 text-gray-600">Catégorie</th>
                    <th className="text-left py-3 px-4 text-gray-600">Stock actuel</th>
                    <th className="text-left py-3 px-4 text-gray-600">Min / Max</th>
                    <th className="text-left py-3 px-4 text-gray-600">Statut</th>
                    <th className="text-left py-3 px-4 text-gray-600">Mouvement</th>
                    <th className="text-left py-3 px-4 text-gray-600">Dernier réappro</th>
                    <th className="text-left py-3 px-4 text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{item.category}</Badge>
                      </td>
                      <td className="py-3 px-4">{item.stock}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {item.minStock} / {item.maxStock}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={
                            item.movement.startsWith('+')
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {item.movement}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{item.lastRestock}</td>
                      <td className="py-3 px-4">
                        <Button size="sm">Réapprovisionner</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="low">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600">Produit</th>
                    <th className="text-left py-3 px-4 text-gray-600">Stock actuel</th>
                    <th className="text-left py-3 px-4 text-gray-600">Stock minimum</th>
                    <th className="text-left py-3 px-4 text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData
                    .filter((item) => item.status === 'low')
                    .map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4">{item.stock}</td>
                        <td className="py-3 px-4">{item.minStock}</td>
                        <td className="py-3 px-4">
                          <Button size="sm">Commander</Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="critical">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600">Produit</th>
                    <th className="text-left py-3 px-4 text-gray-600">Stock actuel</th>
                    <th className="text-left py-3 px-4 text-gray-600">Stock minimum</th>
                    <th className="text-left py-3 px-4 text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData
                    .filter((item) => item.status === 'critical')
                    .map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4 text-red-600">{item.stock}</td>
                        <td className="py-3 px-4">{item.minStock}</td>
                        <td className="py-3 px-4">
                          <Button size="sm" variant="destructive">
                            Commander urgent
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="overstocked">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600">Produit</th>
                    <th className="text-left py-3 px-4 text-gray-600">Stock actuel</th>
                    <th className="text-left py-3 px-4 text-gray-600">Stock maximum</th>
                    <th className="text-left py-3 px-4 text-gray-600">Excédent</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData
                    .filter((item) => item.status === 'overstocked')
                    .map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4">{item.stock}</td>
                        <td className="py-3 px-4">{item.maxStock}</td>
                        <td className="py-3 px-4 text-purple-600">
                          +{item.stock - item.maxStock}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
