@echo off
echo Creating medicine_days table...

cd /d "%~dp0"

node create-medicine-days-table.js

if %ERRORLEVEL% EQU 0 (
    echo Medicine days table created successfully!
) else (
    echo Failed to create medicine days table!
    pause
    exit /b 1
)

echo.
pause
