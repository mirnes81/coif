import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Phone, Mail, X, Calendar, ShoppingBag, Scissors, Upload, Camera, Trash2, TrendingUp, Clock, Award, CreditCard, Banknote, ChevronDown, ChevronUp, FileText, History, DollarSign, Tag, Baby, User } from 'lucide-react';
import { supabase, Client } from '../lib/supabase';
import TagManager from './TagManager';
import ChildrenManager from './ChildrenManager';

interface ClientTag {
  id: string;
  name: string;
  color: string;
}

interface ClientWithLastVisit extends Client {
  last_visit_date?: string;
  last_visit_amount?: number;
  last_items?: any[];
  tags?: ClientTag[];
  client_number?: string;
  date_of_birth?: string;
  parent_id?: string;
  is_independent?: boolean;
  age?: number;
  family_role?: 'parent' | 'child' | 'independent';
  children_count?: number;
}

interface ClientDetailedStats {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  client_since: string;
  total_visits: number;
  total_spent: number;
  avg_spent: number;
  last_visit_date: string;
  first_visit_date: string;
  visits_this_month: number;
  spent_this_month: number;
  visits_this_year: number;
  spent_this_year: number;
  days_since_last_visit: number;
  favorite_payment_method: string;
  all_services: any[];
}

interface ServiceHistory {
  transaction_id: string;
  visit_date: string;
  client_amount: number;
  transaction_total: number;
  payment_method: string;
  items: any[];
  photo_url?: string;
  notes?: string;
  is_primary: boolean;
  total_visits: number;
  total_spent: number;
}

interface MonthlyStats {
  month: string;
  visits_count: number;
  total_spent: number;
  avg_spent: number;
  transactions: any[];
}

interface YearlyStats {
  year: number;
  visits_count: number;
  total_spent: number;
  avg_spent: number;
  active_months: number;
}

interface ServiceFrequency {
  service_name: string;
  service_category: string;
  times_ordered: number;
  total_quantity: number;
  total_spent_on_service: number;
  last_ordered_date: string;
  first_ordered_date: string;
}

const SERVICE_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900', badge: 'bg-blue-100' },
  { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-900', badge: 'bg-green-100' },
  { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-900', badge: 'bg-purple-100' },
  { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-900', badge: 'bg-pink-100' },
  { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-900', badge: 'bg-orange-100' },
  { bg: 'bg-teal-50', border: 'border-teal-300', text: 'text-teal-900', badge: 'bg-teal-100' },
];

export default function ClientManagement() {
  const [clients, setClients] = useState<ClientWithLastVisit[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientWithLastVisit | null>(null);
  const [clientStats, setClientStats] = useState<ClientDetailedStats | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [yearlyStats, setYearlyStats] = useState<YearlyStats[]>([]);
  const [serviceFrequency, setServiceFrequency] = useState<ServiceFrequency[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);
  const [newClient, setNewClient] = useState({ first_name: '', last_name: '', email: '', phone: '', notes: '', date_of_birth: '' });
  const [editClient, setEditClient] = useState({ first_name: '', last_name: '', email: '', phone: '', notes: '', date_of_birth: '' });
  const [uploading, setUploading] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showMonthlyStats, setShowMonthlyStats] = useState(false);
  const [showYearlyStats, setShowYearlyStats] = useState(false);
  const [showServiceFreq, setShowServiceFreq] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'visits' | 'services' | 'payments'>('overview');
  const [expandedVisits, setExpandedVisits] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientData(selectedClient.id);
      setActiveTab('overview');
    }
  }, [selectedClient]);

  useEffect(() => {
    if (serviceHistory.length > 0) {
      setExpandedVisits(new Set([serviceHistory[0].transaction_id]));
    }
  }, [serviceHistory]);

  const loadClients = async () => {
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients_with_family')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientsError || !clientsData) return;

    const { data: clientsWithTags, error: tagsError } = await supabase
      .from('clients_with_tags')
      .select('*');

    const { data: lastVisits } = await supabase
      .from('client_last_visit')
      .select('*');

    const lastVisitsMap = new Map(lastVisits?.map(v => [v.id, v]) || []);

    if (!tagsError && clientsWithTags) {
      const tagsMap = new Map(clientsWithTags.map(c => [c.id, c.tags]));
      const enrichedClients = clientsData.map(client => ({
        ...client,
        ...lastVisitsMap.get(client.id),
        tags: tagsMap.get(client.id) || []
      }));
      setClients(enrichedClients);
    } else {
      setClients(clientsData.map(client => ({
        ...client,
        ...lastVisitsMap.get(client.id)
      })));
    }
  };

  const loadClientData = async (clientId: string) => {
    const [statsRes, historyRes, monthlyRes, yearlyRes, freqRes] = await Promise.all([
      supabase.from('client_detailed_stats').select('*').eq('id', clientId).maybeSingle(),
      supabase.from('client_service_history').select('*').eq('client_id', clientId).order('visit_date', { ascending: false }),
      supabase.from('client_monthly_stats').select('*').eq('client_id', clientId).order('month', { ascending: false }),
      supabase.from('client_yearly_stats').select('*').eq('client_id', clientId).order('year', { ascending: false }),
      supabase.from('client_service_frequency').select('*').eq('client_id', clientId).order('times_ordered', { ascending: false })
    ]);

    if (!statsRes.error && statsRes.data) setClientStats(statsRes.data);
    if (!historyRes.error && historyRes.data) setServiceHistory(historyRes.data.filter(item => item.transaction_id));
    if (!monthlyRes.error && monthlyRes.data) setMonthlyStats(monthlyRes.data);
    if (!yearlyRes.error && yearlyRes.data) setYearlyStats(yearlyRes.data);
    if (!freqRes.error && freqRes.data) setServiceFrequency(freqRes.data);
  };

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('clients')
      .insert([newClient])
      .select()
      .single();

    if (!error && data) {
      loadClients();
      setNewClient({ first_name: '', last_name: '', email: '', phone: '', notes: '', date_of_birth: '' });
      setShowAddClient(false);
    }
  };

  const updateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    const { data, error } = await supabase
      .from('clients')
      .update(editClient)
      .eq('id', selectedClient.id)
      .select()
      .single();

    if (!error && data) {
      loadClients();
      setSelectedClient({ ...selectedClient, ...data });
      setShowEditClient(false);
    }
  };

  const handlePhotoUpload = async (transactionId: string, file: File) => {
    setUploading(transactionId);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${transactionId}-${Date.now()}.${fileExt}`;
      const filePath = `visit-photos/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('pos_transactions')
        .update({ photo_url: publicUrl })
        .eq('id', transactionId);

      if (updateError) throw updateError;

      if (selectedClient) {
        loadClientData(selectedClient.id);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Erreur lors de l\'upload de la photo');
    } finally {
      setUploading(null);
    }
  };

  const deletePhoto = async (transactionId: string) => {
    if (!confirm('Voulez-vous supprimer cette photo?')) return;

    const { error } = await supabase
      .from('pos_transactions')
      .update({ photo_url: null })
      .eq('id', transactionId);

    if (!error && selectedClient) {
      loadClientData(selectedClient.id);
    }
  };

  const updateNotes = async (transactionId: string, notes: string) => {
    const { error } = await supabase
      .from('pos_transactions')
      .update({ notes })
      .eq('id', transactionId);

    if (!error && selectedClient) {
      loadClientData(selectedClient.id);
      setEditingNotes(null);
      setNoteText('');
    }
  };

  const getServiceColor = (index: number) => {
    return SERVICE_COLORS[index % SERVICE_COLORS.length];
  };

  const toggleVisit = (transactionId: string) => {
    const newExpanded = new Set(expandedVisits);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedVisits(newExpanded);
  };

  const filteredClients = clients.filter(client =>
    client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-[calc(100vh-120px)] lg:h-[calc(100vh-200px)]">
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Clients
            </h2>
            <button
              onClick={() => setShowAddClient(true)}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredClients.map((client) => {
            return (
              <div
                key={client.id}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedClient?.id === client.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedClient(client)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{client.first_name} {client.last_name}</h3>
                  {client.client_number && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                      {client.client_number}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {client.age !== undefined && client.age !== null && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {client.age} ans
                    </span>
                  )}
                  {client.family_role === 'parent' && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <Baby className="w-3 h-3" />
                      Parent ({client.children_count})
                    </span>
                  )}
                  {client.family_role === 'child' && (
                    <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <Baby className="w-3 h-3" />
                      Enfant
                    </span>
                  )}
                </div>

                {client.phone && (
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4" />
                    {client.phone}
                  </p>
                )}

                {client.tags && client.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {client.tags.map((tag: ClientTag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                        style={{ backgroundColor: tag.color + '20', color: tag.color }}
                      >
                        <Tag className="w-3 h-3" />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {client.notes && (
                  <p className="text-xs text-gray-500 mt-2 italic line-clamp-2">
                    {client.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        {selectedClient && clientStats ? (
          <>
            <div className="p-4 lg:p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{selectedClient.first_name} {selectedClient.last_name}</h2>
                    {selectedClient.client_number && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-mono">
                        {selectedClient.client_number}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-sm text-gray-500">
                    <span>
                      Client depuis {new Date(clientStats.client_since).toLocaleDateString('fr-CH')}
                    </span>
                    {selectedClient.age !== undefined && selectedClient.age !== null && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {selectedClient.age} ans
                        </span>
                      </>
                    )}
                    {selectedClient.family_role === 'parent' && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <Baby className="w-4 h-4" />
                          Parent de {selectedClient.children_count} enfant{selectedClient.children_count > 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                    {selectedClient.family_role === 'child' && selectedClient.is_independent === false && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <Baby className="w-4 h-4" />
                          Enfant (attaché à un parent)
                        </span>
                      </>
                    )}
                    {selectedClient.is_independent && selectedClient.family_role === 'independent' && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Client indépendant
                        </span>
                      </>
                    )}
                  </div>
                  {selectedClient.tags && selectedClient.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedClient.tags.map((tag: ClientTag) => (
                        <span
                          key={tag.id}
                          className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                          style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        >
                          <Tag className="w-4 h-4" />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setEditClient({
                      first_name: selectedClient.first_name,
                      last_name: selectedClient.last_name,
                      email: selectedClient.email || '',
                      phone: selectedClient.phone || '',
                      notes: selectedClient.notes || '',
                      date_of_birth: selectedClient.date_of_birth || ''
                    });
                    setShowEditClient(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Modifier
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                  <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Total visites
                  </p>
                  <p className="text-xl lg:text-2xl font-bold text-blue-900">{clientStats.total_visits}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3" />
                    Total dépensé
                  </p>
                  <p className="text-base lg:text-lg font-bold text-green-900">{clientStats.total_spent?.toFixed(2)} CHF</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                  <p className="text-xs text-purple-600 font-medium flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Panier moyen
                  </p>
                  <p className="text-base lg:text-lg font-bold text-purple-900">{clientStats.avg_spent?.toFixed(2)} CHF</p>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-3">
                  <p className="text-xs text-pink-600 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Ce mois
                  </p>
                  <p className="text-xl lg:text-2xl font-bold text-pink-900">{clientStats.visits_this_month}</p>
                  <p className="text-xs text-pink-700">{clientStats.spent_this_month?.toFixed(2)} CHF</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
                  <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Cette année
                  </p>
                  <p className="text-xl lg:text-2xl font-bold text-orange-900">{clientStats.visits_this_year}</p>
                  <p className="text-xs text-orange-700">{clientStats.spent_this_year?.toFixed(2)} CHF</p>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3">
                  <p className="text-xs text-teal-600 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Dernière visite
                  </p>
                  <p className="text-sm lg:text-base font-bold text-teal-900">Il y a {clientStats.days_since_last_visit}j</p>
                </div>
              </div>

              {clientStats.favorite_payment_method && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {clientStats.favorite_payment_method === 'cash' ? (
                    <Banknote className="w-4 h-4 text-green-600" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-purple-600" />
                  )}
                  <span>Moyen de paiement préféré: <strong>{clientStats.favorite_payment_method === 'cash' ? 'Cash' : 'Twint'}</strong></span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4 border-t pt-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Vue d'ensemble
                </button>
                <button
                  onClick={() => setActiveTab('visits')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'visits'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Historique
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'services'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Scissors className="w-4 h-4" />
                  Services
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'payments'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  Paiements
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              {activeTab === 'overview' && (
                <>
                  {(selectedClient.family_role !== 'child' || selectedClient.is_independent) && (
                    <div className="mb-6">
                      <ChildrenManager
                        parentId={selectedClient.id}
                        parentName={`${selectedClient.first_name} ${selectedClient.last_name}`}
                        onChildAdded={() => {
                          loadClients();
                          if (selectedClient) {
                            const updatedClient = clients.find(c => c.id === selectedClient.id);
                            if (updatedClient) setSelectedClient(updatedClient);
                          }
                        }}
                      />
                    </div>
                  )}

                  {serviceFrequency.length > 0 && (
                    <div className="mb-6">
                      <button
                        onClick={() => setShowServiceFreq(!showServiceFreq)}
                        className="flex items-center justify-between w-full text-left mb-3"
                      >
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Award className="w-5 h-5 text-yellow-600" />
                          Services Favoris
                        </h3>
                        {showServiceFreq ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>

                      {showServiceFreq && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {serviceFrequency.slice(0, 6).map((service, idx) => (
                            <div key={idx} className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-3 border border-yellow-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 text-sm">{service.service_name}</p>
                                  <p className="text-xs text-gray-600 mt-1">{service.service_category}</p>
                                </div>
                                <div className="bg-yellow-100 px-2 py-1 rounded-full">
                                  <p className="text-xs font-bold text-yellow-900">{service.times_ordered}x</p>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                                <span>{service.total_spent_on_service?.toFixed(2)} CHF</span>
                                <span>Quantité: {service.total_quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {monthlyStats.length > 0 && (
                    <div className="mb-6">
                      <button
                        onClick={() => setShowMonthlyStats(!showMonthlyStats)}
                        className="flex items-center justify-between w-full text-left mb-3"
                      >
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          Statistiques Mensuelles
                        </h3>
                        {showMonthlyStats ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>

                      {showMonthlyStats && (
                        <div className="space-y-2">
                          {monthlyStats.slice(0, 6).map((stat, idx) => (
                            <div key={idx} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {new Date(stat.month).toLocaleDateString('fr-CH', { month: 'long', year: 'numeric' })}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {stat.visits_count} visite{stat.visits_count > 1 ? 's' : ''} • Moyenne: {stat.avg_spent?.toFixed(2)} CHF
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-blue-900">{stat.total_spent?.toFixed(2)} CHF</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {yearlyStats.length > 0 && (
                    <div className="mb-6">
                      <button
                        onClick={() => setShowYearlyStats(!showYearlyStats)}
                        className="flex items-center justify-between w-full text-left mb-3"
                      >
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          Statistiques Annuelles
                        </h3>
                        {showYearlyStats ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>

                      {showYearlyStats && (
                        <div className="space-y-2">
                          {yearlyStats.map((stat, idx) => (
                            <div key={idx} className="bg-green-50 rounded-lg p-4 border border-green-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">{stat.year}</p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {stat.visits_count} visites • {stat.active_months} mois actifs
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Panier moyen: {stat.avg_spent?.toFixed(2)} CHF
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-green-900">{stat.total_spent?.toFixed(2)} CHF</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'visits' && (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-600" />
                    Historique Complet des Visites
                  </h3>

                  <div className="space-y-3">
                    {serviceHistory.map((visit, index) => {
                      const isExpanded = expandedVisits.has(visit.transaction_id);
                      const color = getServiceColor(index);
                      return (
                        <div key={visit.transaction_id} className={`border-2 ${color.border} ${color.bg} rounded-xl overflow-hidden`}>
                          <div
                            className="p-4 cursor-pointer hover:bg-white/30 transition-colors"
                            onClick={() => toggleVisit(visit.transaction_id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(visit.visit_date).toLocaleDateString('fr-CH', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                                <div>
                                  <p className={`text-xl font-bold ${color.text}`}>
                                    {visit.client_amount.toFixed(2)} CHF
                                  </p>
                                  {visit.is_primary && visit.transaction_total !== visit.client_amount && (
                                    <p className="text-xs text-gray-600">
                                      Transaction totale: {visit.transaction_total.toFixed(2)} CHF
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className={`px-3 py-1 ${color.badge} rounded-full text-sm font-medium ${color.text}`}>
                                  {visit.payment_method === 'cash' ? 'Cash' : 'Twint'}
                                </div>
                                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                              </div>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-3">
                              <div className="space-y-2">
                                {visit.items?.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between bg-white/50 rounded-lg p-2">
                                    <div className="flex items-center gap-2">
                                      <Scissors className="w-4 h-4 text-gray-600" />
                                      <span className={`font-medium ${color.text}`}>{item.name}</span>
                                      {item.type === 'service' && (
                                        <span className="text-xs text-gray-500">
                                          ({item.quantity}x)
                                        </span>
                                      )}
                                    </div>
                                    <span className={`font-semibold ${color.text}`}>
                                      {(item.price * item.quantity).toFixed(2)} CHF
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {visit.photo_url ? (
                                <div className="relative group">
                                  <img
                                    src={visit.photo_url}
                                    alt="Photo de visite"
                                    className="w-full h-48 object-cover rounded-lg cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(visit.photo_url, '_blank');
                                    }}
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deletePhoto(visit.transaction_id);
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-white/50 cursor-pointer transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        handlePhotoUpload(visit.transaction_id, e.target.files[0]);
                                      }
                                    }}
                                    disabled={uploading === visit.transaction_id}
                                  />
                                  {uploading === visit.transaction_id ? (
                                    <span className="text-gray-500">Upload...</span>
                                  ) : (
                                    <>
                                      <Camera className="w-5 h-5 text-gray-400" />
                                      <span className="text-sm text-gray-600">Ajouter une photo</span>
                                    </>
                                  )}
                                </label>
                              )}

                              <div onClick={(e) => e.stopPropagation()}>
                                {editingNotes === visit.transaction_id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={noteText}
                                      onChange={(e) => setNoteText(e.target.value)}
                                      placeholder="Ajouter des notes..."
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                      rows={3}
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => updateNotes(visit.transaction_id, noteText)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                      >
                                        Enregistrer
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingNotes(null);
                                          setNoteText('');
                                        }}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                                      >
                                        Annuler
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => {
                                      setEditingNotes(visit.transaction_id);
                                      setNoteText(visit.notes || '');
                                    }}
                                    className="cursor-pointer"
                                  >
                                    {visit.notes ? (
                                      <p className="text-sm text-gray-700 bg-white/50 rounded-lg p-3">{visit.notes}</p>
                                    ) : (
                                      <p className="text-sm text-gray-400 italic">Cliquer pour ajouter des notes...</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {serviceHistory.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Aucune visite enregistrée</p>
                      <p className="text-sm">L'historique apparaîtra après une transaction au POS</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'services' && (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-blue-600" />
                    Services par Catégorie
                  </h3>

                  {serviceFrequency.length > 0 ? (
                    <div className="space-y-3">
                      {serviceFrequency.map((service, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-lg">{service.service_name}</p>
                              <p className="text-sm text-gray-600 mt-1">{service.service_category}</p>
                            </div>
                            <div className="bg-blue-100 px-3 py-2 rounded-full">
                              <p className="text-sm font-bold text-blue-900">{service.times_ordered} fois</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3 mt-3 text-center">
                            <div className="bg-white/70 rounded-lg p-2">
                              <p className="text-xs text-gray-600">Total dépensé</p>
                              <p className="text-base font-bold text-blue-900">{service.total_spent_on_service?.toFixed(2)} CHF</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-2">
                              <p className="text-xs text-gray-600">Quantité totale</p>
                              <p className="text-base font-bold text-blue-900">{service.total_quantity}</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-2">
                              <p className="text-xs text-gray-600">Prix moyen</p>
                              <p className="text-base font-bold text-blue-900">
                                {(service.total_spent_on_service / service.times_ordered)?.toFixed(2)} CHF
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-600">
                            <p>Première commande: {new Date(service.first_ordered_date).toLocaleDateString('fr-CH')}</p>
                            <p>Dernière commande: {new Date(service.last_ordered_date).toLocaleDateString('fr-CH')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Scissors className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Aucun service enregistré</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'payments' && (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    Historique des Paiements
                  </h3>

                  {serviceHistory.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Banknote className="w-5 h-5 text-green-600" />
                            <p className="text-sm font-medium text-gray-600">Cash</p>
                          </div>
                          <p className="text-2xl font-bold text-green-900">
                            {serviceHistory.filter(v => v.payment_method === 'cash').length} paiements
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {serviceHistory
                              .filter(v => v.payment_method === 'cash')
                              .reduce((sum, v) => sum + v.client_amount, 0)
                              .toFixed(2)} CHF
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                            <p className="text-sm font-medium text-gray-600">Twint</p>
                          </div>
                          <p className="text-2xl font-bold text-purple-900">
                            {serviceHistory.filter(v => v.payment_method === 'twint').length} paiements
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {serviceHistory
                              .filter(v => v.payment_method === 'twint')
                              .reduce((sum, v) => sum + v.client_amount, 0)
                              .toFixed(2)} CHF
                          </p>
                        </div>
                      </div>

                      {serviceHistory.map((visit, index) => (
                        <div key={visit.transaction_id} className={`${
                          visit.payment_method === 'cash'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                            : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                        } border-2 rounded-lg p-4`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {visit.payment_method === 'cash' ? (
                                <Banknote className="w-6 h-6 text-green-600" />
                              ) : (
                                <CreditCard className="w-6 h-6 text-purple-600" />
                              )}
                              <div>
                                <p className={`text-xl font-bold ${
                                  visit.payment_method === 'cash' ? 'text-green-900' : 'text-purple-900'
                                }`}>
                                  {visit.client_amount.toFixed(2)} CHF
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date(visit.visit_date).toLocaleDateString('fr-CH', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                {visit.is_primary && visit.transaction_total !== visit.client_amount && (
                                  <p className="text-xs text-gray-500">
                                    Total transaction: {visit.transaction_total.toFixed(2)} CHF
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className={`px-3 py-1 ${
                              visit.payment_method === 'cash' ? 'bg-green-100' : 'bg-purple-100'
                            } rounded-full text-sm font-medium`}>
                              {visit.payment_method === 'cash' ? 'Cash' : 'Twint'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Aucun paiement enregistré</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Sélectionnez un client</p>
              <p className="text-sm">Choisissez un client pour voir toutes ses informations</p>
            </div>
          </div>
        )}
      </div>

      {showAddClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Nouveau Client</h3>
            <form onSubmit={addClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  required
                  value={newClient.first_name}
                  onChange={(e) => setNewClient({ ...newClient, first_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={newClient.last_name}
                  onChange={(e) => setNewClient({ ...newClient, last_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                <input
                  type="date"
                  value={newClient.date_of_birth}
                  onChange={(e) => setNewClient({ ...newClient, date_of_birth: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optionnel - Permet de calculer l'âge et gérer les enfants (moins de 16 ans)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddClient(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Modifier Client</h3>
            <form onSubmit={updateClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  required
                  value={editClient.first_name}
                  onChange={(e) => setEditClient({ ...editClient, first_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={editClient.last_name}
                  onChange={(e) => setEditClient({ ...editClient, last_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editClient.email}
                  onChange={(e) => setEditClient({ ...editClient, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={editClient.phone}
                  onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                <input
                  type="date"
                  value={editClient.date_of_birth}
                  onChange={(e) => setEditClient({ ...editClient, date_of_birth: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optionnel - Permet de calculer l'âge et gérer les enfants (moins de 16 ans)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editClient.notes}
                  onChange={(e) => setEditClient({ ...editClient, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              {selectedClient && (
                <div className="border-t pt-4">
                  <TagManager
                    clientId={selectedClient.id}
                    clientTags={selectedClient.tags || []}
                    onTagsUpdate={() => {
                      loadClients();
                      if (selectedClient) {
                        const updatedClient = clients.find(c => c.id === selectedClient.id);
                        if (updatedClient) setSelectedClient(updatedClient);
                      }
                    }}
                  />
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditClient(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
