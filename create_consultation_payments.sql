-- Create consultation_payments table
CREATE TYPE consultation_payments_payment_type_enum AS ENUM ('cash', 'card', 'upi');

CREATE TABLE consultation_payments (
    id SERIAL PRIMARY KEY,
    consultation_id INTEGER NOT NULL,
    payment_type consultation_payments_payment_type_enum NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);