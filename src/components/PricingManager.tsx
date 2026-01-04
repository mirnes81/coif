import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, DollarSign, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Service {
  id: string;
  category_id?: string;
  name: string;
  description?: string;
  price_short?: number;
  price_medium?: number;
  price_long?: number;
  price_base?: number;
  duration_minutes?: number;
  duration?: number;
  preparation_time?: number;
  is_visible?: boolean;
  image_url?: string;
  service_type?: string;
  active?: boolean;
  display_order?: number;
  created_at: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  display_order?: number;
  active?: boolean;
}

export default function PricingManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Service>>({});
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadCategories();
    loadServices();
  }, []);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('active', true)
      .order('display_order');

    if (!error && data) {
      setCategories(data);
    }
  };

  const loadServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*, service_categories(name)')
      .eq('active', true)
      .order('display_order');

    if (!error && data) {
      setServices(data);
    }
  };

  const resetForm = () => {
    setEditForm({});
    setIsEditing(null);
    setIsAdding(false);
  };

  const handleEdit = (service: Service) => {
    setIsEditing(service.id);
    setEditForm(service);
    setIsAdding(true);
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditForm({
      name: '',
      category_id: categories[0]?.id || '',
      price_short: 0,
      price_medium: 0,
      price_long: 0,
      duration_minutes: 30,
      duration: 30,
      preparation_time: 0,
      is_visible: true,
      image_url: '',
      service_type: 'coiffure',
      active: true,
      display_order: 0
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleImageFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('services')
          .update({
            name: editForm.name,
            category_id: editForm.category_id || null,
            description: editForm.description || null,
            price_short: editForm.price_short || null,
            price_medium: editForm.price_medium || null,
            price_long: editForm.price_long || null,
            price_base: editForm.price_base || null,
            duration_minutes: editForm.duration_minutes || 30,
            duration: editForm.duration || 30,
            preparation_time: editForm.preparation_time || 0,
            is_visible: editForm.is_visible !== undefined ? editForm.is_visible : true,
            image_url: editForm.image_url || null,
            service_type: editForm.service_type || 'coiffure'
          })
          .eq('id', isEditing);

        if (!error) {
          loadServices();
          resetForm();
        }
      } else {
        const { error } = await supabase
          .from('services')
          .insert([{
            name: editForm.name,
            category_id: editForm.category_id || null,
            description: editForm.description || null,
            price_short: editForm.price_short || null,
            price_medium: editForm.price_medium || null,
            price_long: editForm.price_long || null,
            price_base: editForm.price_base || null,
            duration_minutes: editForm.duration_minutes || 30,
            duration: editForm.duration || 30,
            preparation_time: editForm.preparation_time || 0,
            is_visible: editForm.is_visible !== undefined ? editForm.is_visible : true,
            image_url: editForm.image_url || null,
            service_type: editForm.service_type || 'coiffure',
            active: true,
            display_order: 0
          }]);

        if (!error) {
          loadServices();
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service?')) {
      const { error } = await supabase
        .from('services')
        .update({ active: false })
        .eq('id', id);

      if (!error) {
        loadServices();
      }
    }
  };

  const groupedServices = services.reduce((acc, service: any) => {
    const categoryName = service.service_categories?.name || 'Sans catégorie';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">Gestion des Tarifs</h2>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Ajouter un tarif
        </button>
      </div>

      {(isAdding || isEditing) && (
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {isEditing ? 'Modifier le tarif' : 'Ajouter un nouveau tarif'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                <select
                  value={editForm.category_id || ''}
                  onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                <input
                  type="text"
                  required
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex: Coupe + Brushing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix Court (CHF)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.price_short || ''}
                  onChange={(e) => setEditForm({ ...editForm, price_short: parseFloat(e.target.value) || undefined })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix Mi-long (CHF)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.price_medium || ''}
                  onChange={(e) => setEditForm({ ...editForm, price_medium: parseFloat(e.target.value) || undefined })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix Long (CHF)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.price_long || ''}
                  onChange={(e) => setEditForm({ ...editForm, price_long: parseFloat(e.target.value) || undefined })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durée (minutes)</label>
                <input
                  type="number"
                  value={editForm.duration_minutes || 30}
                  onChange={(e) => setEditForm({ ...editForm, duration_minutes: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Temps de préparation (minutes)</label>
                <input
                  type="number"
                  value={editForm.preparation_time || 0}
                  onChange={(e) => setEditForm({ ...editForm, preparation_time: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visibilité</label>
                <div className="flex items-center gap-3 h-12">
                  <input
                    type="checkbox"
                    checked={editForm.is_visible !== false}
                    onChange={(e) => setEditForm({ ...editForm, is_visible: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Visible sur le site</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optionnelle)</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Détails supplémentaires sur le service..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image du service</label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {editForm.image_url ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={editForm.image_url}
                        alt="Preview"
                        className="max-h-48 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, image_url: '' })}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Supprimer l'image
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <Upload className="w-12 h-12" />
                      <div className="text-center">
                        <p className="font-medium">Glissez une image ici</p>
                        <p className="text-sm">ou cliquez pour sélectionner</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Enregistrement...' : (isEditing ? 'Enregistrer' : 'Créer')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-8">
        {Object.entries(groupedServices).map(([category, categoryServices]) => (
          <div key={category} className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{category}</h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Service</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Court</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Mi-long</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Long</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Durée</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryServices.map((service) => (
                    <tr key={service.id} className="border-b border-gray-100 hover:bg-white/50">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-gray-900">{service.name}</p>
                          {service.description && (
                            <p className="text-sm text-gray-600">{service.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {service.price_short ? (
                          <span className="font-semibold text-gray-900">CHF {service.price_short}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {service.price_medium ? (
                          <span className="font-semibold text-gray-900">CHF {service.price_medium}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {service.price_long ? (
                          <span className="font-semibold text-gray-900">CHF {service.price_long}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-gray-600">{service.duration_minutes} min</td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(service)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
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
        ))}
      </div>

      {Object.keys(groupedServices).length === 0 && !isAdding && (
        <div className="text-center py-12 text-gray-500">
          <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Aucun service trouvé</p>
          <p className="text-sm">Cliquez sur "Ajouter un tarif" pour commencer</p>
        </div>
      )}
    </div>
  );
}
