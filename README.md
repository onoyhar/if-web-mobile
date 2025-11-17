# 🍽️ IF PWA - Intermittent Fasting Tracker# IF PWA Project

Placeholder. Full code omitted for brevity.
A modern Progressive Web App (PWA) built with Next.js 15 and Supabase for tracking intermittent fasting, water intake, weight, and exercise routines.

## ✨ Features

- 🔐 **Authentication** - Secure login/signup with Supabase Auth
- ⏱️ **Fasting Timer** - Track your fasting periods with visual ring progress
- 💧 **Water Tracker** - Monitor daily water intake with visual droplets
- ⚖️ **Weight Tracker** - Log and track weight progress with BMI calculation
- 🏋️ **Exercise Library** - Watch workout videos from YouTube
- 📊 **Fasting Planning** - Plan and schedule fasting windows
- 🌙 **Dark/Light Mode** - Theme toggle with next-themes
- 📱 **PWA Support** - Installable app with offline capabilities
- 🔔 **Push Notifications** - (Ready for implementation)
- 🔄 **Background Sync** - Sync data when connection is restored

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.6 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (SSR with cookies)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd if-pwa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   
   Create `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Setup Supabase database**
   
   Run these SQL scripts in your Supabase SQL Editor:
   
   a. **RLS Policies** (Security)
   ```bash
   # Copy content from supabase_policies.sql
   ```
   
   b. **Auto Profile Creation** (Optional)
   ```bash
   # Copy content from supabase_auto_profile.sql
   ```
   
   c. **Sample Exercise Data** (Optional)
   ```bash
   # Copy content from sample_exercises.sql
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## 📦 Database Schema

### Tables

#### `users_profile`
```sql
- id: uuid (primary key, references auth.users)
- name: text
- email: text
- age: integer
- photo_url: text
- created_at: timestamp
- updated_at: timestamp
```

#### `user_settings`
```sql
- id: uuid (primary key, references auth.users)
- height: numeric (cm)
- weight: numeric (kg)
- target_weight: numeric (kg)
- bmi: numeric
- water_goal: integer (glasses)
- created_at: timestamp
- updated_at: timestamp
```

#### `exercise_library`
```sql
- id: uuid (primary key)
- title: text
- thumbnail_url: text
- video_url: text (YouTube URL)
- created_at: timestamp
```

## 🔐 Authentication

The app uses Supabase SSR authentication with cookie-based sessions:

- **Login/Signup** pages with error handling
- **Quick Login** button for testing (test@example.com / Test123456)
- **Protected Routes** via Next.js middleware
- **Session persistence** across page reloads

## 🎯 Usage

### Quick Start with Test Account

1. Go to `/login`
2. Click **"Quick Login (test@example.com)"** button
3. Navigate to any feature (Profile, Settings, Exercise, etc.)

### Manual Registration

1. Go to `/login`
2. Click **"Sign Up"**
3. Enter email and password (min 6 characters)
4. Profile is auto-created on first login

## 📱 PWA Features

### Installation
- Visit the app on mobile
- Add to Home Screen
- Works offline with cached pages

### Service Worker
- Caches static assets
- Network-first strategy for protected routes
- Fallback to home page when offline

## 🔧 Configuration Files

- `next.config.mjs` - Next.js configuration
- `tailwind.config.mjs` - Tailwind CSS customization
- `tsconfig.json` - TypeScript settings
- `middleware.ts` - Route protection logic
- `public/manifest.webmanifest` - PWA manifest
- `public/sw.js` - Service Worker

## 📂 Project Structure

```
if-pwa/
├── app/
│   ├── api/              # API routes
│   ├── exercise/         # Exercise pages
│   ├── login/            # Auth page
│   ├── profile/          # User profile
│   ├── settings/         # User settings
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── layout/           # Navbar, Sidebar
│   ├── trackers/         # Fasting, Water, Weight trackers
│   ├── ui/               # Reusable UI components
│   └── *.tsx             # Other components
├── lib/
│   ├── db.ts             # Database helper functions
│   ├── supabase.ts       # Supabase client
│   ├── storage.ts        # Local storage utils
│   └── types.ts          # TypeScript types
├── public/
│   ├── sw.js             # Service Worker
│   └── manifest.webmanifest
└── middleware.ts         # Route protection
```

## 🚦 Protected Routes

These routes require authentication:
- `/profile` - User profile page
- `/settings` - User settings
- `/exercise` - Exercise library and videos

## 🐛 Troubleshooting

### Service Worker Issues
If you encounter "This site can't be reached" on reload:

1. Open Chrome DevTools (F12)
2. Go to Application → Service Workers
3. Click "Unregister"
4. Hard reload (Cmd+Shift+R or Ctrl+Shift+R)

Or run in browser console:
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
  location.reload();
});
```

### Database Errors
- Enable RLS policies in Supabase dashboard
- Check that all SQL scripts are executed
- Verify environment variables are correct

## 📝 Available Scripts

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app is a standard Next.js app and can be deployed to:
- Netlify
- AWS Amplify
- Railway
- Any Node.js hosting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Built with ❤️ using Next.js and Supabase

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Tailwind CSS for styling utilities
- Radix UI for accessible components

---

**Star ⭐ this repo if you find it useful!**
