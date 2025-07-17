const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const OpenAI = require('openai');
const { fnSendDemoEmail } = require('../services/brevoDemoService');
const { savePreview, getPreviewById } = require('../services/previewCleanupService');

const upload = multer({ storage: multer.memoryStorage() });

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });



// POST /api/mailmerge/preview - Generate AI email preview from CSV
router.post('/preview', upload.single('csv'), async function fnGeneratePreview(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const csvBuffer = req.file.buffer;
    const prompt = req.body.prompt || 'Write a friendly intro about {{Company}}';



    // Parse CSV to get headers and first row
    const csvData = await new Promise((resolve, reject) => {
      const results = [];
      const stream = require('stream');
      const readableStream = new stream.Readable();
      readableStream.push(csvBuffer);
      readableStream.push(null);

      readableStream
        .pipe(csv())  // ← This is the magic! csv-parser library
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });

    if (csvData.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty' });
    }

 

    const headers = Object.keys(csvData[0]);
    const sampleRow = csvData[0];

    // Create a sample prompt with actual data
    let samplePrompt = prompt;
    headers.forEach(header => {
      const placeholder = `{{${header}}}`;
      const value = sampleRow[header] || '';
      samplePrompt = samplePrompt.replace(new RegExp(placeholder, 'g'), value);
    });

    // Generate email content using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert email writer. Create professional, friendly email content based on the user's prompt. Return ONLY the email body content as plain text without any HTML tags, markdown formatting, or code blocks."
        },
        {
          role: "user",
          content: `Write an email body with this prompt: "${samplePrompt}". Make it professional and engaging. Return ONLY the email body content as plain text.`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    let emailBody = completion.choices[0].message.content.trim();
    
    // Clean up any markdown formatting that might have been added
    emailBody = emailBody.replace(/^```html\s*/i, '').replace(/```\s*$/i, '');
    
    // Create proper HTML email structure
    const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">              
                
            ${emailBody.split('\n').map(paragraph => 
                paragraph.trim() ? `<p style="color: #333333; line-height: 1.6; margin: 0 0 16px 0; font-size: 16px;">${paragraph}</p>` : ''
            ).join('')}
                           
        </div>
    `;
    
    // Generate subject line
    const subjectCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert email subject line writer. Create compelling, professional subject lines."
        },
        {
          role: "user",
          content: `Create a subject line for an email about: "${samplePrompt}". Keep it under 60 characters.`
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    let subject = subjectCompletion.choices[0].message.content.trim();

    // remove the double quotes from the subject
    subject = subject.replace(/"/g, '');

    // Store preview with unique ID
    const previewId = Date.now().toString() + Math.random().toString(36).substr(2, 9); // genrate id 
    const previewData = {
      id: previewId,
      subject: subject,
      html: emailContent,
      prompt: prompt,
      headers: headers,
      sampleRow: sampleRow,
      createdAt: new Date()
    };

    // Save to MongoDB
    await savePreview(previewData);

    res.json(previewData);
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});





// POST /api/mailmerge/send - Send test email using generated preview
router.post('/send', async function fnSendTestEmail(req, res) {
  try {
    const { previewId, email } = req.body;

    if (!previewId || !email) {
      return res.status(400).json({ error: 'Missing previewId or email' });
    }

    const preview = await getPreviewById(previewId);
    if (!preview) {
      return res.status(404).json({ error: 'Preview not found' });
    }

    // Send email using Brevo service
    await fnSendDemoEmail(email, preview.subject, preview.html);

    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});






module.exports = router; 