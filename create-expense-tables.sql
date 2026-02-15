-- Create expense categories table
CREATE TABLE IF NOT EXISTS expense_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create employee expenses table
CREATE TABLE IF NOT EXISTS employee_expenses (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES users(id),
    expense_category_id INTEGER NOT NULL REFERENCES expense_categories(id),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    receipt VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default expense categories
INSERT INTO expense_categories (name) VALUES 
('ACCOMMODATION EXPENSES'),
('ADVERTISEMENT & BUSINESS PROMOTIONS'),
('AUTISM VISIT EXPENSES'),
('AUTO CHARGES –CASH DEPOSIT TO BANK'),
('AUTO CHARGES'),
('CAMP EXPENSES'),
('CLEANING EXPENSES'),
('COMPUTER MONITOR PURCHASE'),
('COMPUTER REPAIR EXPENSES'),
('CONSULTANCY CHARGES'),
('CONVEYANCE CHARGES'),
('COURIER CHARGES'),
('CURRENT BILLS'),
('DONATIONS'),
('ELECTRICAL REPAIR EXPENSES'),
('ELECTRICITY CHARGES'),
('FESTIVAL CHARGES'),
('GARBAGE CHARGES'),
('HAMALI CHARGES'),
('HOUSE KEEPING MATERIAL'),
('INTERNET CHARGES'),
('LOCAL MEDICINE PURCHASE'),
('LUNCH EXPENSES'),
('MAINTENANCE CHARGES'),
('MEDICAL CAMP EXPENSES'),
('MEDICINE TRANSPORT CHARGES'),
('MISCELLANEOUS EXPENSES'),
('NEWS PAPER & PERIODICALS'),
('OFFICE MAINTENANCE'),
('OFFICE RENT'),
('PACKING EXP'),
('PAMPHLET EXPENSES'),
('PAMPHLET DISTRIBUTION CHARGES'),
('PATIENT REFUND'),
('PETROL & DIESEL EXPENSES'),
('POOJA EXPENSES'),
('PRINTING & STATIONARY EXPENSES'),
('REPAIRS & MAINTENANCE EXPENSES'),
('SPOT INCENTIVES'),
('SR DOCTOR VISIT EXPENSES'),
('STAFF WELFARE EXPENSE'),
('TELEPHONE CHARGES'),
('TRAVELLING EXPENSES'),
('TV SHOW EXPENSES'),
('EMPLOYEES SALARIES'),
('CLINIC RENT')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employee_expenses_employee_id ON employee_expenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_expenses_status ON employee_expenses(status);
CREATE INDEX IF NOT EXISTS idx_employee_expenses_expense_date ON employee_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_employee_expenses_category_id ON employee_expenses(expense_category_id);