const { Client } = require('pg');

// Try to load dotenv but don't fail if missing
try {
  require('dotenv').config();
} catch (e) {
  console.log('Note: dotenv not found, using environment/fallback values');
}

const client = new Client({
  host: process.env.DB_HOST || 'unicare-1.cjioaoua8wgw.eu-north-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'web1234U',
  database: process.env.DB_NAME || 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database');

    // 1. Add slug column if it doesn't exist
    await client.query(`
      ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "slug" varchar(500) UNIQUE;
    `);
    console.log('Added slug column');

    // 2. Add short_description column if it doesn't exist, and copy from excerpt
    await client.query(`
      ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "short_description" text;
    `);
    await client.query(`
      UPDATE "blogs" SET "short_description" = "excerpt" WHERE "short_description" IS NULL AND "excerpt" IS NOT NULL;
    `);
    console.log('Added short_description column and copied data from excerpt');

    // 3. Add long_description column if it doesn't exist, and copy from content
    await client.query(`
      ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "long_description" text;
    `);
    await client.query(`
      UPDATE "blogs" SET "long_description" = "content" WHERE "long_description" IS NULL AND "content" IS NOT NULL;
    `);
    console.log('Added long_description column and copied data from content');

    // 4. Populate slugs if null
    const res = await client.query('SELECT id, title FROM "blogs" WHERE "slug" IS NULL');
    for (const row of res.rows) {
      const slug = row.title
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      await client.query('UPDATE "blogs" SET "slug" = $1 WHERE id = $2', [slug, row.id]);
    }
    console.log('Populated slugs');

    await client.end();
    console.log('Schema fix completed');
  } catch (err) {
    console.error('Error fixing schema:', err);
    process.exit(1);
  }
}

run();
