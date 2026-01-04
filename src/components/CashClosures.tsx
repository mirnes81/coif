import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, CheckCircle, AlertCircle, Printer, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CashClosure {
  id: string;
  closure_date: string;
  opening_cash: number;
  cash_in_calculated: number;
  cash_out_manual: number;
  expected_cash: number;
  counted_cash: number;
  delta: number;
  note: string;
  closed_by_name: string;
  cash_transactions_count: number;
  created_at: string;
}

export default function CashClosures() {
  const [closures, setClosures] = useState<CashClosure[]>([]);
  const [showNewClosureModal, setShowNewClosureModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    closure_date: new Date().toISOString().split('T')[0],
    opening_cash: 200,
    cash_out_manual: 0,
    counted_cash: 0,
    note: ''
  });

  const [cashInCalculated, setCashInCalculated] = useState(0);

  useEffect(() => {
    loadClosures();
  }, []);

  useEffect(() => {
    if (showNewClosureModal) {
      calculateCashIn();
    }
  }, [showNewClosureModal, formData.closure_date]);

  const loadClosures = async () => {
    try {
      const { data, error } = await supabase
        .from('v_cash_closure_stats')
        .select('*')
        .order('closure_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setClosures(data || []);
    } catch (err: any) {
      console.error('Error loading closures:', err);
      setError(err.message);
    }
  };

  const calculateCashIn = async () => {
    try {
      const { data, error } = await supabase
        .rpc('calculate_cash_in_for_day', {
          target_date: formData.closure_date
        });

      if (error) throw error;
      setCashInCalculated(data || 0);
    } catch (err: any) {
      console.error('Error calculating cash in:', err);
      setCashInCalculated(0);
    }
  };

  const expectedCash = formData.opening_cash + cashInCalculated - formData.cash_out_manual;
  const delta = formData.counted_cash - expectedCash;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('cash_closures')
        .insert({
          closure_date: formData.closure_date,
          opening_cash: formData.opening_cash,
          cash_in_calculated: cashInCalculated,
          cash_out_manual: formData.cash_out_manual,
          counted_cash: formData.counted_cash,
          delta,
          note: formData.note || null,
          closed_by: user?.id
        });

      if (insertError) throw insertError;

      const { error: auditError } = await supabase
        .from('audit_logs')
        .insert({
          actor_user_id: user?.id,
          action: 'cash_closure',
          entity_type: 'cash_closures',
          metadata: {
            date: formData.closure_date,
            delta,
            expected: expectedCash,
            counted: formData.counted_cash
          }
        });

      if (auditError) console.error('Audit log error:', auditError);

      alert('Clôture de caisse enregistrée avec succès !');
      setShowNewClosureModal(false);
      setFormData({
        closure_date: new Date().toISOString().split('T')[0],
        opening_cash: 200,
        cash_out_manual: 0,
        counted_cash: 0,
        note: ''
      });
      loadClosures();
    } catch (err: any) {
      console.error('Error creating closure:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const printClosure = (closure: CashClosure) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Clôture Caisse - ${closure.closure_date}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
          }
          h1 { text-align: center; color: #ec4899; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; }
          .label { font-weight: bold; }
          .value { text-align: right; }
          .total { border-top: 2px solid #333; font-size: 1.2em; font-weight: bold; }
          .delta-positive { color: green; }
          .delta-negative { color: red; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Sabina Coiffure & Ongles</h1>
          <p>Clôture de Caisse</p>
          <p><strong>Date:</strong> ${new Date(closure.closure_date).toLocaleDateString('fr-FR')}</p>
        </div>

        <div class="section">
          <h3>Montants</h3>
          <div class="row">
            <span class="label">Fonds de caisse (ouverture):</span>
            <span class="value">${closure.opening_cash.toFixed(2)} CHF</span>
          </div>
          <div class="row">
            <span class="label">Entrées cash (calculées):</span>
            <span class="value">${closure.cash_in_calculated.toFixed(2)} CHF</span>
          </div>
          <div class="row">
            <span class="label">Sorties cash (manuelles):</span>
            <span class="value">${closure.cash_out_manual.toFixed(2)} CHF</span>
          </div>
          <div class="row total">
            <span class="label">Cash attendu:</span>
            <span class="value">${closure.expected_cash.toFixed(2)} CHF</span>
          </div>
        </div>

        <div class="section">
          <h3>Comptage</h3>
          <div class="row">
            <span class="label">Cash compté (physique):</span>
            <span class="value">${closure.counted_cash.toFixed(2)} CHF</span>
          </div>
          <div class="row total ${closure.delta >= 0 ? 'delta-positive' : 'delta-negative'}">
            <span class="label">Delta (différence):</span>
            <span class="value">${closure.delta >= 0 ? '+' : ''}${closure.delta.toFixed(2)} CHF</span>
          </div>
        </div>

        <div class="section">
          <h3>Détails</h3>
          <div class="row">
            <span class="label">Transactions cash:</span>
            <span class="value">${closure.cash_transactions_count}</span>
          </div>
          <div class="row">
            <span class="label">Clôturé par:</span>
            <span class="value">${closure.closed_by_name || 'N/A'}</span>
          </div>
          ${closure.note ? `
          <div class="row">
            <span class="label">Note:</span>
            <span class="value">${closure.note}</span>
          </div>
          ` : ''}
        </div>

        <div style="text-align: center; margin-top: 40px;">
          <p><small>Généré le ${new Date().toLocaleString('fr-FR')}</small></p>
          <button onclick="window.print()" style="padding: 10px 20px; background: #ec4899; color: white; border: none; cursor: pointer; border-radius: 5px;">
            Imprimer
          </button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clôtures de Caisse</h2>
          <p className="text-gray-600">Gestion des clôtures quotidiennes</p>
        </div>
        <button
          onClick={() => setShowNewClosureModal(true)}
          className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 flex items-center gap-2"
        >
          <CheckCircle size={20} />
          Nouvelle Clôture
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Closures List */}
      <div className="grid gap-4">
        {closures.map((closure) => (
          <div key={closure.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-rose-500" size={20} />
                  <h3 className="text-lg font-bold">
                    {new Date(closure.closure_date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Clôturé par: {closure.closed_by_name || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => printClosure(closure)}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
              >
                <Printer size={16} />
                Imprimer
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Fonds de caisse</p>
                <p className="text-lg font-bold">{closure.opening_cash.toFixed(2)} CHF</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Entrées cash</p>
                <p className="text-lg font-bold text-green-600">+{closure.cash_in_calculated.toFixed(2)} CHF</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sorties cash</p>
                <p className="text-lg font-bold text-red-600">-{closure.cash_out_manual.toFixed(2)} CHF</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Cash attendu</p>
                <p className="text-lg font-bold">{closure.expected_cash.toFixed(2)} CHF</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-gray-500">Cash compté</p>
                <p className="text-lg font-bold">{closure.counted_cash.toFixed(2)} CHF</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Delta</p>
                <p className={`text-lg font-bold ${closure.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {closure.delta >= 0 ? '+' : ''}{closure.delta.toFixed(2)} CHF
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Transactions cash</p>
                <p className="text-lg font-bold">{closure.cash_transactions_count}</p>
              </div>
            </div>

            {closure.note && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 mb-1">Note</p>
                <p className="text-sm text-gray-700">{closure.note}</p>
              </div>
            )}
          </div>
        ))}

        {closures.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Aucune clôture de caisse enregistrée</p>
            <button
              onClick={() => setShowNewClosureModal(true)}
              className="mt-4 text-rose-500 hover:text-rose-600 font-medium"
            >
              Créer la première clôture
            </button>
          </div>
        )}
      </div>

      {/* New Closure Modal */}
      {showNewClosureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Nouvelle Clôture de Caisse</h3>
              <button
                onClick={() => setShowNewClosureModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de clôture
                </label>
                <input
                  type="date"
                  value={formData.closure_date}
                  onChange={(e) => setFormData({ ...formData, closure_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              {/* Opening Cash */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fonds de caisse (ouverture)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.opening_cash}
                  onChange={(e) => setFormData({ ...formData, opening_cash: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              {/* Cash In Calculated (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entrées cash (calculé automatiquement)
                </label>
                <div className="px-3 py-2 bg-gray-50 border rounded-lg text-lg font-bold text-green-600">
                  +{cashInCalculated.toFixed(2)} CHF
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Calculé depuis les transactions cash de la journée
                </p>
              </div>

              {/* Cash Out Manual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sorties cash (manuelles)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cash_out_manual}
                  onChange={(e) => setFormData({ ...formData, cash_out_manual: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="Ex: 50.00 (sorties diverses)"
                />
              </div>

              {/* Expected Cash (calculated) */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Cash attendu en caisse</p>
                <p className="text-2xl font-bold text-blue-900">{expectedCash.toFixed(2)} CHF</p>
                <p className="text-xs text-blue-700 mt-1">
                  = Fonds ({formData.opening_cash}) + Entrées ({cashInCalculated.toFixed(2)}) - Sorties ({formData.cash_out_manual})
                </p>
              </div>

              {/* Counted Cash */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cash compté (physique) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.counted_cash}
                  onChange={(e) => setFormData({ ...formData, counted_cash: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="Ex: 1250.50"
                  required
                />
              </div>

              {/* Delta (calculated) */}
              {formData.counted_cash > 0 && (
                <div className={`${delta >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
                  <p className="text-sm font-medium mb-2">Delta (différence)</p>
                  <p className={`text-2xl font-bold ${delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {delta >= 0 ? '+' : ''}{delta.toFixed(2)} CHF
                  </p>
                  <p className="text-xs mt-1">
                    {delta === 0 && '✓ Comptes justes !'}
                    {delta > 0 && 'Surplus en caisse'}
                    {delta < 0 && 'Manque en caisse'}
                  </p>
                </div>
              )}

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (optionnel)
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  rows={3}
                  placeholder="Ex: Sortie de 50 CHF pour achat fournitures..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewClosureModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>Enregistrement...</>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Enregistrer la Clôture
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
