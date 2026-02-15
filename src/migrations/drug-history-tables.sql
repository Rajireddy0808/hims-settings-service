-- Drug History Tables
CREATE TABLE IF NOT EXISTS drug_history (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drug_history_options (
    id SERIAL PRIMARY KEY,
    drug_history_id INTEGER REFERENCES drug_history(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patient_drug_history (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    drug_history_id INTEGER REFERENCES drug_history(id) ON DELETE CASCADE,
    drug_history_option_id INTEGER REFERENCES drug_history_options(id) ON DELETE CASCADE,
    category_title VARCHAR(255),
    option_title VARCHAR(255),
    location_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, drug_history_option_id, location_id)
);

-- Insert sample drug history categories
INSERT INTO drug_history (title, description) VALUES
('Antibiotics', 'Antibiotic medications'),
('Pain Killers', 'Pain management medications'),
('Blood Thinners', 'Anticoagulant medications'),
('Steroids', 'Corticosteroid medications'),
('Antidepressants', 'Mental health medications'),
('Heart Medications', 'Cardiovascular medications');

-- Insert sample drug history options
INSERT INTO drug_history_options (drug_history_id, title) VALUES
-- Antibiotics
(1, 'Current Use'),
(1, 'Past Use'),
(1, 'Allergic Reaction'),
(1, 'Never Used'),
-- Pain Killers
(2, 'Current Use'),
(2, 'Past Use'),
(2, 'Dependency History'),
(2, 'Never Used'),
-- Blood Thinners
(3, 'Current Use'),
(3, 'Past Use'),
(3, 'Bleeding Issues'),
(3, 'Never Used'),
-- Steroids
(4, 'Current Use'),
(4, 'Past Use'),
(4, 'Side Effects'),
(4, 'Never Used'),
-- Antidepressants
(5, 'Current Use'),
(5, 'Past Use'),
(5, 'Side Effects'),
(5, 'Never Used'),
-- Heart Medications
(6, 'Current Use'),
(6, 'Past Use'),
(6, 'Side Effects'),
(6, 'Never Used');