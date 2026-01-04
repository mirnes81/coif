import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// SendGrid API Key doit être configuré dans les secrets Supabase
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@sabina-coiffure.ch';
const FROM_NAME = Deno.env.get('FROM_NAME') || 'Sabina Coiffure';
const SALON_EMAIL = Deno.env.get('SALON_EMAIL') || 'sabinavelagic82@gmail.com';

interface EmailRequest {
  template: 'contact' | 'gift_card_recipient' | 'gift_card_sender' | 'gift_card_salon' | 'booking_confirmation' | 'booking_reminder' | 'booking_cancelled';
  to: string;
  subject: string;
  data: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const emailRequest: EmailRequest = await req.json();
    
    // Créer le client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Générer le contenu HTML selon le template
    const htmlContent = generateEmailContent(emailRequest.template, emailRequest.data);

    // Vérifier si SendGrid est configuré
    if (!SENDGRID_API_KEY || SENDGRID_API_KEY === '') {
      // Mode simulation: log dans email_logs avec status 'pending'
      await logEmail(supabaseClient, {
        to_email: emailRequest.to,
        template_name: emailRequest.template,
        subject: emailRequest.subject,
        payload: emailRequest.data,
        status: 'pending',
        error_message: 'SendGrid API Key not configured'
      });

      console.log('📧 [SIMULATION] Email:', {
        to: emailRequest.to,
        template: emailRequest.template,
        subject: emailRequest.subject
      });

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Email logged (SendGrid not configured)',
          mode: 'simulation'
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Envoyer l'email via SendGrid
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: emailRequest.to }],
            subject: emailRequest.subject,
          },
        ],
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME,
        },
        content: [
          {
            type: 'text/html',
            value: htmlContent,
          },
        ],
      }),
    });

    if (sendGridResponse.ok) {
      // Récupérer le message ID de SendGrid
      const messageId = sendGridResponse.headers.get('X-Message-Id');

      // Logger le succès
      await logEmail(supabaseClient, {
        to_email: emailRequest.to,
        template_name: emailRequest.template,
        subject: emailRequest.subject,
        payload: emailRequest.data,
        status: 'sent',
        provider_message_id: messageId,
        sent_at: new Date().toISOString()
      });

      console.log('✅ Email sent successfully:', {
        to: emailRequest.to,
        template: emailRequest.template,
        messageId
      });

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Email sent successfully',
          messageId
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      const errorText = await sendGridResponse.text();
      throw new Error(`SendGrid error: ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // Logger l'échec
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await logEmail(supabaseClient, {
        to_email: 'unknown',
        template_name: 'unknown',
        subject: 'Error',
        payload: {},
        status: 'failed',
        error_message: error.message,
        failed_at: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

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

// Fonction pour logger les emails dans la base de données
async function logEmail(supabase: any, data: any) {
  const { error } = await supabase
    .from('email_logs')
    .insert(data);
  
  if (error) {
    console.error('Error logging email:', error);
  }
}

// Fonction pour générer le contenu HTML selon le template
function generateEmailContent(template: string, data: any): string {
  const baseFooter = `
    <div style="background: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
      <p>Sabina Coiffure & Ongles - Rue du Four 7, 1148 Mont-la-Ville (VD)</p>
      <p>076 376 15 14 | ${SALON_EMAIL}</p>
    </div>
  `;

  switch (template) {
    case 'contact':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #f43f5e, #ec4899); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Nouveau message de contact</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin-top: 0;">Informations du client</h2>
              <p><strong>Nom:</strong> ${data.firstName} ${data.lastName}</p>
              <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
              <p><strong>Téléphone:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>
              ${data.service ? `<p><strong>Service:</strong> ${data.service}</p>` : ''}
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Message</h2>
              <p style="white-space: pre-wrap;">${data.message}</p>
            </div>
          </div>
          
          ${baseFooter}
        </div>
      `;

    case 'gift_card_recipient':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ec4899, #f97316); padding: 30px; text-align: center; color: white;">
            <h1>🎁 Vous avez reçu une carte cadeau !</h1>
            <p style="font-size: 18px;">De la part de ${data.senderName}</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #ec4899;">${data.cardTitle}</h2>
              <p style="font-size: 24px; font-weight: bold; color: #333;">CHF ${data.cardValue}</p>
              <p style="background: #f3f4f6; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 18px; text-align: center;">
                <strong>Code: ${data.giftCardNumber}</strong>
              </p>
            </div>
            
            ${data.personalMessage ? `
              <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3>Message personnel:</h3>
                <p style="font-style: italic; color: #666;">"${data.personalMessage}"</p>
              </div>
            ` : ''}
            
            <div style="background: white; padding: 20px; border-radius: 10px;">
              <h3>Comment utiliser votre carte cadeau:</h3>
              <ol>
                <li>Appelez le <strong>076 376 15 14</strong> pour prendre rendez-vous</li>
                <li>Mentionnez votre code: <strong>${data.giftCardNumber}</strong></li>
                <li>Profitez de votre moment beauté !</li>
              </ol>
            </div>
          </div>
          
          ${baseFooter}
        </div>
      `;

    case 'booking_confirmation':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #10b981, #059669); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">✓ Réservation confirmée</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <div style="background: white; padding: 20px; border-radius: 10px;">
              <p>Bonjour ${data.clientName},</p>
              <p>Votre rendez-vous est confirmé:</p>
              <p><strong>Service:</strong> ${data.service}</p>
              <p><strong>Date:</strong> ${data.date}</p>
              <p><strong>Heure:</strong> ${data.time}</p>
              <p><strong>Durée estimée:</strong> ${data.duration}</p>
            </div>
          </div>
          
          ${baseFooter}
        </div>
      `;

    default:
      return `<p>Template not found: ${template}</p>`;
  }
}
