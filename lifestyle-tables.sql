-- Life Style tables
CREATE TABLE IF NOT EXISTS lifestyle (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lifestyle_options (
    id SERIAL PRIMARY KEY,
    lifestyle_id INTEGER REFERENCES lifestyle(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patient_lifestyle (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    lifestyle_id INTEGER NOT NULL,
    lifestyle_option_id INTEGER NOT NULL,
    category_title VARCHAR(255) NOT NULL,
    option_title VARCHAR(255) NOT NULL,
    location_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patient_lifestyle_patient_id ON patient_lifestyle (patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_lifestyle_lifestyle_id ON patient_lifestyle (lifestyle_id);

-- Insert sample data
INSERT INTO lifestyle (id, title, description) VALUES
(1, 'Activity Level', 'Physical activity and fitness level'),
(2, 'Work Environment', 'Work-related lifestyle factors'),
(3, 'Stress Level', 'Stress management and levels'),
(4, 'Social Life', 'Social interactions and relationships'),
(5, 'Hobbies', 'Recreational activities and interests')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lifestyle_options (id, lifestyle_id, title) VALUES
(1, 1, 'Sedentary'),
(2, 1, 'Active'),
(3, 1, 'Moderate'),
(4, 1, 'Very Active'),
(5, 2, 'Office Work'),
(6, 2, 'Physical Labor'),
(7, 2, 'Remote Work'),
(8, 2, 'Field Work'),
(9, 3, 'Low Stress'),
(10, 3, 'Moderate Stress'),
(11, 3, 'High Stress'),
(12, 3, 'Chronic Stress'),
(13, 4, 'Very Social'),
(14, 4, 'Moderately Social'),
(15, 4, 'Introverted'),
(16, 5, 'Sports'),
(17, 5, 'Reading'),
(18, 5, 'Music'),
(19, 5, 'Travel')
ON CONFLICT (id) DO NOTHING;