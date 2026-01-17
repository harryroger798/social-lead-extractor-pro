# ByteCare - Repair Shop Management System

A complete, production-ready repair shop management system for computer and mobile repair shops. ByteCare handles three revenue verticals: PC Repair, Mobile Repair, and Digital Services.

## Features

### Core Features
- **Customer Management**: Track customer information, repair history, and lifetime value
- **Repair Ticket System**: Full lifecycle management from intake to delivery
- **Invoice Generation**: Professional PDF invoices with GST support
- **Payment Tracking**: Multiple payment methods with UPI QR code generation
- **Service Catalog**: Manage services and pricing for all verticals
- **Digital Services**: Project management for websites, apps, SEO, and more

### Integrations
- **Airtable Sync**: Cloud backup with smart batching to stay under free tier limits
- **Omnisend**: Email and SMS notifications for customers
- **Google Pay**: UPI QR code generation for payments

### Technical Features
- **Offline-First**: SQLite local database with cloud sync
- **Role-Based Access**: Admin, Technician, and Viewer roles
- **Activity Logging**: Complete audit trail of all actions
- **GST Compliance**: GSTR-1 and GSTR-3B export support
- **Desktop App**: Electron-based Windows/macOS/Linux application

## Tech Stack

### Backend
- Node.js + Express.js
- SQLite3 with better-sqlite3
- JWT Authentication
- PDFKit for invoice generation

### Frontend
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS
- shadcn/ui components
- React Query for data fetching
- Recharts for analytics

### Desktop
- Electron
- Auto-update support

## Project Structure

```
bytecare/
├── server/           # Backend API
│   ├── config/       # Configuration and constants
│   ├── database/     # SQLite schema and seeds
│   ├── middleware/   # Auth, logging, error handling
│   ├── routes/       # API endpoints
│   └── services/     # Business logic
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utilities and API
│   │   ├── stores/      # State management
│   │   └── hooks/       # Custom hooks
│   └── dist/         # Production build
├── desktop/          # Electron app
│   ├── main.js       # Main process
│   ├── preload.js    # Preload script
│   └── renderer/     # Frontend build
└── docs/             # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/harryroger798/Test.git
cd Test
```

2. Install dependencies:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

3. Set up environment variables:
```bash
# Server (.env)
PORT=3001
JWT_SECRET=your-secret-key
NODE_ENV=development

# Client (.env)
VITE_API_URL=http://localhost:3001/api
```

4. Initialize the database:
```bash
cd server
npm run db:init
npm run db:seed
```

5. Start the development servers:
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

6. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Default Login
- Email: harryroger798@gmail.com
- Password: 007JamesBond@@

## API Documentation

See [docs/API.md](docs/API.md) for complete API documentation.

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User authentication |
| `/api/customers` | GET/POST | Customer management |
| `/api/repairs` | GET/POST | Repair tickets |
| `/api/invoices` | GET/POST | Invoice management |
| `/api/services` | GET/POST | Service catalog |
| `/api/digital-services` | GET/POST | Digital projects |
| `/api/dashboard` | GET | Analytics data |
| `/api/settings` | GET/PUT | System settings |

## Configuration

All integrations are configurable by the super admin in Settings:

### Airtable
- API Key
- Base ID
- Sync frequency (default: 30 minutes)

### Omnisend
- API Key
- Email templates
- SMS settings

### Google Pay
- UPI ID for QR code generation

## Building for Production

### Web Application
```bash
cd client && npm run build
```

### Desktop Application
```bash
# Build client first
cd client && npm run build
cp -r dist/* ../desktop/renderer/

# Build desktop app
cd ../desktop
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Deployment

### DigitalOcean App Platform
1. Connect your GitHub repository
2. Configure environment variables
3. Deploy backend and frontend separately

### Manual Deployment
1. Build the client: `cd client && npm run build`
2. Copy build to server: `cp -r client/dist server/public`
3. Start server: `cd server && npm start`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- Email: harryroger798@gmail.com
- GitHub Issues: https://github.com/harryroger798/Test/issues

## Credits

Built by Sayan Roy Chowdhury for ByteCare.
