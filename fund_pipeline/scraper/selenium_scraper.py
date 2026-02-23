"""
Selenium-Based Fund Data Scraper
================================
Scrapes NAV and fund performance data from Tanzanian fund providers.

Design Rules:
  - NO database writes — raw data goes to JSON files only
  - Headless Chrome execution
  - Explicit waits with retry mechanism
  - Structured logging
"""

import os
import sys
import json
import time
import logging
import csv
import requests
from datetime import datetime
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_PATH = BASE_DIR / "config" / os.getenv("SCRAPER_CONFIG", "sources.json")
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_DIR / f"scraper_{datetime.today().strftime('%Y-%m-%d')}.log"),
    ],
)
logger = logging.getLogger(__name__)


def load_config():
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Browser
# ---------------------------------------------------------------------------
def init_driver():
    """Create a headless Chrome driver."""
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36")
    options.add_argument("--ignore-certificate-errors")
    options.add_argument("--allow-running-insecure-content")
    options.add_argument("--ignore-ssl-errors=yes")
    options.add_argument("--remote-debugging-port=9222")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options,
    )
    return driver


# ---------------------------------------------------------------------------
# Scraper
# ---------------------------------------------------------------------------
def scrape_site(url: str, name: str, wait_seconds: int = 5, retry_count: int = 3, max_pages: int = 1) -> list:
    """
    Load a dynamic page, extract all table data, return as list of lists.
    Retries on failure up to `retry_count` times.
    """
    for attempt in range(1, retry_count + 1):
        driver = None
        try:
            logger.info(f"[{name}] Attempt {attempt}/{retry_count} — {url}")
            driver = init_driver()
            logger.info(f"[{name}] Starting scrape with max_pages={max_pages}")
            driver.get(url)

            # Explicit wait for at least one table to appear
            WebDriverWait(driver, wait_seconds + 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "table"))
            )
            time.sleep(wait_seconds)  # extra settle time for JS rendering

            rows_data = []
            
            # Load existing records to count and skip pages
            existing_count = 0
            file_path = f"data/{name}.json"
            if os.path.exists(file_path):
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        existing_count = len(json.load(f))
                except: pass

            # Rough estimate of records per page for UTT AMIS
            # Every date has ~6 funds. 50 rows per page = ~8 dates. 48 records.
            # Let's say we skip pages if we have a significant overlap.
            # Actually, the simplest resume is to let it run but skipping logic is better.
            
            # Date limit for historical scraping (July 9, 2024)
            STOP_DATE = datetime(2024, 7, 9)
            
            def parse_row_date(cols, source_name):
                """Extract and parse date from row based on source."""
                try:
                    if source_name == "utt-amis":
                        raw_date = cols[7] if len(cols) > 7 else ""
                        if raw_date:
                            parts = raw_date.split("-")
                            if len(parts) == 3 and len(parts[2]) == 4:
                                return datetime.strptime(f"{parts[2]}-{parts[1]}-{parts[0]}", "%Y-%m-%d")
                    elif source_name == "vertex":
                        raw_date = cols[5] if len(cols) > 5 else ""
                        if raw_date:
                            return datetime.strptime(raw_date.strip(), "%d %B %Y")
                    elif source_name == "sanlam-pesa":
                        raw_date = cols[0] if len(cols) > 0 else ""
                        if raw_date:
                            return datetime.strptime(raw_date, "%b %d, %Y")
                    elif source_name == "whi":
                        raw_date = cols[0] if len(cols) > 0 else ""
                        if raw_date:
                            return datetime.strptime(raw_date, "%Y-%m-%d")
                    elif source_name == "zansec":
                        raw_date = cols[6] if len(cols) > 6 else ""
                        if raw_date:
                            return datetime.strptime(raw_date, "%Y-%m-%d")
                except:
                    pass
                return None
            
            for page in range(1, max_pages + 1):
                logger.info(f"[{name}] Scraping page {page}/{max_pages}")
                
                # Try to set "Show 50 entries" at the start to catch all data on one or two pages
                if page == 1:
                    try:
                        all_selects = driver.find_elements(By.TAG_NAME, "select")
                        for s in all_selects:
                            try:
                                from selenium.webdriver.support.ui import Select
                                sel = Select(s)
                                options = [o.get_attribute("value") for o in sel.options]
                                for val in ["50", "100"]:
                                    if val in options:
                                        sel.select_by_value(val)
                                        logger.info(f"[{name}] Successfully set entries per page to {val}")
                                        time.sleep(5) # wait for reload
                                        break
                            except: pass
                    except: pass

                # Settle time for page load
                time.sleep(wait_seconds)
                
                # Load existing keys for skipping check
                existing_keys = set()
                if os.path.exists(file_path):
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            ext_data = json.load(f)
                            for item in ext_data:
                                if name == "utt-amis":
                                    existing_keys.add(f"{item.get('fund_name', '')}_{item.get('date', '')}")
                                else:
                                    existing_keys.add(json.dumps(item, sort_keys=True))
                    except: pass

                tables = driver.find_elements(By.TAG_NAME, "table")
                page_rows = 0
                new_data_on_page = False
                oldest_date_on_page = None
                
                for table in tables:
                    rows = table.find_elements(By.TAG_NAME, "tr")
                    for row in rows:
                        cols = [c.get_attribute("textContent").strip() for c in row.find_elements(By.TAG_NAME, "td")]
                        if cols and any(c for c in cols if c.strip()):
                            rows_data.append(cols)
                            page_rows += 1
                            if name == 'vertex': logging.info(f"[vertex] Captured row: {cols}")
                            
                            # Check if this row is new
                            # Map raw row to structured enough for keying
                            if name == "utt-amis":
                                # Row indices: 1 is name, 7 is date
                                row_key = f"{cols[1] if len(cols)>1 else ''}_{cols[7] if len(cols)>7 else ''}"
                            else:
                                row_key = str(cols)
                                
                            if row_key not in existing_keys:
                                new_data_on_page = True
                            
                            # Track oldest date on this page
                            row_date = parse_row_date(cols, name)
                            if row_date:
                                if oldest_date_on_page is None or row_date < oldest_date_on_page:
                                    oldest_date_on_page = row_date
                
                logger.info(f"[{name}] Found {page_rows} rows on page {page} (New: {new_data_on_page})")
                
                # Check if we've reached the stop date
                if oldest_date_on_page and oldest_date_on_page <= STOP_DATE:
                    logger.info(f"[{name}] Reached stop date {STOP_DATE.strftime('%Y-%m-%d')} (oldest on page: {oldest_date_on_page.strftime('%Y-%m-%d')}). Stopping.")
                    break

                # Incremental progress save only if new data found
                if page_rows > 0 and new_data_on_page:
                    try:
                        structured_batch = map_data(rows_data, name)
                        save_consolidated(structured_batch, name, "data")
                    except Exception as inc_err:
                        logger.debug(f"[{name}] Incremental save failed: {inc_err}")
                elif page_rows > 0 and not new_data_on_page:
                    logger.info(f"[{name}] Page {page} is all duplicates. Skipping save and speeding up.")
                    time.sleep(1) # minimize wait for known pages

                if page < max_pages:
                    try:
                        # Scroll down to ensure pagination is visible
                        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                        time.sleep(2)
                        
                        # Re-find Next button right before clicking to avoid staleness
                        next_btn = None
                        potentials = driver.find_elements(By.XPATH, "//a | //button | //span[@onclick] | //div[contains(@class, 'button')]")
                        for p in potentials:
                            try:
                                if not p.is_displayed(): continue
                                text = p.text.strip()
                                aria = p.get_attribute("aria-label") or ""
                                title = p.get_attribute("title") or ""
                                cls = p.get_attribute("class") or ""
                                
                                if text == ">" or text == "Next" or "next" in text.lower() or "next" in aria.lower() or "next" in title.lower() or "next" in cls.lower():
                                    if "disabled" not in cls.lower():
                                        next_btn = p
                                        if text in [">", "Next"]:
                                            break
                            except: continue

                        if next_btn:
                            logger.info(f"[{name}] Clicking 'Next' button...")
                            driver.execute_script("arguments[0].scrollIntoView();", next_btn)
                            time.sleep(2)
                            driver.execute_script("arguments[0].click();", next_btn)
                        else:
                            # Debug: log all clickable elements if next button not found
                            try:
                                all_links = driver.find_elements(By.TAG_NAME, "a")
                                logger.info(f"[{name}] No 'Next' button found. Found {len(all_links)} links on page")
                                for i, link in enumerate(all_links):
                                    try:
                                        text = link.text.strip()[:30]
                                        class_attr = link.get_attribute("class") or ""
                                        logger.info(f"[{name}] Link {i}: text='{text}', class='{class_attr}'")
                                    except:
                                        pass
                            except Exception as debug_err:
                                logger.debug(f"[{name}] Debug logging failed: {debug_err}")
                            break
                    except Exception as pg_err:
                        logger.warning(f"[{name}] Navigation failed: {pg_err}")
                        break

            if not rows_data:
                logger.warning(f"[{name}] No table data found on attempt {attempt}")
                continue

            # Basic deduplication while preserving order
            seen = set()
            dedup_rows = []
            for row in rows_data:
                row_tuple = tuple(row)
                if row_tuple not in seen:
                    seen.add(row_tuple)
                    dedup_rows.append(row)

            logger.info(f"[{name}] Scraped {len(dedup_rows)} total rows across multi-page attempt")
            return dedup_rows

        except Exception as e:
            logger.error(f"[{name}] Attempt {attempt} failed: {e}")
        finally:
            if driver:
                driver.quit()

    logger.error(f"[{name}] All {retry_count} attempts exhausted")
    return []


def save_consolidated(data: list, name: str, output_path: str):
    """Maintain a single consolidated JSON file per fund with historical records."""
    if not data:
        return None

    path = Path(output_path)
    path.mkdir(parents=True, exist_ok=True)
    file_path = path / f"{name}.json"
    
    # Load existing data if file exists
    existing_data = []
    if file_path.exists():
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
        except Exception as e:
            logger.error(f"[{name}] Failed to load existing data for consolidation: {e}")
    
    # Merge and deduplicate (using date as key if available)
    # For now, we'll use a simple merge and check for duplicates by record content
    combined = existing_data + data
    
    # Deduplicate by converting to tuples of items
    seen = set()
    unique_data = []
    
    # Funds that need name + date for uniqueness
    needs_name_key = ["utt-amis"]
    
    for item in combined:
        if name in needs_name_key:
            # For UTT AMIS raw rows: Col 1 is fund_name, Col 7 is date
            # If it's already structured (from previous runs or incremental), handle both
            if isinstance(item, dict):
                key = f"{item.get('fund_name', '')}_{item.get('date', '')}"
            else:
                key = f"{item[1] if len(item)>1 else ''}_{item[7] if len(item)>7 else ''}"
        else:
            # Default to full content hash for simple funds like WHI
            if isinstance(item, dict):
                key = json.dumps(item, sort_keys=True)
            else:
                key = str(item)
            
        if key not in seen:
            seen.add(key)
            unique_data.append(item)
            
    # Sort by date if possible (descending)
    try:
        from datetime import datetime
        def parse_date(d_str):
            if not d_str: return datetime.min
            # Try DD-MM-YYYY (UTT AMIS)
            try: return datetime.strptime(d_str, "%d-%m-%Y")
            except: pass
            # Try YYYY-MM-DD (WHI / Zansec)
            try: return datetime.strptime(d_str, "%Y-%m-%d")
            except: pass
            return datetime.min
            
        unique_data.sort(key=lambda x: parse_date(x.get("date", "")), reverse=True)
    except Exception as sort_err:
        logger.debug(f"Sorting failed: {sort_err}")

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(unique_data, f, indent=4)
        
    logger.info(f"[{name}] Updated consolidated data -> {file_path}")
    return str(file_path)


def save_raw(data: list, name: str, output_path: str):
    """Save raw scraped data to JSON (NO database writes)."""
    if not data:
        logger.warning(f"[{name}] No data — skipping save")
        return None

    Path(output_path).mkdir(parents=True, exist_ok=True)
    today = datetime.today().strftime("%Y-%m-%d")
    file_path = os.path.join(output_path, f"{name}_{today}.json")
    
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
        
    logger.info(f"[{name}] Saved raw data -> {file_path}")
    return file_path


def save_processed(data: list, name: str, output_path: str):
    """Save structured data to JSON and CSV (Plain text storage)."""
    if not data:
        return None

    path = Path(output_path)
    path.mkdir(parents=True, exist_ok=True)
    today = datetime.today().strftime("%Y-%m-%d")
    
    # Save structured JSON
    json_path = path / f"{name}_processed_{today}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
        
    # Save CSV (Storing in text files)
    csv_path = path / f"{name}_data_{today}.csv"
    if data:
        # Collect all unique keys from all dictionaries to avoid "fieldnames" mismatch
        all_keys = set()
        dict_data = []
        for item in data:
            if isinstance(item, dict):
                all_keys.update(item.keys())
                dict_data.append(item)
        
        if dict_data:
            keys = sorted(list(all_keys))
            with open(csv_path, "w", newline="", encoding="utf-8") as f:
                dict_writer = csv.DictWriter(f, fieldnames=keys)
                dict_writer.writeheader()
                dict_writer.writerows(dict_data)
            
    logger.info(f"[{name}] Saved structured data -> {json_path} and {csv_path}")
    return {"json": str(json_path), "csv": str(csv_path)}


def push_to_api(data: list, name: str):
    """Send data to API (Sending to API)."""
    api_url = os.getenv("FUND_API_URL", "http://localhost:3000/api/funds/update")
    chunk_size = 10
    total_success = True
    
    try:
        for i in range(0, len(data), chunk_size):
            chunk = data[i:i + chunk_size]
            logger.info(f"[{name}] Pushing chunk {i//chunk_size + 1}/{(len(data)-1)//chunk_size + 1} ({len(chunk)} records) to API")
            response = requests.post(api_url, json={"source": name, "data": chunk}, timeout=60)
            response.raise_for_status()
            logger.info(f"[{name}] Chunk {i//chunk_size + 1} push successful")
        
        return True
    except Exception as e:
        logger.error(f"[{name}] API push failed: {e}")
        return False


def map_data(raw_rows: list, source_name: str) -> list:
    """Map raw table rows to structured exact data (Scraping)."""
    structured = []
    
    # Generic mapping logic based on Zansec screenshot
    # Columns likely: index, nav, units, nav_per_unit, sale_price, repurchase_price, date
    for row in raw_rows:
        try:
            # If row is already structured (dict), we just need to ensure date format is correct
            if isinstance(row, dict):
                formatted_date = row.get("date", "")
                if formatted_date and "-" in formatted_date:
                    try:
                        parts = formatted_date.split("-")
                        if len(parts) == 3 and len(parts[0]) == 2: # DD-MM-YYYY
                             formatted_date = f"{parts[2]}-{parts[1]}-{parts[0]}"
                    except: pass
                
                record = row.copy()
                record["date"] = formatted_date
                structured.append(record)
                continue

            # Basic validation: check if raw row has enough columns
            if len(row) < 5:
                continue
                
            def clean_num(val):
                if not val: return 0.0
                if isinstance(val, (int, float)): return float(val)
                return float(str(val).replace(",", "").strip())

            # Specific mapping based on Zansec structure:
            if source_name == "zansec":
                record = {
                    "source": source_name,
                    "fund_name": "Zansec Bond Fund",
                    "date": row[6] if len(row) > 6 else (row[-1] if row else ""),
                    "nav_per_unit": clean_num(row[3]) if len(row) > 3 else 0.0,
                    "sale_price": clean_num(row[4]) if len(row) > 4 else 0.0,
                    "repurchase_price": clean_num(row[5]) if len(row) > 5 else 0.0,
                    "total_nav": clean_num(row[1]) if len(row) > 1 else 0.0,
                    "units": clean_num(row[2]) if len(row) > 2 else 0.0,
                    "status": "extracted"
                }
            elif source_name == "utt-amis":
                raw_date = row[7] if len(row) > 7 else (row[-1] if row else "")
                formatted_date = raw_date
                if raw_date:
                    try:
                        parts = raw_date.split("-")
                        if len(parts) == 3 and len(parts[2]) == 4:
                            formatted_date = f"{parts[2]}-{parts[1]}-{parts[0]}"
                    except: pass

                record = {
                    "source": source_name,
                    "fund_name": row[1] if len(row) > 1 else "",
                    "date": formatted_date,
                    "nav_per_unit": clean_num(row[4]) if len(row) > 4 else 0.0,
                    "sale_price": clean_num(row[5]) if len(row) > 5 else 0.0,
                    "repurchase_price": clean_num(row[6]) if len(row) > 6 else 0.0,
                    "total_nav": clean_num(row[2]) if len(row) > 2 else 0.0,
                    "units": clean_num(row[3]) if len(row) > 3 else 0.0,
                    "status": "extracted"
                }
            elif source_name == "vertex":
                # wpDataTables structure with hidden columns (0-4)
                # Indices: 5: Date, 9: Total NAV (Fund Net Value), 10: Units, 11: NAV per Unit
                if len(row) < 12:
                    continue
                
                raw_date = row[5]
                formatted_date = raw_date
                # Try to parse "10 November 2025"
                try:
                    from datetime import datetime
                    dt = datetime.strptime(raw_date.strip(), "%d %B %Y")
                    formatted_date = dt.strftime("%Y-%m-%d")
                except:
                    pass

                # Skip header or empty rows
                if not formatted_date or any(x.lower() in formatted_date.lower() for x in ["date", "redeemed"]):
                    continue

                nav = clean_num(row[11])
                record = {
                    "source": source_name,
                    "fund_name": "Vertex Bond Fund",
                    "date": formatted_date,
                    "nav_per_unit": nav,
                    "sale_price": nav,        # Fallback to NAV as source doesn't provide explicit price
                    "repurchase_price": nav,  # Fallback to NAV
                    "total_nav": clean_num(row[9]),
                    "units": clean_num(row[10]),
                    "status": "extracted"
                }
            elif source_name == "whi":
                record = {
                    "source": source_name,
                    "fund_name": "WHI Income Fund",
                    "date": row[0] if len(row) > 0 else "",
                    "nav_per_unit": clean_num(row[3]) if len(row) > 3 else 0.0,
                    "sale_price": clean_num(row[4]) if len(row) > 4 else 0.0,
                    "repurchase_price": clean_num(row[5]) if len(row) > 5 else 0.0,
                    "total_nav": clean_num(row[1]) if len(row) > 1 else 0.0,
                    "units": clean_num(row[2]) if len(row) > 2 else 0.0,
                    "status": "extracted"
                }
            elif source_name == "sanlam-pesa":
                # Sanlam table: Date | Fund | Code | Currency | Net Asset Value | Outstanding Units | NAV/Unit | Sale Price | Buy Price
                # Column mapping based on screenshot
                raw_date = row[0] if len(row) > 0 else ""
                # Convert "Feb 20, 2026" to "2026-02-20"
                formatted_date = raw_date
                if raw_date:
                    try:
                        from datetime import datetime
                        dt = datetime.strptime(raw_date, "%b %d, %Y")
                        formatted_date = dt.strftime("%Y-%m-%d")
                    except:
                        pass
                
                record = {
                    "source": source_name,
                    "date": formatted_date,
                    "fund_name": row[1] if len(row) > 1 else "SanlamAllianz Pesa Money Market Fund",
                    "code": row[2] if len(row) > 2 else "001",
                    "currency": row[3] if len(row) > 3 else "TZS",
                    "total_nav": clean_num(row[4]) if len(row) > 4 else 0.0,
                    "units": clean_num(row[5]) if len(row) > 5 else 0.0,
                    "nav_per_unit": clean_num(row[6]) if len(row) > 6 else 0.0,
                    "sale_price": clean_num(row[7]) if len(row) > 7 else 0.0,
                    "repurchase_price": clean_num(row[8]) if len(row) > 8 else 0.0,
                    "status": "extracted"
                }
            else:
                record = {
                    "source": source_name,
                    "date": row[-1] if row else "",
                    "nav_per_unit": clean_num(row[3]) if len(row) > 3 else 0.0,
                    "total_nav": clean_num(row[1]) if len(row) > 1 else 0.0,
                    "units": clean_num(row[2]) if len(row) > 2 else 0.0,
                    "status": "extracted"
                }
            structured.append(record)
        except Exception as e:
            logger.debug(f"Failed to map row {row}: {e}")
            
    return structured


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    logger.info("=" * 60)
    logger.info("Fund Data Scraper — Starting")
    logger.info("=" * 60)

    config = load_config()
    sources = config.get("sources", [])
    
    results = []
    for source in sources:
        name = source["name"]
        data = scrape_site(
            url=source["url"],
            name=name,
            wait_seconds=source.get("wait_seconds", 5),
            retry_count=source.get("retry_count", 3),
            max_pages=source.get("max_pages", 1),
        )

        status = "failed"
        api_pushed = False
        rows = 0
        
        if data:
            rows = len(data)
            # 1. Save Raw
            save_raw(data, name, config["output"]["raw_path"])
            
            # 2. Append to Consolidated
            data_dir = BASE_DIR / "data"
            consolidated_file = save_consolidated(data, name, str(data_dir))
            
            # 3. Map to Structured Platform Data
            # Map the FULL consolidated history to ensure complete processed files
            try:
                if consolidated_file:
                    with open(consolidated_file, "r", encoding="utf-8") as f:
                        all_historical = json.load(f)
                    
                    structured_data = map_data(all_historical, name)
                    
                    if structured_data:
                        # 4. Save Processed
                        save_processed(
                            structured_data, 
                            name, 
                            config["output"]["processed_path"]
                        )
                        
                        # 5. Push to API
                        api_pushed = push_to_api(structured_data, name)
                        status = "success"
                    else:
                        status = "mapping failed"
                else:
                    status = "consolidation failed"
            except Exception as e:
                logger.error(f"[{name}] Post-processing failed: {e}")
                status = "process failed"
        else:
            status = "no data"

        results.append({
            "source": name,
            "rows": rows,
            "status": status,
            "api_pushed": api_pushed
        })

    logger.info("-" * 60)
    for r in results:
        api_str = "Synced" if r["api_pushed"] else "Local only"
        logger.info(f"  {r['source']}: {r['status']} ({r['rows']} rows) - {api_str}")
    logger.info("=" * 60)
    logger.info("Fund Data Scraper — Complete")


if __name__ == "__main__":
    main()
