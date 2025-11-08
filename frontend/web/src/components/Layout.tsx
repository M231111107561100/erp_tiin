import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    {
      name: 'Tableau de Bord',
      href: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Finance',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      children: [
        { name: 'Saisie Journal', href: '/finance/journal' },
        { name: 'Plan de Comptes', href: '/finance/accounts' },
        { name: 'Grand Livre', href: '/finance/ledger' },
        { name: 'Balance', href: '/finance/trial-balance' },
      ]
    },
    {
      name: 'Ressources Humaines',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      children: [
        { name: 'Employés', href: '/hr/employees' },
        { name: 'Paie', href: '/hr/payroll' },
        { name: 'Congés', href: '/hr/leaves' },
        { name: 'Temps & Présence', href: '/hr/attendance' },
      ]
    },
    {
      name: 'Ventes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      children: [
        { name: 'Clients', href: '/sales/customers' },
        { name: 'Devis', href: '/sales/quotes' },
        { name: 'Commandes', href: '/sales/orders' },
        { name: 'Factures', href: '/sales/invoices' },
      ]
    },
    {
      name: 'Achats',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      children: [
        { name: 'Fournisseurs', href: '/purchase/suppliers' },
        { name: 'Demandes de Prix', href: '/purchase/quotations' },
        { name: 'Commandes', href: '/purchase/orders' },
        { name: 'Réceptions', href: '/purchase/receipts' },
      ]
    },
    {
      name: 'Stock',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      children: [
        { name: 'Articles', href: '/inventory/items' },
        { name: 'Mouvements', href: '/inventory/movements' },
        { name: 'Inventaire', href: '/inventory/inventory' },
        { name: 'Magasins', href: '/inventory/warehouses' },
      ]
    }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    // In a real app, this would call an API to logout
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-nodeen-bg text-nodeen-text">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-nodeen-surface transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        flex flex-col border-r border-nodeen-primary border-opacity-20
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-nodeen-primary border-opacity-20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-nodeen-primary to-nodeen-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-nodeen-primary">ERP Tiin</h1>
              <p className="text-xs text-nodeen-text text-opacity-70">SYSCOHADA • Sénégal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <div className="mb-2">
                  <div className="flex items-center space-x-3 p-3 text-nodeen-text text-opacity-80 hover:text-nodeen-primary hover:bg-nodeen-primary hover:bg-opacity-10 rounded-xl transition-colors cursor-pointer">
                    <div className="text-nodeen-primary">
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="ml-4 space-y-1 border-l border-nodeen-primary border-opacity-20 pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.href}
                        className={`
                          block p-2 text-sm rounded-lg transition-colors
                          ${isActivePath(child.href)
                            ? 'text-nodeen-primary bg-nodeen-primary bg-opacity-20 border-l-2 border-nodeen-primary -ml-1 pl-3'
                            : 'text-nodeen-text text-opacity-70 hover:text-nodeen-primary hover:bg-nodeen-primary hover:bg-opacity-10'
                          }
                        `}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  to={item.href}
                  className={`
                    flex items-center space-x-3 p-3 rounded-xl transition-colors
                    ${isActivePath(item.href)
                      ? 'text-nodeen-primary bg-nodeen-primary bg-opacity-20'
                      : 'text-nodeen-text text-opacity-80 hover:text-nodeen-primary hover:bg-nodeen-primary hover:bg-opacity-10'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="text-nodeen-primary">
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-nodeen-primary border-opacity-20">
          <div className="flex items-center space-x-3 p-3">
            <div className="w-10 h-10 bg-nodeen-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-nodeen-text truncate">Admin User</p>
              <p className="text-xs text-nodeen-text text-opacity-70 truncate">admin@erp-tiin.sn</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="!p-2 hover:bg-red-500 hover:bg-opacity-20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top bar */}
        <header className="bg-nodeen-surface border-b border-nodeen-primary border-opacity-20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="lg:hidden !p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              
              <div>
                <h2 className="text-lg font-semibold text-nodeen-text">
                  {navigation.find(item => 
                    item.href === location.pathname || 
                    item.children?.some(child => child.href === location.pathname)
                  )?.name || 'Tableau de Bord'}
                </h2>
                <p className="text-sm text-nodeen-text text-opacity-70">
                  {location.pathname === '/' ? 'Vue d\'ensemble du système' : 'Gestion des opérations'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative !p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-nodeen-surface"></span>
              </Button>

              {/* Settings */}
              <Button variant="ghost" size="sm" className="!p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Button>

              {/* Help */}
              <Button variant="ghost" size="sm" className="!p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-nodeen-surface border-t border-nodeen-primary border-opacity-20 p-4">
          <div className="flex items-center justify-between text-sm text-nodeen-text text-opacity-70">
            <div>
              © 2025 ERP Tiin • Conforme SYSCOHADA • Sénégal
            </div>
            <div className="flex items-center space-x-4">
              <span>v1.0.0</span>
              <span>•</span>
              <span>Dynamique NAV Inspiré</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;