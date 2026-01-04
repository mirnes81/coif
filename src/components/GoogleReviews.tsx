import React, { useEffect, useState } from 'react';
import { Star, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  author_name: string;
  author_photo_url: string | null;
  rating: number;
  text: string | null;
  relative_time_description: string;
  published_at: string;
}

interface ReviewsSettings {
  place_name: string;
  google_maps_url: string | null;
  average_rating: number;
  total_reviews: number;
  last_sync_at: string | null;
  display_on_site: boolean;
  max_reviews_displayed: number;
}

export default function GoogleReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<ReviewsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const [settingsResponse, reviewsResponse] = await Promise.all([
        supabase.from('google_reviews_settings').select('*').single(),
        supabase
          .from('google_reviews')
          .select('*')
          .eq('visible', true)
          .order('published_at', { ascending: false })
          .limit(6)
      ]);

      if (settingsResponse.error) throw settingsResponse.error;
      if (reviewsResponse.error) throw reviewsResponse.error;

      setSettings(settingsResponse.data);
      setReviews(reviewsResponse.data || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Impossible de charger les avis pour le moment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des avis...</p>
        </div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center py-12">
          <p className="text-gray-600">{error || 'Configuration des avis en cours...'}</p>
        </div>
      </div>
    );
  }

  if (!settings.display_on_site) {
    return null;
  }

  const googleMapsUrl = settings.google_maps_url || 'https://www.google.com/search?q=sabina+coiffure+mont+la+ville';

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            G
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Avis <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">Google</span>
          </h2>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < Math.floor(settings.average_rating)
                      ? 'fill-current'
                      : i < settings.average_rating
                      ? 'fill-current opacity-50'
                      : ''
                  }`}
                />
              ))}
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {settings.average_rating.toFixed(1)}
            </span>
          </div>
          <div className="text-gray-600">
            <span className="font-semibold">{settings.total_reviews} avis</span> sur Google
          </div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
        >
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
            G
          </div>
          Voir tous les avis
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {reviews.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  {review.author_photo_url ? (
                    <img
                      src={review.author_photo_url}
                      alt={review.author_name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author_name)}&background=f43f5e&color=fff`;
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                      {review.author_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.author_name}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {review.relative_time_description}
                      </span>
                    </div>
                  </div>
                </div>

                {review.text && (
                  <p className="text-gray-700 leading-relaxed line-clamp-4">
                    {review.text}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Votre avis compte !</h3>
            <p className="text-gray-600 mb-4">
              Partagez votre expérience pour aider d'autres clients à nous découvrir
            </p>
            <a
              href={`${googleMapsUrl}#lrd=0x0:0x0,3`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              <Star className="w-5 h-5" />
              Laisser un avis
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Aucun avis disponible pour le moment</p>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
          >
            <Star className="w-5 h-5" />
            Soyez le premier à laisser un avis
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {settings.last_sync_at && (
        <p className="text-center text-xs text-gray-500 mt-4">
          Dernière mise à jour: {new Date(settings.last_sync_at).toLocaleDateString('fr-CH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      )}
    </div>
  );
}
