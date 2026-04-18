const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USERNAME || 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '12345',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_HOST && !process.env.DB_HOST.includes('localhost') && !process.env.DB_HOST.includes('127.0.0.1') 
    ? { rejectUnauthorized: false } 
    : false
});

async function seedThyroid() {
  const sections = JSON.stringify([
    {
      title: "Homeopathy Treatment For Thyroid Disorder",
      type: "text",
      content: "Thyroid disorders are a common health concern that impacts the metabolic rate of the body. Homeopathy offers a safe and effective alternative to conventional hormone replacement therapy. By focusing on the individual's unique physical and emotional makeup, constitutional homeopathy stimulates the body's self-healing mechanism to regulate thyroid function naturally."
    },
    {
      title: "Symptoms & Indicators",
      type: "list",
      content: "Hyperthyroidism: Rapid heartbeat, unexplained weight loss, increased appetite, nervousness, and tremors. Hypothyroidism: Persistent fatigue, weight gain, cold sensitivity, constipation, dry skin, and muscle weakness. Each patient's symptom profile is carefully analyzed to determine the best remedy."
    },
    {
      title: "The Unicare Genetic Approach",
      type: "text",
      content: "Our specialized treatment goes beyond symptom management. We delve deep into the genetic and environmental factors that trigger thyroid dysfunction. This tailored approach ensures that the immune system is balanced, helping the thyroid gland function at its optimum without the need for lifelong medication in many cases."
    }
  ]);

  const faqs = JSON.stringify([
    {
       question: "Will I have to take homeopathy for the rest of my life?",
       answer: "No. Unlike conventional hormone replacement, homeopathic treatment aims to correct the underlying imbalance. Once the thyroid function is stabilized and the body is balanced, treatment can often be tapered off."
    },
    {
       question: "Can I take homeopathy alongside my current thyroid medication?",
       answer: "Yes, homeopathy is safe to use alongside conventional treatments. Many of our patients start homeopathic care while on their current pills and gradually reduce them under medical supervision as their health improves."
    },
    {
       question: "Is there any specific diet to follow?",
       answer: "We provide personalized nutritional guidance, such as avoiding goitrogenic foods for some or ensuring adequate iodine intake for others, to complement your treatment."
    }
  ]);

  const longDescription = "Thyroid disorders affect the thyroid gland, a butterfly-shaped gland in the front of the neck. The thyroid has important roles to regulate numerous metabolic processes throughout the body. At Unicare Homeopathy, we provide constitutional treatment that targets the root cause of hormonal imbalance.";

  try {
    console.log('🚀 Seeding Thyroid Disorders content...');
    const query = `
      UPDATE treatments 
      SET 
        long_description = $1, 
        sections = $2, 
        faqs = $3 
      WHERE name = 'Thyroid Disorders'
    `;
    
    await pool.query(query, [longDescription, sections, faqs]);
    console.log('✅ Thyroid Disorders updated successfully!');
  } catch (error) {
    console.error('❌ Error updating thyroid:', error.message);
  } finally {
    await pool.end();
  }
}

seedThyroid();
