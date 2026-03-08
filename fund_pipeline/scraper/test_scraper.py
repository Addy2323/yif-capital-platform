import requests
from bs4 import BeautifulSoup
import json

url = "https://www.african-markets.com/en/stock-markets/dse"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

try:
    response = requests.get(url, headers=headers, timeout=10)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        
        # 1. Index Value and Change
        # They might be in a div with class 'index-info' or something similar
        index_val = ""
        change = ""
        
        # Find the index value by looking near the percentage change
        for span in soup.find_all("span", limit=200):
            text = span.get_text(strip=True)
            if "%" in text and ("+" in text or "-" in text):
                # Print the parent's parent text
                print(f"Parent text of percentage: {span.parent.parent.get_text(separator=' ', strip=True)}")
                break
        
        # 2. Date
        # Usually it's in a small tag or specific span near the title or summary
        # Let's just find the text "As of "
        date_text = ""
        for elem in soup.find_all(text=lambda t: t and "As of" in t):
            date_text = elem.strip()
            break
            
        # 3. Market Summary Table
        # Look for the table that contains "Value Traded"
        summary_data = {}
        for th in soup.find_all("th"):
            # African markets might use divs instead of tables, let's dump some classes
            pass
            
        # Let's extract the main market summary div block if it exists
        blocks = soup.select(".market-summary .item, .summary-item, table")
        tables = soup.find_all("table")
        
        table_data = []
        for i, table in enumerate(tables):
            rows = []
            for tr in table.find_all("tr"):
                rows.append([td.text.strip() for td in tr.find_all(["th", "td"])])
            table_data.append(rows)

        print(json.dumps({
            "index_val": index_val,
            "change": change,
            "date": date_text,
            "tables": table_data[:3] # print first 3 tables to inspect
        }, indent=2))
        
except Exception as e:
    print(f"Error: {e}")
