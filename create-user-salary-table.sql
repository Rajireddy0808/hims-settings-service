CREATE TABLE IF NOT EXISTS user_salary_details (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  salary_amount DECIMAL(10, 2) NOT NULL,
  joining_date DATE NOT NULL,
  next_hike_date DATE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
