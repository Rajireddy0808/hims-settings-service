@echo off
echo Running call history table migration...
psql -h localhost -U postgres -d hims_db -f create-call-history-table.sql
echo Migration completed!
pause