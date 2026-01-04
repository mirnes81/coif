import React, { useState } from 'react';
import { X, ShoppingCart, Package, Heart, Star, Minus, Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  benefits: string[];
  inStock: boolean;
  ingredients?: string[];
  usage?: string;
  volume?: string;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onReserve: (product: Product, quantity: number) => void;
  onToggleFavorite: (productId: string) => void;
  isFavorite: boolean;
}

export default function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onReserve,
  onToggleFavorite,
  isFavorite
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Détails du produit</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-96 object-cover rounded-2xl"
              />
              <button
                onClick={() => onToggleFavorite(product.id)}
                className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-300 ${
                  isFavorite 
                    ? 'bg-rose-500 text-white' 
                    : 'bg-white/80 text-gray-600 hover:bg-rose-500 hover:text-white'
                }`}
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <span className="text-sm text-rose-600 font-medium">{product.category}</span>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
                {product.volume && (
                  <p className="text-gray-600 mt-1">{product.volume}</p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} 
                    />
                  ))}
                </div>
                <span className="text-gray-600">({product.reviews} avis)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">CHF {product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">CHF {product.originalPrice}</span>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border border-gray-300 rounded-full hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 border border-gray-300 rounded-full hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={() => onAddToCart(product, quantity)}
                  disabled={!product.inStock}
                  className={`flex-1 py-4 px-6 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    product.inStock
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-lg hover:shadow-rose-500/25'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.inStock ? 'Ajouter au panier' : 'Rupture de stock'}
                </button>
                
                <button
                  onClick={() => onReserve(product, quantity)}
                  className="px-6 py-4 border-2 border-rose-300 text-rose-600 rounded-full font-semibold hover:bg-rose-50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  Réserver
                </button>
              </div>

              {/* Stock status */}
              <div className={`p-3 rounded-xl mb-6 ${
                product.inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                <p className="font-medium">
                  {product.inStock ? '✓ En stock - Expédition sous 24h' : '⚠ Rupture de stock'}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {['description', 'benefits', 'ingredients', 'usage'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? 'border-rose-500 text-rose-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'description' && 'Description'}
                    {tab === 'benefits' && 'Bénéfices'}
                    {tab === 'ingredients' && 'Ingrédients'}
                    {tab === 'usage' && 'Utilisation'}
                  </button>
                ))}
              </nav>
            </div>

            <div className="py-6">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              {activeTab === 'benefits' && (
                <div>
                  <ul className="space-y-3">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-rose-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'ingredients' && (
                <div>
                  {product.ingredients ? (
                    <p className="text-gray-700 leading-relaxed">{product.ingredients.join(', ')}</p>
                  ) : (
                    <p className="text-gray-500 italic">Informations sur les ingrédients non disponibles.</p>
                  )}
                </div>
              )}

              {activeTab === 'usage' && (
                <div>
                  {product.usage ? (
                    <p className="text-gray-700 leading-relaxed">{product.usage}</p>
                  ) : (
                    <p className="text-gray-500 italic">Instructions d'utilisation non disponibles.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}