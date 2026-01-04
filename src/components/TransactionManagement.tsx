import React, { useState, useEffect } from 'react';
import { Receipt, Trash2, Calendar, CreditCard, Banknote, AlertTriangle, CheckSquare, Square, Tag, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ClientTag {
  id: string;
  name: string;
  color: string;
}

interface TransactionClient {
  client_id: string;
  client_number: string;
  first_name: string;
  last_name: string;
  is_primary: boolean;
}

interface Transaction {
  id: string;
  client_id?: string;
  total_amount: number;
  payment_method: 'cash' | 'twint';
  payment_status: string;
  items: any[];
  created_at: string;
  clients?: {
    first_name: string;
    last_name: string;
  };
  all_clients?: TransactionClient[];
}

type DateFilter = 'today' | 'week' | 'month' | 'custom';

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableTags, setAvailableTags] = useState<ClientTag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [dateFilter, customDate, selectedTagId]);

  const loadTags = async () => {
    const { data, error } = await supabase
      .from('client_tags')
      .select('*')
      .order('name');

    if (!error && data) {
      setAvailableTags(data);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    switch (dateFilter) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        startDate = new Date(customDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(customDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
    }

    return { startDate, endDate };
  };

  const loadTransactions = async () => {
    setLoading(true);
    const { startDate, endDate } = getDateRange();

    let query = supabase
      .from('pos_transactions')
      .select('*, clients(first_name, last_name)')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (selectedTagId) {
      const { data: tagAssignments } = await supabase
        .from('client_tag_assignments')
        .select('client_id')
        .eq('tag_id', selectedTagId);

      if (tagAssignments) {
        const clientIds = tagAssignments.map(a => a.client_id);
        if (clientIds.length > 0) {
          query = query.in('client_id', clientIds);
        } else {
          setTransactions([]);
          setLoading(false);
          setSelectedIds(new Set());
          return;
        }
      }
    }

    const { data, error } = await query;

    if (!error && data) {
      const transactionsWithClients = await Promise.all(
        data.map(async (transaction) => {
          const { data: transactionClients } = await supabase
            .from('pos_transaction_clients')
            .select('*, clients(client_number, first_name, last_name)')
            .eq('transaction_id', transaction.id);

          const all_clients = transactionClients?.map(tc => ({
            client_id: tc.client_id,
            client_number: tc.clients?.client_number || '',
            first_name: tc.clients?.first_name || '',
            last_name: tc.clients?.last_name || '',
            is_primary: tc.is_primary
          })) || [];

          return {
            ...transaction,
            all_clients
          };
        })
      );

      setTransactions(transactionsWithClients);
    }
    setLoading(false);
    setSelectedIds(new Set());
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === transactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map(t => t.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setDeleteConfirmStep(1);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmStep === 1) {
      setDeleteConfirmStep(2);
    } else if (deleteConfirmStep === 2) {
      const idsToDelete = Array.from(selectedIds);
      const { error } = await supabase
        .from('pos_transactions')
        .delete()
        .in('id', idsToDelete);

      if (!error) {
        setTransactions(transactions.filter(t => !selectedIds.has(t.id)));
        setSelectedIds(new Set());
        setDeleteConfirmStep(0);
      } else {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmStep(0);
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + t.total_amount, 0);
  const cashRevenue = transactions.filter(t => t.payment_method === 'cash').reduce((sum, t) => sum + t.total_amount, 0);
  const twintRevenue = transactions.filter(t => t.payment_method === 'twint').reduce((sum, t) => sum + t.total_amount, 0);

  const selectedTransactions = transactions.filter(t => selectedIds.has(t.id));
  const selectedTotal = selectedTransactions.reduce((sum, t) => sum + t.total_amount, 0);

  return (
    <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl p-4 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 lg:mb-8">
        <div className="flex items-center gap-2 lg:gap-3">
          <Receipt className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
          <h2 className="text-xl lg:text-3xl font-bold text-gray-900">Transactions</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                dateFilter === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setDateFilter('week')}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                dateFilter === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              7 jours
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                dateFilter === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ce mois
            </button>
            <button
              onClick={() => setDateFilter('custom')}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                dateFilter === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Date
            </button>
          </div>

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="bg-transparent border-none text-sm focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {availableTags.length > 0 && (
        <div className="mb-4 lg:mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Tag className="w-4 h-4" />
              <span>Filtrer par famille:</span>
            </div>
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTagId(selectedTagId === tag.id ? null : tag.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  selectedTagId === tag.id
                    ? 'ring-2 ring-offset-2'
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: selectedTagId === tag.id ? tag.color : tag.color + '20',
                  color: selectedTagId === tag.id ? 'white' : tag.color,
                  ringColor: tag.color
                }}
              >
                {tag.name}
                {selectedTagId === tag.id && (
                  <X className="w-3 h-3 inline ml-1" />
                )}
              </button>
            ))}
            {selectedTagId && (
              <button
                onClick={() => setSelectedTagId(null)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-300"
              >
                Effacer
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <p className="text-xs lg:text-sm text-blue-600 font-medium mb-1 lg:mb-2">Total</p>
          <p className="text-xl lg:text-3xl font-bold text-blue-900">{totalRevenue.toFixed(2)} CHF</p>
          <p className="text-xs lg:text-sm text-blue-700 mt-1 lg:mt-2">{transactions.length} transactions</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <Banknote className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
            <p className="text-xs lg:text-sm text-green-600 font-medium">Cash</p>
          </div>
          <p className="text-xl lg:text-3xl font-bold text-green-900">{cashRevenue.toFixed(2)} CHF</p>
          <p className="text-xs lg:text-sm text-green-700 mt-1 lg:mt-2">
            {transactions.filter(t => t.payment_method === 'cash').length} paiements
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <CreditCard className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
            <p className="text-xs lg:text-sm text-purple-600 font-medium">Twint</p>
          </div>
          <p className="text-xl lg:text-3xl font-bold text-purple-900">{twintRevenue.toFixed(2)} CHF</p>
          <p className="text-xs lg:text-sm text-purple-700 mt-1 lg:mt-2">
            {transactions.filter(t => t.payment_method === 'twint').length} paiements
          </p>
        </div>
      </div>

      {transactions.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            {selectedIds.size === transactions.length ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            <span>
              {selectedIds.size > 0
                ? `${selectedIds.size} sélectionnée${selectedIds.size > 1 ? 's' : ''}`
                : 'Tout sélectionner'}
            </span>
          </button>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">
                Total: {selectedTotal.toFixed(2)} CHF
              </span>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Supprimer</span>
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Receipt className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-base lg:text-lg font-medium mb-2">Aucune transaction</p>
          <p className="text-sm">Aucune transaction trouvée pour cette période</p>
        </div>
      ) : (
        <div className="space-y-2 lg:space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`p-3 lg:p-4 border-2 rounded-xl transition-all ${
                selectedIds.has(transaction.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleSelection(transaction.id)}
                  className="mt-1 flex-shrink-0"
                >
                  {selectedIds.has(transaction.id) ? (
                    <CheckSquare className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs lg:text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleTimeString('fr-CH', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {transaction.all_clients && transaction.all_clients.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1">
                        {transaction.all_clients.map((client, idx) => (
                          <span
                            key={client.client_id}
                            className={`text-xs lg:text-sm font-medium ${
                              client.is_primary
                                ? 'text-blue-700 bg-blue-50 px-2 py-0.5 rounded'
                                : 'text-gray-600'
                            }`}
                          >
                            {client.first_name} {client.last_name}
                            {client.is_primary && ' (payeur)'}
                            {idx < transaction.all_clients.length - 1 && !client.is_primary && ','}
                          </span>
                        ))}
                      </div>
                    ) : transaction.clients && (
                      <span className="text-xs lg:text-sm font-medium text-gray-700">
                        {transaction.clients.first_name} {transaction.clients.last_name}
                      </span>
                    )}
                    <div className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                      transaction.payment_method === 'cash'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {transaction.payment_method === 'cash' ? 'Cash' : 'Twint'}
                    </div>
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600">
                    {transaction.items?.map((item: any, idx: number) => (
                      <span key={idx}>
                        {item.name} (x{item.quantity})
                        {idx < transaction.items.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                </div>

                <span className="text-lg lg:text-2xl font-bold text-gray-900 whitespace-nowrap">
                  {transaction.total_amount.toFixed(2)} CHF
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirmStep > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-full ${
                deleteConfirmStep === 1 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <AlertTriangle className={`w-6 h-6 ${
                  deleteConfirmStep === 1 ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-gray-900">
                {deleteConfirmStep === 1 ? 'Confirmation 1/2' : 'CONFIRMATION FINALE 2/2'}
              </h3>
            </div>

            <p className="text-sm lg:text-base text-gray-700 mb-4">
              {deleteConfirmStep === 1 ? (
                <>
                  Vous allez supprimer <strong>{selectedIds.size} transaction{selectedIds.size > 1 ? 's' : ''}</strong> pour un total de <strong>{selectedTotal.toFixed(2)} CHF</strong>.
                </>
              ) : (
                <>
                  <strong className="text-red-600">ATTENTION!</strong> Cette action est irréversible.
                  Les <strong>{selectedIds.size} transaction{selectedIds.size > 1 ? 's' : ''}</strong> seront définitivement supprimées.
                </>
              )}
            </p>

            <div className="bg-gray-50 rounded-lg p-3 mb-4 max-h-60 overflow-y-auto">
              <p className="text-sm font-medium text-gray-700 mb-2">Transactions à supprimer:</p>
              <ul className="text-xs lg:text-sm text-gray-600 space-y-2">
                {selectedTransactions.map((transaction) => (
                  <li key={transaction.id} className="pb-2 border-b border-gray-200 last:border-0">
                    <div className="font-medium">{transaction.total_amount.toFixed(2)} CHF - {transaction.payment_method === 'cash' ? 'Cash' : 'Twint'}</div>
                    <div className="text-xs text-gray-500">
                      {transaction.items?.map((item: any) => item.name).join(', ')}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm lg:text-base"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium text-white text-sm lg:text-base ${
                  deleteConfirmStep === 1
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deleteConfirmStep === 1 ? 'Continuer' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
