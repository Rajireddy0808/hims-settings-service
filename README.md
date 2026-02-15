# Settings Service

HIMS Settings Service API running on port 3002

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run PostgreSQL migration:
```sql
-- Run the SQL from: frontend/database/migrations/complete_tables.sql
```

3. Start the service:
```bash
npm run dev
```

## API Endpoints

- `GET /api/medical-history` - Get all medical history categories
- `GET /api/medical-history-options/:id` - Get options for specific category
- `POST /api/patient-medical-history` - Save patient medical history selection
- `DELETE /api/patient-medical-history` - Remove patient medical history selection

## Database Configuration

- Host: 127.0.0.1
- Port: 5432
- User: postgres
- Password: 12345
- Database: postgres