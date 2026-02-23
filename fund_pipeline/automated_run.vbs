Set WshShell = CreateObject("WScript.Shell")
' Run the batch file with 0 (hidden window) and true (wait for completion)
WshShell.Run "cmd /c run_scraper.bat", 0, true
