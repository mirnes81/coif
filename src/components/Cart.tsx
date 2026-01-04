import React from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export default function Cart({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout 
}: CartProps) {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Panier ({itemCount} {itemCount > 1 ? 'articles' : 'article'})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Votre panier est vide</h3>
              <p className="text-gray-600">Découvrez nos produits Keune et ajoutez-les à votre panier</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl"
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.category}</p>
                    <p className="text-lg font-bold text-rose-600">CHF {item.price}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-rose-600">CHF {total.toFixed(2)}</span>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={onCheckout}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300"
              >
                Procéder au paiement
              </button>
              
              <div className="text-center text-sm text-gray-600">
                <p>Livraison gratuite dès CHF 80 d'achat</p>
                <p>Click & Collect gratuit au salon</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}