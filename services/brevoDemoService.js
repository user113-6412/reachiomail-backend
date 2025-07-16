async function fnSendDemoEmail(toEmail, subject, html) {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: 'ReachioMail Demo',
          email: process.env.BREVO_FROM_EMAIL
        },
        to: [
          {
            email: toEmail
          }
        ],
        subject: subject,
        htmlContent: html
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Brevo API error: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email via Brevo:', error);
    throw error;
  }
}

module.exports = { fnSendDemoEmail }; 