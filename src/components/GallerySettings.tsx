import React, { useState, useEffect } from 'react';
import { Image, Save, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GallerySetting {
  id: string;
  setting_key: string;
  setting_value: any;
  updated_at: string;
}

export default function GallerySettings() {
  const [settings, setSettings] = useState<Record<string, any>>({
    instagram_enabled: true,
    instagram_access_token: '',
    gallery_images: [],
    auto_refresh_interval: 3600000,
    max_images: 12
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('gallery_settings')
      .select('*');

    if (!error && data) {
      const settingsMap: Record<string, any> = {};
      data.forEach((setting: GallerySetting) => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });
      setSettings({ ...settings, ...settingsMap });
    }
  };

  const saveSetting = async (key: string, value: any) => {
    const { data: existing } = await supabase
      .from('gallery_settings')
      .select('id')
      .eq('setting_key', key)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('gallery_settings')
        .update({ setting_value: value, updated_at: new Date().toISOString() })
        .eq('setting_key', key);
    } else {
      await supabase
        .from('gallery_settings')
        .insert([{ setting_key: key, setting_value: value }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      for (const [key, value] of Object.entries(settings)) {
        await saveSetting(key, value);
      }
      setMessage('Paramètres enregistrés avec succès');
    } catch (error) {
      setMessage('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Paramètres de la galerie</h2>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('succès')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Image className="w-5 h-5 text-blue-600" />
              Intégration Instagram
            </h3>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="instagram_enabled"
                checked={settings.instagram_enabled}
                onChange={(e) => setSettings({ ...settings, instagram_enabled: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="instagram_enabled" className="text-sm font-medium text-gray-700">
                Activer l'intégration Instagram
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Token Instagram
              </label>
              <input
                type="text"
                value={settings.instagram_access_token}
                onChange={(e) => setSettings({ ...settings, instagram_access_token: e.target.value })}
                placeholder="Entrez votre access token Instagram"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-2 text-xs text-gray-500">
                Pour obtenir votre access token, connectez-vous à votre compte Instagram Business
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Paramètres d'affichage</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre maximum d'images
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.max_images}
                onChange={(e) => setSettings({ ...settings, max_images: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervalle de rafraîchissement automatique (ms)
              </label>
              <input
                type="number"
                min="60000"
                step="60000"
                value={settings.auto_refresh_interval}
                onChange={(e) => setSettings({ ...settings, auto_refresh_interval: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-2 text-xs text-gray-500">
                Temps en millisecondes entre chaque actualisation (60000ms = 1 minute)
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">URLs des images personnalisées</h3>
            <textarea
              value={settings.gallery_images?.join('\n') || ''}
              onChange={(e) => setSettings({
                ...settings,
                gallery_images: e.target.value.split('\n').filter(url => url.trim())
              })}
              rows={8}
              placeholder="Entrez une URL par ligne..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <p className="mt-2 text-xs text-gray-500">
              Ces images seront affichées dans la galerie. Une URL par ligne.
            </p>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
