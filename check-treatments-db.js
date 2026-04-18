const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/hims_settings'
});

async function checkTreatments() {
  try {
    await client.connect();
    const res = await client.query('SELECT name, image_url FROM treatments');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkTreatments();
