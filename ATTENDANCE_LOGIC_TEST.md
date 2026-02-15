# Doctor Availability Logic Test

## Updated Logic Implementation

The doctor availability status is now determined based on the latest attendance record's checkout status:

### Logic Rules:
1. **If latest attendance record has `checkOut` time (not null/empty)**: 
   - Doctor status = "Not Available"
   - `isCheckedIn` = false

2. **If latest attendance record has `checkOut` as null/empty**:
   - Doctor status = `availableStatus` from attendance record (or "Available" if null)
   - `isCheckedIn` = true (if status is "Present")

### Code Changes Made:

#### Backend (queue.service.ts):
```typescript
// Added checkOut field to doctor data
attendance_checkOut: latestAttendance?.checkOut,

// Updated availability logic
let availabilityStatus = 'Not Available';
if (doctor.attendance_status === 'Present') {
  // If latest record has checkout time, doctor is not available
  // If checkout is null/empty, use the available status
  availabilityStatus = doctor.attendance_checkOut ? 'Not Available' : (doctor.attendance_availableStatus || 'Available');
}

// Updated isCheckedIn logic
isCheckedIn: doctor.attendance_status === 'Present' && !doctor.attendance_checkOut,
```

#### Frontend (page.tsx):
- Added support for "not available" status in color mappings
- Status handling already supports the updated logic

### Test Scenarios:

1. **Doctor checked in, no checkout**: Shows as Available/Consulting based on availableStatus
2. **Doctor checked in, then checked out**: Shows as "Not Available"
3. **Doctor not checked in**: Shows as "Not Available"
4. **Doctor checked in with specific status**: Shows the specific status (Available, Consulting, etc.)

### Database Schema Reference:
- `attendance.check_out`: TIME field, nullable
- `attendance.available_status`: VARCHAR(50), nullable
- `attendance.status`: VARCHAR(50), default 'Present'