import { Card } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TrendingUp, TrendingDown, ShoppingCart, Package, DollarSign, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

export function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [period, setPeriod] = useState<'week'|'month'|'year'>('week');

  const [weekSalesData, setWeekSalesData] = useState<any[]>([]);
  const [monthSalesData, setMonthSalesData] = useState<any[]>([]);
  const [yearSalesData, setYearSalesData] = useState<any[]>([]);

  // ---- Dashboard cards ----
  useEffect(() => {
    fetch('http://localhost:3000/api/stats/dashboard')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  // ---- Sales par période (graphiques) ----
  useEffect(() => {
    fetch(`http://localhost:3000/api/sales?period=${period}`)
      .then(r => r.json())
      .then(data => {
        // Transforme le tableau sales en format {name, ventes}
        const chart = data.map((s:any) => ({
          name: new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short' }),
          ventes: s.total
        }));
        if (period === 'week') setWeekSalesData(chart);
        if (period === 'month') setMonthSalesData(chart);
        if (period === 'year') setYearSalesData(chart);
      })
      .catch(console.error);
  }, [period]);

  // ---- Catégories (pie) ----
  useEffect(() => {
    fetch('http://localhost:3000/api/stats/categories')
      .then(r => r.json())
      .then(setCategoryData)
      .catch(console.error);
  }, []);

  // Remplace les valeurs calculées localement par celles reçues du back-end
  const dayStats = stats?.day ?? { sales: 0, transactions: 0, items: 0, avgTicket: 0 };
  const monthStats = stats?.month ?? { sales: 0, transactions: 0, items: 0, avgTicket: 0 };
  const yearStats = stats?.year ?? { sales: 0, transactions: 0, items: 0, avgTicket: 0 };

  const statsCards = [
    {
      label: 'Ventes du jour',
      value: `${dayStats.sales.toFixed(2)} €`,
      change: '+12.5%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Transactions',
      value: dayStats.transactions.toString(),
      change: '+8.3%',
      trend: 'up',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Ticket moyen',
      value: `${dayStats.avgTicket.toFixed(2)} €`,
      change: '+5.1%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Articles vendus',
      value: dayStats.items.toString(),
      change: '+15.4%',
      trend: 'up',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const categoryDataLocal = categoryData;

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="mt-2">{stat.value}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Period Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="mb-4">Aujourd'hui</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Ventes:</span>
              <span>{dayStats.sales.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transactions:</span>
              <span>{dayStats.transactions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Articles:</span>
              <span>{dayStats.items}</span>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="mb-4">Ce mois</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Ventes:</span>
              <span>{monthStats.sales.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transactions:</span>
              <span>{monthStats.transactions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Articles:</span>
              <span>{monthStats.items}</span>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="mb-4">Cette année</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Ventes:</span>
              <span>{yearStats.sales.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transactions:</span>
              <span>{yearStats.transactions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Articles:</span>
              <span>{yearStats.items}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts with Tabs */}
      <Card className="p-6">
  <Tabs value={period} onValueChange={(v: 'week' | 'month' | 'year') => setPeriod(v)}>
          <div className="flex justify-between items-center mb-4">
            <h3>Évolution des ventes</h3>
            <TabsList>
              <TabsTrigger value="week">Semaine</TabsTrigger>
              <TabsTrigger value="month">Mois</TabsTrigger>
              <TabsTrigger value="year">Année</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="week">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weekSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ventes" fill="#10b981" name="Ventes (€)" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="month">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ventes" fill="#3b82f6" name="Ventes (€)" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="year">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ventes" stroke="#8b5cf6" strokeWidth={2} name="Ventes (€)" />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Category Distribution */}
      <Card className="p-6">
        <h3 className="mb-4">Répartition par catégorie</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryDataLocal}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryDataLocal.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
