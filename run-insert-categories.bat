@echo off
echo Inserting expense categories...

set PGPASSWORD=your_password_here
psql -h localhost -U postgres -d hims -f insert-expense-categories.sql

if %ERRORLEVEL% EQU 0 (
    echo Categories inserted successfully!
) else (
    echo Failed to insert categories!
)

pause