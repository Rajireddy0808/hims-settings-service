-- Medical History tables only
CREATE TABLE IF NOT EXISTS medical_history (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_history_options (
    id SERIAL PRIMARY KEY,
    medical_history_id INTEGER REFERENCES medical_history(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patient_medical_history (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    medical_history_id INTEGER NOT NULL,
    medical_history_option_id INTEGER NOT NULL,
    category_title VARCHAR(255) NOT NULL,
    option_title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patient_medical_history_patient_id ON patient_medical_history (patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_medical_history_medical_history_id ON patient_medical_history (medical_history_id);

-- Insert sample data
INSERT INTO medical_history (id, title, description) VALUES
(1, 'Birth History', 'Birth related medical history'),
(2, 'Cardiovascular History', 'Heart and blood vessel related history'),
(3, 'Child Past History', 'Childhood medical history'),
(4, 'Hormonal Disorders', 'Endocrine system disorders'),
(5, 'Infections History', 'Previous infections and treatments')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_history_options (id, medical_history_id, title) VALUES
(1, 1, 'PREMATURE BORN'),
(2, 1, 'AMNIOTIC FLUID ASPIRATION'),
(3, 1, 'BIRTH CRY DELAYED'),
(4, 1, 'BIRTH CRY NORMAL'),
(5, 1, 'CHILD CONCEIVED BY IUI'),
(6, 1, 'CHILD CONCEIVED BY IVF'),
(7, 1, 'CONSANGUINEOUS'),
(8, 1, 'CORD AROUND THE NECK'),
(9, 1, 'DELIVERY-CESAREAN SECTION'),
(10, 2, 'HYPERTENSION'),
(11, 2, 'HEART ATTACK'),
(12, 2, 'ARRHYTHMIA'),
(13, 2, 'HEART MURMUR'),
(14, 3, 'CHILDHOOD ASTHMA'),
(15, 3, 'ALLERGIES'),
(16, 3, 'FREQUENT INFECTIONS'),
(17, 4, 'DIABETES TYPE 1'),
(18, 4, 'DIABETES TYPE 2'),
(19, 4, 'THYROID DISORDER'),
(20, 5, 'TUBERCULOSIS'),
(21, 5, 'HEPATITIS'),
(22, 5, 'MALARIA')
ON CONFLICT (id) DO NOTHING;