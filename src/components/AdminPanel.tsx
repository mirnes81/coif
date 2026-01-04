import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import ImageGallery from './ImageGallery';

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
  ingredients?: string[];
  usage?: string;
  volume?: string;
}

interface AdminPanelProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
}

export default function AdminPanel({ 
  products, 
  onUpdateProduct, 
  onDeleteProduct, 
  onAddProduct 
}: AdminPanelProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageField, setCurrentImageField] = useState<string>('');

  const categories = ['Shampoings', 'Soins', 'Coiffage', 'Coloration', 'Accessoires', 'Ongles'];

  const handleEdit = (product: Product) => {
    setIsEditing(product.id);
    setEditForm(product);
  };

  const handleSave = () => {
    if (isAdding) {
      onAddProduct({
        ...editForm,
        id: Date.now().toString(),
        rating: editForm.rating || 4.5,
        reviews: editForm.reviews || 0,
        benefits: editForm.benefits || [],
      } as Omit<Product, 'id'>);
      setIsAdding(false);
    } else if (isEditing) {
      onUpdateProduct(editForm as Product);
      setIsEditing(null);
    }
    setEditForm({});
  };

  const handleCancel = () => {
    setIsEditing(null);
    setIsAdding(false);
    setEditForm({});
  };

  const handleImageSelect = (imageUrl: string) => {
    setEditForm({ ...editForm, image: imageUrl });
    setIsGalleryOpen(false);
  };

  const openImageGallery = () => {
    setCurrentImageField('image');
    setIsGalleryOpen(true);
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditForm({
      name: '',
      category: categories[0],
      price: 0,
      image: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: '',
      benefits: [],
      inStock: true,
      isNew: false,
      isBestseller: false,
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Gestion des Produits</h2>
        <button
          onClick={handleAddNew}
          className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Ajouter un produit
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || isEditing) && (
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {isAdding ? 'Ajouter un nouveau produit' : 'Modifier le produit'}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom du produit</label>
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <select
                value={editForm.category || ''}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix (CHF)</label>
              <input
                type="number"
                step="0.01"
                value={editForm.price || ''}
                onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix original (optionnel)</label>
              <input
                type="number"
                step="0.01"
                value={editForm.originalPrice || ''}
                onChange={(e) => setEditForm({ ...editForm, originalPrice: parseFloat(e.target.value) || undefined })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Volume</label>
              <input
                type="text"
                value={editForm.volume || ''}
                onChange={(e) => setEditForm({ ...editForm, volume: e.target.value })}
                placeholder="ex: 250ml, 1L"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL de l'image</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={editForm.image || ''}
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="URL de l'image ou utilisez la galerie"
                />
                <button
                  type="button"
                  onClick={openImageGallery}
                  className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Galerie
                </button>
              </div>
              {editForm.image && (
                <div className="mt-2">
                  <img 
                    src={editForm.image} 
                    alt="Aperçu" 
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bénéfices (un par ligne)</label>
              <textarea
                value={editForm.benefits?.join('\n') || ''}
                onChange={(e) => setEditForm({ ...editForm, benefits: e.target.value.split('\n').filter(b => b.trim()) })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode d'emploi</label>
              <textarea
                value={editForm.usage || ''}
                onChange={(e) => setEditForm({ ...editForm, usage: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.inStock || false}
                  onChange={(e) => setEditForm({ ...editForm, inStock: e.target.checked })}
                  className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                />
                <span className="text-sm font-medium text-gray-700">En stock</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.isNew || false}
                  onChange={(e) => setEditForm({ ...editForm, isNew: e.target.checked })}
                  className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                />
                <span className="text-sm font-medium text-gray-700">Nouveau</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.isBestseller || false}
                  onChange={(e) => setEditForm({ ...editForm, isBestseller: e.target.checked })}
                  className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                />
                <span className="text-sm font-medium text-gray-700">Best-seller</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      <ImageGallery
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectImage={handleImageSelect}
        selectedImage={editForm.image}
      />

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-2">Image</th>
              <th className="text-left py-4 px-2">Nom</th>
              <th className="text-left py-4 px-2">Catégorie</th>
              <th className="text-left py-4 px-2">Prix</th>
              <th className="text-left py-4 px-2">Stock</th>
              <th className="text-left py-4 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-2">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                </td>
                <td className="py-4 px-2">
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    {product.volume && (
                      <p className="text-sm text-gray-600">{product.volume}</p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-2 text-gray-600">{product.category}</td>
                <td className="py-4 px-2">
                  <span className="font-semibold text-gray-900">CHF {product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through ml-2">CHF {product.originalPrice}</span>
                  )}
                </td>
                <td className="py-4 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.inStock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'En stock' : 'Rupture'}
                  </span>
                </td>
                <td className="py-4 px-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}