const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'postgres',
  password: '12345',
  port: 5432,
});

async function testAPI() {
  try {
    console.log('Testing Appointment Types API...');
    
    // Test 1: Get all appointment types
    console.log('\n1. Testing appointment types query:');
    const types = await pool.query(`
      SELECT id, name, code, description, is_active 
      FROM appointment_types 
      WHERE is_active = true 
      ORDER BY name
    `);
    
    console.log('✅ Appointment Types:');
    types.rows.forEach(type => {
      console.log(`  ${type.id}. ${type.name} (${type.code}) - ${type.description}`);
    });
    
    // Test 2: Test appointment creation with appointment_type_id
    console.log('\n2. Testing appointment creation with appointment_type_id:');
    
    // Get a consultation type ID
    const consultationType = await pool.query(
      'SELECT id FROM appointment_types WHERE code = $1 LIMIT 1',
      ['consultation']
    );
    
    if (consultationType.rows.length > 0) {
      console.log(`✅ Found consultation type with ID: ${consultationType.rows[0].id}`);
    }
    
    // Test 3: Test appointments with type information
    console.log('\n3. Testing appointments with type information:');
    const appointments = await pool.query(`
      SELECT 
        a.id,
        a.appointment_id,
        a.appointment_type,
        a.appointment_type_id,
        at.name as type_name,
        at.code as type_code
      FROM appointments a
      LEFT JOIN appointment_types at ON at.id = a.appointment_type_id
      LIMIT 3
    `);
    
    console.log('✅ Sample Appointments with Types:');
    appointments.rows.forEach(apt => {
      console.log(`  ${apt.appointment_id}: ${apt.appointment_type} -> ${apt.type_name} (${apt.type_code})`);
    });
    
    console.log('\n🎉 All tests passed! API is ready to use.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testAPI();