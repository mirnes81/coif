import React, { useState, useEffect } from 'react';
import { Save, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function GeneralSettings() {
  const [settings, setSettings] = useState({
    twint_number: '',
    phone: '',
    email: '',
    address: '',
    whatsapp: '',
    opening_hours: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          twint_number: data.twint_number || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          whatsapp: data.whatsapp || '',
          opening_hours: data.opening_hours || ''
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('settings')
        .update({
          twint_number: settings.twint_number,
          phone: settings.phone,
          email: settings.email,
          address: settings.address,
          whatsapp: settings.whatsapp,
          opening_hours: settings.opening_hours,
          updated_at: new Date().toISOString()
        })
        .eq('id', (await supabase.from('settings').select('id').single()).data?.id);

      if (error) throw error;

      setMessage('Paramètres enregistrés avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Paramètres généraux</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Numéro Twint</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Ce numéro sera utilisé pour générer les QR codes de paiement Twint dans le système de caisse.
                </p>
                <input
                  type="tel"
                  value={settings.twint_number}
                  onChange={(e) => setSettings({ ...settings, twint_number: e.target.value })}
                  placeholder="ex: 0791234567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone du salon
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp
            </label>
            <input
              type="tel"
              value={settings.whatsapp}
              onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              placeholder="ex: 41763761514"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horaires d'ouverture
            </label>
            <textarea
              value={settings.opening_hours}
              onChange={(e) => setSettings({ ...settings, opening_hours: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>

            {message && (
              <p className={`text-sm font-medium ${
                message.includes('succès') ? 'text-green-600' : 'text-red-600'
              }`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
