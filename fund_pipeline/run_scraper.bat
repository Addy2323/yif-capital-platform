@echo off
pushd %~dp0
echo [%date% %time%] Starting Fund Data Scraper... >> logs\automation.log
.\.venv\Scripts\python.exe scraper\selenium_scraper.py
popd
