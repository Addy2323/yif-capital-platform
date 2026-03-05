"""
DSE Stock Data Scraper
======================
Scrapes Tanzania Stock Exchange data from stockanalysis.com.
Uses requests + BeautifulSoup (no Selenium needed - page is server-rendered).

Usage:
  python dse_scraper.py              # Scrape and save locally
  python dse_scraper.py --push       # Scrape and push to API
"""

import os
import sys
import json
import logging
import requests
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR = BASE_DIR / "data" / "stocks"
DATA_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_DIR / f"dse_scraper_{datetime.today().strftime('%Y-%m-%d')}.log"),
    ],
)
logger = logging.getLogger(__name__)

DSE_URL = "https://stockanalysis.com/list/tanzania-stock-exchange/"

# Headers to avoid being blocked
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

# Sector/industry mapping for DSE stocks
STOCK_METADATA = {
    "NMB":       {"sector": "Banking", "industry": "Commercial Banks"},
    "CRDB":      {"sector": "Banking", "industry": "Commercial Banks"},
    "KCB":       {"sector": "Banking", "industry": "Commercial Banks"},
    "DCB":       {"sector": "Banking", "industry": "Commercial Banks"},
    "MCB":       {"sector": "Banking", "industry": "Commercial Banks"},
    "MKCB":      {"sector": "Banking", "industry": "Commercial Banks"},
    "MUCOBA":    {"sector": "Banking", "industry": "Microfinance"},
    "YETU":      {"sector": "Banking", "industry": "Microfinance"},
    "EABL":      {"sector": "Consumer Goods", "industry": "Beverages"},
    "TBL":       {"sector": "Consumer Goods", "industry": "Beverages"},
    "TCC":       {"sector": "Consumer Goods", "industry": "Tobacco"},
    "VODA":      {"sector": "Telecommunications", "industry": "Mobile Services"},
    "TPCC":      {"sector": "Construction", "industry": "Building Materials"},
    "TCCL":      {"sector": "Construction", "industry": "Building Materials"},
    "JHL":       {"sector": "Agriculture", "industry": "Sisal"},
    "KA":        {"sector": "Agriculture", "industry": "Agriculture"},
    "NICO":      {"sector": "Investment", "industry": "Financial Services"},
    "AFRIPRISE": {"sector": "Investment", "industry": "Financial Services"},
    "DSE":       {"sector": "Financial Services", "industry": "Stock Exchange"},
    "SWIS":      {"sector": "Financial Services", "industry": "Insurance"},
    "MBP":       {"sector": "Real Estate", "industry": "Property"},
    "PAL":       {"sector": "Services", "industry": "Aviation"},
    "TOL":       {"sector": "Energy", "industry": "Oil & Gas"},
    "NMG":       {"sector": "Media", "industry": "Publishing"},
    "USL":       {"sector": "Consumer Goods", "industry": "Personal Care"},
    "TTP":       {"sector": "Consumer Goods", "industry": "Tea"},
    "JATU":      {"sector": "Agriculture", "industry": "Agriculture"},
}


def scrape_dse_stocks() -> list:
    """Scrape DSE stock data from stockanalysis.com Screener API."""
    api_url = "https://stockanalysis.com/api/screener/s/f?m=marketCap&s=desc&c=no,s,n,marketCap,price,change,volume,revenue,peRatio,dividendYield,payoutRatio,netIncome,eps,ch1w,ch1m,ch6m,chYTD,ch1y,ch3y,ch5y,psRatio,pbRatio,roe,roa,debtToEquity,dps,dividendGrowth,payoutFrequency,operatingIncome,fcf,fcfPerShare,sharesOut,averageVolume,beta,rsi&f=exchange-is-Tanzania Stock Exchange"
    logger.info(f"Fetching DSE stock data from Screener API: {api_url}")

    try:
        response = requests.get(api_url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        logger.error(f"Failed to fetch API: {e}")
        return []

    results = data.get("data", {}).get("data", [])
    logger.info(f"API returned {len(results)} stock rows")

    stocks = []
    for row in results:
        try:
            # The API returns symbols like 'DAR-NMB' or 'DAR-CRDB'. Let's strip the 'DAR-' prefix.
            symbol = row.get("s", "")
            if symbol.startswith("DAR-"):
                symbol = symbol[4:]

            name = row.get("n", symbol)
            price = row.get("price", 0.0)
            change_pct = row.get("change", 0.0)
            market_cap = row.get("marketCap", 0.0)
            volume = row.get("volume", 0)
            revenue = row.get("revenue", 0.0)

            def get_float(key):
                val = row.get(key)
                if val is not None and str(val).strip() != "":
                    try:
                        return float(val)
                    except ValueError:
                        return None
                return None

            pe_ratio = get_float("peRatio")
            dividend_yield = get_float("dividendYield")
            payout_ratio = get_float("payoutRatio")
            net_income = get_float("netIncome")
            eps = get_float("eps")
            # Performance columns (correct short names)
            change_1w = get_float("ch1w")
            change_1m = get_float("ch1m")
            change_6m = get_float("ch6m")
            ytd_change = get_float("chYTD")
            change_1y = get_float("ch1y")
            change_3y = get_float("ch3y")
            change_5y = get_float("ch5y")
            ps_ratio = get_float("psRatio")
            pb_ratio = get_float("pbRatio")
            roe = get_float("roe")
            roa = get_float("roa")
            debt_to_equity = get_float("debtToEquity")
            # Dividend columns
            dps = get_float("dps")
            dividend_growth = get_float("dividendGrowth")
            payout_frequency = row.get("payoutFrequency")  # String, not float
            # Financial columns
            operating_income = get_float("operatingIncome")
            fcf = get_float("fcf")
            fcf_per_share = get_float("fcfPerShare")
            # Detail page columns
            shares_out = get_float("sharesOut")
            average_volume = get_float("averageVolume")
            beta_val = get_float("beta")
            rsi_val = get_float("rsi")
            
            # Use metadata for mapping sector/industry if available, else fallback to API's industry
            api_industry = row.get("industry", "Other")
            meta = STOCK_METADATA.get(symbol, {"sector": "Other", "industry": api_industry})

            stock = {
                "symbol": symbol,
                "name": name,
                "price": price,
                "change_pct": change_pct,
                # 'change' in the API is actually change percent! Wait no, 'change' in API might be percent. Let's calculate the absolute change anyway.
                "change": round(price * change_pct / 100, 2) if change_pct else 0,
                "market_cap": market_cap,
                "volume": volume,
                "revenue": revenue,
                "pe_ratio": pe_ratio,
                "dividend_yield": dividend_yield,
                "payout_ratio": payout_ratio,
                "net_income": net_income,
                "eps": eps,
                "ytd_change": ytd_change,
                "change_1w": change_1w,
                "change_1m": change_1m,
                "change_6m": change_6m,
                "change_1y": change_1y,
                "change_3y": change_3y,
                "change_5y": change_5y,
                "ps_ratio": ps_ratio,
                "pb_ratio": pb_ratio,
                "roe": roe,
                "roa": roa,
                "debt_to_equity": debt_to_equity,
                "dps": dps,
                "dividend_growth": dividend_growth,
                "payout_frequency": payout_frequency,
                "operating_income": operating_income,
                "fcf": fcf,
                "fcf_per_share": fcf_per_share,
                "shares_out": shares_out,
                "average_volume": average_volume,
                "beta": beta_val,
                "rsi": rsi_val,
                "sector": meta.get("sector", "Other"),
                "industry": meta.get("industry", api_industry),
            }
            stocks.append(stock)
            logger.debug(f"  Parsed: {symbol} — {name} — TZS {price} — PE: {pe_ratio}")

        except Exception as e:
            logger.debug(f"Failed to parse row: {e}")
            continue

    logger.info(f"Successfully processed {len(stocks)} stocks")
    return stocks


def save_local(stocks: list):
    """Save scraped data to local JSON file."""
    if not stocks:
        return

    today = datetime.today().strftime("%Y-%m-%d")
    file_path = DATA_DIR / f"dse_stocks_{today}.json"

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(stocks, f, indent=2)

    logger.info(f"Saved {len(stocks)} stocks to {file_path}")

    # Also save a "latest" file for quick access
    latest_path = DATA_DIR / "dse_stocks_latest.json"
    with open(latest_path, "w", encoding="utf-8") as f:
        json.dump(stocks, f, indent=2)


def push_to_api(stocks: list):
    """Push scraped stock data to the API."""
    api_url = os.getenv("STOCK_API_URL", os.getenv("FUND_API_URL", "http://localhost:3000").rstrip("/api/funds/update"))
    # Normalize the base URL
    if "/api/" in api_url:
        api_url = api_url.split("/api/")[0]
    api_url = f"{api_url}/api/stocks/update"

    logger.info(f"Pushing {len(stocks)} stocks to {api_url}")

    try:
        response = requests.post(
            api_url,
            json={"stocks": stocks},
            timeout=30,
            headers={"Content-Type": "application/json"},
        )

        if response.status_code != 200:
            logger.error(f"API returned status {response.status_code}: {response.text[:500]}")
            return False

        result = response.json()
        logger.info(f"API response: upserted={result.get('upserted', '?')}, errors={result.get('errors', '?')}")
        return True

    except requests.exceptions.ConnectionError as e:
        logger.error(f"API connection failed (is the server running?): {e}")
        return False
    except Exception as e:
        logger.error(f"API push failed: {e}")
        return False


def main():
    import argparse
    parser = argparse.ArgumentParser(description="DSE Stock Data Scraper")
    parser.add_argument("--push", action="store_true", help="Push data to the API")
    args = parser.parse_args()

    logger.info("=" * 60)
    logger.info("DSE Stock Scraper — Starting")
    logger.info("=" * 60)

    stocks = scrape_dse_stocks()

    if stocks:
        save_local(stocks)

        if args.push:
            push_to_api(stocks)
    else:
        logger.warning("No stocks scraped, skipping save/push")

    logger.info("=" * 60)
    logger.info("DSE Stock Scraper — Complete")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
