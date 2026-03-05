import requests
import json

base_url = "https://stockanalysis.com/api/screener/s/f?m=marketCap&s=desc&c=no,s,n,marketCap,price,change,industry,volume,peRatio&f="

filters = [
    "exchange-is-Tanzania Stock Exchange",
    "exchange-is-TZS",
    "exchange-is-DSE",
    "country-is-Tanzania",
    "exchangeCountry-is-Tanzania",
    "exchange-is-Tanzania"
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
}

for f in filters:
    try:
        url = base_url + f
        res = requests.get(url, headers=headers)
        data = res.json()
        print(f"Filter: {f} -> Results: {data['data']['resultsCount']}")
        if data['data']['resultsCount'] > 0:
            print(data['data']['data'][:1])
    except Exception as e:
        print(f"Failed {f}: {e}")
