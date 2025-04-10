# AyurVeda - AI-powered Pharmacy Assistant

AyurVeda is a comprehensive pharmacy assistant application that helps healthcare professionals manage medications, calculate dosages, and provide optimal care to patients.

## Features

- Medication management and tracking
- Dosage calculator with support for adult and pediatric patients
- Weight-based medication dosing
- Real-time medication advice and interactions
- Responsive design for desktop and mobile

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS, shadcn/ui
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL (Railway)
- **ORM**: Prisma
- **Deployment**: Vercel

## Setting Up Railway + Vercel Deployment

### Step 1: Set Up Railway PostgreSQL Database

1. Sign up for a [Railway](https://railway.app/) account
2. Create a new project in Railway
3. Add a PostgreSQL database to your project
4. From the PostgreSQL service, go to the "Connect" tab
5. Copy the PostgreSQL connection string (it should look like `postgresql://postgres:password@containers-us-west-XXX.railway.app:XXXX/railway`)

### Step 2: Configure Prisma for Railway

1. Update the database schema to use PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Create migrations after schema changes:
   ```bash
   npx prisma migrate dev --name init
   ```

### Step 3: Deploy to Vercel

1. Push your code to a GitHub repository
2. Sign up for a [Vercel](https://vercel.com/) account
3. Import your GitHub repository into Vercel
4. Add the following environment variables in Vercel:
   - `DATABASE_URL` - The PostgreSQL connection string from Railway
   - `NEXTAUTH_SECRET` - A secure random string for NextAuth.js
   - `NEXTAUTH_URL` - Your deployed application URL (e.g., https://your-app.vercel.app)
5. Deploy the application

### Step 4: Run Database Migrations

After deployment, you'll need to run migrations to set up your database schema.

1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Link to your project:
   ```bash
   vercel link
   ```

4. Pull environment variables:
   ```bash
   vercel env pull .env
   ```

5. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

6. (Optional) Seed the database:
   ```bash
   npx prisma db seed
   ```

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy the `.env.example` file to `.env.local` and fill in the required values
4. Start the development server: `npm run dev`

## Database Schema Updates

When you need to update the database schema:

1. Modify the Prisma schema in `prisma/schema.prisma`
2. Generate a new migration:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
3. Push the changes to your Railway database:
   ```bash
   npx prisma migrate deploy
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

## Deployment

### Deploying to Vercel with SQLite

This project is configured to use SQLite for both local development and Vercel deployment, which simplifies the setup process.

1. **Prepare for deployment**:
   - SQLite database files are automatically created and managed
   - No need for external database services
   - Push your changes to GitHub:
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
     - Environment Variables: 
       - `NEXTAUTH_SECRET`: A secure random string
       - `NEXTAUTH_URL`: Your production URL (e.g., https://your-app.vercel.app)
       - `GEMINI_API_KEY`: Your Google Gemini API key (if using AI features)

3. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your application automatically

4. **Important Notes About SQLite on Vercel**:
   - SQLite databases on Vercel are **read-only** in production
   - The database is created during build time
   - You can pre-seed your database during the build phase, which is done via the `postinstall` script
   - Changes made during runtime won't persist between deploys or serverless function invocations
   - This approach is suitable for:
     - Demo applications
     - Content-focused sites that rarely change data
     - Applications where data persistence is not critical

5. **For Production Applications**:
   - For production applications that need to frequently write data, consider:
     - Using a managed database service (PostgreSQL on Neon, Supabase, etc.)
     - Implementing a more robust data persistence strategy

6. **Continuous Deployment**:
   - Vercel will automatically deploy new changes when you push to your main branch 