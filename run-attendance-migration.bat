@echo off
echo Running Attendance Table Migration...

set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=hims_db
set DB_USER=postgres

echo Connecting to database %DB_NAME% on %DB_HOST%:%DB_PORT%...

psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f update-attendance-table.sql

if %ERRORLEVEL% EQU 0 (
    echo Migration completed successfully!
) else (
    echo Migration failed with error code %ERRORLEVEL%
)

pause