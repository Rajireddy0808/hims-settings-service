@echo off
echo Creating Attendance Table...

set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=hims_db
set DB_USER=postgres

echo Connecting to database %DB_NAME% on %DB_HOST%:%DB_PORT%...

psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f create-attendance-table-new.sql

if %ERRORLEVEL% EQU 0 (
    echo Attendance table created successfully!
) else (
    echo Table creation failed with error code %ERRORLEVEL%
)

pause