import React, { useState } from 'react';
import { Gift, CreditCard, Heart, Download, Mail, X, Check } from 'lucide-react';

interface GiftCard {
  id: string;
  type: 'service' | 'amount' | 'custom';
  title: string;
  description: string;
  value: number;
  image: string;
  validityMonths: number;
}

interface GiftCardSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GiftCardSystem({ isOpen, onClose }: GiftCardSystemProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [customAmount, setCustomAmount] = useState(50);
  const [giftData, setGiftData] = useState({
    recipientName: '',
    recipientEmail: '',
    senderName: '',
    senderEmail: '',
    personalMessage: '',
    deliveryDate: '',
    deliveryMethod: 'email'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Cartes cadeaux prédéfinies
  const giftCards: GiftCard[] = [
    {
      id: '1',
      type: 'service',
      title: 'Coupe + Brushing',
      description: 'Une coupe tendance avec brushing professionnel',
      value: 79,
      image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400',
      validityMonths: 12
    },
    {
      id: '2',
      type: 'service',
      title: 'Balayage Complet',
      description: 'Balayage professionnel avec toner et brushing',
      value: 190,
      image: 'https://images.pexels.com/photos/3997386/pexels-photo-3997386.jpeg?auto=compress&cs=tinysrgb&w=400',
      validityMonths: 12
    },
    {
      id: '3',
      type: 'service',
      title: 'Ongles Fumés',
      description: 'Notre spécialité exclusive avec semi-permanent',
      value: 70,
      image: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=400',
      validityMonths: 6
    },
    {
      id: '4',
      type: 'amount',
      title: 'Bon Cadeau 50 CHF',
      description: 'Montant libre à utiliser pour tous nos services',
      value: 50,
      image: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=400',
      validityMonths: 12
    },
    {
      id: '5',
      type: 'amount',
      title: 'Bon Cadeau 100 CHF',
      description: 'Montant libre à utiliser pour tous nos services',
      value: 100,
      image: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=400',
      validityMonths: 12
    },
    {
      id: '6',
      type: 'custom',
      title: 'Montant Personnalisé',
      description: 'Choisissez le montant qui vous convient',
      value: 0,
      image: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=400',
      validityMonths: 12
    }
  ];

  const handleCardSelect = (card: GiftCard) => {
    setSelectedCard(card);
    if (card.type === 'custom') {
      setSelectedCard({ ...card, value: customAmount });
    }
    setCurrentStep(2);
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePurchase = async () => {
    setIsProcessing(true);

    try {
      const giftCardNumber = generateGiftCardNumber();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-gift-card-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          recipientName: giftData.recipientName,
          recipientEmail: giftData.recipientEmail,
          senderName: giftData.senderName,
          senderEmail: giftData.senderEmail,
          personalMessage: giftData.personalMessage,
          deliveryDate: giftData.deliveryDate,
          deliveryMethod: giftData.deliveryMethod,
          cardTitle: selectedCard?.title,
          cardValue: selectedCard?.value,
          validityMonths: selectedCard?.validityMonths,
          giftCardNumber: giftCardNumber
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la carte cadeau');
      }

      setIsProcessing(false);
      setIsConfirmed(true);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la carte cadeau. Veuillez réessayer ou nous contacter au 076 376 15 14.');
      setIsProcessing(false);
    }
  };

  const generateGiftCardEmail = () => {
    const giftCardNumber = generateGiftCardNumber();
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ec4899, #f97316); padding: 30px; text-align: center; color: white;">
          <h1>🎁 Vous avez reçu une carte cadeau !</h1>
          <p style="font-size: 18px;">De la part de ${giftData.senderName}</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #ec4899;">${selectedCard?.title}</h2>
            <p style="font-size: 24px; font-weight: bold; color: #333;">CHF ${selectedCard?.value}</p>
            <p style="background: #f3f4f6; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 18px; text-align: center;">
              <strong>Code: ${giftCardNumber}</strong>
            </p>
          </div>
          
          ${giftData.personalMessage ? `
            <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h3>Message personnel :</h3>
              <p style="font-style: italic; color: #666;">"${giftData.personalMessage}"</p>
            </div>
          ` : ''}
          
          <div style="background: white; padding: 20px; border-radius: 10px;">
            <h3>Comment utiliser votre carte cadeau :</h3>
            <ol>
              <li>Appelez le <strong>076 376 15 14</strong> pour prendre rendez-vous</li>
              <li>Mentionnez votre code carte cadeau : <strong>${giftCardNumber}</strong></li>
              <li>Profitez de votre moment beauté chez Sabina !</li>
            </ol>
            
            <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 5px;">
              <p><strong>📍 Sabina Coiffure & Ongles</strong><br>
              Rue du Four 7, 1148 Mont-la-Ville (VD)<br>
              📞 076 376 15 14<br>
              ⏰ Mar-Ven: 9h-18h | Sam: 8h-16h</p>
            </div>
            
            <p style="font-size: 12px; color: #666; margin-top: 20px;">
              Carte valable ${selectedCard?.validityMonths} mois à partir de la date d'achat.
            </p>
          </div>
        </div>
      </div>
    `;
  };

  const generateConfirmationEmail = () => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; padding: 20px; text-align: center; color: white;">
          <h1>✅ Carte cadeau envoyée avec succès !</h1>
        </div>
        
        <div style="padding: 30px;">
          <p>Bonjour ${giftData.senderName},</p>
          
          <p>Votre carte cadeau a été envoyée avec succès à <strong>${giftData.recipientName}</strong> (${giftData.recipientEmail}).</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>Détails de la carte cadeau :</h3>
            <ul>
              <li><strong>Service :</strong> ${selectedCard?.title}</li>
              <li><strong>Valeur :</strong> CHF ${selectedCard?.value}</li>
              <li><strong>Destinataire :</strong> ${giftData.recipientName}</li>
              <li><strong>Mode de livraison :</strong> ${giftData.deliveryMethod === 'email' ? 'Email' : 'Courrier'}</li>
            </ul>
          </div>
          
          <p>Merci pour votre confiance !</p>
          
          <p style="margin-top: 30px;">
            <strong>Sabina Coiffure & Ongles</strong><br>
            076 376 15 14
          </p>
        </div>
      </div>
    `;
  };

  const generateGiftCardNumber = () => {
    return 'SC' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedCard(null);
    setGiftData({
      recipientName: '',
      recipientEmail: '',
      senderName: '',
      senderEmail: '',
      personalMessage: '',
      deliveryDate: '',
      deliveryMethod: 'email'
    });
    setIsConfirmed(false);
  };

  if (!isOpen) return null;

  if (isConfirmed) {
    const giftCardNumber = generateGiftCardNumber();
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Carte Cadeau Créée !</h2>
          
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Gift className="w-8 h-8" />
              <span className="text-sm opacity-90">Sabina Coiffure & Ongles</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{selectedCard?.title}</h3>
            <p className="text-2xl font-bold mb-4">CHF {selectedCard?.value}</p>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-sm mb-1">Numéro de carte :</p>
              <p className="text-lg font-mono font-bold">{giftCardNumber}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left">
            <h4 className="font-semibold text-gray-900 mb-4">Détails de la carte :</h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Destinataire :</span> {giftData.recipientName}</p>
              <p><span className="font-medium">Valeur :</span> CHF {selectedCard?.value}</p>
              <p><span className="font-medium">Validité :</span> {selectedCard?.validityMonths} mois</p>
              <p><span className="font-medium">Livraison :</span> {giftData.deliveryMethod === 'email' ? 'Par email' : 'Par courrier'}</p>
              {giftData.personalMessage && (
                <p><span className="font-medium">Message :</span> "{giftData.personalMessage}"</p>
              )}
            </div>
          </div>

          <div className="bg-rose-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-700">
              La carte cadeau a été envoyée {giftData.deliveryMethod === 'email' ? 'par email' : 'par courrier'} 
              {giftData.deliveryDate && ` le ${new Date(giftData.deliveryDate).toLocaleDateString('fr-CH')}`}.
              {giftData.deliveryMethod === 'email' && ' Vérifiez votre boîte de réception et vos spams.'} 
              La carte est valable {selectedCard?.validityMonths} mois à partir de la date d'achat.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              Nouvelle carte cadeau
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
          <div className="flex items-center gap-3">
            <Gift className="w-6 h-6 text-rose-600" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Cartes Cadeaux</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex items-center justify-center space-x-8">
            {[
              { number: 1, title: 'Choisir', icon: <Gift className="w-5 h-5" /> },
              { number: 2, title: 'Personnaliser', icon: <Heart className="w-5 h-5" /> },
              { number: 3, title: 'Payer', icon: <CreditCard className="w-5 h-5" /> }
            ].map((step, index) => (
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
                {index < 2 && (
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
          {/* Step 1: Sélection de la carte */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Choisissez votre carte cadeau</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {giftCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-gradient-to-br from-white to-rose-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-rose-100 hover:border-rose-300 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => handleCardSelect(card)}
                  >
                    <img 
                      src={card.image} 
                      alt={card.title}
                      className="w-full h-24 md:h-32 object-cover rounded-lg md:rounded-xl mb-3 md:mb-4 group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-5 h-5 text-rose-500" />
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">{card.title}</h4>
                    </div>
                    
                    <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4">{card.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-lg md:text-2xl font-bold text-rose-600">
                        {card.type === 'custom' ? 'Personnalisé' : `CHF ${card.value}`}
                      </span>
                      <span className="text-xs text-gray-500">
                        Valable {card.validityMonths} mois
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Montant personnalisé */}
              <div className="mt-6 md:mt-8 bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6">
                <h4 className="font-semibold text-gray-900 mb-4 text-sm md:text-base">Ou choisissez un montant personnalisé :</h4>
                <div className="flex items-center gap-4">
                  <label className="text-gray-700">Montant :</label>
                  <input
                    type="number"
                    min="20"
                    max="500"
                    step="5"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(parseInt(e.target.value) || 50)}
                    className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent w-20 md:w-24 text-sm md:text-base"
                  />
                  <span className="text-gray-700">CHF</span>
                  <button
                    onClick={() => handleCardSelect({
                      id: 'custom',
                      type: 'custom',
                      title: `Bon Cadeau ${customAmount} CHF`,
                      description: 'Montant personnalisé à utiliser pour tous nos services',
                      value: customAmount,
                      image: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=400',
                      validityMonths: 12
                    })}
                    className="bg-rose-500 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors text-sm md:text-base"
                  >
                    Sélectionner
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personnalisation */}
          {currentStep === 2 && selectedCard && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Personnalisez votre carte cadeau</h3>
              
              {/* Aperçu de la carte */}
              <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-6 mb-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Gift className="w-8 h-8" />
                  <span className="text-sm opacity-90">Sabina Coiffure & Ongles</span>
                </div>
                <h4 className="text-xl font-bold mb-2">{selectedCard.title}</h4>
                <p className="text-2xl font-bold mb-4">CHF {selectedCard.value}</p>
                {giftData.personalMessage && (
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm italic">"{giftData.personalMessage}"</p>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du destinataire *
                  </label>
                  <input
                    type="text"
                    value={giftData.recipientName}
                    onChange={(e) => setGiftData({ ...giftData, recipientName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Prénom Nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email du destinataire *
                  </label>
                  <input
                    type="email"
                    value={giftData.recipientEmail}
                    onChange={(e) => setGiftData({ ...giftData, recipientEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="destinataire@email.ch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre nom *
                  </label>
                  <input
                    type="text"
                    value={giftData.senderName}
                    onChange={(e) => setGiftData({ ...giftData, senderName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Votre prénom et nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre email *
                  </label>
                  <input
                    type="email"
                    value={giftData.senderEmail}
                    onChange={(e) => setGiftData({ ...giftData, senderEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="votre@email.ch"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message personnel (optionnel)
                  </label>
                  <textarea
                    value={giftData.personalMessage}
                    onChange={(e) => setGiftData({ ...giftData, personalMessage: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    placeholder="Joyeux anniversaire ! J'espère que tu vas adorer..."
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{giftData.personalMessage.length}/200 caractères</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de livraison (optionnel)
                  </label>
                  <input
                    type="date"
                    value={giftData.deliveryDate}
                    onChange={(e) => setGiftData({ ...giftData, deliveryDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode de livraison
                  </label>
                  <select
                    value={giftData.deliveryMethod}
                    onChange={(e) => setGiftData({ ...giftData, deliveryMethod: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    <option value="email">Par email (gratuit)</option>
                    <option value="mail">Par courrier (+5 CHF)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Paiement */}
          {currentStep === 3 && selectedCard && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Finaliser l'achat</h3>
              
              {/* Récapitulatif */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Récapitulatif</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Carte cadeau :</span>
                    <span className="font-medium">{selectedCard.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Destinataire :</span>
                    <span className="font-medium">{giftData.recipientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Livraison :</span>
                    <span className="font-medium">
                      {giftData.deliveryMethod === 'email' ? 'Email (gratuit)' : 'Courrier (+5 CHF)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valeur carte :</span>
                    <span className="font-medium">CHF {selectedCard.value}</span>
                  </div>
                  {giftData.deliveryMethod === 'mail' && (
                    <div className="flex justify-between">
                      <span>Frais de port :</span>
                      <span className="font-medium">CHF 5.00</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total :</span>
                      <span className="text-rose-600">
                        CHF {selectedCard.value + (giftData.deliveryMethod === 'mail' ? 5 : 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modes de paiement */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Mode de paiement</h4>
                
                <div className="grid gap-3">
                  <div className="p-4 border-2 border-rose-200 bg-rose-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-rose-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Paiement en ligne sécurisé</p>
                        <p className="text-sm text-gray-600">Carte bancaire, TWINT, PostFinance</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Conditions :</strong> Les cartes cadeaux sont valables {selectedCard.validityMonths} mois 
                    à partir de la date d'achat. Un email sera envoyé au destinataire avec le code unique. 
                    Elles ne sont ni remboursables ni échangeables contre des espèces.
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

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !selectedCard) ||
                (currentStep === 2 && (!giftData.recipientName || !giftData.recipientEmail || !giftData.senderName || !giftData.senderEmail))
              }
              className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm md:text-base"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span className="hidden sm:inline">Acheter la carte cadeau</span>
                  <span className="sm:hidden">Acheter</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}