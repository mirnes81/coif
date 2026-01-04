import React from 'react';
import { ShoppingCart, Heart, Star, Package } from 'lucide-react';

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
  isNew?: boolean;
  isBestseller?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onReserve: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
  isFavorite: boolean;
}

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onReserve, 
  onToggleFavorite, 
  isFavorite 
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Nouveau
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Best-seller
            </span>
          )}
          {!product.inStock && (
            <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Rupture
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={() => onToggleFavorite(product.id)}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${
            isFavorite 
              ? 'bg-rose-500 text-white' 
              : 'bg-white/80 text-gray-600 hover:bg-rose-500 hover:text-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-6">
        <div className="mb-3">
          <span className="text-sm text-rose-600 font-medium">{product.category}</span>
          <h3 className="text-xl font-bold text-gray-900 mt-1 line-clamp-2">{product.name}</h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} 
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">({product.reviews})</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>

        {/* Benefits */}
        <div className="mb-4">
          <ul className="text-sm text-gray-600 space-y-1">
            {product.benefits.slice(0, 2).map((benefit, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">CHF {product.price}</span>
          {product.originalPrice && (
            <span className="text-lg text-gray-500 line-through">CHF {product.originalPrice}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
            className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              product.inStock
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-lg hover:shadow-rose-500/25'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {product.inStock ? 'Ajouter' : 'Rupture'}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReserve(product);
            }}
            className="px-4 py-3 border-2 border-rose-300 text-rose-600 rounded-full font-semibold hover:bg-rose-50 transition-all duration-300 flex items-center justify-center"
          >
            <Package className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}