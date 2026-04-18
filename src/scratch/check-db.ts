import { Client } from 'pg';

async function checkTable() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'postgres',
    });

    try {
        await client.connect();
        const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'google_reviews';`);
        console.log('Table exists:', res.rows.length > 0);
        if (res.rows.length > 0) {
            const columns = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'google_reviews';`);
            console.log('Columns:', columns.rows);
        }
    } catch (err) {
        console.error('Error connecting to DB:', err);
    } finally {
        await client.end();
    }
}

checkTable();
