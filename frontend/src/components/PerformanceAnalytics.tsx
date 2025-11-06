import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Trophy, TrendingUp, Award, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

export function PerformanceAnalytics() {
  // API-driven: performance data for employees and departments
  const [empPerf, setEmpPerf] = useState<any[]>([]);
  const [deptPerf, setDeptPerf] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/stats/employees')
      .then(r => r.json())
      .then(setEmpPerf)
      .catch(console.error);
    fetch('http://localhost:3000/api/stats/departments')
      .then(r => r.json())
      .then(setDeptPerf)
      .catch(console.error);
  }, []);

  const employeeRanking = (empPerf || []).slice().sort((a: any, b: any) => (b.revenue || 0) - (a.revenue || 0));

  const departmentRanking = (deptPerf || []).slice().sort((a: any, b: any) => (b.revenue || 0) - (a.revenue || 0));

  const departmentChartData = departmentRanking.map((dept: any) => ({
    name: dept.department || dept.name || 'N/A',
    revenue: dept.revenue || 0,
    transactions: dept.transactions || 0,
  }));

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getRankBadge = (rank: number) => {
    if (rank === 0) return <Badge className="bg-yellow-100 text-yellow-800">🥇 1er</Badge>;
    if (rank === 1) return <Badge className="bg-gray-100 text-gray-800">🥈 2ème</Badge>;
    if (rank === 2) return <Badge className="bg-orange-100 text-orange-800">🥉 3ème</Badge>;
    return <Badge variant="outline">{rank + 1}ème</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {employeeRanking.slice(0, 3).map((employee: any, index) => (
          <Card key={employee.id} className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className={
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  'bg-orange-100 text-orange-800'
                }>
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getRankBadge(index)}
                </div>
                <h3 className="text-sm">{employee.name}</h3>
                <p className="text-green-600 mt-2">{(employee.revenue ?? 0).toFixed(2)} €</p>
                <p className="text-xs text-gray-600 mt-1">{employee.transactions ?? 0} ventes</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs for Different Analytics */}
      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="employees">Performance Employés</TabsTrigger>
          <TabsTrigger value="departments">Performance Rayons</TabsTrigger>
          <TabsTrigger value="comparison">Comparaison</TabsTrigger>
        </TabsList>

        {/* Employee Performance */}
        <TabsContent value="employees" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Classement des employés</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600">Rang</th>
                    <th className="text-left py-3 px-4 text-gray-600">Employé</th>
                    <th className="text-left py-3 px-4 text-gray-600">Ventes</th>
                    <th className="text-left py-3 px-4 text-gray-600">Transactions</th>
                    <th className="text-left py-3 px-4 text-gray-600">Chiffre d'affaires</th>
                    <th className="text-left py-3 px-4 text-gray-600">Ticket moyen</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeRanking.map((employee: any, index) => (
                    <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{getRankBadge(index)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                              {getInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{employee.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{employee.sales ?? 0} articles</td>
                      <td className="py-3 px-4">{employee.transactions ?? 0}</td>
                      <td className="py-3 px-4">{(employee.revenue ?? 0).toFixed(2)} €</td>
                      <td className="py-3 px-4">
                        {(employee.transactions > 0 ? ((employee.revenue ?? 0) / employee.transactions) : 0).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Employee Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Meilleur vendeur</p>
                  <p className="mt-1">{employeeRanking[0]?.name ?? '—'}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total CA</p>
                  <p className="mt-1">
                    {(empPerf.reduce((sum: number, emp: any) => sum + (emp.revenue || 0), 0)).toFixed(2)} €
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employés actifs</p>
                  <p className="mt-1">{empPerf.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">CA moyen/employé</p>
                  <p className="mt-1">
                    {(empPerf.length > 0 ? (empPerf.reduce((sum: number, emp: any) => sum + (emp.revenue || 0), 0) / empPerf.length) : 0).toFixed(2)} €
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Department Performance */}
        <TabsContent value="departments" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Performance par rayon</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={departmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Chiffre d'affaires (€)" />
                <Bar dataKey="transactions" fill="#3b82f6" name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">Classement des rayons</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600">Rang</th>
                    <th className="text-left py-3 px-4 text-gray-600">Rayon</th>
                    <th className="text-left py-3 px-4 text-gray-600">Transactions</th>
                    <th className="text-left py-3 px-4 text-gray-600">Articles vendus</th>
                    <th className="text-left py-3 px-4 text-gray-600">Chiffre d'affaires</th>
                    <th className="text-left py-3 px-4 text-gray-600">% du total</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentRanking.map((dept: any, index) => {
                    const totalRevenue = departmentRanking.reduce(
                      (sum: number, d: any) => sum + d.revenue,
                      0
                    );
                    const percentage = (dept.revenue / totalRevenue) * 100;
                    return (
                      <tr key={dept.department} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{getRankBadge(index)}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{dept.department}</Badge>
                        </td>
                        <td className="py-3 px-4">{dept.transactions}</td>
                        <td className="py-3 px-4">{dept.items}</td>
                        <td className="py-3 px-4">{(dept.revenue ?? 0).toFixed(2)} €</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span>{percentage.toFixed(1)}%</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Comparison */}
        <TabsContent value="comparison" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="mb-4">Top 5 Employés - Chiffre d'affaires</h3>
              <div className="space-y-3">
                {employeeRanking.slice(0, 5).map((employee: any, index) => (
                  <div key={employee.id} className="flex items-center gap-3">
                    <span className="text-gray-600 w-6">{index + 1}.</span>
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                        {getInitials(employee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">{employee.name}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(employee.revenue / employeeRanking[0].revenue) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm">{employee.revenue.toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Top 5 Rayons - Chiffre d'affaires</h3>
              <div className="space-y-3">
                {departmentRanking.slice(0, 5).map((dept: any, index) => (
                  <div key={dept.department} className="flex items-center gap-3">
                    <span className="text-gray-600 w-6">{index + 1}.</span>
                    <Badge variant="outline" className="w-32">{dept.department}</Badge>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(dept.revenue / departmentRanking[0].revenue) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm">{dept.revenue.toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
