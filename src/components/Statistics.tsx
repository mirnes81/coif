import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, CreditCard, Banknote, Users, AlertCircle, Star, Award, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PeriodStats {
  period: string;
  payment_method: string;
  transaction_count: number;
  total_revenue: number;
  average_transaction: number;
  unique_clients: number;
}

interface ClientActivity {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  last_visit: string | null;
  total_visits: number;
  total_spent: number;
  activity_status: string;
}

interface MonthlyRevenue {
  month: string;
  year: number;
  month_number: number;
  payment_method: string;
  transaction_count: number;
  total_revenue: number;
  unique_clients: number;
}

interface YearlyRevenue {
  year: number;
  payment_method: string;
  transaction_count: number;
  total_revenue: number;
  average_transaction: number;
  unique_clients: number;
}

interface WeeklyRevenue {
  week_number: number;
  year: number;
  week_start: string;
  payment_method: string;
  transaction_count: number;
  total_revenue: number;
  unique_clients: number;
}

interface TopService {
  id: string;
  service_name: string;
  category_name: string;
  times_sold: number;
  total_revenue: number;
  average_price: number;
}

interface TopClient {
  id: string;
  first_name: string;
  last_name: string;
  total_visits: number;
  total_spent: number;
  average_spent: number;
  last_visit: string;
}

interface CustomDateStats {
  totalRevenue: number;
  totalTransactions: number;
  cashRevenue: number;
  twintRevenue: number;
  cashCount: number;
  twintCount: number;
  uniqueClients: number;
}

export default function Statistics() {
  const [viewMode, setViewMode] = useState<'period' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('period');
  const [selectedPeriod, setSelectedPeriod] = useState<'1_day' | '7_days' | '30_days'>('1_day');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [customStats, setCustomStats] = useState<CustomDateStats>({
    totalRevenue: 0,
    totalTransactions: 0,
    cashRevenue: 0,
    twintRevenue: 0,
    cashCount: 0,
    twintCount: 0,
    uniqueClients: 0
  });
  const [periodStats, setPeriodStats] = useState<PeriodStats[]>([]);
  const [clientActivity, setClientActivity] = useState<ClientActivity[]>([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<WeeklyRevenue[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [yearlyRevenue, setYearlyRevenue] = useState<YearlyRevenue[]>([]);
  const [topServices, setTopServices] = useState<TopService[]>([]);
  const [topClients, setTopClients] = useState<TopClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadPeriodStats();
    }
  }, [selectedPeriod]);

  useEffect(() => {
    if (!loading && viewMode === 'weekly') {
      loadWeeklyRevenue();
    }
  }, [selectedWeek, selectedYear, viewMode]);

  useEffect(() => {
    if (!loading && viewMode === 'monthly') {
      loadMonthlyRevenue();
    }
  }, [selectedMonth, selectedYear, viewMode]);

  useEffect(() => {
    if (!loading && viewMode === 'yearly') {
      loadYearlyRevenue();
    }
  }, [selectedYear, viewMode]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadPeriodStats(),
      loadClientActivity(),
      loadWeeklyRevenue(),
      loadMonthlyRevenue(),
      loadYearlyRevenue(),
      loadTopServices(),
      loadTopClients()
    ]);
    setLoading(false);
  };

  const loadPeriodStats = async () => {
    const { data, error } = await supabase
      .from('pos_period_stats')
      .select('*');

    if (!error && data) {
      setPeriodStats(data);
    }
  };

  const loadClientActivity = async () => {
    const { data, error } = await supabase
      .from('client_activity_status')
      .select('*')
      .order('total_visits', { ascending: false });

    if (!error && data) {
      setClientActivity(data);
    }
  };

  const loadWeeklyRevenue = async () => {
    const { data, error } = await supabase
      .from('weekly_revenue')
      .select('*')
      .order('year', { ascending: false })
      .order('week_number', { ascending: false })
      .limit(52);

    if (!error && data) {
      setWeeklyRevenue(data);
    }
  };

  const loadMonthlyRevenue = async () => {
    const { data, error } = await supabase
      .from('monthly_revenue')
      .select('*')
      .order('month', { ascending: false })
      .limit(24);

    if (!error && data) {
      setMonthlyRevenue(data);
    }
  };

  const loadYearlyRevenue = async () => {
    const { data, error } = await supabase
      .from('yearly_revenue')
      .select('*')
      .order('year', { ascending: false });

    if (!error && data) {
      setYearlyRevenue(data);
    }
  };

  const loadTopServices = async () => {
    const { data, error } = await supabase
      .from('top_services')
      .select('*')
      .limit(10);

    if (!error && data) {
      setTopServices(data);
    }
  };

  const loadTopClients = async () => {
    const { data, error } = await supabase
      .from('top_loyal_clients')
      .select('*')
      .limit(10);

    if (!error && data) {
      setTopClients(data);
    }
  };

  const loadCustomDateStats = async () => {
    const { data, error } = await supabase
      .from('pos_transactions')
      .select('*')
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`)
      .eq('payment_status', 'paid');

    if (!error && data) {
      const cashTransactions = data.filter(t => t.payment_method === 'cash');
      const twintTransactions = data.filter(t => t.payment_method === 'twint');

      const cashRevenue = cashTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
      const twintRevenue = twintTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);

      const uniqueClientIds = new Set(data.map(t => t.client_id).filter(id => id !== null));

      setCustomStats({
        totalRevenue: cashRevenue + twintRevenue,
        totalTransactions: data.length,
        cashRevenue,
        twintRevenue,
        cashCount: cashTransactions.length,
        twintCount: twintTransactions.length,
        uniqueClients: uniqueClientIds.size
      });
    }
  };

  const getStatsForPeriod = () => {
    const stats = periodStats.filter(s => s.period === selectedPeriod);
    const cashStats = stats.find(s => s.payment_method === 'cash') || {
      transaction_count: 0, total_revenue: 0, average_transaction: 0, unique_clients: 0
    };
    const twintStats = stats.find(s => s.payment_method === 'twint') || {
      transaction_count: 0, total_revenue: 0, average_transaction: 0, unique_clients: 0
    };

    return {
      totalRevenue: (cashStats.total_revenue || 0) + (twintStats.total_revenue || 0),
      totalTransactions: (cashStats.transaction_count || 0) + (twintStats.transaction_count || 0),
      cashRevenue: cashStats.total_revenue || 0,
      twintRevenue: twintStats.total_revenue || 0,
      cashCount: cashStats.transaction_count || 0,
      twintCount: twintStats.transaction_count || 0,
      averageTransaction: (cashStats.transaction_count + twintStats.transaction_count) > 0
        ? ((cashStats.total_revenue || 0) + (twintStats.total_revenue || 0)) / ((cashStats.transaction_count || 0) + (twintStats.transaction_count || 0))
        : 0,
      uniqueClients: Math.max(cashStats.unique_clients || 0, twintStats.unique_clients || 0)
    };
  };

  const getWeeklyStats = () => {
    const stats = weeklyRevenue.filter(r => r.year === selectedYear && r.week_number === selectedWeek);
    const cashStats = stats.find(s => s.payment_method === 'cash') || {
      transaction_count: 0, total_revenue: 0, unique_clients: 0
    };
    const twintStats = stats.find(s => s.payment_method === 'twint') || {
      transaction_count: 0, total_revenue: 0, unique_clients: 0
    };

    return {
      totalRevenue: (cashStats.total_revenue || 0) + (twintStats.total_revenue || 0),
      totalTransactions: (cashStats.transaction_count || 0) + (twintStats.transaction_count || 0),
      cashRevenue: cashStats.total_revenue || 0,
      twintRevenue: twintStats.total_revenue || 0,
      cashCount: cashStats.transaction_count || 0,
      twintCount: twintStats.transaction_count || 0,
      uniqueClients: Math.max(cashStats.unique_clients || 0, twintStats.unique_clients || 0)
    };
  };

  const getMonthlyStats = () => {
    const stats = monthlyRevenue.filter(r => r.year === selectedYear && r.month_number === selectedMonth);
    const cashStats = stats.find(s => s.payment_method === 'cash') || {
      transaction_count: 0, total_revenue: 0, unique_clients: 0
    };
    const twintStats = stats.find(s => s.payment_method === 'twint') || {
      transaction_count: 0, total_revenue: 0, unique_clients: 0
    };

    return {
      totalRevenue: (cashStats.total_revenue || 0) + (twintStats.total_revenue || 0),
      totalTransactions: (cashStats.transaction_count || 0) + (twintStats.transaction_count || 0),
      cashRevenue: cashStats.total_revenue || 0,
      twintRevenue: twintStats.total_revenue || 0,
      cashCount: cashStats.transaction_count || 0,
      twintCount: twintStats.transaction_count || 0,
      uniqueClients: Math.max(cashStats.unique_clients || 0, twintStats.unique_clients || 0)
    };
  };

  const getYearlyStats = () => {
    const stats = yearlyRevenue.filter(r => r.year === selectedYear);
    const cashStats = stats.find(s => s.payment_method === 'cash') || {
      transaction_count: 0, total_revenue: 0, unique_clients: 0
    };
    const twintStats = stats.find(s => s.payment_method === 'twint') || {
      transaction_count: 0, total_revenue: 0, unique_clients: 0
    };

    return {
      totalRevenue: (cashStats.total_revenue || 0) + (twintStats.total_revenue || 0),
      totalTransactions: (cashStats.transaction_count || 0) + (twintStats.transaction_count || 0),
      cashRevenue: cashStats.total_revenue || 0,
      twintRevenue: twintStats.total_revenue || 0,
      cashCount: cashStats.transaction_count || 0,
      twintCount: twintStats.transaction_count || 0,
      uniqueClients: Math.max(cashStats.unique_clients || 0, twintStats.unique_clients || 0)
    };
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '1_day': return "Aujourd'hui";
      case '7_days': return '7 derniers jours';
      case '30_days': return '30 derniers jours';
      default: return '';
    }
  };

  const getMonthName = (month: number) => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[month - 1];
  };

  const activeClients = clientActivity.filter(c => c.activity_status === 'active').length;
  const inactive30 = clientActivity.filter(c => c.activity_status === 'inactive_30_days').length;
  const inactive60 = clientActivity.filter(c => c.activity_status === 'inactive_60_plus_days').length;
  const neverVisited = clientActivity.filter(c => c.activity_status === 'never_visited').length;

  const currentStats = viewMode === 'period' ? getStatsForPeriod() :
                      viewMode === 'weekly' ? getWeeklyStats() :
                      viewMode === 'monthly' ? getMonthlyStats() :
                      viewMode === 'yearly' ? getYearlyStats() :
                      customStats;

  const availableYears = [...new Set(monthlyRevenue.map(r => r.year))].sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          Statistiques détaillées
        </h2>
        <button
          onClick={loadAllData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setViewMode('period')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'period' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Par période
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Par semaine
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Par mois
          </button>
          <button
            onClick={() => setViewMode('yearly')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'yearly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Par année
          </button>
          <button
            onClick={() => setViewMode('custom')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Par date personnalisée
          </button>
        </div>

        {viewMode === 'period' && (
          <div className="flex gap-2">
            {(['1_day', '7_days', '30_days'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedPeriod === period ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getPeriodLabel(period)}
              </button>
            ))}
          </div>
        )}

        {viewMode === 'weekly' && (
          <div className="flex gap-2">
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 52 }, (_, i) => i + 1).map(w => (
                <option key={w} value={w}>Semaine {w}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}

        {viewMode === 'monthly' && (
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                <option key={m} value={m}>{getMonthName(m)}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}

        {viewMode === 'yearly' && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}

        {viewMode === 'custom' && (
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Du:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Au:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={loadCustomDateStats}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            >
              Rechercher
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Revenu total</span>
                <TrendingUp className="w-6 h-6 text-blue-100" />
              </div>
              <p className="text-3xl font-bold">{currentStats.totalRevenue.toFixed(2)} CHF</p>
              <p className="text-sm text-blue-100 mt-1">
                {currentStats.totalTransactions} transaction(s)
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-100">Cash</span>
                <Banknote className="w-6 h-6 text-green-100" />
              </div>
              <p className="text-3xl font-bold">{currentStats.cashRevenue.toFixed(2)} CHF</p>
              <p className="text-sm text-green-100 mt-1">
                {currentStats.cashCount} paiement(s)
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-100">Twint</span>
                <CreditCard className="w-6 h-6 text-purple-100" />
              </div>
              <p className="text-3xl font-bold">{currentStats.twintRevenue.toFixed(2)} CHF</p>
              <p className="text-sm text-purple-100 mt-1">
                {currentStats.twintCount} paiement(s)
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-100">Clients uniques</span>
                <Users className="w-6 h-6 text-orange-100" />
              </div>
              <p className="text-3xl font-bold">{currentStats.uniqueClients}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Activité des clients
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Actifs (30j)</p>
                  <p className="text-2xl font-bold text-green-600">{activeClients}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Inactifs (30-60j)</p>
                  <p className="text-2xl font-bold text-yellow-600">{inactive30}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Inactifs (60j+)</p>
                  <p className="text-2xl font-bold text-red-600">{inactive60}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Jamais venus</p>
                  <p className="text-2xl font-bold text-gray-600">{neverVisited}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Répartition des paiements</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-green-600" />
                      Cash
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {currentStats.totalRevenue > 0
                        ? ((currentStats.cashRevenue / currentStats.totalRevenue) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{
                        width: `${currentStats.totalRevenue > 0
                          ? (currentStats.cashRevenue / currentStats.totalRevenue) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      Twint
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {currentStats.totalRevenue > 0
                        ? ((currentStats.twintRevenue / currentStats.totalRevenue) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-purple-600 h-3 rounded-full transition-all"
                      style={{
                        width: `${currentStats.totalRevenue > 0
                          ? (currentStats.twintRevenue / currentStats.totalRevenue) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Top 10 Services
              </h3>
              <div className="space-y-2">
                {topServices.slice(0, 10).map((service, index) => (
                  <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900">{service.service_name}</p>
                        <p className="text-xs text-gray-600">{service.category_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{service.times_sold}x</p>
                      <p className="text-xs text-gray-600">{service.total_revenue.toFixed(2)} CHF</p>
                    </div>
                  </div>
                ))}
                {topServices.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Aucun service vendu</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                Top 10 Clients Fidèles
              </h3>
              <div className="space-y-2">
                {topClients.slice(0, 10).map((client, index) => (
                  <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900">{client.first_name} {client.last_name}</p>
                        <p className="text-xs text-gray-600">{client.total_visits} visites</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{client.total_spent.toFixed(2)} CHF</p>
                      <p className="text-xs text-gray-600">Moy: {client.average_spent.toFixed(2)} CHF</p>
                    </div>
                  </div>
                ))}
                {topClients.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Aucun client</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Clients à Relancer (60+ jours sans visite)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clientActivity
                .filter(c => c.activity_status === 'inactive_60_plus_days')
                .slice(0, 10)
                .map(client => (
                  <div key={client.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-medium text-gray-900">{client.first_name} {client.last_name}</p>
                    <p className="text-sm text-gray-600">{client.phone}</p>
                    <p className="text-xs text-red-600 mt-1">
                      Dernière visite: {client.last_visit ? new Date(client.last_visit).toLocaleDateString('fr-FR') : 'Jamais'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {client.total_visits} visites • {client.total_spent.toFixed(2)} CHF dépensés
                    </p>
                  </div>
                ))}
              {clientActivity.filter(c => c.activity_status === 'inactive_60_plus_days').length === 0 && (
                <p className="text-center text-gray-500 py-4 col-span-2">Aucun client à relancer</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
