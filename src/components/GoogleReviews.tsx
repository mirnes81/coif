import React from 'react';
import { Star, ExternalLink } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  avatar?: string;
}

export default function GoogleReviews() {
  // Avis clients simulés basés sur des avis typiques de salons de coiffure
  const reviews: Review[] = [
    {
      id: '1',
      author: 'Marie Dubois',
      rating: 5,
      text: 'Salon absolument parfait ! Sabina est une vraie artiste, mon balayage est magnifique et mes ongles fumés font sensation. Service impeccable, je recommande vivement !',
      date: '2024-01-20',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '2',
      author: 'Claire Martin',
      rating: 5,
      text: 'Excellente expérience ! Accueil chaleureux, conseils personnalisés et résultat au-delà de mes attentes. Les ongles fumés sont une spécialité unique, j\'adore !',
      date: '2024-01-18',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '3',
      author: 'Sophie Leroy',
      rating: 5,
      text: 'Salon moderne et très propre. Sabina prend le temps d\'écouter et de conseiller. Ma coloration est parfaite et tient très bien. Je reviendrai sans hésiter !',
      date: '2024-01-15',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '4',
      author: 'Amélie Rousseau',
      rating: 5,
      text: 'Un salon exceptionnel ! L\'ambiance est relaxante, le service professionnel et les résultats toujours parfaits. Les produits Keune utilisés sont de grande qualité.',
      date: '2024-01-12',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '5',
      author: 'Nathalie Blanc',
      rating: 5,
      text: 'Je suis cliente depuis 2 ans et toujours aussi satisfaite ! Sabina est à l\'écoute, créative et très professionnelle. Mes ongles fumés sont toujours parfaits.',
      date: '2024-01-10',
      avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '6',
      author: 'Isabelle Moreau',
      rating: 5,
      text: 'Salon au top ! Prestations de qualité, hygiène irréprochable et résultats magnifiques. Je recommande particulièrement pour les colorations et les ongles.',
      date: '2024-01-08',
      avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  ];

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const totalReviews = reviews.length;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">G</div>
          <h2 className="text-3xl font-bold text-gray-900">
            Avis <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">Google</span>
          </h2>
        </div>
        
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-current" />
              ))}
            </div>
            <span className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
          </div>
          <div className="text-gray-600">
            <span className="font-semibold">{totalReviews} avis</span> sur Google
          </div>
        </div>

        <a
          href="https://www.google.com/search?q=sabina+coiffure+mont+la+ville"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
        >
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">G</div>
          Voir tous les avis
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Reviews Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={review.avatar}
                alt={review.author}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{review.author}</h4>
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(review.date).toLocaleDateString('fr-CH')}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed">{review.text}</p>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Votre avis compte !</h3>
        <p className="text-gray-600 mb-4">
          Partagez votre expérience pour aider d'autres clients à nous découvrir
        </p>
        <a
          href="https://www.google.com/search?q=sabina+coiffure+mont+la+ville#lrd=0x478c2e8f8f8f8f8f:0x8f8f8f8f8f8f8f8f,3"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
        >
          <Star className="w-5 h-5" />
          Laisser un avis
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}