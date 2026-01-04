import React, { useState } from 'react';
import { Instagram, Facebook, ExternalLink, Heart, MessageCircle } from 'lucide-react';

interface InstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  date: string;
  type: 'instagram' | 'facebook';
}

export default function InstagramGallery() {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);

  // Posts simulés basés sur les comptes Instagram et Facebook
  const posts: InstagramPost[] = [
    {
      id: '1',
      imageUrl: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600',
      caption: '✨ Balayage parfait pour cette cliente ! Technique de coloration qui sublime les cheveux naturellement. #balayage #coiffure #montlaville',
      likes: 45,
      comments: 8,
      date: '2024-01-15',
      type: 'instagram'
    },
    {
      id: '2',
      imageUrl: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=600',
      caption: '💅 Nos fameux "ongles fumés" ! Une technique exclusive qui fait sensation. Réservez votre rendez-vous ! #onglesfumes #manucure #nailart',
      likes: 62,
      comments: 12,
      date: '2024-01-12',
      type: 'instagram'
    },
    {
      id: '3',
      imageUrl: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=600',
      caption: '🌟 Nouvelle collection de produits Keune disponible au salon ! Venez découvrir nos shampoings et soins professionnels.',
      likes: 38,
      comments: 5,
      date: '2024-01-10',
      type: 'facebook'
    },
    {
      id: '4',
      imageUrl: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600',
      caption: '💇‍♀️ Coupe tendance et brushing parfait ! Merci à cette belle cliente pour sa confiance. #coiffure #brushing #style',
      likes: 51,
      comments: 9,
      date: '2024-01-08',
      type: 'instagram'
    },
    {
      id: '5',
      imageUrl: 'https://images.pexels.com/photos/3997386/pexels-photo-3997386.jpeg?auto=compress&cs=tinysrgb&w=600',
      caption: '✨ Transformation complète ! Avant/après de cette magnifique coloration. Résultat : des cheveux éclatants de santé !',
      likes: 73,
      comments: 15,
      date: '2024-01-05',
      type: 'instagram'
    },
    {
      id: '6',
      imageUrl: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=600',
      caption: '🎉 Promotion spéciale : -20% sur tous les soins Keune ce mois-ci ! Profitez-en pour chouchouter vos cheveux.',
      likes: 29,
      comments: 4,
      date: '2024-01-03',
      type: 'facebook'
    }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Nos <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">Réalisations</span>
        </h2>
        <p className="text-gray-600 mb-6">Découvrez nos dernières créations sur nos réseaux sociaux</p>
        
        <div className="flex justify-center gap-4">
          <a
            href="https://www.instagram.com/sabinavelAGIC/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
          >
            <Instagram className="w-5 h-5" />
            @sabinavelAGIC
            <ExternalLink className="w-4 h-4" />
          </a>
          
          <a
            href="https://www.facebook.com/SabinaCoiffureNail/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
          >
            <Facebook className="w-5 h-5" />
            SabinaCoiffureNail
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {posts.map((post) => (
          <div
            key={post.id}
            className="group relative bg-gray-100 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => setSelectedPost(post)}
          >
            <img
              src={post.imageUrl}
              alt="Réalisation salon"
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            
            {/* Social Media Badge */}
            <div className="absolute top-3 left-3">
              <div className={`p-2 rounded-full ${
                post.type === 'instagram' 
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500' 
                  : 'bg-blue-600'
              }`}>
                {post.type === 'instagram' ? (
                  <Instagram className="w-4 h-4 text-white" />
                ) : (
                  <Facebook className="w-4 h-4 text-white" />
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl p-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="font-medium">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{post.comments}</span>
                  </div>
                </div>
                <span className="text-gray-600">{new Date(post.date).toLocaleDateString('fr-CH')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Suivez-nous pour plus d'inspirations !</h3>
        <p className="text-gray-600 mb-4">
          Découvrez quotidiennement nos réalisations, conseils beauté et nouveautés
        </p>
        <div className="flex justify-center gap-3">
          <a
            href="https://www.instagram.com/sabinavelAGIC/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </a>
          <span className="text-gray-400">•</span>
          <a
            href="https://www.facebook.com/SabinaCoiffureNail/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            <Facebook className="w-4 h-4" />
            Facebook
          </a>
        </div>
      </div>

      {/* Modal for selected post */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedPost.imageUrl}
                alt="Réalisation"
                className="w-full h-96 object-cover rounded-t-3xl"
              />
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
              >
                <ExternalLink className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${
                  selectedPost.type === 'instagram' 
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500' 
                    : 'bg-blue-600'
                }`}>
                  {selectedPost.type === 'instagram' ? (
                    <Instagram className="w-5 h-5 text-white" />
                  ) : (
                    <Facebook className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedPost.type === 'instagram' ? '@sabinavelAGIC' : 'SabinaCoiffureNail'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedPost.date).toLocaleDateString('fr-CH')}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{selectedPost.caption}</p>
              
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="font-medium">{selectedPost.likes} j'aime</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">{selectedPost.comments} commentaires</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}