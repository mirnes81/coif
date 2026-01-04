import React, { useState, useEffect } from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ClientTag {
  id: string;
  name: string;
  color: string;
}

interface TagManagerProps {
  clientId: string;
  clientTags: ClientTag[];
  onTagsUpdate: () => void;
}

export default function TagManager({ clientId, clientTags, onTagsUpdate }: TagManagerProps) {
  const [allTags, setAllTags] = useState<ClientTag[]>([]);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  const PRESET_COLORS = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ];

  useEffect(() => {
    loadAllTags();
  }, []);

  const loadAllTags = async () => {
    const { data, error } = await supabase
      .from('client_tags')
      .select('*')
      .order('name');

    if (!error && data) {
      setAllTags(data);
    }
  };

  const createTag = async () => {
    if (!newTagName.trim()) return;

    const { data, error } = await supabase
      .from('client_tags')
      .insert([{ name: newTagName.trim(), color: selectedColor }])
      .select()
      .single();

    if (!error && data) {
      await assignTag(data.id);
      setNewTagName('');
      setSelectedColor('#3B82F6');
      setShowAddTag(false);
      loadAllTags();
    }
  };

  const assignTag = async (tagId: string) => {
    const { error } = await supabase
      .from('client_tag_assignments')
      .insert([{ client_id: clientId, tag_id: tagId }]);

    if (!error) {
      onTagsUpdate();
    }
  };

  const removeTag = async (tagId: string) => {
    const { error } = await supabase
      .from('client_tag_assignments')
      .delete()
      .eq('client_id', clientId)
      .eq('tag_id', tagId);

    if (!error) {
      onTagsUpdate();
    }
  };

  const clientTagIds = new Set(clientTags.map(t => t.id));
  const availableTags = allTags.filter(t => !clientTagIds.has(t.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Tags Famille
        </h4>
      </div>

      <div className="flex flex-wrap gap-2">
        {clientTags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
            style={{ backgroundColor: tag.color + '20', color: tag.color }}
          >
            <span>{tag.name}</span>
            <button
              onClick={() => removeTag(tag.id)}
              className="hover:bg-white/50 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {availableTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">Ajouter un tag existant:</p>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => assignTag(tag.id)}
                className="px-3 py-1 rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ backgroundColor: tag.color + '20', color: tag.color }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {showAddTag ? (
        <div className="border border-gray-300 rounded-lg p-3 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nom du tag (ex: Famille Dupont)
            </label>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Famille..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Couleur</label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={createTag}
              disabled={!newTagName.trim()}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 text-sm font-medium"
            >
              Créer
            </button>
            <button
              onClick={() => {
                setShowAddTag(false);
                setNewTagName('');
              }}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddTag(true)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Créer un nouveau tag
        </button>
      )}
    </div>
  );
}
