@echo off
echo Running expense management database migration...

set PGPASSWORD=postgres
psql -h localhost -U postgres -d hims -f create-expense-tables.sql

if %ERRORLEVEL% EQU 0 (
    echo Migration completed successfully!
) else (
    echo Migration failed!
)

pause