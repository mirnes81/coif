import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description_short: '',
    price: '',
    category: '',
    image_url: '',
    in_stock: true,
    visible_on_shop: true
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (!error && data) {
      setProducts(data);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description_short: '',
      price: '',
      category: '',
      image_url: '',
      in_stock: true,
      visible_on_shop: true
    });
    setEditingProduct(null);
    setShowAddProduct(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description_short: product.description_short || '',
      price: product.price.toString(),
      category: product.category || '',
      image_url: product.image_url || '',
      in_stock: product.in_stock ?? true,
      visible_on_shop: product.visible_on_shop ?? true
    });
    setShowAddProduct(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      description_short: formData.description_short || null,
      price: parseFloat(formData.price),
      category: formData.category,
      image_url: formData.image_url || null,
      in_stock: formData.in_stock,
      visible_on_shop: formData.visible_on_shop
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (!error) {
        loadProducts();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (!error) {
        loadProducts();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (!error) {
        loadProducts();
      }
    }
  };

  const toggleActive = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ visible_on_shop: !product.visible_on_shop })
      .eq('id', product.id);

    if (!error) {
      loadProducts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-8 h-8 text-blue-600" />
          Gestion des produits
        </h2>
        <button
          onClick={() => setShowAddProduct(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau produit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
              product.visible_on_shop ? 'border-gray-200' : 'border-red-200 opacity-60'
            }`}
          >
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-xl"
              />
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
                  {product.category && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {product.category}
                    </span>
                  )}
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {product.price.toFixed(2)} CHF
                </span>
              </div>

              {product.description_short && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description_short}</p>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => toggleActive(product)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    product.visible_on_shop
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {product.visible_on_shop ? 'Actif' : 'Inactif'}
                </button>
                <button
                  onClick={() => handleEdit(product)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du produit</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description_short}
                  onChange={(e) => setFormData({ ...formData, description_short: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prix (CHF)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL de l'image</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="mt-3 w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="in_stock"
                    checked={formData.in_stock}
                    onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="in_stock" className="text-sm font-medium text-gray-700">
                    En stock
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="visible_on_shop"
                    checked={formData.visible_on_shop}
                    onChange={(e) => setFormData({ ...formData, visible_on_shop: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="visible_on_shop" className="text-sm font-medium text-gray-700">
                    Visible sur la boutique
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingProduct ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
