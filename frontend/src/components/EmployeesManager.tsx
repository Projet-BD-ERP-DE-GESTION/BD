import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Phone, Mail, Calendar, Plus, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'vacation' | 'inactive';
  schedule: string;
}

export function EmployeesManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // ==== Chargement initial ====
  useEffect(() => {
    fetch('http://localhost:3000/api/employees')
      .then(r => r.json())
      .then(data => setEmployees(data))
      .finally(() => setLoading(false));
  }, []);

  // ==== Ajout (exemple modal) ====
  const createEmployee = async (newEmp: Omit<Employee,'id'>) => {
    const resp = await fetch('http://localhost:3000/api/employees', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(newEmp)
    });
    const created = await resp.json();
    setEmployees(prev => [...prev, created]);   // mise à jour UI
  };

  // ==== Modification ====
  const updateEmployee = async (id:string, upd:Partial<Employee>) => {
    const resp = await fetch(`http://localhost:3000/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(upd)
    });
    const updated = await resp.json();
    setEmployees(prev => prev.map(e => e.id===id ? updated : e));
  };

  // ==== Suppression (facultatif) ====
  const deleteEmployee = async (id:string) => {
    await fetch(`http://localhost:3000/api/employees/${id}`, { method: 'DELETE' });
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'vacation':
        return <Badge className="bg-blue-100 text-blue-800">En congé</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (loading) return <p>Chargement…</p>;

  // Calcul des stats
  const activeCount = employees.filter(e => e.status === 'active').length;
  const vacationCount = employees.filter(e => e.status === 'vacation').length;
  const presentToday = activeCount; // Simplifié - à adapter selon votre logique de présence
  const monthlyHours = 856; // À remplacer par un calcul réel ou une API

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2>Employés</h2>
          <p className="text-gray-600 mt-1">{employees.length} employés enregistrés</p>
        </div>
        <Button className="gap-2" onClick={() => {/* TODO: Ouvrir modal createEmployee */}}>
          <Plus className="w-4 h-4" />
          Nouvel employé
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600">Employés actifs</p>
          <p className="mt-2">{activeCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">En congé</p>
          <p className="mt-2">{vacationCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Présents aujourd'hui</p>
          <p className="mt-2">{presentToday}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Heures ce mois</p>
          <p className="mt-2">{monthlyHours}</p>
        </Card>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {employees.map((employee) => (
          <Card key={employee.id} className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-green-100 text-green-600">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3>{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.role}</p>
                  </div>
                  {getStatusBadge(employee.status)}
                </div>
                <Badge variant="outline" className="mb-3">
                  {employee.department}
                </Badge>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Depuis le {employee.joinDate}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm text-gray-600 mb-3">
                    Horaires: {employee.schedule}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {/* TODO: Ouvrir modal updateEmployee */}}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                    <Button size="sm" className="flex-1">
                      Planning
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
