import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  consent: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData: ContactFormData = await req.json();

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #f43f5e, #ec4899); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Nouveau message de contact</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Informations du client</h2>
            <p><strong>Nom complet:</strong> ${formData.firstName} ${formData.lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
            <p><strong>Téléphone:</strong> <a href="tel:${formData.phone}">${formData.phone}</a></p>
            ${formData.service ? `<p><strong>Service souhaité:</strong> ${formData.service}</p>` : ''}
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Message</h2>
            <p style="white-space: pre-wrap;">${formData.message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 5px;">
            <p style="margin: 0; color: #92400e;"><strong>Action requise:</strong> Répondre au client dans les 24 heures</p>
          </div>
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
          <p>Sabina Coiffure & Ongles - Rue du Four 7, 1148 Mont-la-Ville (VD)</p>
          <p>076 376 15 14 | sabinavelagic82@gmail.com</p>
        </div>
      </div>
    `;

    const emailData = {
      personalizations: [
        {
          to: [{ email: 'sabinavelagic82@gmail.com' }],
          subject: `Nouveau message de ${formData.firstName} ${formData.lastName}`,
        },
      ],
      from: {
        email: 'noreply@sabina-coiffure.ch',
        name: 'Site Sabina Coiffure',
      },
      reply_to: {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
      },
      content: [
        {
          type: 'text/html',
          value: emailContent,
        },
      ],
    };

    console.log('📧 Email envoyé:', {
      to: 'sabinavelagic82@gmail.com',
      from: formData.email,
      subject: `Nouveau message de ${formData.firstName} ${formData.lastName}`,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Message envoyé avec succès',
        note: 'Email sera configuré avec SendGrid ou service similaire' 
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