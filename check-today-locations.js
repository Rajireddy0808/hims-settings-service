const { Client } = require('pg');

const client = new Client({
  host: 'unicare-1.cjioaoua8wgw.eu-north-1.rds.amazonaws.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'web1234U',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkLocationFiltering() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Distribution of today's records by location_id
    const res = await client.query(`
      SELECT location_id, COUNT(*) as count 
      FROM patient_examination 
      WHERE created_at >= $1
      GROUP BY location_id
      ORDER BY location_id
    `, [today]);
    
    console.log(`\n=== Distribution of Today's Records (${today}) ===`);
    console.table(res.rows);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkLocationFiltering();
