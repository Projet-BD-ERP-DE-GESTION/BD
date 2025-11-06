import { LayoutDashboard, Package, Warehouse, ShoppingCart, TrendingUp, Truck, Users, CreditCard } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'pos', label: 'Point de Vente', icon: CreditCard },
    { id: 'sales', label: 'Ventes', icon: ShoppingCart },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'inventory', label: 'Inventaire', icon: Warehouse },
    { id: 'employees', label: 'Employés', icon: Users },
    { id: 'suppliers', label: 'Fournisseurs', icon: Truck },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-green-600">SuperMarché ERP</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
