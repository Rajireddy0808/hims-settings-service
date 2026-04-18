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

async function seedAdenomyosis() {
  const sections = JSON.stringify([
    {
      title: "Understanding Adenomyosis",
      type: "text",
      content: "Adenomyosis is a complex gynecological condition where the endometrial tissue, which normally lines the uterus, grows into the muscular wall of the uterus. This causes the uterine walls to thicken, leading to pain and heavy menstrual cycles. In homeopathy, we view this as a systemic hormonal and inflammatory imbalance that can be corrected through constitutional remedies."
    },
    {
      title: "Primary Symptoms",
      type: "list",
      content: "Heavy menstrual bleeding (Menorrhagia), Severe menstrual cramping (Dysmenorrhea), Chronic pelvic pain, Pressure in the lower abdomen, Bloating, Pain during intercourse."
    },
    {
      title: "The Homeopathic Approach to Healing",
      type: "text",
      content: "Conventional treatments often suggest hormone therapy or hysterectomy. Homeopathy offers a non-surgical alternative by regulating the body's natural hormonal cycle and reducing uterine inflammation. Our specialized medicines work on the 'Constitutional' level, meaning we address your body's specific response to the condition to provide long-term relief."
    }
  ]);

  const faqs = JSON.stringify([
    {
       question: "Is surgery (hysterectomy) the only option?",
       answer: "No. Many of our patients successfully avoid surgery through consistent homeopathic treatment which reduces the thickening of the uterine wall and manages symptoms naturally."
    },
    {
       question: "Is the treatment safe for all ages?",
       answer: "Yes, homeopathic remedies are 100% natural and safe for women of all ages, from puberty to menopause, without any side effects."
    },
    {
       question: "How soon can I expect relief from pain?",
       answer: "Most patients report a significant reduction in menstrual pain and bleeding within the first 2-3 cycles of starting our constitutional treatment."
    }
  ]);

  const longDescription = "Find natural, non-surgical relief from Adenomyosis. Our constitutional homeopathic treatments target uterine inflammation and hormonal imbalance to restore your health naturally and permanently.";

  try {
    console.log('🚀 Seeding Adenomyosis content...');
    const query = `
      UPDATE treatments 
      SET 
        long_description = $1, 
        sections = $2, 
        faqs = $3,
        slug = COALESCE(slug, 'adenomyosis')
      WHERE name ILIKE '%Adenomyosis%'
    `;
    
    const result = await pool.query(query, [longDescription, sections, faqs]);
    
    if (result.rowCount > 0) {
      console.log('✅ Adenomyosis updated successfully!');
    } else {
      console.log('⚠️ Adenomyosis treatment not found in database. Please check the name.');
    }
  } catch (error) {
    console.error('❌ Error updating Adenomyosis:', error.message);
  } finally {
    await pool.end();
  }
}

seedAdenomyosis();
