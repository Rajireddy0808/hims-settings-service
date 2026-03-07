const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
    host: 'unicare-1.cjioaoua8wgw.eu-north-1.rds.amazonaws.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'web1234U'
});

const email = 'polojusrinaiah2020@gmail.com';
const password = 'haara123';

async function checkLogin() {
    console.log('Connecting to database...');
    const client = await pool.connect();

    try {
        console.log('Searching for patient with email:', email);
        const res = await client.query('SELECT * FROM patients WHERE email = $1', [email.toLowerCase()]);

        if (res.rows.length === 0) {
            console.log('No patient found with email:', email);

            // Let's check if there's any patient at all or if the email is slightly different
            const allPatients = await client.query('SELECT email FROM patients LIMIT 10');
            console.log('First 10 patient emails in database:', allPatients.rows.map(r => r.email));
            return;
        }

        const patient = res.rows[0];
        console.log('Patient found:');
        console.log('ID:', patient.id);
        console.log('Email:', patient.email);
        console.log('Password (hashed):', patient.password);
        console.log('Patient ID (from DB):', patient.patient_id);

        if (!patient.password) {
            console.log('Patient has no password set (not registered for portal access).');
            return;
        }

        const testHash = crypto.createHash('md5').update(password).digest('hex');
        console.log('Hash for input password:', testHash);

        if (patient.password === testHash) {
            console.log('Password matches!');
        } else {
            console.log('Password does not match.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

checkLogin();
