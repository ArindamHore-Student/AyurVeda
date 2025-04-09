// This script ensures the DATABASE_URL is set before starting Prisma Studio
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to validate SQLite database path
function validateSQLiteUrl(url) {
  if (!url.startsWith('file:')) return false;
  
  // Extract the file path from the URL
  const filePath = url.replace(/^file:/i, '');
  
  // Normalize path handling
  const normalizedPath = filePath.replace(/\\/g, '/').replace(/^\.\//, '');
  
  // Check if it's an absolute path
  if (path.isAbsolute(normalizedPath)) {
    return fs.existsSync(normalizedPath);
  } else {
    // Try relative to current directory
    const absolutePath = path.join(__dirname, normalizedPath);
    return fs.existsSync(absolutePath);
  }
}

try {
  // Read .env.local file and set environment variables
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    // Parse and set environment variables
    for (const line of envLines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const match = trimmedLine.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          process.env[key] = value;
          console.log(`Set environment variable: ${key}`);
        }
      }
    }
  } else {
    console.log('.env.local file not found, setting default DATABASE_URL');
    // Set default DATABASE_URL if .env.local doesn't exist
    process.env.DATABASE_URL = `file:${path.join(__dirname, 'prisma', 'dev.db')}`;
  }
  
  // Ensure DATABASE_URL is valid
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not found in env file, using default');
    process.env.DATABASE_URL = `file:${path.join(__dirname, 'prisma', 'dev.db')}`;
  }
  
  // Validate the database path
  if (process.env.DATABASE_URL.startsWith('file:')) {
    if (!validateSQLiteUrl(process.env.DATABASE_URL)) {
      console.warn(`WARNING: Database file does not exist at ${process.env.DATABASE_URL}`);
      console.log('Creating a new database...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    }
  }
  
  console.log(`Using DATABASE_URL: ${process.env.DATABASE_URL}`);
  
  // Start Prisma Studio
  execSync('npx prisma studio', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting Prisma Studio:', error);
  process.exit(1);
} 