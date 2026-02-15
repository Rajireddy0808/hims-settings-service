-- Personal History tables
CREATE TABLE IF NOT EXISTS personal_history (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS personal_history_options (
    id SERIAL PRIMARY KEY,
    personal_history_id INTEGER REFERENCES personal_history(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patient_personal_history (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    personal_history_id INTEGER NOT NULL,
    personal_history_option_id INTEGER NOT NULL,
    category_title VARCHAR(255) NOT NULL,
    option_title VARCHAR(255) NOT NULL,
    location_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patient_personal_history_patient_id ON patient_personal_history (patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_personal_history_personal_history_id ON patient_personal_history (personal_history_id);

-- Insert sample data
INSERT INTO personal_history (id, title, description) VALUES
(1, 'Smoking', 'Smoking related history'),
(2, 'Alcohol', 'Alcohol consumption history'),
(3, 'Exercise', 'Physical activity and exercise habits'),
(4, 'Diet', 'Dietary habits and preferences'),
(5, 'Sleep', 'Sleep patterns and disorders')
ON CONFLICT (id) DO NOTHING;

INSERT INTO personal_history_options (id, personal_history_id, title) VALUES
(1, 1, 'Daily'),
(2, 1, 'Occasional'),
(3, 1, 'Former Smoker'),
(4, 1, 'Never Smoked'),
(5, 2, 'Daily'),
(6, 2, 'Social Drinker'),
(7, 2, 'Occasional'),
(8, 2, 'Never'),
(9, 3, 'Regular'),
(10, 3, 'Moderate'),
(11, 3, 'Sedentary'),
(12, 4, 'Vegetarian'),
(13, 4, 'Non-Vegetarian'),
(14, 4, 'Vegan'),
(15, 5, 'Good'),
(16, 5, 'Poor'),
(17, 5, 'Insomnia')
ON CONFLICT (id) DO NOTHING;