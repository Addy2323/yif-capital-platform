@echo off
:: Production Sync Script for Windows servers
:: Pointing to yifcapital.co.tz

setlocal
cd /d "%~dp0.."

:: Environment Variables
set FUND_API_URL=https://yifcapital.co.tz/api/funds/update
set PYTHON_EXEC=.\fund_pipeline\.venv\Scripts\python.exe

echo [%date% %time%] Starting Daily Fund Sync... >> fund_pipeline\logs\automation.log

:: 1. Run the Scraper (latest-only mode for daily runs)
%PYTHON_EXEC% fund_pipeline\scraper\selenium_scraper.py --latest-only >> fund_pipeline\logs\automation.log 2>&1

echo [%date% %time%] Daily Fund Sync Complete. >> fund_pipeline\logs\automation.log
endlocal
