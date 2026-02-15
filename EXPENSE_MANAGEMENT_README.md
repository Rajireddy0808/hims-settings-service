# Employee Expense Management System

This system allows employees to submit expense applications and administrators to review and approve them.

## Features

### Employee Features
- Submit expense applications with categories
- Track expense status (pending, approved, rejected, paid)
- View expense history
- Delete pending expenses

### Admin Features
- Review all employee expenses
- Approve or reject expenses with reasons
- Filter expenses by status, category, employee
- View expense summaries and statistics

## Expense Categories

The system includes 46 predefined expense categories:
- ACCOMMODATION EXPENSES
- ADVERTISEMENT & BUSINESS PROMOTIONS
- AUTISM VISIT EXPENSES
- AUTO CHARGES –CASH DEPOSIT TO BANK
- AUTO CHARGES
- CAMP EXPENSES
- CLEANING EXPENSES
- COMPUTER MONITOR PURCHASE
- COMPUTER REPAIR EXPENSES
- CONSULTANCY CHARGES
- CONVEYANCE CHARGES
- COURIER CHARGES
- CURRENT BILLS
- DONATIONS
- ELECTRICAL REPAIR EXPENSES
- ELECTRICITY CHARGES
- FESTIVAL CHARGES
- GARBAGE CHARGES
- HAMALI CHARGES
- HOUSE KEEPING MATERIAL
- INTERNET CHARGES
- LOCAL MEDICINE PURCHASE
- LUNCH EXPENSES
- MAINTENANCE CHARGES
- MEDICAL CAMP EXPENSES
- MEDICINE TRANSPORT CHARGES
- MISCELLANEOUS EXPENSES
- NEWS PAPER & PERIODICALS
- OFFICE MAINTENANCE
- OFFICE RENT
- PACKING EXP
- PAMPHLET EXPENSES
- PAMPHLET DISTRIBUTION CHARGES
- PATIENT REFUND
- PETROL & DIESEL EXPENSES
- POOJA EXPENSES
- PRINTING & STATIONARY EXPENSES
- REPAIRS & MAINTENANCE EXPENSES
- SPOT INCENTIVES
- SR DOCTOR VISIT EXPENSES
- STAFF WELFARE EXPENSE
- TELEPHONE CHARGES
- TRAVELLING EXPENSES
- TV SHOW EXPENSES
- EMPLOYEES SALARIES
- CLINIC RENT

## Setup Instructions

### 1. Database Setup
Run the database migration to create the required tables:
```bash
cd hims/backend/settings-service
run-expense-migration.bat
```

### 2. Backend Setup
The expense management APIs are integrated into the existing settings service. No additional setup required.

### 3. Frontend Setup
The UI components are created in:
- Employee expense page: `/admin/expenses/employee`
- Admin management page: `/admin/expenses/management`

### 4. API Endpoints

#### Expense Categories
- `GET /expense-categories` - Get all active categories
- `POST /expense-categories` - Create new category
- `POST /expense-categories/seed` - Seed default categories

#### Employee Expenses
- `GET /employee-expenses` - Get current user's expenses
- `GET /employee-expenses/all` - Get all expenses (admin only)
- `GET /employee-expenses/summary` - Get expense summary
- `POST /employee-expenses` - Create new expense
- `PUT /employee-expenses/:id/status` - Update expense status
- `DELETE /employee-expenses/:id` - Delete expense (pending only)

## Usage

### For Employees
1. Navigate to `/admin/expenses/employee`
2. Click "New Expense" to submit an expense
3. Fill in the required details:
   - Select expense category
   - Enter amount
   - Select expense date
   - Add description and receipt number
4. Submit the expense
5. Track status in the expense history table

### For Administrators
1. Navigate to `/admin/expenses/management`
2. View all employee expenses with filters
3. Use the action buttons to:
   - View expense details
   - Approve expenses
   - Reject expenses with reasons
4. Monitor expense statistics in the summary cards

## Database Schema

### expense_categories
- id (Primary Key)
- name (Unique)
- description
- is_active
- created_at
- updated_at

### employee_expenses
- id (Primary Key)
- employee_id (Foreign Key to users)
- expense_category_id (Foreign Key to expense_categories)
- amount
- description
- expense_date
- receipt
- status (pending/approved/rejected/paid)
- approved_by (Foreign Key to users)
- approved_at
- rejection_reason
- created_at
- updated_at

## Testing

Use the test script to verify API functionality:
```bash
node test-expense-apis.js
```

Make sure to replace the JWT token in the test script with a valid token.

## Security

- All endpoints require JWT authentication
- Employees can only view/modify their own expenses
- Only pending expenses can be deleted by employees
- Admin approval required for expense status changes