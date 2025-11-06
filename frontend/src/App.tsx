import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { ProductsManager } from './components/ProductsManager';
import { InventoryManager } from './components/InventoryManager';
import { SalesManager } from './components/SalesManager';
import { SuppliersManager } from './components/SuppliersManager';
import { EmployeesManager } from './components/EmployeesManager';
import { POSSystem } from './components/POSSystem';
import { PerformanceAnalytics } from './components/PerformanceAnalytics';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SalesProvider } from './context/SalesContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos':
        return <POSSystem />;
      case 'products':
        return <ProductsManager />;
      case 'inventory':
        return <InventoryManager />;
      case 'sales':
        return <SalesManager />;
      case 'performance':
        return <PerformanceAnalytics />;
      case 'suppliers':
        return <SuppliersManager />;
      case 'employees':
        return <EmployeesManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SalesProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header currentPage={currentPage} />
          <main className="flex-1 overflow-y-auto p-6">
            {renderPage()}
          </main>
        </div>
      </div>
      
    </SalesProvider>
  );
}
