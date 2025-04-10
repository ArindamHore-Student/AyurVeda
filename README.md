# AyurVeda - Medication Management System

AyurVeda is a comprehensive medication management application built with Next.js, helping users track their medications, check for drug interactions, and maintain proper adherence to their treatment plans.

## Screenshots

### Dashboard Overview
![AyurVeda Dashboard](./docs/screenshots/dashboard-overview.png)
*The main dashboard showing medication schedule, adherence statistics, and upcoming doses.*

### Medication Management
![Medication Management](./docs/screenshots/medication-management.png)
*Add, edit, and track your medications with detailed information and dosage schedules.*

### Dosage Calculator
![Dosage Calculator](./docs/screenshots/dosage-calculator.png)
*Calculate precise medication dosages based on weight, age, and other patient factors.*

### Drug Interaction Checker
![Drug Interaction Checker](./docs/screenshots/drug-interaction-checker.png)
*Check for potential interactions between different medications in your treatment plan.*

## Adding Your Own Screenshots

To add your own screenshots to the README:

1. Create the following directory structure in your project root:
   ```
   docs/
   └── screenshots/
       ├── dashboard-overview.png
       ├── medication-management.png
       ├── dosage-calculator.png
       ├── drug-interaction-checker.png
       ├── server-starting.png
       ├── registration-page.png
       ├── login-page.png
       ├── dashboard-navigation.png
       ├── adding-medication.png
       └── prisma-studio.png
   ```

2. Take screenshots of your application running locally
3. Save them in the `docs/screenshots/` directory with the filenames shown above
4. The README will automatically reference these images using relative paths

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
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ayurveda.git
   cd ayurveda
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   # or
   pnpm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Database (SQLite - local file-based database)
   DATABASE_URL="file:./prisma/dev.db"

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # API Keys
   GEMINI_API_KEY=your_gemini_api_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Set up the database:
   ```bash
   # Reset the database and apply migrations
   npm run db:reset
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Running the Application

### 1. Start the Server
![Starting the Server](./docs/screenshots/server-starting.png)
*Run `npm run dev` to start the development server.*

### 2. Registration Page
![Registration Page](./docs/screenshots/registration-page.png)
*Create a new account to access the medication management system.*

### 3. Login Page
![Login Page](./docs/screenshots/login-page.png)
*Sign in with your credentials to access your personalized dashboard.*

### 4. Dashboard Navigation
![Dashboard Navigation](./docs/screenshots/dashboard-navigation.png)
*Navigate through the various features using the sidebar menu.*

### 5. Adding a New Medication
![Adding Medication](./docs/screenshots/adding-medication.png)
*Add new medications to your profile with detailed dosage information.*

### Database Management

This project uses SQLite, a file-based database that doesn't require a separate database server. The database file is stored at `prisma/dev.db` and is created automatically when you run the database setup commands.

- **Reset Database**: If you need to reset the database at any point:
  ```bash
  npm run db:reset
  ```

- **View Database**: To explore the database structure using Prisma Studio:
  ```bash
  npm run prisma:studio
  ```
  
  ![Prisma Studio](./docs/screenshots/prisma-studio.png)
  *Prisma Studio provides a visual interface to browse and edit your database.*

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
├── docs/               # Documentation
│   └── screenshots/    # Application screenshots
├── lib/                # Utility functions
├── prisma/             # Prisma schema and migrations
│   ├── dev.db          # SQLite database file
│   ├── schema.prisma   # Database schema definition
│   └── migrations/     # Database migrations
├── public/             # Static assets
└── styles/             # Global styles
```

## Troubleshooting

### Common Issues

- **Database Errors**: If you encounter database-related errors, try resetting the database:
  ```bash
  npm run db:reset
  ```

- **Next.js Build Errors**: If you get build errors related to the .next directory:
  ```bash
  # Remove the .next directory and rebuild
  rm -rf .next
  npm run dev
  ```

- **Environment Variables**: Make sure all required environment variables are set in your .env file.

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

## Important Notes About SQLite

- SQLite is a file-based database that works well for development and small applications
- The database file is stored at `prisma/dev.db`
- All data is stored locally on your machine
- This approach is suitable for:
  - Development environments
  - Personal projects
  - Small-scale applications
  - Demonstrations

- For production applications that need to handle significant user load, consider:
  - Migrating to a more robust database like PostgreSQL
  - Using a managed database service (Neon, Supabase, etc.) 