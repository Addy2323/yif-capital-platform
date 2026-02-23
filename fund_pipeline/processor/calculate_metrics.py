"""
Calculation Engine — Fund Metrics
=================================
Processes raw scraped data into analytics-ready metrics:
  - Daily Return
  - AUM (NAV × Units Outstanding)
  - Rolling Volatility

Only aggregated metrics are saved to DB (via separate sync step).
"""

import os
import json
import logging
import math
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_PATH = BASE_DIR / "data" / "raw"
PROCESSED_PATH = BASE_DIR / "data" / "processed"


def calculate_daily_return(nav_today: float, nav_yesterday: float) -> float:
    """Return = (NAV_today - NAV_yesterday) / NAV_yesterday"""
    if nav_yesterday == 0:
        return 0.0
    return (nav_today - nav_yesterday) / nav_yesterday


def calculate_aum(nav: float, units_outstanding: float) -> float:
    """AUM = NAV × Units Outstanding"""
    return nav * units_outstanding


def calculate_volatility(returns: list, window: int = 20) -> list:
    """
    Rolling standard deviation of returns.
    returns: list of daily returns (floats)
    """
    if not returns:
        return []

    volatility = []
    for i in range(len(returns)):
        # Get window of returns
        start = max(0, i - window + 1)
        subset = returns[start : i + 1]
        
        if len(subset) < 2:
            volatility.append(0.0)
            continue
            
        # Calculate standard deviation
        mean = sum(subset) / len(subset)
        variance = sum((x - mean) ** 2 for x in subset) / (len(subset) - 1)
        std_dev = math.sqrt(variance)
        volatility.append(std_dev)
        
    return volatility


def parse_numeric(value: str) -> float:
    """Helper to parse strings like '1,234.56' to float."""
    if not value or not isinstance(value, str):
        return 0.0
    try:
        # Remove commas and non-numeric chars except .
        clean = "".join(c for c in value if c.isdigit() or c == "." or c == "-")
        return float(clean)
    except:
        return 0.0


def process_fund_file(file_path: str) -> list:
    """
    Read a raw JSON file and compute metrics.
    Assumes rows are lists: [Date, NAV, Units, ...].
    Attempts to identify NAV and Units columns based on typical scraped structures.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if not data:
            logger.warning(f"Empty data: {file_path}")
            return []

        logger.info(f"Processing: {file_path} ({len(data)} rows)")
        
        # Simple heuristic: assume col 0 is date, col 1 is NAV, col 2 is Units if available
        # This is a baseline, usually scrapers produce consistent column orders.
        processed_data = []
        navs = []
        returns = []
        
        for i, row in enumerate(data):
            if not row or len(row) < 2:
                continue
                
            date_str = row[0]
            nav = parse_numeric(row[1])
            units = parse_numeric(row[2]) if len(row) > 2 else 1.0
            
            # Daily Return
            daily_return = 0.0
            if i > 0:
                prev_nav = parse_numeric(data[i-1][1])
                daily_return = calculate_daily_return(nav, prev_nav)
            
            returns.append(daily_return)
            
            # AUM
            aum = calculate_aum(nav, units)
            
            processed_data.append({
                "date": date_str,
                "nav": nav,
                "units": units,
                "daily_return": daily_return,
                "aum": aum
            })

        # Calculate rolling volatility
        vol_list = calculate_volatility(returns)
        for i in range(len(processed_data)):
            processed_data[i]["volatility"] = vol_list[i]

        return processed_data

    except Exception as e:
        logger.error(f"Failed to process {file_path}: {e}")
        return []


def process_all():
    """Process all raw JSON files in the raw directory."""
    PROCESSED_PATH.mkdir(parents=True, exist_ok=True)

    if not RAW_PATH.exists():
        logger.warning(f"Raw data path does not exist: {RAW_PATH}")
        return

    files = list(RAW_PATH.glob("*.json"))
    if not files:
        logger.info("No raw JSON files to process")
        return

    logger.info(f"Found {len(files)} raw file(s) to process")

    for file_path in files:
        processed = process_fund_file(str(file_path))
        if processed:
            out_name = file_path.stem + "_processed.json"
            out_path = PROCESSED_PATH / out_name
            
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(processed, f, indent=4)
                
            logger.info(f"Saved processed → {out_path}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    process_all()
