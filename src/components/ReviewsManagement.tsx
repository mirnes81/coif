import React, { useEffect, useState } from 'react';
import { Star, RefreshCw, Eye, EyeOff, ExternalLink, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  google_review_id: string;
  author_name: string;
  author_photo_url: string | null;
  rating: number;
  text: string | null;
  relative_time_description: string;
  published_at: string;
  visible: boolean;
  last_synced_at: string;
}

interface ReviewsSettings {
  id: string;
  place_id: string;
  place_name: string;
  google_maps_url: string | null;
  average_rating: number;
  total_reviews: number;
  last_sync_at: string | null;
  sync_enabled: boolean;
  display_on_site: boolean;
  max_reviews_displayed: number;
}

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<ReviewsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editingSettings, setEditingSettings] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [settingsResponse, reviewsResponse] = await Promise.all([
        supabase.from('google_reviews_settings').select('*').single(),
        supabase
          .from('google_reviews')
          .select('*')
          .order('published_at', { ascending: false })
      ]);

      if (settingsResponse.error) throw settingsResponse.error;
      if (reviewsResponse.error) throw reviewsResponse.error;

      setSettings(settingsResponse.data);
      setReviews(reviewsResponse.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      showMessage('error', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const syncReviews = async () => {
    try {
      setSyncing(true);
      showMessage('success', 'Synchronisation en cours...');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-google-reviews`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        showMessage('success', `Synchronisation réussie: ${result.stats.new_reviews} nouveaux avis, ${result.stats.updated_reviews} mis à jour`);
        await loadData();
      } else {
        throw new Error(result.error || 'Échec de la synchronisation');
      }
    } catch (err) {
      console.error('Error syncing reviews:', err);
      showMessage('error', `Erreur: ${err instanceof Error ? err.message : 'Échec de la synchronisation'}`);
    } finally {
      setSyncing(false);
    }
  };

  const toggleVisibility = async (reviewId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('google_reviews')
        .update({ visible: !currentVisibility })
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(reviews.map(r =>
        r.id === reviewId ? { ...r, visible: !currentVisibility } : r
      ));

      showMessage('success', 'Visibilité mise à jour');
    } catch (err) {
      console.error('Error updating visibility:', err);
      showMessage('error', 'Erreur lors de la mise à jour');
    }
  };

  const updateSettings = async (updates: Partial<ReviewsSettings>) => {
    if (!settings) return;

    try {
      const { error } = await supabase
        .from('google_reviews_settings')
        .update(updates)
        .eq('id', settings.id);

      if (error) throw error;

      setSettings({ ...settings, ...updates });
      showMessage('success', 'Paramètres mis à jour');
      setEditingSettings(false);
    } catch (err) {
      console.error('Error updating settings:', err);
      showMessage('error', 'Erreur lors de la mise à jour');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-rose-600 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <p className="text-gray-600">Configuration des avis non trouvée</p>
      </div>
    );
  }

  const visibleReviews = reviews.filter(r => r.visible);
  const hiddenReviews = reviews.filter(r => !r.visible);

  return (
    <div className="space-y-6">
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                G
              </div>
              Avis Google
            </h2>
            <p className="text-gray-600 mt-1">{settings.place_name}</p>
          </div>
          <button
            onClick={syncReviews}
            disabled={syncing || !settings.sync_enabled}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Synchronisation...' : 'Synchroniser'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-yellow-700 mb-2">
              <Star className="w-5 h-5 fill-current" />
              <span className="text-sm font-medium">Note moyenne</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{settings.average_rating.toFixed(1)}</p>
            <p className="text-sm text-gray-600">{settings.total_reviews} avis total</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Eye className="w-5 h-5" />
              <span className="text-sm font-medium">Visibles</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{visibleReviews.length}</p>
            <p className="text-sm text-gray-600">affichés sur le site</p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <EyeOff className="w-5 h-5" />
              <span className="text-sm font-medium">Masqués</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{hiddenReviews.length}</p>
            <p className="text-sm text-gray-600">non affichés</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm font-medium">Dernière sync</span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {settings.last_sync_at
                ? new Date(settings.last_sync_at).toLocaleDateString('fr-CH')
                : 'Jamais'
              }
            </p>
            <p className="text-sm text-gray-600">
              {settings.last_sync_at
                ? new Date(settings.last_sync_at).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })
                : '-'
              }
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
            <button
              onClick={() => setEditingSettings(!editingSettings)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Settings className="w-4 h-4" />
              {editingSettings ? 'Annuler' : 'Modifier'}
            </button>
          </div>

          {editingSettings ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Place ID Google
                </label>
                <input
                  type="text"
                  value={settings.place_id}
                  onChange={(e) => setSettings({ ...settings, place_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ChIJ..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lien Google Maps
                </label>
                <input
                  type="url"
                  value={settings.google_maps_url || ''}
                  onChange={(e) => setSettings({ ...settings, google_maps_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://g.page/..."
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.display_on_site}
                    onChange={(e) => setSettings({ ...settings, display_on_site: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Afficher sur le site public</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.sync_enabled}
                    onChange={(e) => setSettings({ ...settings, sync_enabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Synchronisation activée</span>
                </label>
              </div>

              <button
                onClick={() => updateSettings(settings)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Enregistrer les modifications
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Place ID:</span>
                <p className="font-mono text-gray-900">{settings.place_id}</p>
              </div>
              <div>
                <span className="text-gray-600">Affichage site:</span>
                <p className="font-medium text-gray-900">{settings.display_on_site ? 'Activé' : 'Désactivé'}</p>
              </div>
              {settings.google_maps_url && (
                <div className="col-span-2">
                  <span className="text-gray-600">Lien Google Maps:</span>
                  <a
                    href={settings.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-1"
                  >
                    {settings.google_maps_url}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Tous les avis ({reviews.length})</h3>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Aucun avis synchronisé</p>
            <button
              onClick={syncReviews}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Lancer la première synchronisation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`border rounded-xl p-4 transition-all ${
                  review.visible ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {review.author_photo_url ? (
                      <img
                        src={review.author_photo_url}
                        alt={review.author_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold">
                        {review.author_name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{review.author_name}</h4>
                        <div className="flex text-yellow-400">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {review.relative_time_description} • {new Date(review.published_at).toLocaleDateString('fr-CH')}
                      </p>
                      {review.text && (
                        <p className="text-gray-700 leading-relaxed">{review.text}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleVisibility(review.id, review.visible)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      review.visible
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {review.visible ? (
                      <>
                        <Eye className="w-4 h-4" />
                        Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Masqué
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
