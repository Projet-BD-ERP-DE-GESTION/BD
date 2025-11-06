import { Bell, Search, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface HeaderProps {
  currentPage: string;
}

export function Header({ currentPage }: HeaderProps) {
  const pageNames: Record<string, string> = {
    dashboard: 'Tableau de bord',
    pos: 'Point de Vente',
    products: 'Gestion des produits',
    inventory: 'Gestion de l\'inventaire',
    sales: 'Historique des ventes',
    performance: 'Analytics & Performance',
    suppliers: 'Gestion des fournisseurs',
    employees: 'Gestion des employés',
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2>{pageNames[currentPage]}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 w-64"
            />
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
