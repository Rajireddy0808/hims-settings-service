CREATE TABLE user_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO user_types (name, code, description) VALUES
('Call Center', 'cc', 'Call center executive'),
('Call Center Lead', 'ccl', 'Call center team lead'),
('Customer Relations Officer', 'cro', 'Customer relations officer'),
('Doctor', 'doctor', 'Medical doctor'),
('Staff', 'staff', 'General staff member');