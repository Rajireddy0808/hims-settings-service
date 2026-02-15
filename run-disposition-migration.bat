@echo off
echo Running disposition column migration...
psql -h localhost -U postgres -d hims_settings -f add-disposition-column.sql
echo Migration completed!
pause