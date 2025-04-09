# AyurVeda - Medication Management System

AyurVeda is a comprehensive medication management application built with Next.js, helping users track their medications, check for drug interactions, and maintain proper adherence to their treatment plans.

![AyurVeda Dashboard](https://via.placeholder.com/800x400?text=AyurVeda+Dashboard)

## Features

- **Medication Management**: Add, edit, view, and delete medications with detailed information
- **Interactive Dashboard**: View medication schedules, adherence rates, and upcoming doses
- **Drug Interaction Checker**: Check for potential drug interactions between medications
- **Adherence Tracking**: Track medication adherence with visual progress indicators
- **Medication Information**: Access detailed information about medications
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or pnpm
- PostgreSQL

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ayurveda.git
   cd ayurveda
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/ayurveda"

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # API Keys (optional)
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
ayurveda/
├── app/                # Next.js app directory
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard routes
│   ├── login/          # Login page
│   ├── register/       # Registration page
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # Reusable components
│   ├── ui/             # UI components
│   └── dashboard/      # Dashboard-specific components
├── lib/                # Utility functions
├── prisma/             # Prisma schema and migrations
├── public/             # Static assets
└── styles/             # Global styles
```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | Authentication endpoints |
| `/api/medications` | GET | Get all medications for current user |
| `/api/medications` | POST | Create a new medication |
| `/api/medications/:id` | GET | Get a specific medication |
| `/api/medications/:id` | PUT | Update a medication |
| `/api/medications/:id` | DELETE | Delete a medication |
| `/api/adherence` | GET | Get adherence records |
| `/api/adherence` | POST | Create a new adherence record |
| `/api/interactions` | POST | Check for drug interactions |

## Performance Optimizations

1. **Context API with State Caching**: Used for efficient state management and to avoid prop drilling
2. **Memoization**: Optimized expensive calculations with useMemo and useCallback
3. **Code Splitting**: Implemented with Next.js dynamic imports
4. **API Response Caching**: Implemented with HTTP cache headers
5. **Image Optimization**: Using Next.js Image component

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

## Deployment

### Deploying to Vercel

This project is configured for easy deployment on Vercel.

1. **Connect to GitHub**: Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. **Import to Vercel**:
   - Go to [Vercel](https://vercel.com/) and sign in
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure your project:
     - Framework Preset: Next.js
     - Environment Variables: Add all variables from `.env.example`

3. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your application automatically

4. **Database Setup**:
   - Set up a PostgreSQL database (e.g., on Supabase, Neon, or Railway)
   - Update the `DATABASE_URL` environment variable in your Vercel project settings
   - Run the following command to apply migrations to your production database:
     ```bash
     npx prisma migrate deploy
     ```

5. **Continuous Deployment**:
   - Vercel will automatically deploy new changes when you push to your main branch 