# MemoryKeeper - Your Personal Memory Preservation App

> **A comprehensive memory-keeping application that helps preserve family stories, enhance cognitive health, and create collaborative memory collections.**

## 🌟 Features

### Core Functionality
- **📝 Journal Memories**: Capture daily thoughts, stories, and moments with text or voice input
- **🧠 Memory Games**: 10+ brain training games with adaptive difficulty
- **📊 Memory Strength Tracking**: Advanced analytics showing cognitive improvement over time
- **👥 Collaborative Collections**: Share memories with family and friends securely
- **🤖 AI Studio**: Generate insights and connections from your memories
- **🎨 Visual Content Generation**: Create images and visuals from memories
- **🔄 Offline Support**: Full functionality without internet connection
- **📱 PWA Ready**: Install as a native app on mobile devices

### Advanced Features
- **Knowledge Graph**: Visualize connections between memories
- **Import/Export**: Backup and restore your memory data
- **Multi-modal Input**: Text, voice, and photo memories
- **Progress Analytics**: Detailed cognitive health metrics
- **Family Sharing**: Secure collaboration with permissions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for backend)
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd memorykeeper-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key # consumed only by /api/ai proxy
   ```

4. **Database Setup**
   Run the SQL setup script in your Supabase project:
   ```sql
   -- Execute contents of SUPABASE_DATABASE_SETUP.sql
   ```

5. **Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173). To exercise the AI proxy locally, run `vercel dev` instead so the `/api/ai` Edge function is available alongside Vite.

6. **Build for Production**
   ```bash
   npm run build
   npm run preview
   ```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### End-to-End Tests
```bash
npx playwright test
```

### Build Verification
```bash
npm run build
```

## 📱 Progressive Web App (PWA)

MemoryKeeper is a fully installable PWA tuned for seniors:

- Maskable 192/512 icons, screenshots, and shortcuts declared in `public/manifest.json`.
- Custom A2HS prompt (`src/hooks/useA2HS.ts`) educates Android/iOS users on installation steps.
- Offline fallback page (`public/offline.html`) plus Workbox `NetworkFirst` caching for Supabase reads and a Background Sync queue for writes.
- `virtual:pwa-register` toast (`src/components/ServiceWorkerToast.tsx`) announces when a new version is ready so users can refresh immediately.
- Push notifications remain on the roadmap; hooks are ready once browser keys and server logic are provisioned.

## 🔒 Security Features

- **Input Sanitization**: All user inputs are sanitized to prevent XSS attacks
- **Rate Limiting**: API calls are rate-limited to prevent abuse
- **Authentication**: Secure user authentication via Supabase
- **Data Encryption**: Sensitive data is encrypted in transit and at rest
- **Permission System**: Granular access controls for collaborative features

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI Integration**: OpenAI API
- **State Management**: React Context + Custom Hooks
- **Storage**: IndexedDB (local) + Supabase (remote)
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library + Playwright

### Key Components
- **Authentication Flow**: Secure user onboarding and session management
- **Memory Management**: CRUD operations with offline sync
- **Game Engine**: Adaptive difficulty brain training games
- **AI Services**: Memory analysis and content generation
- **Collaborative System**: Real-time sharing and permissions

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:run     # Run tests once
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking
```

### Project Structure
```
memorykeeper-app/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   ├── lib/               # Utility functions and services
│   ├── hooks/             # Custom React hooks
│   └── tests/             # Test files
├── tests/
│   └── e2e/               # End-to-end tests
├── docs/                  # Documentation
└── dist/                  # Production build output
```

## 🚀 Deployment

### Environment Variables for Production
Ensure all environment variables are properly set in your deployment platform:

```env
NODE_ENV=production
VITE_APP_ENV=production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-key
```

### Build Optimization
The app includes several performance optimizations:
- Code splitting and lazy loading
- Bundle size optimization (419KB main bundle)
- Service worker for caching
- Image optimization and compression

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Write tests for new features
- Update documentation for API changes
- Ensure accessibility compliance
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React, Supabase, and OpenAI
- Inspired by cognitive health research and family storytelling
- Designed for accessibility and inclusive user experience

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in the `docs/` folder
- Review the troubleshooting guide

---

**MemoryKeeper** - Preserving memories, enhancing lives, connecting families.
