// Service d'email pour les bons cadeaux
// Remplacez cette simulation par votre service d'email réel

interface EmailData {
  to: string;
  from: string;
  subject: string;
  html: string;
}

// OPTION 1: Avec SendGrid (recommandé)
export const sendEmailWithSendGrid = async (emailData: EmailData) => {
  const SENDGRID_API_KEY = 'votre_clé_sendgrid_ici';
  
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: emailData.to }],
          subject: emailData.subject
        }],
        from: { email: emailData.from, name: 'Sabina Coiffure & Ongles' },
        content: [{
          type: 'text/html',
          value: emailData.html
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`SendGrid error: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur SendGrid:', error);
    return { success: false, error };
  }
};

// OPTION 2: Avec votre serveur PHP/Node.js
export const sendEmailWithCustomServer = async (emailData: EmailData) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erreur serveur email:', error);
    return { success: false, error };
  }
};

// OPTION 3: Simulation actuelle (à remplacer)
export const sendEmailSimulation = async (emailData: EmailData) => {
  console.log('📧 EMAIL SIMULÉ:', emailData);
  
  // Simulation d'attente
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Toujours succès en simulation
  return { success: true };
};

// Fonction principale à utiliser
export const sendEmail = async (emailData: EmailData) => {
  // CHANGEZ ICI pour utiliser votre service réel :
  
  // return await sendEmailWithSendGrid(emailData);
  // return await sendEmailWithCustomServer(emailData);
  return await sendEmailSimulation(emailData); // ← Actuellement utilisé
};