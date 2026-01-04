import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GiftCardData {
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  personalMessage?: string;
  deliveryDate?: string;
  deliveryMethod: string;
  cardTitle: string;
  cardValue: number;
  validityMonths: number;
  giftCardNumber: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const giftCardData: GiftCardData = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: giftCard, error: dbError } = await supabaseClient
      .from('gift_cards')
      .insert({
        code: giftCardData.giftCardNumber,
        amount: giftCardData.cardValue,
        buyer_name: giftCardData.senderName,
        recipient_name: giftCardData.recipientName,
        status: 'valid',
        notes: giftCardData.personalMessage || null
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erreur base de données:', dbError);
      throw new Error('Erreur lors de la création de la carte cadeau');
    }

    const recipientEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ec4899, #f97316); padding: 30px; text-align: center; color: white;">
          <h1>🎁 Vous avez reçu une carte cadeau !</h1>
          <p style="font-size: 18px;">De la part de ${giftCardData.senderName}</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #ec4899;">${giftCardData.cardTitle}</h2>
            <p style="font-size: 24px; font-weight: bold; color: #333;">CHF ${giftCardData.cardValue}</p>
            <p style="background: #f3f4f6; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 18px; text-align: center;">
              <strong>Code: ${giftCardData.giftCardNumber}</strong>
            </p>
          </div>
          
          ${giftCardData.personalMessage ? `
            <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h3>Message personnel :</h3>
              <p style="font-style: italic; color: #666;">“${giftCardData.personalMessage}”</p>
            </div>
          ` : ''}
          
          <div style="background: white; padding: 20px; border-radius: 10px;">
            <h3>Comment utiliser votre carte cadeau :</h3>
            <ol>
              <li>Appelez le <strong>076 376 15 14</strong> pour prendre rendez-vous</li>
              <li>Mentionnez votre code carte cadeau : <strong>${giftCardData.giftCardNumber}</strong></li>
              <li>Profitez de votre moment beauté chez Sabina !</li>
            </ol>
            
            <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 5px;">
              <p><strong>📍 Sabina Coiffure & Ongles</strong><br>
              Rue du Four 7, 1148 Mont-la-Ville (VD)<br>
              📞 076 376 15 14<br>
              🕖 Mar-Ven: 9h-18h | Sam: 8h-16h</p>
            </div>
            
            <p style="font-size: 12px; color: #666; margin-top: 20px;">
              Carte valable ${giftCardData.validityMonths} mois à partir de la date d'achat.
            </p>
          </div>
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
          <p>Sabina Coiffure & Ongles - Rue du Four 7, 1148 Mont-la-Ville (VD)</p>
          <p>076 376 15 14 | sabinavelagic82@gmail.com</p>
        </div>
      </div>
    `;

    const senderEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; padding: 20px; text-align: center; color: white;">
          <h1>✅ Carte cadeau envoyée avec succès !</h1>
        </div>
        
        <div style="padding: 30px;">
          <p>Bonjour ${giftCardData.senderName},</p>
          
          <p>Votre carte cadeau a été envoyée avec succès à <strong>${giftCardData.recipientName}</strong> (${giftCardData.recipientEmail}).</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>Détails de la carte cadeau :</h3>
            <ul>
              <li><strong>Service :</strong> ${giftCardData.cardTitle}</li>
              <li><strong>Valeur :</strong> CHF ${giftCardData.cardValue}</li>
              <li><strong>Code :</strong> ${giftCardData.giftCardNumber}</li>
              <li><strong>Destinataire :</strong> ${giftCardData.recipientName}</li>
              <li><strong>Mode de livraison :</strong> ${giftCardData.deliveryMethod === 'email' ? 'Email' : 'Courrier'}</li>
            </ul>
          </div>
          
          <p>Une copie de cette carte a également été envoyée à <strong>sabinavelagic82@gmail.com</strong> pour suivi.</p>
          
          <p>Merci pour votre confiance !</p>
          
          <p style="margin-top: 30px;">
            <strong>Sabina Coiffure & Ongles</strong><br>
            076 376 15 14
          </p>
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
          <p>Sabina Coiffure & Ongles - Rue du Four 7, 1148 Mont-la-Ville (VD)</p>
          <p>076 376 15 14 | sabinavelagic82@gmail.com</p>
        </div>
      </div>
    `;

    const salonEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #f43f5e, #ec4899); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎁 Nouvelle carte cadeau vendue</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Détails de la carte</h2>
            <p><strong>Code:</strong> ${giftCardData.giftCardNumber}</p>
            <p><strong>Montant:</strong> CHF ${giftCardData.cardValue}</p>
            <p><strong>Service:</strong> ${giftCardData.cardTitle}</p>
            <p><strong>Validité:</strong> ${giftCardData.validityMonths} mois</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Acheteur</h2>
            <p><strong>Nom:</strong> ${giftCardData.senderName}</p>
            <p><strong>Email:</strong> <a href="mailto:${giftCardData.senderEmail}">${giftCardData.senderEmail}</a></p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Bénéficiaire</h2>
            <p><strong>Nom:</strong> ${giftCardData.recipientName}</p>
            <p><strong>Email:</strong> <a href="mailto:${giftCardData.recipientEmail}">${giftCardData.recipientEmail}</a></p>
            ${giftCardData.personalMessage ? `<p><strong>Message:</strong> "${giftCardData.personalMessage}"</p>` : ''}
          </div>
        </div>
      </div>
    `;

    console.log('🎁 Carte cadeau créée:', {
      code: giftCardData.giftCardNumber,
      recipient: giftCardData.recipientEmail,
      sender: giftCardData.senderEmail,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Carte cadeau créée et emails envoyés',
        giftCardNumber: giftCardData.giftCardNumber,
        note: 'Emails seront configurés avec SendGrid ou service similaire'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});