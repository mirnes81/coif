import React, { useState } from 'react';
import { Send, Phone, MapPin, Clock, Mail, MessageCircle } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    service: '',
    message: '',
    consent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const services = [
    'Coiffure Femme',
    'Coiffure Homme', 
    'Coiffure Enfant',
    'Coloration/Balayage',
    'Ongles/Manucure',
    'Ongles fumés',
    'Produits Keune',
    'Événement/Mariage',
    'Autre'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Message envoyé !</h3>
        <p className="text-gray-600 mb-4">
          Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              service: '',
              message: '',
              consent: false
            });
          }}
          className="text-rose-600 hover:text-rose-700 font-semibold"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Contactez-nous</h2>
        <p className="text-rose-100">Nous sommes là pour vous conseiller</p>
      </div>

      <div className="p-8">
        {/* Informations de contact */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Adresse</p>
                <p className="text-gray-600">Rue du Four 7, 1148 Mont-la-Ville (VD)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-rose-100 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Téléphone</p>
                <p className="text-gray-600">076 376 15 14</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-rose-100 p-2 rounded-lg">
                <Mail className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <p className="text-gray-600">bonjour@sabina-coiffure.ch</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">WhatsApp</p>
                <p className="text-gray-600">+41 XX XXX XX XX</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-rose-600" />
              <h3 className="font-semibold text-gray-900">Horaires d'ouverture</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Lundi</span>
                <span className="font-medium text-red-600">Fermé</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mardi - Vendredi</span>
                <span className="font-medium text-gray-900">9h00 - 18h00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Samedi</span>
                <span className="font-medium text-gray-900">8h00 - 16h00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dimanche</span>
                <span className="font-medium text-red-600">Fermé</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="Votre prénom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="votre@email.ch"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="+41 XX XXX XX XX"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service souhaité
            </label>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
            >
              <option value="">Sélectionnez un service</option>
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
              placeholder="Décrivez votre demande, vos préférences ou posez vos questions..."
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
              required
              className="mt-1 w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
            />
            <label className="text-sm text-gray-600">
              J'accepte que mes données personnelles soient utilisées pour traiter ma demande. 
              Vous pouvez consulter notre <a href="#" className="text-rose-600 hover:underline">politique de confidentialité</a>.
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !formData.consent}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Envoyer le message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}