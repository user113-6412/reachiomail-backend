# ReachioMail - AI Email Writer for Personalized Reach

No add-ons. Upload a CSV, let AI craft the perfect intro, and hit send — straight from your Gmail.

## Features

- **AI-Powered Email Generation**: Uses OpenAI to create personalized email content
- **CSV Upload & Processing**: Drag-and-drop CSV file upload with automatic parsing
- **Live Preview**: See your personalized email before sending
- **Direct Gmail Integration**: Send test emails directly to your inbox
- **Modern UI**: Clean, responsive design with soft gradients and smooth animations

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **Tailwind CSS** for styling
- **React Dropzone** for file uploads
- **Analytics**: GA4

### Backend
- **Node.js** with **Express**
- **OpenAI API** for email generation
- **Brevo** for email delivery
- **Multer** for file uploads
- **CSV Parser** for data processing

## Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key
- Brevo API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. **Set up environment variables**

   Create `.env` files in both frontend and backend directories:

   **Backend (.env)**
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   BREVO_API_KEY=your_brevo_api_key_here
   BREVO_FROM_EMAIL=demo@mailmergegooglesheets.com
   MONGODB_URI=mongodb://localhost:27017/mailmerge
   PORT=10000
   NODE_ENV=development
   ```

   **Frontend (.env.local)**
   ```env
   NEXT_PUBLIC_GA_ID=G-XXXX
   NEXT_PUBLIC_LOGROCKET_ID=your-app/1.0.0
   ```

4. **Start the development servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:10000

## API Endpoints

### POST `/api/mailmerge/preview`
Generate an AI-powered email preview from CSV data.

**Request:**
- `csv`: CSV file (multipart/form-data)
- `prompt`: AI prompt string

**Response:**
```json
{
  "id": "preview_id",
  "subject": "Generated subject line",
  "html": "<html>email content</html>",
  "prompt": "original prompt",
  "headers": ["Name", "Email", "Company"],
  "sampleRow": {"Name": "John Doe", "Email": "john@example.com"},
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### POST `/api/mailmerge/send`
Send a test email using the generated preview.

**Request:**
```json
{
  "previewId": "preview_id",
  "email": "recipient@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully"
}
```

## Project Structure

```
reachiomail/
├── frontend/
│   ├── app/
│   │   ├── globals.css          # Global styles with gradient
│   │   ├── layout.jsx           # Root layout with analytics
│   │   └── page.jsx             # Landing page
│   ├── components/
│   │   ├── Navbar.js            # Sticky navigation
│   │   ├── Footer.js            # Footer with links
│   │   └── DemoModal.js         # Demo modal (client component)
│   └── package.json
├── backend/
│   ├── routes/
│   │   └── mailMergeRoutes.js   # API routes
│   ├── services/
│   │   └── brevoDemoService.js  # Email service
│   ├── server.js                # Express server
│   └── package.json
└── README.md
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for email generation | Yes |
| `BREVO_API_KEY` | Brevo API key for email delivery | Yes |
| `BREVO_FROM_EMAIL` | Sender email address | Yes |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | No |
| `NEXT_PUBLIC_LOGROCKET_ID` | LogRocket app ID | No |
| `MONGODB_URI` | MongoDB connection string | No (uses in-memory storage) |
| `PORT` | Backend server port | No (default: 10000) |

## Features in Detail

### AI Email Generation
- Uses GPT-3.5-turbo for content generation
- Automatically generates subject lines
- Supports template variables like `{{Company}}`, `{{Name}}`
- Returns HTML-formatted emails

### CSV Processing
- Supports standard CSV format
- Automatic header detection
- Sample data preview
- Template variable replacement

### Email Delivery
- Uses Brevo (formerly Sendinblue) for reliable delivery
- Professional sender branding
- HTML email support
- Delivery tracking

### Analytics Integration
- Google Analytics 4 for user behavior
- Plausible for privacy-focused analytics
- LogRocket for session replay
- Custom event tracking for demo interactions

## Development

### Code Conventions
- JavaScript only (no TypeScript)
- Function names prefixed with `fn` (e.g., `fnGeneratePreview`)
- Classic function declarations preferred
- Consistent error handling

### Adding New Features
1. Create new route in `backend/routes/`
2. Add controller logic in `backend/controllers/`
3. Create services in `backend/services/` if needed
4. Update frontend components as required

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render/Railway)
1. Connect GitHub repository
2. Set environment variables
3. Configure build command: `npm install`
4. Set start command: `npm start`

## License

MIT License - see LICENSE file for details.

## Support

For support, email viktorasjarm@gmail.com or create an issue in the repository. 