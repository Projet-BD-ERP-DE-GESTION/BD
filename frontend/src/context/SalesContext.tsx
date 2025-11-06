import { createContext, useContext, useState, ReactNode } from 'react';

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  time: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  payment: string;
  cashierId: string;
  cashierName: string;
  department: string;
}

interface SalesContextType {
  sales: Sale[];
  addSale: (sale: Sale) => void;
  getSalesByPeriod: (period: 'day' | 'month' | 'year') => Sale[];
  getSalesByEmployee: (employeeId: string) => Sale[];
  getSalesByDepartment: (department: string) => Sale[];
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<Sale[]>([
    {
      id: 'VNT-2025-001',
      date: '2025-10-24',
      time: '14:32',
      items: [
        { productId: '1', productName: 'Pain Complet', quantity: 2, price: 2.5, total: 5.0 },
        { productId: '2', productName: 'Lait Entier', quantity: 3, price: 1.4, total: 4.2 },
      ],
      subtotal: 9.2,
      tax: 0.92,
      total: 10.12,
      payment: 'Carte bancaire',
      cashierId: '1',
      cashierName: 'Marie Dubois',
      department: 'Boulangerie',
    },
    {
      id: 'VNT-2025-002',
      date: '2025-10-24',
      time: '14:28',
      items: [
        { productId: '3', productName: 'Tomates', quantity: 2, price: 3.0, total: 6.0 },
      ],
      subtotal: 6.0,
      tax: 0.6,
      total: 6.6,
      payment: 'Espèces',
      cashierId: '1',
      cashierName: 'Marie Dubois',
      department: 'Fruits & Légumes',
    },
    {
      id: 'VNT-2025-003',
      date: '2025-10-24',
      time: '14:15',
      items: [
        { productId: '4', productName: 'Poulet Fermier', quantity: 1, price: 9.0, total: 9.0 },
        { productId: '5', productName: 'Eau Minérale', quantity: 2, price: 3.0, total: 6.0 },
      ],
      subtotal: 15.0,
      tax: 1.5,
      total: 16.5,
      payment: 'Carte bancaire',
      cashierId: '2',
      cashierName: 'Jean Martin',
      department: 'Viandes',
    },
    {
      id: 'VNT-2025-004',
      date: '2025-10-23',
      time: '16:45',
      items: [
        { productId: '1', productName: 'Pain Complet', quantity: 5, price: 2.5, total: 12.5 },
      ],
      subtotal: 12.5,
      tax: 1.25,
      total: 13.75,
      payment: 'Espèces',
      cashierId: '2',
      cashierName: 'Jean Martin',
      department: 'Boulangerie',
    },
    {
      id: 'VNT-2025-005',
      date: '2025-10-23',
      time: '11:20',
      items: [
        { productId: '3', productName: 'Tomates', quantity: 3, price: 3.0, total: 9.0 },
        { productId: '2', productName: 'Lait Entier', quantity: 4, price: 1.4, total: 5.6 },
      ],
      subtotal: 14.6,
      tax: 1.46,
      total: 16.06,
      payment: 'Carte bancaire',
      cashierId: '3',
      cashierName: 'Sophie Lefebvre',
      department: 'Fruits & Légumes',
    },
  ]);

  const addSale = (sale: Sale) => {
    setSales([sale, ...sales]);
  };

  const getSalesByPeriod = (period: 'day' | 'month' | 'year') => {
    const now = new Date();
    return sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      if (period === 'day') {
        return saleDate.toDateString() === now.toDateString();
      } else if (period === 'month') {
        return (
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      } else {
        return saleDate.getFullYear() === now.getFullYear();
      }
    });
  };

  const getSalesByEmployee = (employeeId: string) => {
    return sales.filter((sale) => sale.cashierId === employeeId);
  };

  const getSalesByDepartment = (department: string) => {
    return sales.filter((sale) => sale.department === department);
  };

  return (
    <SalesContext.Provider
      value={{
        sales,
        addSale,
        getSalesByPeriod,
        getSalesByEmployee,
        getSalesByDepartment,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within SalesProvider');
  }
  return context;
}
