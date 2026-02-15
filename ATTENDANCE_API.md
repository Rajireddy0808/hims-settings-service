# Attendance API Documentation

## Overview
The Attendance API provides endpoints to manage employee attendance records in the HIMS system with support for multiple check-ins/check-outs per day and automatic duration calculation.

## Database Schema
The attendance table includes the following columns:
- `id` (Primary Key)
- `user_id` (Foreign Key to users table)
- `location_id` (Foreign Key to locations table)
- `date` (Date of attendance)
- `check_in` (Check-in time)
- `check_out` (Check-out time)
- `duration` (Duration in minutes between check-in and check-out)
- `status` (Attendance status: Present, Absent, Late, etc.)
- `remarks` (Additional notes or remarks)
- `leave_status` (Leave status if applicable)
- `created_at` (Record creation timestamp)
- `updated_at` (Record update timestamp)

## API Endpoints

### 1. Dynamic Check-In/Check-Out
- **POST** `/settings/attendance/check-in-out`
- **Body**: CheckInOutDto
```json
{
  "userId": 1,
  "locationId": 1,
  "type": "check-in"
}
```

### 2. Create Attendance Record
- **POST** `/settings/attendance`
- **Body**: CreateAttendanceDto
```json
{
  "userId": 1,
  "locationId": 1,
  "date": "2024-01-15",
  "checkIn": "09:00:00",
  "checkOut": "17:00:00",
  "status": "Present",
  "remarks": "Regular attendance"
}
```

### 3. Get All Attendance Records
- **GET** `/settings/attendance`
- **Query Parameters**:
  - `locationId` (optional): Filter by location
  - `userId` (optional): Filter by user
  - `date` (optional): Filter by specific date

### 4. Get User Today's Attendance
- **GET** `/settings/attendance/user/:userId/today?locationId=1`

### 5. Get Total Duration
- **GET** `/settings/attendance/user/:userId/duration?locationId=1&date=2024-01-15`

### 6. Get Attendance Record by ID
- **GET** `/settings/attendance/:id`

### 7. Update Attendance Record
- **PATCH** `/settings/attendance/:id`
- **Body**: UpdateAttendanceDto
```json
{
  "checkOut": "18:00:00",
  "remarks": "Worked overtime",
  "status": "Present"
}
```

### 8. Delete Attendance Record
- **DELETE** `/settings/attendance/:id`

## Features
- **Multiple Check-ins/Check-outs**: Users can check in and out multiple times per day
- **Automatic Duration Calculation**: System calculates duration in minutes between check-in and check-out
- **Location-based Storage**: All attendance data is stored with global location_id
- **Real-time Tracking**: Dynamic check-in/check-out endpoints for frontend integration

## Setup Instructions

1. Run the database migration:
   ```bash
   cd backend/settings-service
   run-attendance-migration.bat
   ```

2. Start the service:
   ```bash
   npm run start:dev
   ```

3. The API will be available at: `http://localhost:3001/settings/attendance`

## Authentication
All endpoints require JWT authentication. Include the Bearer token in the Authorization header.

## Usage Examples

### Frontend Integration
```javascript
// Check-in
const checkIn = await fetch('/settings/attendance/check-in-out', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
  body: JSON.stringify({ userId: 1, locationId: 1, type: 'check-in' })
});

// Check-out
const checkOut = await fetch('/settings/attendance/check-in-out', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
  body: JSON.stringify({ userId: 1, locationId: 1, type: 'check-out' })
});
```