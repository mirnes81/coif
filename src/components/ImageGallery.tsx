import React, { useState } from 'react';
import { X, Check, Upload, Image as ImageIcon } from 'lucide-react';

interface ImageGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  selectedImage?: string;
}

export default function ImageGallery({ isOpen, onClose, onSelectImage, selectedImage }: ImageGalleryProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Galerie d'images Keune prédéfinies
  const defaultImages = [
    'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/3997386/pexels-photo-3997386.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/3997378/pexels-photo-3997378.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/4041393/pexels-photo-4041393.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/3997380/pexels-photo-3997380.jpeg?auto=compress&cs=tinysrgb&w=400'
  ];

  const allImages = [...defaultImages, ...uploadedImages];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setUploadedImages(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-rose-600" />
            Galerie d'Images
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Upload Section */}
          <div className="mb-6">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {allImages.map((image, index) => (
              <div
                key={index}
                className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  selectedImage === image
                    ? 'border-rose-500 ring-2 ring-rose-500/25'
                    : 'border-gray-200 hover:border-rose-300'
                }`}
                onClick={() => onSelectImage(image)}
              >
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {selectedImage === image && (
                  <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                    <div className="bg-rose-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {allImages.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune image disponible</h3>
              <p className="text-gray-600">Téléchargez des images pour commencer</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onClose}
            disabled={!selectedImage}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sélectionner
          </button>
        </div>
      </div>
    </div>
  );
}