import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function migrate() {
  try {
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'postgres',
      entities: [__dirname + '/src/entities/*.entity{.ts,.js}'],
      ssl: { rejectUnauthorized: false },
    });

    console.log('Connected to database. Adding slug column...');
    
    // Add slug column to treatments table
    await connection.query('ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(255) UNIQUE');
    
    console.log('Column "slug" added successfully to "treatments" table.');

    await connection.close();
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

migrate();
