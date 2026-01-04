import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Calendar, Banknote, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ClientStatsProps {
  clientId: string;
}

interface Transaction {
  id: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  items: any;
  created_at: string;
}

interface ClientStats {
  total_visits: number;
  total_spent: number;
  average_spent: number;
  last_visit: string | null;
  first_visit: string | null;
  cash_payments: number;
  twint_payments: number;
  cash_total: number;
  twint_total: number;
}

export default function ClientStats({ clientId }: ClientStatsProps) {
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactions, setShowTransactions] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState<'cash' | 'twint'>('cash');

  useEffect(() => {
    loadStats();
    loadTransactions();
  }, [clientId]);

  const loadStats = async () => {
    const { data, error } = await supabase
      .from('client_pos_statistics')
      .select('*')
      .eq('id', clientId)
      .maybeSingle();

    if (!error && data) {
      setStats(data);
    }
    setLoading(false);
  };

  const loadTransactions = async () => {
    const { data: transactionClientData, error: tcError } = await supabase
      .from('pos_transaction_clients')
      .select('transaction_id')
      .eq('client_id', clientId);

    if (tcError || !transactionClientData || transactionClientData.length === 0) {
      setTransactions([]);
      return;
    }

    const transactionIds = transactionClientData.map(tc => tc.transaction_id);

    const { data, error } = await supabase
      .from('pos_transactions')
      .select('*')
      .in('id', transactionIds)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
  };

  const updatePaymentMethod = async (transactionId: string, paymentMethod: 'cash' | 'twint') => {
    const { error } = await supabase
      .from('pos_transactions')
      .update({ payment_method: paymentMethod })
      .eq('id', transactionId);

    if (!error) {
      setTransactions(transactions.map(t =>
        t.id === transactionId ? { ...t, payment_method: paymentMethod } : t
      ));
      setEditingTransaction(null);
      loadStats();
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Chargement...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-gray-500">Aucune statistique disponible</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Statistiques du client
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Visites</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total_visits}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Total dépensé</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total_spent.toFixed(2)} CHF</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Panier moyen</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.average_spent.toFixed(2)} CHF</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">Dernière visite</span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {stats.last_visit ? new Date(stats.last_visit).toLocaleDateString('fr-FR') : 'Jamais'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Banknote className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Paiements Cash</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.cash_total.toFixed(2)} CHF</p>
            <p className="text-xs text-gray-600 mt-1">{stats.cash_payments} paiement(s)</p>
          </div>

          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Paiements Twint</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.twint_total.toFixed(2)} CHF</p>
            <p className="text-xs text-gray-600 mt-1">{stats.twint_payments} paiement(s)</p>
          </div>
        </div>
      </div>

      <div>
        <button
          onClick={() => setShowTransactions(!showTransactions)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-between"
        >
          <span>Historique des transactions ({transactions.length})</span>
          <span>{showTransactions ? '▲' : '▼'}</span>
        </button>

        {showTransactions && (
          <div className="mt-4 space-y-3">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Aucune transaction</p>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {transaction.total_amount.toFixed(2)} CHF
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(transaction.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    {editingTransaction === transaction.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updatePaymentMethod(transaction.id, 'cash')}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            newPaymentMethod === 'cash'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          Cash
                        </button>
                        <button
                          onClick={() => updatePaymentMethod(transaction.id, 'twint')}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            newPaymentMethod === 'twint'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          Twint
                        </button>
                        <button
                          onClick={() => setEditingTransaction(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm font-medium"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingTransaction(transaction.id);
                          setNewPaymentMethod(transaction.payment_method as 'cash' | 'twint');
                        }}
                        className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium ${
                          transaction.payment_method === 'cash'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {transaction.payment_method === 'cash' ? (
                          <Banknote className="w-4 h-4" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        {transaction.payment_method === 'cash' ? 'Cash' : 'Twint'}
                      </button>
                    )}
                  </div>
                  {transaction.items && Array.isArray(transaction.items) && (
                    <div className="space-y-1">
                      {transaction.items.map((item: any, index: number) => (
                        <div key={index} className="text-xs text-gray-600 flex justify-between">
                          <span>{item.name} x{item.quantity}</span>
                          <span>{(item.price * item.quantity).toFixed(2)} CHF</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
