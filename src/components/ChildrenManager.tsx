import React, { useState, useEffect } from 'react';
import { Users, Plus, Baby, X, Calendar, User, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Child {
  id: string;
  client_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  age: number;
  is_independent: boolean;
  became_independent_at: string | null;
  created_at: string;
}

interface ChildrenManagerProps {
  parentId: string;
  parentName: string;
  onChildAdded?: () => void;
}

export default function ChildrenManager({ parentId, parentName, onChildAdded }: ChildrenManagerProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newChild, setNewChild] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: ''
  });

  useEffect(() => {
    loadChildren();
  }, [parentId]);

  const loadChildren = async () => {
    const { data, error } = await supabase
      .from('client_children')
      .select('*')
      .eq('parent_id', parentId)
      .order('date_of_birth', { ascending: false });

    if (!error && data) {
      setChildren(data);
    }
  };

  const addChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          ...newChild,
          parent_id: parentId,
          is_independent: false
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'ajout de l\'enfant:', error);
        setError(`Erreur: ${error.message}`);
        setLoading(false);
        return;
      }

      if (data) {
        await loadChildren();
        setNewChild({ first_name: '', last_name: '', date_of_birth: '' });
        setShowAddChild(false);
        if (onChildAdded) onChildAdded();
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError('Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  const removeChild = async (childId: string) => {
    if (!confirm('Voulez-vous vraiment détacher cet enfant ? Il deviendra un client indépendant.')) return;

    const { error } = await supabase
      .from('clients')
      .update({ parent_id: null, is_independent: true })
      .eq('id', childId);

    if (!error) {
      await loadChildren();
      if (onChildAdded) onChildAdded();
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Baby className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Enfants ({children.length})</h3>
        </div>
        <button
          onClick={() => setShowAddChild(!showAddChild)}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter enfant
        </button>
      </div>

      {showAddChild && (
        <form onSubmit={addChild} className="bg-white rounded-lg p-4 mb-4 border border-purple-300">
          <h4 className="font-medium text-gray-900 mb-3">Nouvel enfant pour {parentName}</h4>

          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                type="text"
                required
                value={newChild.first_name}
                onChange={(e) => setNewChild({ ...newChild, first_name: e.target.value })}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                required
                value={newChild.last_name}
                onChange={(e) => setNewChild({ ...newChild, last_name: e.target.value })}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label>
            <input
              type="date"
              required
              value={newChild.date_of_birth}
              onChange={(e) => setNewChild({ ...newChild, date_of_birth: e.target.value })}
              disabled={loading}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Les enfants de moins de 16 ans seront automatiquement rattachés au parent
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>Ajout en cours...</>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Ajouter
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddChild(false);
                setError(null);
              }}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {children.length > 0 ? (
        <div className="space-y-2">
          {children.map((child) => (
            <div key={child.id} className="bg-white rounded-lg p-3 border border-purple-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {child.first_name} {child.last_name}
                    </span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      {child.client_number}
                    </span>
                    {child.is_independent && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Indépendant
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {child.age} ans
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>
                      Né(e) le {new Date(child.date_of_birth).toLocaleDateString('fr-CH')}
                    </span>
                  </div>
                  {child.became_independent_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Devenu indépendant le {new Date(child.became_independent_at).toLocaleDateString('fr-CH')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeChild(child.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Détacher l'enfant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          Aucun enfant attaché à ce parent
        </p>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Info:</strong> Les enfants de moins de 16 ans sont attachés au parent.
          À 16 ans, ils deviennent automatiquement des clients indépendants.
        </p>
      </div>
    </div>
  );
}
