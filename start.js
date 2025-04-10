// This script ensures the DATABASE_URL is set before starting the app
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to validate SQLite database path
function validateSQLiteUrl(url) {
  if (!url.startsWith('file:')) return false;
  
  try {
    // Extract the file path from the URL
    let filePath = url.replace(/^file:/i, '');
    
    // Handle Windows file:// paths with drive letters
    if (/^\/[A-Za-z]:/.test(filePath)) {
      filePath = filePath.substring(1); // Remove leading slash for Windows paths
    }
    
    // Normalize path handling
    const normalizedPath = path.normalize(filePath);
    
    // Check if it's an absolute path
    if (path.isAbsolute(normalizedPath)) {
      return fs.existsSync(normalizedPath);
    } else {
      // Try relative to current directory
      const absolutePath = path.join(__dirname, normalizedPath);
      return fs.existsSync(absolutePath);
    }
  } catch (error) {
    console.error('Error validating SQLite path:', error);
    return false;
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
    console.log('.env.local file not found, checking .env file');
    // Try .env file as backup
    const envPath = path.join(__dirname, '.env');
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
      console.log('No environment file found, setting default DATABASE_URL');
      // Set default DATABASE_URL
      process.env.DATABASE_URL = `file:${path.join(__dirname, 'prisma', 'dev.db')}`;
    }
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
  
  // Start the dev server
  execSync('npx next dev', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting the application:', error);
  process.exit(1);
} 