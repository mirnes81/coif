import React, { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

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

const WHATSAPP_NUMBER = '41763761514';

export default function BookingSystem({ isOpen, onClose, services }: BookingSystemProps) {
  useEffect(() => {
    if (isOpen) {
      const message = encodeURIComponent('Bonjour Sabina, je souhaiterais prendre rendez-vous.');
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
      onClose();
    }
  }, [isOpen, onClose]);

  return null;
}