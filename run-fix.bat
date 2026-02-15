@echo off
echo Fixing database issues...
psql -h localhost -U postgres -d hims_db -f fix-database.sql
echo Database fixed!
pause