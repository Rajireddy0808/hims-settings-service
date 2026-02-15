-- Family History tables
CREATE TABLE IF NOT EXISTS family_history (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS family_history_options (
    id SERIAL PRIMARY KEY,
    family_history_id INTEGER REFERENCES family_history(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patient_family_history (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    family_history_id INTEGER NOT NULL,
    family_history_option_id INTEGER NOT NULL,
    category_title VARCHAR(255) NOT NULL,
    option_title VARCHAR(255) NOT NULL,
    location_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patient_family_history_patient_id ON patient_family_history (patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_family_history_family_history_id ON patient_family_history (family_history_id);

-- Insert sample data
INSERT INTO family_history (id, title, description) VALUES
(1, 'Diabetes', 'Family history of diabetes'),
(2, 'Hypertension', 'Family history of high blood pressure'),
(3, 'Heart Disease', 'Family history of cardiovascular conditions'),
(4, 'Cancer', 'Family history of cancer'),
(5, 'Mental Health', 'Family history of mental health conditions'),
(6, 'Genetic Disorders', 'Family history of genetic conditions')
ON CONFLICT (id) DO NOTHING;

INSERT INTO family_history_options (id, family_history_id, title) VALUES
(1, 1, 'Father'),
(2, 1, 'Mother'),
(3, 1, 'Sibling'),
(4, 1, 'Grandparent'),
(5, 2, 'Father'),
(6, 2, 'Mother'),
(7, 2, 'Sibling'),
(8, 2, 'Grandparent'),
(9, 3, 'Father'),
(10, 3, 'Mother'),
(11, 3, 'Sibling'),
(12, 3, 'Grandparent'),
(13, 4, 'Father'),
(14, 4, 'Mother'),
(15, 4, 'Sibling'),
(16, 4, 'Grandparent'),
(17, 5, 'Father'),
(18, 5, 'Mother'),
(19, 5, 'Sibling'),
(20, 6, 'Father'),
(21, 6, 'Mother'),
(22, 6, 'Sibling')
ON CONFLICT (id) DO NOTHING;