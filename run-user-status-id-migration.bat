@echo off
echo Running user_status_id migration...
psql -h localhost -U postgres -d hims_user_settings -f add-user-status-id-to-attendance.sql
echo Migration completed!
pause