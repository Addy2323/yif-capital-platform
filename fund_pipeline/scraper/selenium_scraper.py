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
import re
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
        logging.FileHandler(LOG_DIR / f"scraper_{datetime.today().strftime('%Y-%m-%d')}.log", encoding="utf-8"),
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
    """Create a headless Chrome driver. One driver per source, always quit after use."""
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-software-rasterizer")
    options.add_argument("--disable-extensions")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36")
    options.add_argument("--ignore-certificate-errors")
    options.add_argument("--allow-running-insecure-content")
    options.add_argument("--ignore-ssl-errors=yes")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options,
    )
    driver.set_page_load_timeout(90)
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
            logger.info(f"[{name}] Attempt {attempt}/{retry_count} - {url}")
            driver = init_driver()
            logger.info(f"[{name}] Starting scrape with max_pages={max_pages}")
            driver.get(url)

            # 1. Wait for page to settle
            time.sleep(wait_seconds)

            # Vertex: table is filled via AJAX (wpdatatables serverSide). Wait for data rows.
            if name == "vertex":
                try:
                    WebDriverWait(driver, 30).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "#table_2 tbody tr td"))
                    )
                    time.sleep(2)
                    logger.info("[vertex] Data table loaded (AJAX)")
                except Exception as ve:
                    logger.warning("[vertex] Timeout waiting for #table_2 data: %s", ve)
            
            # 2. Try to find table in main content or iframes
            table_found = False
            try:
                # First check main content
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "table"))
                )
                table_found = True
                logger.debug(f"[{name}] Table found in main content")
            except:
                # Then check iframes
                logger.info(f"[{name}] Table not found in main content, checking iframes...")
                iframes = driver.find_elements(By.TAG_NAME, "iframe")
                for i, frame in enumerate(iframes):
                    try:
                        driver.switch_to.frame(frame)
                        WebDriverWait(driver, 5).until(
                            EC.presence_of_element_located((By.TAG_NAME, "table"))
                        )
                        table_found = True
                        logger.info(f"[{name}] Found table in iframe {i}")
                        break
                    except:
                        driver.switch_to.default_content()
            
            if not table_found:
                raise Exception("No table found in main content or any iframe")

            rows_data = []

            # iTrust has multiple fund tabs (iCash, iGrowth, iSave, iIncome, Imaan, iDollar).
            # We must scrape each tab separately; otherwise the default tab data (usually iCash)
            # gets parsed and pushed for the entire iTrust source, overwriting other schemes.
            itrust_tabs = []
            if name == "itrust":
                itrust_tabs = ["iCash Fund", "iGrowth Fund", "iSave Fund", "iIncome Fund", "Imaan Fund", "iDollar Fund"]

            if itrust_tabs:
                tab_rows = []
                prev_first_date = None
                for tab_label in itrust_tabs:
                    try:
                        # Click the iTrust fund card.
                        # Your markup shows an <h3> with the fund name inside a container with "cursor-pointer".
                        # Use contains() instead of exact match because the DOM text can include extra whitespace.
                        card_xpath = (
                            f"//h3[contains(normalize-space(.), '{tab_label}')]/ancestor::div[contains(@class,'cursor-pointer')][1]"
                        )
                        card = WebDriverWait(driver, 20).until(
                            EC.presence_of_element_located((By.XPATH, card_xpath))
                        )
                        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", card)
                        # Use JS click to avoid overlay/clickability issues
                        driver.execute_script("arguments[0].click();", card)

                        # Wait until the first table row date changes (prevents scraping the previous tab again).
                        def first_row_date():
                            try:
                                el = driver.find_element(By.CSS_SELECTOR, "table tbody tr td")
                                return el.text.strip()
                            except:
                                return None

                        # Small settle time first, then wait for date change.
                        time.sleep(1)
                        new_first = first_row_date()
                        if prev_first_date is not None:
                            WebDriverWait(driver, 20).until(
                                lambda d: first_row_date() and first_row_date() != prev_first_date
                            )
                        prev_first_date = first_row_date()

                        # Find table and scrape current view once (latest-only runs should be enough here).
                        tables = driver.find_elements(By.TAG_NAME, "table")
                        if not tables:
                            logger.warning("[itrust] No table found after switching to tab: %s", tab_label)
                            continue

                        main_table = max(tables, key=lambda t: len(t.find_elements(By.TAG_NAME, "tr")))
                        rows = main_table.find_elements(By.TAG_NAME, "tr")
                        for row in rows:
                            cols = [c.text.strip() for c in row.find_elements(By.TAG_NAME, "td")]
                            if not cols:
                                cols = [c.text.strip() for c in row.find_elements(By.TAG_NAME, "th")]
                            if cols and len(cols) > 3:
                                # Append tab label so we can recover scheme name during mapping.
                                cols = cols + [tab_label]
                                tab_rows.append(cols)
                    except Exception as e:
                        logger.error("[itrust] Failed tab scrape for %s: %s (%s)", tab_label, e, type(e).__name__)

                # Deduplicate and return
                dedup_rows = []
                seen = set()
                for r in tab_rows:
                    r_tuple = tuple(r)
                    if r_tuple in seen:
                        continue
                    seen.add(r_tuple)
                    dedup_rows.append(r)
                logger.info("[itrust] Successfully scraped %s unique rows across all tabs", len(dedup_rows))
                return dedup_rows
            
            # Helper to parse date — only keep data from 2025 onwards
            STOP_DATE = datetime(2024, 12, 31)
            
            def parse_row_date(cols, source_name):
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
                    elif source_name in ("itrust", "orbit", "tsl", "apef"):
                        # Generic: try first column then last
                        for idx in (0, -1):
                            raw_date = cols[idx] if cols else ""
                            if not raw_date:
                                continue
                            for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%b %d, %Y", "%d %B %Y"):
                                try:
                                    return datetime.strptime(str(raw_date).strip(), fmt)
                                except ValueError:
                                    continue
                except Exception:
                    pass
                return None

            for page in range(1, max_pages + 1):
                tables = driver.find_elements(By.TAG_NAME, "table")
                if not tables:
                    break
                # Vertex: use WP Data Table by id (AJAX-filled)
                if name == "vertex":
                    try:
                        main_table = driver.find_element(By.ID, "table_2")
                    except Exception:
                        main_table = max(tables, key=lambda t: len(t.find_elements(By.TAG_NAME, "tr")))
                else:
                    main_table = max(tables, key=lambda t: len(t.find_elements(By.TAG_NAME, "tr")))
                rows = main_table.find_elements(By.TAG_NAME, "tr")
                logger.info(f"[{name}] Page {page}: Found {len(rows)} rows")
                
                page_stop_hit = False
                for row in rows:
                    cols = [c.text.strip() for c in row.find_elements(By.TAG_NAME, "td")]
                    if not cols:
                        # Try th if td is empty (header)
                        cols = [c.text.strip() for c in row.find_elements(By.TAG_NAME, "th")]
                    
                    if cols and len(cols) > 3:
                        rows_data.append(cols)
                        
                        # Stop check for UTT AMIS historical data
                        rd = parse_row_date(cols, name)
                        if rd and rd <= STOP_DATE:
                            logger.info(f"[{name}] Reached STOP_DATE: {STOP_DATE.date()}")
                            page_stop_hit = True
                            break
                
                if page_stop_hit:
                    break
                    
                if page < max_pages:
                    try:
                        # Scroll down to ensure pagination is visible
                        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                        time.sleep(2)
                        
                        next_btn = None
                        potentials = driver.find_elements(By.XPATH, "//a | //button | //span[@onclick]")
                        for p in potentials:
                            try:
                                if not p.is_displayed(): continue
                                text = p.text.strip()
                                if text in [">", "Next"] or "next" in text.lower():
                                    next_btn = p
                                    break
                            except: continue

                        if next_btn:
                            driver.execute_script("arguments[0].click();", next_btn)
                            time.sleep(5)
                        else:
                            break
                    except:
                        break
            
            # Deduplicate by full row content
            dedup_rows = []
            seen = set()
            for r in rows_data:
                r_tuple = tuple(r)
                if r_tuple not in seen:
                    seen.add(r_tuple)
                    dedup_rows.append(r)
            
            logger.info(f"[{name}] Successfully scraped {len(dedup_rows)} unique rows")
            return dedup_rows

        except Exception as e:
            try:
                page_title = driver.title if driver else "Unknown"
            except Exception:
                page_title = "Unknown"
            logger.error(f"[{name}] Attempt {attempt} failed: {e}")
            logger.error(f"[{name}] Page Title: {page_title}")
            if attempt == retry_count:
                logger.error(f"[{name}] All {retry_count} attempts exhausted")
        finally:
            if driver is not None:
                try:
                    driver.quit()
                except Exception as qe:
                    logger.debug(f"[{name}] Driver quit: {qe}")
            if attempt < retry_count and driver is not None:
                time.sleep(3)
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
    combined = existing_data + data
    
    # Deduplicate by converting to tuples of items
    seen = set()
    unique_data = []
    
    # Funds that need name + date for uniqueness (multi-scheme per source)
    needs_name_key = ["utt-amis", "itrust", "orbit", "sanlam-pesa", "tsl"]
    
    for item in combined:
        if name in needs_name_key:
            # For UTT AMIS raw rows: Col 1 is fund_name, Col 7 is date
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
            
        unique_data.sort(key=lambda x: parse_date(x.get("date", "") if isinstance(x, dict) else (x[-1] if x else "")), reverse=True)
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
    if "your-domain" in api_url:
        logger.warning("[%s] FUND_API_URL contains 'your-domain' - set it to your real site URL (e.g. https://yifcapital.co.tz/api/funds/update) so data reaches your app", name)
    chunk_size = 50  # Larger chunks = fewer API calls = faster & more reliable
    total_chunks = max(1, (len(data) - 1) // chunk_size + 1)
    
    try:
        for i in range(0, len(data), chunk_size):
            chunk = data[i:i + chunk_size]
            chunk_num = i // chunk_size + 1
            logger.info(f"[{name}] Pushing chunk {chunk_num}/{total_chunks} ({len(chunk)} records) to {api_url}")
            response = requests.post(api_url, json={"source": name, "data": chunk}, timeout=60)
            
            if response.status_code != 200:
                logger.error(f"[{name}] API returned status {response.status_code}: {response.text[:500]}")
                response.raise_for_status()
            
            # Log the API response details
            try:
                resp_json = response.json()
                upserted = resp_json.get('upserted', '?')
                errors = resp_json.get('errors', '?')
                logger.info(f"[{name}] Chunk {chunk_num} -> upserted={upserted}, errors={errors}")
            except:
                logger.info(f"[{name}] Chunk {chunk_num} push successful")
        
        return True
    except requests.exceptions.ConnectionError as e:
        logger.error(f"[{name}] API connection failed (is the server running?): {e}")
        return False
    except Exception as e:
        logger.error(f"[{name}] API push failed: {e}")
        return False


def map_data(raw_rows: list, source_name: str) -> list:
    """Map raw table rows to structured exact data (Scraping)."""
    structured = []
    
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

            # Basic validation: need at least 3 columns (relaxed for itrust/orbit/apef)
            min_cols = 3 if source_name in ("itrust", "orbit", "tsl", "apef") else 5
            if len(row) < min_cols:
                continue

            def clean_num(val):
                if val is None: return 0.0
                if isinstance(val, (int, float)): return float(val)
                try:
                    s = str(val).replace(",", "").replace(" ", "").strip()
                    if not s or s in ("-", "."): return 0.0
                    return float(s)
                except (ValueError, TypeError):
                    return 0.0

            # Specific mapping:
            if source_name == "zansec":
                record = {
                    "source": source_name,
                    "fund_name": "Timiza Fund",
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
                if len(row) < 12:
                    continue
                raw_date = row[5]
                formatted_date = raw_date
                try:
                    dt = datetime.strptime(raw_date.strip(), "%d %B %Y")
                    formatted_date = dt.strftime("%Y-%m-%d")
                except:
                    pass

                if not formatted_date or any(x.lower() in formatted_date.lower() for x in ["date", "redeemed"]):
                    continue

                nav = clean_num(row[11])
                record = {
                    "source": source_name,
                    "fund_name": "Vertex Bond Fund",
                    "date": formatted_date,
                    "nav_per_unit": nav,
                    "sale_price": nav,
                    "repurchase_price": nav,
                    "total_nav": clean_num(row[9]),
                    "units": clean_num(row[10]),
                    "status": "extracted"
                }
            elif source_name == "whi":
                record = {
                    "source": source_name,
                    "fund_name": "Faida Fund",
                    "date": row[0] if len(row) > 0 else "",
                    "nav_per_unit": clean_num(row[3]) if len(row) > 3 else 0.0,
                    "sale_price": clean_num(row[4]) if len(row) > 4 else 0.0,
                    "repurchase_price": clean_num(row[5]) if len(row) > 5 else 0.0,
                    "total_nav": clean_num(row[1]) if len(row) > 1 else 0.0,
                    "units": clean_num(row[2]) if len(row) > 2 else 0.0,
                    "status": "extracted"
                }
            elif source_name == "sanlam-pesa":
                raw_date = row[0] if len(row) > 0 else ""
                formatted_date = raw_date
                if raw_date:
                    try:
                        dt = datetime.strptime(raw_date, "%b %d, %Y")
                        formatted_date = dt.strftime("%Y-%m-%d")
                    except:
                        pass
                
                record = {
                    "source": source_name,
                    "date": formatted_date,
                    "fund_name": row[1] if len(row) > 1 else "SanlamAllianz Pesa Money Market Fund",
                    "total_nav": clean_num(row[4]) if len(row) > 4 else 0.0,
                    "units": clean_num(row[5]) if len(row) > 5 else 0.0,
                    "nav_per_unit": clean_num(row[6]) if len(row) > 6 else 0.0,
                    "sale_price": clean_num(row[7]) if len(row) > 7 else 0.0,
                    "repurchase_price": clean_num(row[8]) if len(row) > 8 else 0.0,
                    "status": "extracted"
                }
            elif source_name in ("itrust", "orbit", "tsl", "apef"):
                # Try to find a date in ANY column. Prefer DD/MM/YYYY (Tanzania). No "today" fallback for itrust.
                # Order: ISO, then DD-MM/DD/MM (East Africa), then MM/DD (US), then text formats
                date_formats = (
                    "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y",
                    "%b %d, %Y", "%d %b %Y", "%d %B %Y", "%B %d, %Y",
                    "%Y/%m/%d", "%d-%b-%Y", "%d %b %Y",
                    "%d %b %y", "%d %B %y", "%b %d %Y", "%B %d %Y",
                )
                formatted_date = None
                for col_idx in range(len(row)):
                    raw_date = row[col_idx]
                    if raw_date is None: continue
                    raw_date = str(raw_date).strip()
                    if not raw_date or raw_date.lower() in ("date", "valuation date"):
                        continue
                    # Skip single digits / very short numbers that are not full dates
                    if len(raw_date) < 8 and raw_date.replace("/", "").replace("-", "").isdigit():
                        continue
                    for fmt in date_formats:
                        try:
                            dt = datetime.strptime(raw_date, fmt)
                            formatted_date = dt.strftime("%Y-%m-%d")
                            break
                        except ValueError:
                            continue
                    if formatted_date:
                        break
                if not formatted_date:
                    # Regex: YYYY-MM-DD, then DD/MM/YYYY and DD-MM-YYYY (day first = Tanzania)
                    for col_idx in range(len(row)):
                        s = str(row[col_idx] if row[col_idx] is not None else "").strip()
                        m = re.match(r"(\d{4})-(\d{1,2})-(\d{1,2})", s)
                        if m:
                            formatted_date = f"{m.group(1)}-{m.group(2).zfill(2)}-{m.group(3).zfill(2)}"
                            break
                        m = re.match(r"(\d{1,2})/(\d{1,2})/(\d{4})", s)
                        if m:
                            # iTrust uses M/D/YYYY (e.g. 3/16/2026) while Tanzania tables sometimes use DD/MM/YYYY.
                            a = int(m.group(1))
                            b = int(m.group(2))
                            y = m.group(3)
                            if source_name == "itrust":
                                # a=month, b=day
                                mo = a
                                d = b
                            else:
                                # day first
                                d = a
                                mo = b
                            formatted_date = f"{y}-{str(mo).zfill(2)}-{str(d).zfill(2)}"
                            break
                        m = re.match(r"(\d{1,2})-(\d{1,2})-(\d{4})", s)
                        if m:
                            formatted_date = f"{m.group(3)}-{m.group(2).zfill(2)}-{m.group(1).zfill(2)}"
                            break
                # Reject future dates (misparsed or wrong source)
                if formatted_date:
                    try:
                        dt = datetime.strptime(formatted_date, "%Y-%m-%d")
                        if dt.date() > datetime.today().date():
                            formatted_date = None
                    except Exception:
                        pass
                # For itrust: never use "today" as fallback — skip row so we don't store wrong dates
                if not formatted_date:
                    if source_name == "itrust":
                        continue
                    formatted_date = datetime.today().strftime("%Y-%m-%d")
                    if not getattr(map_data, "_warned_fallback_date", False):
                        logger.warning("[%s] Using today as date fallback for some rows (no parseable date)", source_name)
                        map_data._warned_fallback_date = True
                fund_name = str(row[1] if len(row) > 1 else "") or str(row[2] if len(row) > 2 else "") or str(row[0] if len(row) > 0 else "")
                if not fund_name or fund_name.replace(".", "").replace(",", "").replace(" ", "").isdigit() or len(fund_name) < 2:
                    fund_name = {"itrust": "iTrust Fund", "orbit": "Orbit Fund", "tsl": "TSL Fund", "apef": "Ziada Fund"}.get(source_name, "Fund")
                fund_name = str(fund_name).strip()

                # iTrust: scrape_site appends the tab label as the last column.
                # Use it directly to prevent pushing iCash table rows into other iTrust schemes.
                if source_name == "itrust" and len(row) >= 1:
                    tab_label = str(row[-1]).strip()
                    tab_scheme_set = {
                        "iCash Fund",
                        "iGrowth Fund",
                        "iSave Fund",
                        "iIncome Fund",
                        "Imaan Fund",
                        "iDollar Fund",
                    }
                    if tab_label in tab_scheme_set:
                        fund_name = tab_label

                if fund_name.upper() in ("DATE", "NAV", "FUND", "SCHEME", "VALUATION DATE", "TOTAL NAV", "UNITS"):
                    continue
                # Common layouts: [date, name, aum, nav, ...] or [name, aum, nav, date] or [date, nav, aum, units]
                nav = clean_num(row[3]) if len(row) > 3 else (clean_num(row[4]) if len(row) > 4 else 0.0)
                aum = clean_num(row[2]) if len(row) > 2 else (clean_num(row[1]) if len(row) > 1 else 0.0)
                units = clean_num(row[4]) if len(row) > 4 else (clean_num(row[5]) if len(row) > 5 else 0.0)
                if nav == 0 and len(row) > 2:
                    for idx in (2, 3, 4, 1):
                        if idx < len(row):
                            v = clean_num(row[idx])
                            if 0 < v < 1e7:
                                nav = v
                                break
                if aum == 0 and nav > 0 and len(row) > 1:
                    for idx in (1, 2, 0):
                        if idx < len(row):
                            v = clean_num(row[idx])
                            if v >= 1e5:
                                aum = v
                                break
                record = {
                    "source": source_name,
                    "fund_name": fund_name or "Fund",
                    "date": formatted_date,
                    "nav_per_unit": nav,
                    "total_nav": aum,
                    "units": units if units > 0 else (aum / nav if nav else 0),
                    "sale_price": 0.0,
                    "repurchase_price": 0.0,
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
            if source_name in ("itrust", "orbit", "apef") and len(structured) == 0:
                logger.warning("[%s] Map row failed (sample): %s -> %s", source_name, str(row)[:150], e)
            logger.debug(f"Failed to map row {row}: {e}")
            
    return structured


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    logger.info("=" * 60)
    logger.info("Fund Data Scraper — Starting")
    logger.info("=" * 60)

    import argparse
    parser = argparse.ArgumentParser(description="Fund Data Scraper")
    parser.add_argument(
        "--fund",
        help="Fund(s) to scrape: one name or comma-separated (e.g. 'orbit', 'orbit,tsl,vertex'). Omit to run all."
    )
    parser.add_argument("--latest-only", action="store_true",
                        help="Only scrape the first 2 pages (latest data) — use for daily cron runs")
    args = parser.parse_args()

    config = load_config()
    sources = config.get("sources", [])

    if args.fund:
        fund_names = [n.strip() for n in args.fund.split(",") if n.strip()]
        sources = [s for s in sources if s["name"] in fund_names]
        missing = set(fund_names) - {s["name"] for s in sources}
        if missing:
            logger.error("Fund(s) not found in config: %s. Valid names: %s", missing, [s["name"] for s in config.get("sources", [])])
            return
        logger.info("Scraping only: %s", fund_names)
    
    # In latest-only mode, cap max_pages so daily runs stay fast,
    # but allow more pages for sources that paginate and need a few extra pages
    if args.latest_only:
        logger.info("Running in --latest-only mode (capped pages per source)")
        for s in sources:
            name = s.get("name")
            cap = 2
            if name in ("itrust", "vertex"):
                cap = 6
            s["max_pages"] = min(s.get("max_pages", 1), cap)

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
            try:
                if consolidated_file:
                    with open(consolidated_file, "r", encoding="utf-8") as f:
                        all_historical = json.load(f)
                    
                    structured_data = map_data(all_historical, name)
                    if not structured_data and name in ("itrust", "orbit", "apef", "tsl"):
                        if all_historical:
                            first = all_historical[0]
                            sample = first if isinstance(first, list) else list(first.keys()) if isinstance(first, dict) else type(first).__name__
                            logger.info("[%s] Consolidated mapping returned 0 rows; sample row: %s", name, str(sample)[:200])
                        structured_data = map_data(data, name)
                        if structured_data:
                            logger.info("[%s] Mapped fresh scrape instead (%s records)", name, len(structured_data))
                    
                    if structured_data:
                        # 4. Save Processed
                        save_processed(
                            structured_data, 
                            name, 
                            config["output"]["processed_path"]
                        )
                        
                        # 5. Push to API
                        # In --latest-only mode, only push the newly scraped data
                        # (not the entire historical dataset which can be 21,000+ records)
                        if args.latest_only:
                            push_data = map_data(data, name)
                            logger.info(f"[{name}] --latest-only: pushing {len(push_data)} new records (not {len(structured_data)} total)")
                        else:
                            push_data = structured_data
                        
                        api_pushed = push_to_api(push_data, name)
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

        # Give Chrome/OS time to release resources before next source (avoids session/renderer errors)
        if source != sources[-1]:
            time.sleep(5)

    logger.info("-" * 60)
    for r in results:
        api_str = "Synced" if r["api_pushed"] else "Local only"
        logger.info(f"  {r['source']}: {r['status']} ({r['rows']} rows) - {api_str}")
    logger.info("=" * 60)
    logger.info("Fund Data Scraper — Complete")


if __name__ == "__main__":
    main()
