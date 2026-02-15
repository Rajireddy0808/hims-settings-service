@echo off
echo Running User Status Table Migration...

REM Load environment variables
for /f "delims=" %%x in (.env) do (set "%%x")

REM Run the SQL file
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USERNAME% -d %DB_DATABASE% -f create-user-status-table.sql

echo User Status Table Migration completed!
pause