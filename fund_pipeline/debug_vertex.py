from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

options = webdriver.ChromeOptions()
options.add_argument("--headless")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

try:
    url = "https://vertex.co.tz/vertex-bond-fund/"
    print(f"Fetching {url}...")
    driver.get(url)
    time.sleep(10)
    with open("vertex_source.html", "w", encoding="utf-8") as f:
        f.write(driver.page_source)
    print("Source saved to vertex_source.html")
finally:
    driver.quit()
