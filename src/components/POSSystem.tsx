import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Plus, Minus, Trash2, CreditCard, Banknote, Scissors, Tag, Users } from 'lucide-react';
import { supabase, Client, Product } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ClientTag {
  id: string;
  name: string;
  color: string;
}

interface ClientWithTags extends Client {
  tags?: ClientTag[];
}

interface FamilyMember {
  client_id: string;
  client_name: string;
  phone?: string;
  email?: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price_short?: number;
  price_medium?: number;
  price_long?: number;
  duration?: number;
  image_url?: string;
  is_visible?: boolean;
}

interface CartItem extends Partial<Product> {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  type?: 'product' | 'service';
}

interface SelectedClient extends ClientWithTags {
  isPrimary: boolean;
}

export default function POSSystem() {
  const [clients, setClients] = useState<ClientWithTags[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedClients, setSelectedClients] = useState<SelectedClient[]>([]);
  const [availableChildren, setAvailableChildren] = useState<ClientWithTags[]>([]);
  const [showChildrenSelector, setShowChildrenSelector] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'twint'>('cash');
  const [searchClient, setSearchClient] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [viewMode, setViewMode] = useState<'products' | 'services'>('services');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadClients();
    loadProducts();
    loadServices();
  }, []);

  const loadClients = async () => {
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .order('first_name');

    if (clientsError || !clientsData) return;

    const { data: clientsWithTags, error: tagsError } = await supabase
      .from('clients_with_tags')
      .select('*');

    if (!tagsError && clientsWithTags) {
      const tagsMap = new Map(clientsWithTags.map(c => [c.id, c.tags]));
      const enrichedClients = clientsData.map(client => ({
        ...client,
        tags: tagsMap.get(client.id) || []
      }));
      setClients(enrichedClients);
    } else {
      setClients(clientsData);
    }
  };

  const loadChildren = async (parentId: string) => {
    const { data, error } = await supabase
      .from('client_children')
      .select('*')
      .eq('parent_id', parentId);

    if (!error && data) {
      const childrenWithTags = await Promise.all(
        data.map(async (child) => {
          const { data: tags } = await supabase
            .from('clients_with_tags')
            .select('*')
            .eq('id', child.id)
            .single();
          return { ...child, tags: tags?.tags || [] };
        })
      );
      setAvailableChildren(childrenWithTags as ClientWithTags[]);
    }
  };

  const selectClient = async (client: ClientWithTags, isPrimary: boolean = true) => {
    if (selectedClients.some(sc => sc.id === client.id)) return;

    setSelectedClients([...selectedClients, { ...client, isPrimary }]);

    if (isPrimary) {
      await loadChildren(client.id);
      setShowChildrenSelector(true);
    }
  };

  const unselectClient = (clientId: string) => {
    setSelectedClients(selectedClients.filter(sc => sc.id !== clientId));
    if (selectedClients.find(sc => sc.id === clientId)?.isPrimary) {
      setAvailableChildren([]);
      setShowChildrenSelector(false);
    }
  };

  const toggleChild = (child: ClientWithTags) => {
    if (selectedClients.some(sc => sc.id === child.id)) {
      unselectClient(child.id);
    } else {
      selectClient(child, false);
    }
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('visible_on_shop', true)
      .order('name');

    if (!error && data) {
      setProducts(data);
    }
  };

  const loadServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('name');

    if (!error && data) {
      setServices(data);
    }
  };

  const addToCart = (item: Product | Service, price?: number, type: 'product' | 'service' = 'product') => {
    const itemPrice = price || (item as Product).price || 0;
    const existingItem = cart.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        id: item.id,
        name: item.name,
        price: itemPrice,
        quantity: 1,
        image_url: item.image_url,
        type
      }]);
    }
  };

  const addServiceToCart = (service: Service, priceType: 'short' | 'medium' | 'long') => {
    const price = priceType === 'short' ? service.price_short :
                  priceType === 'medium' ? service.price_medium :
                  service.price_long;

    if (price) {
      addToCart(service, price, 'service');
    }
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: Math.max(0, item.quantity + change) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const processPayment = async () => {
    if (cart.length === 0) return;

    const totalAmount = getTotalAmount();
    const items = cart.map(item => ({
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    const primaryClient = selectedClients.find(sc => sc.isPrimary);

    const { data, error } = await supabase
      .from('pos_transactions')
      .insert([{
        client_id: primaryClient?.id || null,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: 'paid',
        items,
        created_by: user?.id
      }])
      .select()
      .single();

    if (!error && data) {
      if (selectedClients.length > 0) {
        await supabase
          .from('pos_transaction_clients')
          .insert(
            selectedClients.map(client => ({
              transaction_id: data.id,
              client_id: client.id,
              is_primary: client.isPrimary
            }))
          );

        for (const client of selectedClients) {
          const clientLabel = client.isPrimary ? 'Parent payeur' : 'Enfant inclus';
          await supabase
            .from('client_history')
            .insert([{
              client_id: client.id,
              action_type: 'purchase',
              description: `${clientLabel} - Achat de ${totalAmount.toFixed(2)} CHF via ${paymentMethod === 'cash' ? 'Cash' : 'Twint'}`,
              metadata: {
                transaction_id: data.id,
                items,
                payment_method: paymentMethod,
                is_primary: client.isPrimary,
                all_clients: selectedClients.map(sc => ({ id: sc.id, name: `${sc.first_name} ${sc.last_name}`, is_primary: sc.isPrimary }))
              },
              created_by: user?.id
            }]);
        }
      }

      setCart([]);
      setSelectedClients([]);
      setAvailableChildren([]);
      setShowChildrenSelector(false);
      alert(`Paiement enregistré avec succès pour ${selectedClients.length} client(s)!`);
    } else {
      alert('Erreur lors de l\'enregistrement du paiement');
    }
  };

  const filteredClients = clients.filter(client =>
    client.first_name.toLowerCase().includes(searchClient.toLowerCase()) ||
    client.last_name.toLowerCase().includes(searchClient.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchClient.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Client
          </h2>

          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchClient}
            onChange={(e) => setSearchClient(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
          />

          {selectedClients.length > 0 ? (
            <div className="space-y-3">
              <div className="space-y-2">
                {selectedClients.map((client) => (
                  <div key={client.id} className={`p-3 border rounded-lg ${client.isPrimary ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{client.first_name} {client.last_name}</h3>
                          {client.isPrimary && (
                            <span className="px-2 py-0.5 bg-green-600 text-white rounded text-xs font-medium">
                              Payeur
                            </span>
                          )}
                          {client.client_number && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                              {client.client_number}
                            </span>
                          )}
                        </div>
                        {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
                      </div>
                      <button
                        onClick={() => unselectClient(client.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showChildrenSelector && availableChildren.length > 0 && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Enfants du parent (cliquer pour ajouter):
                  </p>
                  <div className="space-y-2">
                    {availableChildren.map((child) => {
                      const isSelected = selectedClients.some(sc => sc.id === child.id);
                      return (
                        <button
                          key={child.id}
                          onClick={() => toggleChild(child)}
                          className={`w-full p-2 text-left border rounded-lg transition-colors ${
                            isSelected
                              ? 'border-blue-500 bg-blue-100'
                              : 'border-gray-200 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {child.first_name} {child.last_name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {child.client_number}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                                Sélectionné
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedClients([]);
                  setAvailableChildren([]);
                  setShowChildrenSelector(false);
                }}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Réinitialiser la sélection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => selectClient(client, true)}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900">{client.first_name} {client.last_name}</h3>
                  {client.email && <p className="text-xs text-gray-600">{client.email}</p>}
                  {client.client_number && <p className="text-xs text-gray-500">{client.client_number}</p>}
                  {client.tags && client.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {client.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-1.5 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {viewMode === 'services' ? 'Services' : 'Produits'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('services')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'services'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Scissors className="w-5 h-5 inline mr-1" />
                Services
              </button>
              <button
                onClick={() => setViewMode('products')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'products'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ShoppingCart className="w-5 h-5 inline mr-1" />
                Produits
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder={`Rechercher ${viewMode === 'services' ? 'un service' : 'un produit'}...`}
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
          />

          {viewMode === 'services' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded mb-2 flex items-center justify-center">
                      <Scissors className="w-12 h-12 text-blue-600" />
                    </div>
                  )}
                  <h3 className="font-medium text-gray-900 text-sm">{service.name}</h3>
                  {service.duration && (
                    <p className="text-xs text-gray-500 mt-1">{service.duration} min</p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product, undefined, 'product')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                  <p className="text-lg font-bold text-blue-600 mt-1">{product.price.toFixed(2)} CHF</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            Panier
          </h2>

          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Panier vide</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 flex-1">{item.name}</h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-bold text-gray-900">
                        {(item.price * item.quantity).toFixed(2)} CHF
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex items-center justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">{getTotalAmount().toFixed(2)} CHF</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Méthode de paiement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Banknote className={`w-8 h-8 mx-auto mb-2 ${
                      paymentMethod === 'cash' ? 'text-green-600' : 'text-gray-600'
                    }`} />
                    <span className={`font-medium ${
                      paymentMethod === 'cash' ? 'text-green-900' : 'text-gray-900'
                    }`}>
                      Cash
                    </span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('twint')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'twint'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <CreditCard className={`w-8 h-8 mx-auto mb-2 ${
                      paymentMethod === 'twint' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <span className={`font-medium ${
                      paymentMethod === 'twint' ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      Twint
                    </span>
                  </button>
                </div>
              </div>

              <button
                onClick={processPayment}
                className={`w-full py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-white ${
                  paymentMethod === 'cash'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {paymentMethod === 'cash' ? (
                  <Banknote className="w-5 h-5" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                Enregistrer le paiement
              </button>
            </>
          )}
        </div>
      </div>

      {selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedService.name}</h3>
            {selectedService.description && (
              <p className="text-gray-600 mb-4">{selectedService.description}</p>
            )}
            {selectedService.duration && (
              <p className="text-sm text-gray-500 mb-6">Durée: {selectedService.duration} min</p>
            )}

            <p className="text-lg font-semibold text-gray-900 mb-3">Choisir la longueur:</p>
            <div className="space-y-3 mb-6">
              {selectedService.price_short && (
                <button
                  onClick={() => {
                    addServiceToCart(selectedService, 'short');
                    setSelectedService(null);
                  }}
                  className="w-full p-4 bg-blue-50 border-2 border-blue-300 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-900">Cheveux Courts</span>
                    <span className="text-xl font-bold text-blue-600">{selectedService.price_short.toFixed(2)} CHF</span>
                  </div>
                </button>
              )}
              {selectedService.price_medium && (
                <button
                  onClick={() => {
                    addServiceToCart(selectedService, 'medium');
                    setSelectedService(null);
                  }}
                  className="w-full p-4 bg-green-50 border-2 border-green-300 rounded-lg hover:bg-green-100 transition-colors text-left"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-900">Cheveux Mi-longs</span>
                    <span className="text-xl font-bold text-green-600">{selectedService.price_medium.toFixed(2)} CHF</span>
                  </div>
                </button>
              )}
              {selectedService.price_long && (
                <button
                  onClick={() => {
                    addServiceToCart(selectedService, 'long');
                    setSelectedService(null);
                  }}
                  className="w-full p-4 bg-purple-50 border-2 border-purple-300 rounded-lg hover:bg-purple-100 transition-colors text-left"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-purple-900">Cheveux Longs</span>
                    <span className="text-xl font-bold text-purple-600">{selectedService.price_long.toFixed(2)} CHF</span>
                  </div>
                </button>
              )}
            </div>

            <button
              onClick={() => setSelectedService(null)}
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
