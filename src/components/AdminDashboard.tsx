import React, { useState } from 'react';
import { LogOut, Users, ShoppingCart, Package, Settings, Image, LayoutDashboard, Wrench, Receipt, Menu, X, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ClientManagement from './ClientManagement';
import POSSystem from './POSSystem';
import ProductManagement from './ProductManagement';
import GallerySettings from './GallerySettings';
import PricingManager from './PricingManager';
import GeneralSettings from './GeneralSettings';
import Statistics from './Statistics';
import TransactionManagement from './TransactionManagement';
import ReviewsManagement from './ReviewsManagement';

type TabType = 'dashboard' | 'clients' | 'pos' | 'transactions' | 'products' | 'pricing' | 'reviews' | 'gallery' | 'settings';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { admin, signOut } = useAuth();

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'pos' as TabType, label: 'Caisse (POS)', icon: ShoppingCart },
    { id: 'transactions' as TabType, label: 'Transactions', icon: Receipt },
    { id: 'clients' as TabType, label: 'Clients', icon: Users },
    { id: 'products' as TabType, label: 'Produits', icon: Package },
    { id: 'pricing' as TabType, label: 'Tarifs', icon: Settings },
    { id: 'reviews' as TabType, label: 'Avis Google', icon: Star },
    { id: 'gallery' as TabType, label: 'Galerie', icon: Image },
    { id: 'settings' as TabType, label: 'Paramètres', icon: Wrench },
  ];

  const handleSignOut = async () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
      await signOut();
    }
  };

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            <div className="flex items-center gap-2 lg:gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-base lg:text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-600 hidden sm:block">{admin?.name || admin?.email}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 lg:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden sm:inline text-sm lg:text-base">Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-56px)] lg:h-[calc(100vh-64px)]">
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white shadow-lg lg:shadow-sm border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto mt-14 lg:mt-0
        `}>
          <nav className="p-3 lg:p-4 space-y-1 lg:space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all text-sm lg:text-base ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden mt-14"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-3 lg:p-6">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'clients' && <ClientManagement />}
          {activeTab === 'pos' && <POSSystem />}
          {activeTab === 'transactions' && <TransactionManagement />}
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'pricing' && <PricingManager />}
          {activeTab === 'reviews' && <ReviewsManagement />}
          {activeTab === 'gallery' && <GallerySettings />}
          {activeTab === 'settings' && <GeneralSettings />}
        </main>
      </div>
    </div>
  );
}

function DashboardOverview() {
  return (
    <div>
      <h2 className="text-xl lg:text-3xl font-bold text-gray-900 mb-4 lg:mb-6">Tableau de bord</h2>
      <Statistics />
    </div>
  );
}
