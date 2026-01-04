import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Scissors, 
  Sparkles, 
  Heart,
  ChevronRight,
  Instagram,
  Facebook,
  MessageCircle,
  Award,
  Users,
  Palette,
  Gift,
  Search,
  Filter,
  Settings,
  Package,
  Mail,
  DollarSign,
  Camera
} from 'lucide-react';

import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import ContactForm from './components/ContactForm';
import PricingManager from './components/PricingManager';
import InstagramGallery from './components/InstagramGallery';
import GoogleReviews from './components/GoogleReviews';
import BookingSystem from './components/BookingSystem';
import GiftCardSystem from './components/GiftCardSystem';

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

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface PriceItem {
  id: string;
  category: string;
  service: string;
  priceShort?: number;
  priceMedium?: number;
  priceLong?: number;
  duration: string;
  description?: string;
}

function App() {
  const [activeService, setActiveService] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState('accueil');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isGiftCardOpen, setIsGiftCardOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [reservations, setReservations] = useState<{productId: string, quantity: number, date: string}[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Produits Keune inspirés du site officiel
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'KEUNE CARE Keratin Smooth Shampoo',
      category: 'Shampoings',
      price: 24.90,
      originalPrice: 29.90,
      image: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      reviews: 156,
      description: 'Shampooing lissant à la kératine pour cheveux indisciplinés. Nourrit intensément et facilite le coiffage.',
      benefits: [
        'Lisse et discipline les cheveux',
        'Réduit les frisottis jusqu\'à 72h',
        'Protège contre l\'humidité',
        'Formule sans sulfates'
      ],
      inStock: true,
      isBestseller: true,
      volume: '300ml',
      ingredients: ['Kératine', 'Huile d\'Argan', 'Protéines de soie'],
      usage: 'Appliquer sur cheveux mouillés, masser délicatement, rincer abondamment.'
    },
    {
      id: '2',
      name: 'KEUNE STYLE Brilliant Gloss Spray',
      category: 'Coiffage',
      price: 32.50,
      image: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.6,
      reviews: 89,
      description: 'Spray brillance instantanée pour une finition éclatante. Fixation légère et protection UV.',
      benefits: [
        'Brillance intense instantanée',
        'Protection UV',
        'Fixation légère',
        'Ne graisse pas les cheveux'
      ],
      inStock: true,
      isNew: true,
      volume: '200ml',
      usage: 'Vaporiser à 20cm des cheveux secs ou humides pour une brillance instantanée.'
    },
    {
      id: '3',
      name: 'KEUNE TINTA Color Infinity Shampoo',
      category: 'Coloration',
      price: 28.90,
      image: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      reviews: 203,
      description: 'Shampooing protecteur de couleur avec technologie Infinity. Prolonge l\'éclat et la tenue de la coloration.',
      benefits: [
        'Prolonge la tenue de la couleur',
        'Protège contre la décoloration',
        'Nourrit les cheveux colorés',
        'Technologie Infinity exclusive'
      ],
      inStock: true,
      isBestseller: true,
      volume: '300ml',
      usage: 'Utiliser après chaque coloration et 2-3 fois par semaine pour maintenir l\'éclat.'
    },
    {
      id: '4',
      name: 'KEUNE CARE Vital Nutrition Mask',
      category: 'Soins',
      price: 45.00,
      originalPrice: 52.00,
      image: 'https://images.pexels.com/photos/3997386/pexels-photo-3997386.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7,
      reviews: 124,
      description: 'Masque nutrition intense pour cheveux secs et abîmés. Restaure la fibre capillaire en profondeur.',
      benefits: [
        'Nutrition intense',
        'Répare les cheveux abîmés',
        'Texture soyeuse',
        'Résultats visibles dès la 1ère application'
      ],
      inStock: false,
      volume: '200ml',
      usage: 'Appliquer sur cheveux lavés, laisser poser 5-10 minutes, rincer soigneusement.'
    },
    {
      id: '5',
      name: 'KEUNE STYLE Forming Wax',
      category: 'Coiffage',
      price: 26.90,
      image: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.5,
      reviews: 67,
      description: 'Cire coiffante pour un look texturé et naturel. Tenue forte avec finition mate.',
      benefits: [
        'Tenue forte toute la journée',
        'Finition mate naturelle',
        'Facile à travailler',
        'Ne laisse pas de résidus'
      ],
      inStock: true,
      volume: '75ml',
      usage: 'Chauffer entre les paumes, appliquer sur cheveux secs ou légèrement humides.'
    },
    {
      id: '6',
      name: 'KEUNE CARE Color Brillianz Conditioner',
      category: 'Soins',
      price: 31.50,
      image: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      reviews: 145,
      description: 'Après-shampooing protecteur pour cheveux colorés. Maintient l\'intensité et la brillance de la couleur.',
      benefits: [
        'Protège la couleur',
        'Démêlage facilité',
        'Brillance éclatante',
        'Cheveux doux et soyeux'
      ],
      inStock: true,
      volume: '250ml',
      usage: 'Appliquer après le shampooing, laisser poser 2-3 minutes, rincer.'
    }
  ]);

  // Tarifs initiaux basés sur le cahier des charges
  const [prices, setPrices] = useState<PriceItem[]>([
    {
      id: '1',
      category: 'Coiffure Femme',
      service: 'Brushing',
      priceShort: 35,
      priceMedium: 45,
      priceLong: 55,
      duration: '30-50 min'
    },
    {
      id: '2',
      category: 'Coiffure Femme',
      service: 'Coupe + Brushing',
      priceShort: 69,
      priceMedium: 79,
      priceLong: 89,
      duration: '45-70 min'
    },
    {
      id: '3',
      category: 'Coloration',
      service: 'Balayage complet',
      priceShort: 160,
      priceMedium: 190,
      priceLong: 220,
      duration: '120-180 min'
    },
    {
      id: '4',
      category: 'Ongles',
      service: 'Semi-permanent',
      priceShort: 55,
      priceMedium: 65,
      duration: '45-60 min'
    },
    {
      id: '5',
      category: 'Ongles',
      service: 'Ongles fumés (supplément)',
      priceShort: 15,
      duration: '+20 min',
      description: 'Notre spécialité exclusive'
    },
    {
      id: '6',
      category: 'Coiffure Homme',
      service: 'Coupe homme',
      priceShort: 35,
      duration: '30 min'
    }
  ]);

  const categories = ['Tous', 'Shampoings', 'Soins', 'Coiffage', 'Coloration', 'Accessoires', 'Ongles'];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const services = [
    {
      icon: <Scissors className="w-8 h-8" />,
      title: "Coiffure",
      description: "Coupe, brushing, coloration, balayage pour femmes, hommes et enfants",
      price: "À partir de 35 CHF",
      image: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Ongles",
      description: "Manucure, gel, semi-permanent, nail art et nos fameux 'ongles fumés'",
      price: "À partir de 35 CHF",
      image: "https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Produits",
      description: "Shampoings, soins, accessoires et produits professionnels Keune",
      price: "Boutique en ligne",
      image: "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800"
    }
  ];

  const testimonials = [
    {
      name: "Marie L.",
      rating: 5,
      text: "Sabina est une vraie artiste ! Mon balayage est parfait et mes ongles fumés font sensation.",
      service: "Balayage + Ongles fumés"
    },
    {
      name: "Claire M.",
      rating: 5,
      text: "Salon chaleureux, service impeccable. Je recommande vivement !",
      service: "Coupe + Brushing"
    },
    {
      name: "Sophie D.",
      rating: 5,
      text: "Enfin un salon où je me sens comprise. Résultat toujours au top !",
      service: "Coloration complète"
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
        category: product.category
      }]);
    }
    
    setIsProductModalOpen(false);
  };

  const handleReserve = (product: Product, quantity: number = 1) => {
    const reservation = {
      productId: product.id,
      quantity,
      date: new Date().toISOString()
    };
    setReservations([...reservations, reservation]);
    setIsProductModalOpen(false);
    alert(`Produit "${product.name}" réservé avec succès ! Vous pouvez le récupérer au salon.`);
  };

  const handleUpdateCartQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleToggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const product: Product = {
      ...newProduct,
      id: Date.now().toString()
    };
    setProducts([...products, product]);
  };

  const handleUpdatePrice = (updatedPrice: PriceItem) => {
    setPrices(prices.map(p => p.id === updatedPrice.id ? updatedPrice : p));
  };

  const handleDeletePrice = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) {
      setPrices(prices.filter(p => p.id !== id));
    }
  };

  const handleAddPrice = (newPrice: Omit<PriceItem, 'id'>) => {
    const price: PriceItem = {
      ...newPrice,
      id: Date.now().toString()
    };
    setPrices([...prices, price]);
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const renderSection = () => {
    switch (currentSection) {
      case 'boutique':
        return (
          <section className="py-20 bg-gradient-to-br from-rose-50 to-pink-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Boutique <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">Keune</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Découvrez notre sélection de produits professionnels Keune pour sublimer vos cheveux
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-12 pr-8 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-rose-500 focus:border-transparent appearance-none bg-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <div key={product.id} onClick={() => handleProductClick(product)}>
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      onReserve={handleReserve}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={favorites.includes(product.id)}
                    />
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
                  <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
                </div>
              )}
            </div>
          </section>
        );

      case 'contact':
        return (
          <section className="py-20 bg-gradient-to-br from-gray-50 to-white min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">Contact</span>
                </h2>
                <p className="text-xl text-gray-600">
                  Nous sommes là pour répondre à toutes vos questions
                </p>
              </div>
              <ContactForm />
            </div>
          </section>
        );

      case 'tarifs':
        return (
          <section className="py-20 bg-gradient-to-br from-gray-50 to-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <PricingManager
                prices={prices}
                onUpdatePrice={handleUpdatePrice}
                onDeletePrice={handleDeletePrice}
                onAddPrice={handleAddPrice}
              />
            </div>
          </section>
        );

      case 'galerie':
        return (
          <section className="py-20 bg-gradient-to-br from-gray-50 to-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <InstagramGallery />
            </div>
          </section>
        );

      case 'avis':
        return (
          <section className="py-20 bg-gradient-to-br from-gray-50 to-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <GoogleReviews />
            </div>
          </section>
        );

      case 'admin':
        return (
          <section className="py-20 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <AdminPanel
                products={products}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddProduct={handleAddProduct}
              />
            </div>
          </section>
        );

      default:
        return (
          <>
            {/* Hero Section */}
            <section id="accueil" className="relative py-20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-100/50 to-pink-100/50"></div>
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                    <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                      Votre beauté,
                      <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent block">
                        notre passion
                      </span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                      Salon de coiffure et stylisme d'ongles à Mont-la-Ville. 
                      Spécialistes des techniques modernes et des fameux "ongles fumés".
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                      <button 
                        onClick={() => setIsBookingOpen(true)}
                        className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg hover:shadow-xl hover:shadow-rose-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-5 h-5" />
                        Prendre rendez-vous
                      </button>
                      <button 
                        onClick={() => setCurrentSection('boutique')}
                        className="border-2 border-rose-300 text-rose-600 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg hover:bg-rose-50 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        Boutique Keune
                      </button>
                      <button 
                        onClick={() => setIsGiftCardOpen(true)}
                        className="border-2 border-pink-300 text-pink-600 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg hover:bg-pink-50 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Gift className="w-5 h-5" />
                        Cartes Cadeaux
                      </button>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span>Rue du Four 7, Mont-la-Ville</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-rose-500" />
                        <span>076 376 15 14</span>
                      </div>
                    </div>
                  </div>

                  <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                    <div className="relative">
                      <img 
                        src="https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800" 
                        alt="Salon Sabina" 
                        className="rounded-3xl shadow-2xl w-full h-96 object-cover"
                      />
                      <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-3">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-5 h-5 fill-current" />
                            ))}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">4.9/5</p>
                            <p className="text-sm text-gray-600">120+ avis</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Nos <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">Services</span>
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    De la coupe tendance aux ongles fumés, découvrez notre gamme complète de services beauté
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                  {services.map((service, index) => (
                    <div
                      key={index}
                      className={`group bg-gradient-to-br from-white to-rose-50 rounded-3xl p-8 border border-rose-100 hover:border-rose-200 hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:scale-105 ${
                        activeService === index ? 'ring-2 ring-rose-500/50 shadow-xl' : ''
                      }`}
                      onMouseEnter={() => setActiveService(index)}
                    >
                      <div className="bg-gradient-to-r from-rose-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        {service.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                      <p className="text-rose-600 font-semibold text-lg mb-6">{service.price}</p>
                      <img 
                        src={service.image} 
                        alt={service.title}
                        className="w-full h-48 object-cover rounded-2xl mb-4"
                      />
                      <button 
                        onClick={() => service.title === 'Produits' ? setCurrentSection('boutique') : null}
                        className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        {service.title === 'Produits' ? 'Voir la boutique' : (
                          <span onClick={(e) => {
                            e.stopPropagation();
                            setIsBookingOpen(true);
                          }}>
                            Réserver
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Tarifs populaires */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-3xl p-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Tarifs populaires</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { service: "Coupe + Brushing", price: "69-89 CHF", duration: "45-70 min" },
                      { service: "Balayage complet", price: "160-220 CHF", duration: "120-180 min" },
                      { service: "Semi-permanent", price: "55-65 CHF", duration: "45-60 min" },
                      { service: "Ongles fumés", price: "+15 CHF", duration: "+20 min" }
                    ].map((item, index) => (
                      <div key={index} className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300">
                        <h4 className="font-semibold text-gray-900 mb-2">{item.service}</h4>
                        <p className="text-2xl font-bold text-rose-600 mb-1">{item.price}</p>
                        <p className="text-sm text-gray-500">{item.duration}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setIsGiftCardOpen(true)}
                      className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                    >
                      <Gift className="w-5 h-5" />
                      Offrir une carte cadeau
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Témoignages */}
            <section className="py-20 bg-gradient-to-br from-rose-50 to-pink-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Avis <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">Clients</span>
                  </h2>
                  <p className="text-xl text-gray-600 mb-6">Ce que disent nos clientes</p>
                  <button
                    onClick={() => setCurrentSection('avis')}
                    className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Voir tous les avis Google
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="bg-white rounded-3xl p-8 hover:shadow-xl transition-all duration-300">
                      <div className="flex text-yellow-400 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-rose-600">{testimonial.service}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section Galerie Instagram */}
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Nos <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">Réalisations</span>
                  </h2>
                  <p className="text-xl text-gray-600 mb-8">
                    Découvrez nos dernières créations sur Instagram et Facebook
                  </p>
                  <button
                    onClick={() => setCurrentSection('galerie')}
                    className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                  >
                    <Camera className="w-5 h-5" />
                    Voir toute la galerie
                  </button>
                </div>

                {/* Aperçu galerie */}
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400',
                    'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=400',
                    'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=400',
                    'https://images.pexels.com/photos/3997386/pexels-photo-3997386.jpeg?auto=compress&cs=tinysrgb&w=400'
                  ].map((image, index) => (
                    <div key={index} className="relative group cursor-pointer" onClick={() => setCurrentSection('galerie')}>
                      <img 
                        src={image} 
                        alt={`Réalisation ${index + 1}`}
                        className="w-full h-64 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-2xl transition-all duration-300" />
                      <div className="absolute top-3 left-3">
                        <Instagram className="w-6 h-6 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Contact & Infos */}
            <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12">
                  <div>
                    <h2 className="text-4xl font-bold mb-8">
                      Contactez-nous
                    </h2>
                    
                    <div className="space-y-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="bg-rose-500 p-3 rounded-xl">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold">Adresse</p>
                          <p className="text-gray-300">Rue du Four 7, 1148 Mont-la-Ville (VD)</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="bg-rose-500 p-3 rounded-xl">
                          <Phone className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold">Téléphone</p>
                          <p className="text-gray-300">076 376 15 14</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="bg-rose-500 p-3 rounded-xl">
                          <Clock className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold">Horaires</p>
                          <p className="text-gray-300">Mar-Ven: 9h-18h | Sam: 8h-16h</p>
                          <p className="text-gray-300">Lun & Dim: Fermé</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <a 
                        href="https://www.instagram.com/sabinavelAGIC/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-rose-500 p-3 rounded-xl hover:bg-rose-600 transition-colors"
                      >
                        <Instagram className="w-6 h-6" />
                      </a>
                      <a 
                        href="https://www.facebook.com/SabinaCoiffureNail/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-rose-500 p-3 rounded-xl hover:bg-rose-600 transition-colors"
                      >
                        <Facebook className="w-6 h-6" />
                      </a>
                      <a
                        href="https://wa.me/41763761514"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 p-3 rounded-xl hover:bg-green-600 transition-colors"
                      >
                        <MessageCircle className="w-6 h-6" />
                      </a>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold mb-6">Formulaire de contact complet</h3>
                    <p className="text-gray-300 mb-6">
                      Utilisez notre formulaire détaillé pour nous faire part de vos demandes
                    </p>
                    <button
                      onClick={() => setCurrentSection('contact')}
                      className="bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 px-8 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                    >
                      <Mail className="w-5 h-5" />
                      Accéder au formulaire
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-2 rounded-xl">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sabina</h1>
                <p className="text-sm text-rose-600">Coiffure & Ongles</p>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => setCurrentSection('accueil')}
                className={`transition-colors ${currentSection === 'accueil' ? 'text-rose-600' : 'text-gray-700 hover:text-rose-600'}`}
              >
                Accueil
              </button>
              <button 
                onClick={() => setCurrentSection('boutique')}
                className={`transition-colors ${currentSection === 'boutique' ? 'text-rose-600' : 'text-gray-700 hover:text-rose-600'}`}
              >
                Boutique Keune
              </button>
              <button 
                onClick={() => setCurrentSection('tarifs')}
                className={`transition-colors ${currentSection === 'tarifs' ? 'text-rose-600' : 'text-gray-700 hover:text-rose-600'}`}
              >
                Tarifs
              </button>
              <button 
                onClick={() => setCurrentSection('galerie')}
                className={`transition-colors ${currentSection === 'galerie' ? 'text-rose-600' : 'text-gray-700 hover:text-rose-600'}`}
              >
                Galerie
              </button>
              <button 
                onClick={() => setCurrentSection('contact')}
                className={`transition-colors ${currentSection === 'contact' ? 'text-rose-600' : 'text-gray-700 hover:text-rose-600'}`}
              >
                Contact
              </button>
            </nav>

            {/* Menu mobile */}
            <nav className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-rose-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-rose-600 transition-colors"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                className="hidden md:block p-2 text-gray-700 hover:text-rose-600 transition-colors"
              >
                <Settings className="w-6 h-6" />
              </button>

              <button
                onClick={() => setIsBookingOpen(true)}
                className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-3 md:px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-rose-500/25 transform hover:scale-105 transition-all duration-300 flex items-center gap-1 md:gap-2 text-sm md:text-base"
              >
                <Calendar className="w-4 h-4 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Réserver</span>
                <span className="sm:hidden">RDV</span>
              </button>
              
              <button
                onClick={() => setIsGiftCardOpen(true)}
                className="border-2 border-pink-300 text-pink-600 px-3 md:px-6 py-2 rounded-full font-semibold hover:bg-pink-50 transition-all duration-300 flex items-center gap-1 md:gap-2 text-sm md:text-base"
              >
                <Gift className="w-4 h-4 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Cadeaux</span>
                <span className="sm:hidden">🎁</span>
              </button>
            </div>
          </div>

          {/* Menu mobile déroulant */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 bg-white">
              <div className="px-4 py-2 space-y-1">
                <button
                  onClick={() => {
                    setCurrentSection('accueil');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    currentSection === 'accueil' ? 'bg-rose-50 text-rose-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Accueil
                </button>
                <button
                  onClick={() => {
                    setCurrentSection('boutique');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    currentSection === 'boutique' ? 'bg-rose-50 text-rose-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Boutique Keune
                </button>
                <button
                  onClick={() => {
                    setCurrentSection('tarifs');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    currentSection === 'tarifs' ? 'bg-rose-50 text-rose-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Tarifs
                </button>
                <button
                  onClick={() => {
                    setCurrentSection('galerie');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    currentSection === 'galerie' ? 'bg-rose-50 text-rose-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Galerie
                </button>
                <button
                  onClick={() => {
                    setCurrentSection('contact');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    currentSection === 'contact' ? 'bg-rose-50 text-rose-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Contact
                </button>
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <button
                    onClick={() => {
                      setIsAdminOpen(!isAdminOpen);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Administration
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Admin Panel Toggle */}
      {isAdminOpen && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <p className="text-yellow-800 font-medium">Mode Administration</p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentSection('admin')}
                className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-yellow-600 transition-colors"
              >
                Gérer les produits
              </button>
              <button
                onClick={() => setCurrentSection('tarifs')}
                className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors"
              >
                Gérer les tarifs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {renderSection()}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-2 rounded-xl">
                  <Scissors className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Sabina</h3>
                  <p className="text-sm text-rose-400">Coiffure & Ongles</p>
                </div>
              </div>
              <p className="text-gray-400">Votre salon de beauté à Mont-la-Ville</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-rose-400 transition-colors">Coiffure femme</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors">Coiffure homme</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors">Ongles & manucure</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors">Ongles fumés</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Boutique Keune</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-rose-400 transition-colors">Shampoings</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors">Soins capillaires</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors">Produits coiffage</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors">Colorations</a></li>
                <li><button onClick={() => setIsGiftCardOpen(true)} className="hover:text-rose-400 transition-colors">Cartes cadeaux</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => setCurrentSection('tarifs')} className="hover:text-rose-400 transition-colors">Tarifs</button></li>
                <li><button onClick={() => setCurrentSection('galerie')} className="hover:text-rose-400 transition-colors">Galerie</button></li>
                <li><button onClick={() => setCurrentSection('avis')} className="hover:text-rose-400 transition-colors">Avis clients</button></li>
                <li><button onClick={() => setCurrentSection('contact')} className="hover:text-rose-400 transition-colors">Contact</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Sabina Coiffure & Ongles. Tous droits réservés. Produits Keune disponibles.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddToCart={handleAddToCart}
        onReserve={handleReserve}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={selectedProduct ? favorites.includes(selectedProduct.id) : false}
      />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={() => alert('Redirection vers le paiement...')}
      />

      <BookingSystem
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        services={prices}
      />
      
      <GiftCardSystem
        isOpen={isGiftCardOpen}
        onClose={() => setIsGiftCardOpen(false)}
      />

      {/* Bouton WhatsApp flottant */}
      <div className="fixed bottom-6 right-6 z-50">
        <a 
          href="https://wa.me/41763761514"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl hover:shadow-green-500/25 transform hover:scale-110 transition-all duration-300 block"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
}

export default App;