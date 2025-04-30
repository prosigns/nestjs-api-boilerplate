#!/usr/bin/env node

/**
 * Script to quickly switch between database types
 * Usage: node scripts/switch-db.js [postgres|mongodb|mysql|supabase]
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Parse command line arguments
const args = process.argv.slice(2);
const dbType = args[0]?.toLowerCase();

if (!dbType || !['postgres', 'mongodb', 'mysql', 'supabase'].includes(dbType)) {
  console.error('Please specify a valid database type: postgres, mongodb, mysql, or supabase');
  process.exit(1);
}

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
let envConfig = {};

try {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envConfig = dotenv.parse(envFile);
} catch (err) {
  console.error('Error reading .env file, creating a new one');
}

// Update the database type
envConfig.DATABASE_TYPE = dbType;

// Ensure other required variables exist
switch (dbType) {
  case 'postgres':
    if (!envConfig.DATABASE_URL) {
      envConfig.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/api';
    }
    break;
  case 'mongodb':
    if (!envConfig.MONGODB_URI) {
      envConfig.MONGODB_URI = 'mongodb://root:password@localhost:27017/api';
    }
    break;
  case 'mysql':
    if (!envConfig.MYSQL_HOST) {
      envConfig.MYSQL_HOST = 'localhost';
      envConfig.MYSQL_PORT = '3306';
      envConfig.MYSQL_USERNAME = 'root';
      envConfig.MYSQL_PASSWORD = 'password';
      envConfig.MYSQL_DATABASE = 'api';
      envConfig.MYSQL_SYNCHRONIZE = 'true';
    }
    break;
  case 'supabase':
    if (!envConfig.SUPABASE_URL) {
      envConfig.SUPABASE_URL = 'https://your-project-ref.supabase.co';
      envConfig.SUPABASE_KEY = 'your-supabase-anon-key';
    }
    break;
}

// Write updated config back to .env file
const envContent = Object.entries(envConfig)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync(envPath, envContent);

console.log(`Database type switched to ${dbType}`);
console.log('Please restart your application for changes to take effect.');

// Add instructions for additional setup
switch (dbType) {
  case 'postgres':
    console.log('\nFor PostgreSQL with Prisma, make sure to:');
    console.log('1. Run: npx prisma generate');
    console.log('2. Run: npx prisma migrate dev');
    break;
  case 'mongodb':
    console.log('\nFor MongoDB, make sure MongoDB is running');
    break;
  case 'mysql':
    console.log('\nFor MySQL, make sure MySQL server is running and the database is created');
    break;
  case 'supabase':
    console.log('\nFor Supabase, update your .env file with:');
    console.log('- SUPABASE_URL: Your Supabase project URL');
    console.log('- SUPABASE_KEY: Your Supabase anon key');
    break;
} 