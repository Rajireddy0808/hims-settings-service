-- Drop table if it partially exists to ensure clean state
DROP TABLE IF EXISTS "blogs" CASCADE;

-- Create blogs table
CREATE TABLE IF NOT EXISTS "blogs" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(500) UNIQUE NOT NULL,
  "excerpt" TEXT,
  "content" TEXT,
  "image_url" VARCHAR(255),
  "author" VARCHAR(100),
  "status" VARCHAR(20) DEFAULT 'active',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial blogs data
INSERT INTO "blogs" ("title", "excerpt", "content", "image_url", "status")
VALUES 
('Homeopathy Treatment for Tuberculosis: A Comprehensive Supportive Approach', 'Tuberculosis (TB) is a serious but treatable infectious disease that continues to affect millions worldwide...', 'Detailed content about TB and homeopathy approach...', 'https://drcarehomeopathy.com/wp-content/uploads/2026/03/Homeopathy-Treatment-for-Tuberculosis-A-Comprehensive-Supportive-Approach.webp', 'active'),
('Homeopathy for Kidney Stones: A Natural Path to Relief and Prevention', 'Dealing with the sharp, stabbing pain of a kidney stone can be an overwhelming experience...', 'Detailed content about kidney stones and homeopathy...', 'https://drcarehomeopathy.com/wp-content/uploads/2026/01/Kindey-Stones.jpeg', 'active'),
('Brain Tumors: Causes, Symptoms and Homeopathy Treatment', 'Understanding brain tumors and how holistic homeopathy treatment can support recovery and well-being...', 'Detailed content about brain tumors and homeopathy...', 'https://drcarehomeopathy.com/wp-content/uploads/2026/03/Artboard-18-3.png', 'active')
ON CONFLICT (title) DO NOTHING;
