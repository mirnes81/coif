import React, { useState, useEffect } from 'react';
import { Receipt, RotateCcw, X, AlertCircle, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Transaction {
  id: string;
  transaction_number: string;
  transaction_type: 'sale' | 'refund';
  status: string;
  payment_method: string;
  total_amount: number;
  total_net?: number;
  total_vat?: number;
  total_gross?: number;
  client_name?: string;
  client_number?: string;
  created_by_name?: string;
  items_count?: number;
  items_detail?: any[];
  created_at: string;
  parent_transaction_id?: string;
  refund_reason?: string;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'refund'>('all');
  const [filterPayment, setFilterPayment] = useState<'all' | 'cash' | 'card' | 'twint' | 'mixed'>('all');
  const [filterDate, setFilterDate] = useState('');

  // Refund modal
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterType, filterPayment, filterDate, transactions]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('v_transaction_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions(data || []);
    } catch (err: any) {
      console.error('Error loading transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.transaction_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.client_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.transaction_type === filterType);
    }

    if (filterPayment !== 'all') {
      filtered = filtered.filter(t => t.payment_method === filterPayment);
    }

    if (filterDate) {
      filtered = filtered.filter(t =>
        t.created_at.startsWith(filterDate)
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleRefund = async () => {
    if (!selectedTransaction || !refundReason.trim()) {
      alert('Veuillez entrer une raison pour le remboursement');
      return;
    }

    setRefundLoading(true);
    try {
      // Créer transaction refund
      const { data: refundTransaction, error: refundError } = await supabase
        .from('pos_transactions')
        .insert({
          transaction_type: 'refund',
          parent_transaction_id: selectedTransaction.id,
          total_amount: -selectedTransaction.total_amount,
          total_net: selectedTransaction.total_net ? -selectedTransaction.total_net : null,
          total_vat: selectedTransaction.total_vat ? -selectedTransaction.total_vat : null,
          total_gross: selectedTransaction.total_gross ? -selectedTransaction.total_gross : null,
          payment_method: selectedTransaction.payment_method,
          status: 'paid',
          client_id: selectedTransaction.client_name ? null : null, // TODO: get client_id if needed
          refund_reason: refundReason,
          notes: `Remboursement de ${selectedTransaction.transaction_number}`,
          items: selectedTransaction.items_detail || [],
          created_by: user?.id
        })
        .select()
        .single();

      if (refundError) throw refundError;

      // Log dans audit
      await supabase
        .from('audit_logs')
        .insert({
          actor_user_id: user?.id,
          action: 'refund',
          entity_type: 'pos_transactions',
          entity_id: refundTransaction.id,
          metadata: {
            original_transaction: selectedTransaction.transaction_number,
            amount: selectedTransaction.total_amount,
            reason: refundReason
          }
        });

      alert('Remboursement créé avec succès !');
      setShowRefundModal(false);
      setSelectedTransaction(null);
      setRefundReason('');
      loadTransactions();
    } catch (err: any) {
      console.error('Error creating refund:', err);
      alert('Erreur lors du remboursement: ' + err.message);
    } finally {
      setRefundLoading(false);
    }
  };

  const canRefund = (transaction: Transaction) => {
    return (
      transaction.transaction_type === 'sale' &&
      transaction.status === 'paid'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Historique des Transactions</h2>
        <p className="text-gray-600">Toutes les ventes et remboursements</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <Filter size={20} />
          <span>Filtres</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Numéro, client..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
            >
              <option value="all">Tous</option>
              <option value="sale">Ventes</option>
              <option value="refund">Remboursements</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Paiement</label>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
            >
              <option value="all">Tous</option>
              <option value="cash">Cash</option>
              <option value="card">Carte</option>
              <option value="twint">TWINT</option>
              <option value="mixed">Mixte</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          {filteredTransactions.length} transaction(s) trouvée(s)
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className={`bg-white rounded-lg shadow p-4 ${
              transaction.transaction_type === 'refund' ? 'border-l-4 border-red-500' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-3">
                  <Receipt className={transaction.transaction_type === 'refund' ? 'text-red-500' : 'text-rose-500'} size={20} />
                  <span className="font-bold">{transaction.transaction_number}</span>
                  {transaction.transaction_type === 'refund' && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                      REMBOURSEMENT
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(transaction.created_at).toLocaleString('fr-FR')}
                </p>
              </div>

              <div className="text-right">
                <p className={`text-2xl font-bold ${
                  transaction.transaction_type === 'refund' ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {transaction.transaction_type === 'refund' ? '-' : ''}
                  {Math.abs(transaction.total_amount).toFixed(2)} CHF
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {transaction.payment_method === 'cash' && 'Cash'}
                  {transaction.payment_method === 'card' && 'Carte'}
                  {transaction.payment_method === 'twint' && 'TWINT'}
                  {transaction.payment_method === 'mixed' && 'Mixte'}
                </p>
              </div>
            </div>

            {/* Client */}
            {transaction.client_name && (
              <div className="mb-2">
                <p className="text-sm">
                  <span className="text-gray-600">Client:</span>{' '}
                  <span className="font-medium">{transaction.client_name}</span>
                  {transaction.client_number && (
                    <span className="text-gray-500 ml-2">({transaction.client_number})</span>
                  )}
                </p>
              </div>
            )}

            {/* Items */}
            {transaction.items_detail && transaction.items_detail.length > 0 && (
              <div className="mb-3 bg-gray-50 rounded p-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Articles ({transaction.items_count}):</p>
                <div className="space-y-1">
                  {transaction.items_detail.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-medium">{item.total?.toFixed(2)} CHF</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Refund reason */}
            {transaction.refund_reason && (
              <div className="mb-3 bg-red-50 border border-red-200 rounded p-3">
                <p className="text-xs font-medium text-red-700 mb-1">Raison du remboursement:</p>
                <p className="text-sm text-red-900">{transaction.refund_reason}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center pt-3 border-t">
              <div className="text-sm text-gray-600">
                Par: {transaction.created_by_name || 'N/A'}
              </div>

              {/* Actions */}
              {canRefund(transaction) && (
                <button
                  onClick={() => {
                    setSelectedTransaction(transaction);
                    setShowRefundModal(true);
                  }}
                  className="px-3 py-1 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2 text-sm"
                >
                  <RotateCcw size={16} />
                  Rembourser
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && !loading && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Receipt className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Aucune transaction trouvée</p>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {showRefundModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="bg-red-500 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <RotateCcw size={24} />
                Rembourser la Transaction
              </h3>
              <button
                onClick={() => setShowRefundModal(false)}
                className="text-white hover:bg-red-600 rounded p-1"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Transaction Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Transaction à rembourser:</p>
                <p className="font-bold">{selectedTransaction.transaction_number}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {selectedTransaction.total_amount.toFixed(2)} CHF
                </p>
                {selectedTransaction.client_name && (
                  <p className="text-sm text-gray-600 mt-2">
                    Client: {selectedTransaction.client_name}
                  </p>
                )}
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Attention</p>
                  <p>Cette action créera une transaction de remboursement avec montant négatif. Elle ne peut pas être annulée.</p>
                </div>
              </div>

              {/* Refund Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison du remboursement *
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Ex: Client insatisfait, erreur de facturation..."
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={refundLoading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleRefund}
                  disabled={refundLoading || !refundReason.trim()}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {refundLoading ? (
                    <>Traitement...</>
                  ) : (
                    <>
                      <RotateCcw size={20} />
                      Confirmer le Remboursement
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
