@echo off
for /f "delims=" %%x in (.env) do (set "%%x")
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USERNAME% -d %DB_DATABASE% -f add-color-code-column.sql
pause