@echo off
psql -U postgres -d postgres -f "src/migrations/drug-history-tables.sql"
pause