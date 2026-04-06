-- Create treatments table
CREATE TABLE IF NOT EXISTS "treatments" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "category" VARCHAR(100),
  "short_description" TEXT,
  "long_description" TEXT,
  "image_url" VARCHAR(255),
  "sections" JSONB,
  "faqs" JSONB,
  "status" VARCHAR(20) DEFAULT 'active',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data
INSERT INTO "treatments" (
  "name", 
  "category", 
  "short_description", 
  "long_description", 
  "image_url", 
  "status", 
  "sections", 
  "faqs"
) VALUES 
(
  'Low Back Pain (Backache)', 
  'Bone & Spine', 
  'Comprehensive homeopathic treatment for chronic and acute low back pain, targeting the root cause naturally.', 
  'Experience a natural way to heal your back. Our specialized homeopathic remedies target inflammation and strengthen spinal health without side effects.', 
  'https://images.unsplash.com/photo-1588636746830-6784570076a9?q=80&w=2671&auto=format&fit=crop', 
  'active', 
  '[{"title": "Understanding Low Back Pain", "type": "text", "content": "Low back pain is incredibly common, affecting people from all walks of life. The lumbar spine supports your weight and ensures flexibility."}]', 
  '[{"question": "Can homeopathy provide long-term relief?", "answer": "Yes, by addressing the root cause such as spinal inflammation or nerve compression."}]'
),
(
  'Kidney Stones', 
  'Renal Care', 
  'Holistic homeopathic treatment for all stages of kidney stones, offering natural relief and prevention of recurrence.', 
  'Gentle yet powerful treatment for kidney stones. Our remedies help in natural stone passage and prevent future occurrences.', 
  'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?q=80&w=2612&auto=format&fit=crop', 
  'active', 
  '[]', 
  '[]'
),
(
  'Spondylitis', 
  'Bone & Spine', 
  'Lasting relief from spondylitis through personalized homeopathic care and inflammation management.', 
  'Restore your mobility and find lasting relief from spinal stiffness. We focus on long-term spinal health.', 
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2640&auto=format&fit=crop', 
  'active', 
  '[]', 
  '[]'
),
(
  'Thyroid Disorders', 
  'Hormonal', 
  'Expert care for thyroid conditions using individualized homeopathic treatment plans for hormonal balance.', 
  'Natural hormonal balance for your thyroid. We provide specialized care to regulate your glands function.', 
  'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=2670&auto=format&fit=crop', 
  'active', 
  '[]', 
  '[]'
);
