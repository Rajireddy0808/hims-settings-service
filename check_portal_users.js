const { Pool } = require('pg');

const pool = new Pool({
    host: 'unicare-1.cjioaoua8wgw.eu-north-1.rds.amazonaws.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'web1234U'
});

async function checkPatientsWithPasswords() {
    console.log('Connecting to database...');
    const client = await pool.connect();

    try {
        console.log('Searching for patients with portal access (passwords)...');
        const res = await client.query('SELECT id, email, patient_id, first_name, last_name FROM patients WHERE password IS NOT NULL LIMIT 5');

        if (res.rows.length === 0) {
            console.log('NO patients have passwords set. Portal login will not work for anyone until passwords are set in Admin.');
        } else {
            console.log('Patients with portal access found:', res.rows.length);
            res.rows.forEach(p => {
                console.log(`- ${p.first_name} ${p.last_name} (${p.email}) ID: ${p.patient_id}`);
            });
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

checkPatientsWithPasswords();
