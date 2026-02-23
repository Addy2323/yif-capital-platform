import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

def test_headless_chrome():
    print("--- Testing Headless Chrome on Linux ---")
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    
    print("Initializing WebDriver...")
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        print("Success! Loading a test page...")
        driver.get("https://www.google.com")
        print(f"Title: {driver.title}")
        
        driver.quit()
        print("--- Test Complete: SUCCESS ---")
    except Exception as e:
        print("\n--- ERROR ENCOUNTERED ---")
        print(e)
        print("\nTIP: If you see 'DevToolsActivePort file doesn't exist', ensure --no-sandbox and --disable-dev-shm-usage are set.")
        print("TIP: If you see missing libraries (.so files), run: ldd /opt/google/chrome/chrome | grep not")

if __name__ == "__main__":
    test_headless_chrome()
