CREATE TABLE IF NOT EXISTS patient_diet_charts (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    chart_no BOOLEAN DEFAULT FALSE,
    chart_title VARCHAR(100),
    chart_title_specific VARCHAR(100),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);