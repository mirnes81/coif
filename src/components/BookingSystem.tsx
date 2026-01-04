import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, CreditCard, Smartphone, MapPin, Check, X } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  category: string;
  priceShort?: number;
  priceMedium?: number;
  priceLong?: number;
  duration: string;
  description?: string;
}

interface BookingSystemProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
}

export default function BookingSystem({ isOpen, onClose, services }: BookingSystemProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    service: '',
    hairLength: '',
    date: '',
    time: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    paymentMethod: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const steps = [
    { number: 1, title: 'Service', icon: <User className="w-5 h-5" /> },
    { number: 2, title: 'Date & Heure', icon: <Calendar className="w-5 h-5" /> },
    { number: 3, title: 'Informations', icon: <Phone className="w-5 h-5" /> },
    { number: 4, title: 'Paiement', icon: <CreditCard className="w-5 h-5" /> }
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  const hairLengths = ['Court', 'Mi-long', 'Long'];

  const getServicePrice = (service: Service, hairLength: string) => {
    switch (hairLength) {
      case 'Court': return service.priceShort;
      case 'Mi-long': return service.priceMedium;
      case 'Long': return service.priceLong;
      default: return service.priceShort;
    }
  };

  const selectedService = services.find(s => s.id === bookingData.service);
  const totalPrice = selectedService ? getServicePrice(selectedService, bookingData.hairLength) : 0;

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulation de l'envoi
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsConfirmed(true);
  };

  const resetBooking = () => {
    setCurrentStep(1);
    setBookingData({
      service: '',
      hairLength: '',
      date: '',
      time: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      paymentMethod: '',
      notes: ''
    });
    setIsConfirmed(false);
  };

  if (!isOpen) return null;

  if (isConfirmed) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Réservation Confirmée !</h2>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Détails de votre rendez-vous :</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Service :</span> {selectedService?.name}</p>
              <p><span className="font-medium">Date :</span> {new Date(bookingData.date).toLocaleDateString('fr-CH')}</p>
              <p><span className="font-medium">Heure :</span> {bookingData.time}</p>
              <p><span className="font-medium">Durée :</span> {selectedService?.duration}</p>
              <p><span className="font-medium">Prix :</span> CHF {totalPrice}</p>
              <p><span className="font-medium">Paiement :</span> {bookingData.paymentMethod}</p>
            </div>
          </div>

          <div className="bg-rose-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-rose-600" />
              <span className="font-semibold text-gray-900">Sabina Coiffure & Ongles</span>
            </div>
            <p className="text-gray-700">Rue du Four 7, 1148 Mont-la-Ville (VD)</p>
            <p className="text-gray-700">Tél: 076 376 15 14</p>
          </div>

          <p className="text-gray-600 mb-6">
            Un SMS de confirmation vous sera envoyé. En cas d'empêchement, merci de nous prévenir 24h à l'avance.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => {
                resetBooking();
                onClose();
              }}
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              Nouvelle réservation
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4">
      <div className="bg-white rounded-2xl md:rounded-3xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Réserver un rendez-vous</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step.number
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  <div className="scale-75 md:scale-100">
                    {step.icon}
                  </div>
                </div>
                <div className="ml-2 md:ml-3 hidden sm:block">
                  <p className={`text-xs md:text-sm font-medium ${
                    currentStep >= step.number ? 'text-rose-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-6 md:w-12 h-0.5 mx-2 md:mx-4 ${
                    currentStep > step.number ? 'bg-rose-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-4 md:p-6">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Choisissez votre service</h3>
              
              <div className="grid gap-3 md:gap-4 mb-4 md:mb-6">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-3 md:p-4 border-2 rounded-xl md:rounded-2xl cursor-pointer transition-all duration-300 ${
                      bookingData.service === service.id
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-rose-300'
                    }`}
                    onClick={() => setBookingData({ ...bookingData, service: service.id })}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm md:text-base">{service.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{service.category}</p>
                        <p className="text-sm text-gray-500">{service.duration}</p>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-2">{service.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {service.priceShort && (
                          <p className="text-base md:text-lg font-bold text-rose-600">
                            CHF {service.priceShort}
                            {service.priceLong && service.priceShort !== service.priceLong && 
                              ` - ${service.priceLong}`
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {bookingData.service && selectedService && (selectedService.priceMedium || selectedService.priceLong) && (
                <div className="mb-4 md:mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm md:text-base">Longueur de cheveux</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {hairLengths.map((length) => {
                      const price = getServicePrice(selectedService, length);
                      if (!price) return null;
                      
                      return (
                        <button
                          key={length}
                          onClick={() => setBookingData({ ...bookingData, hairLength: length })}
                          className={`p-2 md:p-3 border-2 rounded-lg md:rounded-xl transition-all duration-300 ${
                            bookingData.hairLength === length
                              ? 'border-rose-500 bg-rose-50 text-rose-700'
                              : 'border-gray-200 hover:border-rose-300'
                          }`}
                        >
                          <div className="text-center">
                            <p className="font-medium text-sm md:text-base">{length}</p>
                            <p className="text-sm text-gray-600">CHF {price}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Date & Time */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Choisissez la date et l'heure</h3>
              
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
                  <div className="grid grid-cols-4 md:grid-cols-3 gap-1 md:gap-2 max-h-48 overflow-y-auto">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setBookingData({ ...bookingData, time })}
                        className={`p-1 md:p-2 text-xs md:text-sm border rounded-md md:rounded-lg transition-all duration-300 ${
                          bookingData.time === time
                            ? 'border-rose-500 bg-rose-50 text-rose-700'
                            : 'border-gray-200 hover:border-rose-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Personal Information */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Vos informations</h3>
              
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                  <input
                    type="text"
                    value={bookingData.firstName}
                    onChange={(e) => setBookingData({ ...bookingData, firstName: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm md:text-base"
                    placeholder="Votre prénom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                  <input
                    type="text"
                    value={bookingData.lastName}
                    onChange={(e) => setBookingData({ ...bookingData, lastName: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm md:text-base"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm md:text-base"
                    placeholder="votre@email.ch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm md:text-base"
                    placeholder="076 376 15 14"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optionnel)</label>
                  <textarea
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none text-sm md:text-base"
                    placeholder="Informations supplémentaires, allergies, préférences..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 4 && (
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Mode de paiement</h3>
              
              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 text-sm md:text-base">Récapitulatif</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Service :</span>
                    <span className="font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date :</span>
                    <span className="font-medium">{new Date(bookingData.date).toLocaleDateString('fr-CH')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heure :</span>
                    <span className="font-medium">{bookingData.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Durée :</span>
                    <span className="font-medium">{selectedService?.duration}</span>
                  </div>
                  {bookingData.hairLength && (
                    <div className="flex justify-between">
                      <span>Longueur :</span>
                      <span className="font-medium">{bookingData.hairLength}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between text-base md:text-lg font-bold">
                      <span>Total :</span>
                      <span className="text-rose-600">CHF {totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-sm md:text-base">Choisissez votre mode de paiement</h4>
                
                <div className="grid gap-3">
                  <button
                    onClick={() => setBookingData({ ...bookingData, paymentMethod: 'Sur place (Cash)' })}
                    className={`p-3 md:p-4 border-2 rounded-xl md:rounded-2xl transition-all duration-300 flex items-center gap-3 ${
                      bookingData.paymentMethod === 'Sur place (Cash)'
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-rose-300'
                    }`}
                  >
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm md:text-base">Paiement sur place (Cash)</p>
                      <p className="text-sm text-gray-600">Payez directement au salon en espèces</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setBookingData({ ...bookingData, paymentMethod: 'TWINT' })}
                    className={`p-3 md:p-4 border-2 rounded-xl md:rounded-2xl transition-all duration-300 flex items-center gap-3 ${
                      bookingData.paymentMethod === 'TWINT'
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-rose-300'
                    }`}
                  >
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Smartphone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm md:text-base">TWINT</p>
                      <p className="text-sm text-gray-600">Paiement mobile sécurisé</p>
                    </div>
                  </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl md:rounded-2xl p-3 md:p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Politique d'annulation :</strong> Annulation gratuite jusqu'à 24h avant le rendez-vous. 
                    En cas de no-show, 30% du montant du service sera facturé.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-gray-100 flex justify-between gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            Précédent
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !bookingData.service) ||
                (currentStep === 2 && (!bookingData.date || !bookingData.time)) ||
                (currentStep === 3 && (!bookingData.firstName || !bookingData.lastName || !bookingData.email || !bookingData.phone))
              }
              className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!bookingData.paymentMethod || isSubmitting}
              className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm md:text-base"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Confirmation...
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Confirmer la réservation</span>
                  <span className="sm:hidden">Confirmer</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}