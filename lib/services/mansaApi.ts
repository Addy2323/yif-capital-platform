const MANSA_BASE = 'https://mansaapi.com/api/v1/markets/exchanges/DSE';
const MANSA_KEY = process.env.MANSA_API_KEY || 'mansa_live_sk_yzja0dnxqfaamtu3';

const headers = {
  Authorization: `Bearer ${MANSA_KEY}`,
  'Content-Type': 'application/json',
};

// Simple cache entry interface
interface CacheEntry<T> {
  data: T;
  expiry: number;
}
const cache: Record<string, CacheEntry<any>> = {};
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

async function getCached<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  if (cache[key] && cache[key].expiry > now) {
    console.log(`[MANSA CACHE HIT] Key: ${key}`);
    return cache[key].data;
  }
  console.log(`[MANSA CACHE MISS] Fetching Key: ${key}`);
  const data = await fetchFn();
  cache[key] = {
    data,
    expiry: Date.now() + CACHE_TTL_MS,
  };
  return data;
}

// Resilient fetch helper with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// All DSE stocks
export async function getDSEStocks() {
  return getCached('stocks', async () => {
    try {
      const res = await fetchWithTimeout(`${MANSA_BASE}/stocks?limit=200`, { headers });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("[MANSA API] Error in getDSEStocks:", err);
      return { success: false, data: [] };
    }
  });
}

// Single stock quote
export async function getDSEStock(ticker: string) {
  const upperTicker = ticker.toUpperCase();
  return getCached(`stock:${upperTicker}`, async () => {
    try {
      const res = await fetchWithTimeout(`${MANSA_BASE}/stocks/${upperTicker}`, { headers });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(`[MANSA API] Error in getDSEStock for ${upperTicker}:`, err);
      return { success: false, data: null };
    }
  });
}

// Stock fundamentals
export async function getDSEFundamentals(ticker: string) {
  const upperTicker = ticker.toUpperCase();
  return getCached(`fundamentals:${upperTicker}`, async () => {
    try {
      const res = await fetchWithTimeout(`${MANSA_BASE}/stocks/${upperTicker}/fundamentals`, { headers });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(`[MANSA API] Error in getDSEFundamentals for ${upperTicker}:`, err);
      return { success: false, data: null };
    }
  });
}

// Price history
export async function getDSEHistory(ticker: string, range = '1Y') {
  const upperTicker = ticker.toUpperCase();
  return getCached(`history:${upperTicker}:${range}`, async () => {
    try {
      const res = await fetchWithTimeout(`${MANSA_BASE}/stocks/${upperTicker}/history?range=${range}`, { headers });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(`[MANSA API] Error in getDSEHistory for ${upperTicker} (${range}):`, err);
      return { success: false, data: [] };
    }
  });
}

// Top movers
export async function getDSEMovers() {
  return getCached('movers', async () => {
    try {
      const res = await fetchWithTimeout(`${MANSA_BASE}/movers?type=both&limit=10`, { headers });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("[MANSA API] Error in getDSEMovers:", err);
      return { success: false, data: { gainers: [], losers: [] } };
    }
  });
}

// All indices
export async function getDSEIndices() {
  return getCached('indices', async () => {
    try {
      const res = await fetchWithTimeout(`${MANSA_BASE}/indices`, { headers });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("[MANSA API] Error in getDSEIndices:", err);
      return { success: false, data: [] };
    }
  });
}

// Index history
export async function getDSEIndexHistory(code: string, range = '1Y') {
  const upperCode = code.toUpperCase();
  return getCached(`index_history:${upperCode}:${range}`, async () => {
    try {
      const res = await fetchWithTimeout(`${MANSA_BASE}/indices/${upperCode}/history?range=${range}`, { headers });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(`[MANSA API] Error in getDSEIndexHistory for ${upperCode} (${range}):`, err);
      return { success: false, data: [] };
    }
  });
}

// Market open/closed status
export async function getDSEMarketStatus() {
  return getCached('market_status', async () => {
    try {
      const res = await fetchWithTimeout(`https://mansaapi.com/api/v1/markets/calendar/DSE/is-open`, { headers });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("[MANSA API] Error in getDSEMarketStatus:", err);
      return { success: false, data: null };
    }
  });
}
