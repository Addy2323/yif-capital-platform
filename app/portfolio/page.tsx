"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AreaChart, Area, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from 'recharts';
import { motion } from "framer-motion";

/* ─── SVG Icon Components ─── */
const IconChart = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
);
const IconEmptyInbox = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
);
const IconTrendUp = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
);
const IconBank = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="10" width="18" height="11" rx="2" /><path d="M12 2 L2 10 L22 10 Z" /><line x1="7" y1="14" x2="7" y2="17" /><line x1="12" y1="14" x2="12" y2="17" /><line x1="17" y1="14" x2="17" y2="17" /></svg>
);
const IconStar = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
const IconCoins = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><line x1="7" y1="6" x2="7.01" y2="6" /><line x1="16" y1="18" x2="16.01" y2="18" /></svg>
);
const IconEdit = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);
const IconTrash = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);
const IconFlag = () => (
    <svg width="20" height="16" viewBox="0 0 60 40"><rect width="60" height="40" fill="#1EB53A" /><rect y="10" width="60" height="20" fill="#00A3DD" /><rect y="12" width="60" height="16" fill="#000" /><polygon points="0,0 30,20 0,40" fill="#FCD116" /></svg>
);
const IconLock = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);

/* ─── helpers ─── */
const fmt = (n: number) => new Intl.NumberFormat("sw-TZ", { maximumFractionDigits: 0 }).format(n);
const fmtTZS = (n: number) => `TZS ${fmt(n)}`;
const pctChange = (cur: number, buy: number) => (((cur - buy) / buy) * 100).toFixed(2);
const uid = () => Math.random().toString(36).slice(2, 9);

/* ─── stock data type ─── */
interface StockData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePct: number;
    sector: string;
    industry: string;
}

// Keep as fallback just in case
const DSE_STOCKS_FALLBACK = [
    { ticker: "NMB", name: "NMB Bank Plc", sector: "Banking", price: 14690, change: 0.55 },
    { ticker: "CRDB", name: "CRDB Bank Plc", sector: "Banking", price: 2660, change: -4.66 },
    { ticker: "KCB", name: "KCB Group PLC", sector: "Banking", price: 1700, change: 0.00 },
    { ticker: "EABL", name: "East African Breweries PLC", sector: "Consumer Goods", price: 2140, change: -3.60 },
    { ticker: "TBL", name: "Tanzania Breweries Public Limited Company", sector: "Consumer Goods", price: 9760, change: -0.61 },
    { ticker: "VODA", name: "Vodacom Tanzania Public Limited Company", sector: "Telecommunications", price: 780, change: -2.50 },
    { ticker: "TPCC", name: "Tanzania Portland Cement Public Ltd Co", sector: "Construction", price: 6800, change: 0.00 },
    { ticker: "TCC", name: "Tanzania Cigarette Public Limited Company", sector: "Consumer Goods", price: 11780, change: -1.26 },
    { ticker: "JHL", name: "Jubilee Holdings Limited", sector: "Insurance", price: 7000, change: 4.48 },
    { ticker: "KA", name: "Kenya Airways Plc", sector: "Aviation", price: 80, change: 0.00 },
    { ticker: "NICO", name: "National Investment Company Limited", sector: "Investment", price: 3820, change: -1.55 },
    { ticker: "TCCL", name: "Tanga Cement Public Limited Company", sector: "Construction", price: 3180, change: -1.85 },
    { ticker: "DSE", name: "Dar es Salaam Stock Exchange Plc", sector: "Financial Services", price: 6500, change: 1.25 },
    { ticker: "MCB", name: "Mwalimu Commercial Bank PLC", sector: "Banking", price: 2430, change: 7.52 },
    { ticker: "DCB", name: "DCB Commercial Bank Plc", sector: "Banking", price: 835, change: 10.60 },
    { ticker: "AFRIPRISE", name: "Afriprise Investment PLC", sector: "Investment", price: 850, change: -1.16 },
    { ticker: "MKCB", name: "Mkombozi Commercial Bank Plc", sector: "Banking", price: 4980, change: -1.77 },
    { ticker: "SWIS", name: "Swissport Tanzania Plc", sector: "Financial Services", price: 2610, change: -2.61 },
    { ticker: "MBP", name: "Maendeleo Bank PLC", sector: "Banking", price: 2660, change: -8.59 },
    { ticker: "PAL", name: "Precision Air Services Plc", sector: "Aviation", price: 450, change: 12.50 },
    { ticker: "TOL", name: "TOL Gases Limited", sector: "Energy", price: 1010, change: 1.00 },
    { ticker: "NMG", name: "Nation Media Group PLC", sector: "Media", price: 340, change: 9.68 },
    { ticker: "MUCOBA", name: "Mucoba Bank Plc", sector: "Banking", price: 1080, change: 10.20 },
    { ticker: "USL", name: "Uchumi Supermarkets Limited", sector: "Consumer Goods", price: 5, change: 0.00 },
    { ticker: "TTP", name: "Tatepa Public Limited Company", sector: "Consumer Goods", price: 435, change: -3.33 },
    { ticker: "YETU", name: "Yetu Microfinance Bank PLC", sector: "Banking", price: 600, change: 0.00 },
];

const FUND_CATALOGUE = [
    { name: "Umoja Fund", provider: "UTT AMIS", type: "Unit Trust" },
    { name: "Liquid Fund", provider: "UTT AMIS", type: "Money Market" },
    { name: "Bond Fund", provider: "UTT AMIS", type: "Bond Fund" },
    { name: "Faida Fund", provider: "Watumishi Housing Company", type: "Unit Trust" },
    { name: "Jikimu Fund", provider: "UTT AMIS", type: "Unit Trust" },
    { name: "Wekeza Maisha", provider: "UTT AMIS", type: "Unit Trust" },
    { name: "Watoto Fund", provider: "UTT AMIS", type: "Unit Trust" },
    { name: "iSave Fund", provider: "iSave Tanzania", type: "Money Market" },
    { name: "Vertex Bond Fund", provider: "Vertex International Asset Mgmt", type: "Bond Fund" },
    { name: "Sanlam Pesa Fund", provider: "Sanlam Investments", type: "Money Market" },
    { name: "Timiza Fund", provider: "Zan Securities", type: "Unit Trust" },
    { name: "BOT 182-Day T-Bill", provider: "Bank of Tanzania", type: "T-Bill" },
    { name: "BOT 364-Day T-Bill", provider: "Bank of Tanzania", type: "T-Bill" },
    { name: "BOT 5-Year Bond", provider: "Bank of Tanzania", type: "Govt Bond" },
    { name: "BOT 10-Year Bond", provider: "Bank of Tanzania", type: "Govt Bond" },
];

const SECTOR_COLORS: Record<string, string> = {
    Banking: "#D4A017", Telecommunications: "#38bdf8", "Consumer Goods": "#e879f9",
    "Financial Services": "#fb923c", Energy: "#a78bfa",
    Construction: "#f97316", Investment: "#818cf8", Insurance: "#ec4899",
    Aviation: "#22d3ee", Media: "#84cc16", Health: "#f43f5e",
    "Unit Trust": "#34d399", "Money Market": "#38bdf8", "Bond Fund": "#a78bfa",
    "T-Bill": "#fbbf24", "Govt Bond": "#f472b6",
};
const sectorColor = (s: string) => SECTOR_COLORS[s] || "#E2E8F0";

/* ─── storage helpers (per-user) ─── */
const STORAGE_PREFIX = "dse_portfolios_v2_";
const getUserKey = (userId: string) => STORAGE_PREFIX + userId;
const loadData = (userId: string) => {
    try {
        const r = localStorage.getItem(getUserKey(userId));
        return r ? JSON.parse(r) : [];
    } catch { return []; }
};
const saveData = (userId: string, data: any) => {
    try { localStorage.setItem(getUserKey(userId), JSON.stringify(data)); } catch { }
};

/* ─── chart helpers ─── */
const generateHistory = (currentSc: number, investedSc: number) => {
    const data = [];
    const now = new Date();
    // Simulate 12 months of data trailing up to current
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = d.toLocaleString('default', { month: 'short' });

        // Add some noise to make a realistic looking chart
        // Early months are closer to invested amount, later months drift towards current value
        const progress = (11 - i) / 11;
        const randomFluctuation = 1 + (Math.random() * 0.08 - 0.04);

        const pointVal = investedSc + ((currentSc - investedSc) * progress) * randomFluctuation;
        const pointInv = investedSc * (0.8 + (progress * 0.2)); // Simulate gradually investing

        data.push({
            month,
            value: Math.round(pointVal),
            cost: Math.round(pointInv)
        });
    }
    // Ensure the last point matches exact current reality
    if (data.length > 0) {
        data[data.length - 1].value = currentSc;
        data[data.length - 1].cost = investedSc;
    }
    return data;
};

/* ─── investment calculators ─── */
const getHoldingPeriod = (buyDate: string) => {
    if (!buyDate) return "-";
    const d1 = new Date(buyDate).getTime();
    const d2 = new Date().getTime();
    const diffDays = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "-";
    if (diffDays < 30) return `${diffDays}d`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`;
    const yrs = Math.floor(diffDays / 365);
    const mos = Math.floor((diffDays % 365) / 30);
    return mos > 0 ? `${yrs}yr ${mos}mo` : `${yrs}yr`;
};

const getAnnualisedReturn = (gainPct: number, buyDate: string) => {
    if (!buyDate) return "-";
    const d1 = new Date(buyDate).getTime();
    const d2 = new Date().getTime();
    const years = (d2 - d1) / (1000 * 60 * 60 * 24 * 365.25);
    if (years <= 0 || years < 0.08) return "-"; // Need at least ~1 month to annualize properly
    const cagr = (Math.pow(1 + (gainPct / 100), 1 / years) - 1) * 100;
    return isNaN(cagr) ? "-" : Math.abs(cagr).toFixed(2);
};

const getFundDaysToMaturity = (maturityDate: string) => {
    if (!maturityDate) return null;
    const d1 = new Date().getTime();
    const d2 = new Date(maturityDate).getTime();
    const diffDays = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};

const getProjectedInterest = (invested: number, rate: number, startDate: string, maturityDate: string) => {
    if (!invested || !rate || !startDate || !maturityDate) return 0;
    const d1 = new Date(startDate).getTime();
    const d2 = new Date(maturityDate).getTime();
    const days = (d2 - d1) / (1000 * 60 * 60 * 24);
    if (days <= 0) return 0;
    const years = days / 365.25;
    return invested * (rate / 100) * years;
};

/* ─── small components ─── */
const Tag = ({ children, color }: { children: React.ReactNode; color: string }) => (
    <span style={{
        background: color + "22", color, border: `1px solid ${color}44`,
        borderRadius: 6, padding: "2px 9px", fontSize: 11, fontWeight: 700, letterSpacing: 0.8
    }}>{children}</span>
);

const Btn = ({ children, onClick, variant = "primary", disabled, style = {}, className = "" }: any) => {
    const styles: any = {
        primary: { background: "#D4A017", color: "#000", border: "none" },
        ghost: { background: "transparent", color: "#D4A017", border: "1px solid #D4A01766" },
        danger: { background: "transparent", color: "#ff5c5c", border: "1px solid #ff5c5c44" },
        dark: { background: "#24427E", color: "#e8f0fe", border: "1px solid #375692" },
    };
    return (
        <button className={className} onClick={onClick} disabled={disabled} style={{
            ...styles[variant], borderRadius: 10, padding: "9px 18px", fontSize: 13,
            fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
            transition: "all 0.15s", fontFamily: "'Outfit', sans-serif", ...style
        }}>{children}</button>
    );
};

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
    <div style={{
        position: "fixed", inset: 0, background: "#00000088", zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }} onClick={onClose}>
        <div style={{
            background: "#1A3A6E", border: "1px solid #24427E", borderRadius: 20,
            padding: 28, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto"
        }} onClick={(e: any) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800 }}>{title}</span>
                <button onClick={onClose} style={{ background: "none", border: "none", color: "#E2E8F0", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            {children}
        </div>
    </div>
);

const InputField = ({ label, type = "text", value, onChange, placeholder, list }: any) => (
    <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", color: "#E2E8F0", fontSize: 12, fontWeight: 600, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" as const }}>{label}</label>
        <input
            type={type} value={value} onChange={(e: any) => onChange(e.target.value)}
            placeholder={placeholder} list={list}
            style={{
                width: "100%", background: "#0A1F44", border: "1px solid #24427E", borderRadius: 10,
                padding: "10px 14px", color: "#e8f0fe", fontSize: 14, outline: "none",
                fontFamily: "'Outfit', sans-serif", boxSizing: "border-box" as const
            }}
        />
    </div>
);

const AutocompleteField = ({ label, value, onChange, placeholder, options, onSelect }: any) => {
    const [open, setOpen] = useState(false);

    // Filter options based on input
    const filtered = options.filter((o: any) =>
        o.label.toLowerCase().includes(value.toLowerCase()) ||
        (o.sub && o.sub.toLowerCase().includes(value.toLowerCase()))
    );

    return (
        <div style={{ marginBottom: 16, position: "relative" }}>
            <label style={{ display: "block", color: "#E2E8F0", fontSize: 12, fontWeight: 600, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" as const }}>{label}</label>
            <input
                type="text" value={value}
                onChange={(e: any) => { onChange(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
                placeholder={placeholder}
                style={{
                    width: "100%", background: "#0A1F44", border: "1px solid #24427E", borderRadius: 10,
                    padding: "10px 14px", color: "#e8f0fe", fontSize: 14, outline: "none",
                    fontFamily: "'Outfit', sans-serif", boxSizing: "border-box" as const
                }}
            />
            {open && filtered.length > 0 && (
                <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
                    background: "#0A1F44", border: "1px solid #24427E", borderRadius: 10,
                    maxHeight: 220, overflowY: "auto", zIndex: 300, boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                }}>
                    {filtered.map((o: any, i: number) => (
                        <div key={i} onClick={() => { onChange(o.value); onSelect && onSelect(o); setOpen(false); }}
                            style={{ padding: "12px 14px", borderBottom: i < filtered.length - 1 ? "1px solid #1A3A6E" : "none", cursor: "pointer" }}
                            onMouseEnter={(e: any) => e.currentTarget.style.background = "#1A3A6E"}
                            onMouseLeave={(e: any) => e.currentTarget.style.background = "transparent"}
                        >
                            <div style={{ fontWeight: 600, color: "#e8f0fe", fontSize: 14 }}>{o.label}</div>
                            {o.sub && <div style={{ color: "#B0B8C1", fontSize: 12, marginTop: 2 }}>{o.sub}</div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─── MAIN PAGE ─── */
export default function PortfolioPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [portfolios, setPortfolios] = useState<any[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [tab, setTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [liveStocks, setLiveStocks] = useState<StockData[]>([]);
    const [lastLiveUpdate, setLastLiveUpdate] = useState<string | null>(null);

    const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
    const [showAddStock, setShowAddStock] = useState(false);
    const [showAddFund, setShowAddFund] = useState(false);
    const [showEditStock, setShowEditStock] = useState<any>(null);
    const [showEditFund, setShowEditFund] = useState<any>(null);

    const [pName, setPName] = useState("");
    const [pDesc, setPDesc] = useState("");
    const [sTicker, setSTicker] = useState("");
    const [sQty, setSQty] = useState("");
    const [sBuyPrice, setSBuyPrice] = useState("");
    const [sCurPrice, setSCurPrice] = useState("");
    const [sDividend, setSDividend] = useState("");
    const [sBuyDate, setSBuyDate] = useState("");
    const [fName, setFName] = useState("");
    const [fType, setFType] = useState("");
    const [fInvested, setFInvested] = useState("");
    const [fCurrent, setFCurrent] = useState("");
    const [fRate, setFRate] = useState("");
    const [fStartDate, setFStartDate] = useState("");
    const [fMaturityDate, setFMaturityDate] = useState("");

    useEffect(() => {
        if (!user) { setLoading(false); return; }
        const d = loadData(user.id);
        setPortfolios(d);
        if (d.length > 0) setActiveId(d[0].id);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        const fetchStocks = async () => {
            try {
                const res = await fetch("/api/v1/stocks");
                const result = await res.json();
                if (result.success) {
                    setLiveStocks(result.data);
                    setLastLiveUpdate(result.metadata.last_updated);
                }
            } catch (err) {
                console.error("Live stock fetch failed", err);
            }
        };
        fetchStocks();
        const interval = setInterval(fetchStocks, 60000);
        return () => clearInterval(interval);
    }, []);

    const persist = (updated: any[]) => { setPortfolios(updated); if (user) saveData(user.id, updated); };
    const activePortfolio = portfolios.find((p: any) => p.id === activeId);

    const createPortfolio = () => {
        if (!pName.trim()) return;
        const np = { id: uid(), name: pName.trim(), desc: pDesc.trim(), createdAt: Date.now(), stocks: [], funds: [] };
        const updated = [...portfolios, np];
        persist(updated); setActiveId(np.id); setPName(""); setPDesc(""); setShowCreatePortfolio(false); setTab("overview");
    };
    const deletePortfolio = (id: string) => {
        const updated = portfolios.filter((p: any) => p.id !== id);
        persist(updated); setActiveId(updated[0]?.id || null);
    };

    const resetStockForm = () => { setSTicker(""); setSQty(""); setSBuyPrice(""); setSCurPrice(""); setSDividend(""); setSBuyDate(""); };
    const addStock = () => {
        if (!sTicker || !sQty || !sBuyPrice || !sCurPrice) return;
        const cat = liveStocks.find(s => s.symbol === sTicker.toUpperCase());
        const stock = {
            id: uid(),
            ticker: sTicker.toUpperCase(),
            qty: +sQty,
            buyPrice: +sBuyPrice,
            currentPrice: +sCurPrice,
            dividend: +sDividend || 0,
            buyDate: sBuyDate,
            addedAt: Date.now(),
            name: cat?.name || sTicker,
            sector: cat?.sector || "Other"
        };
        const updated = portfolios.map((p: any) => p.id === activeId ? { ...p, stocks: [...p.stocks, stock] } : p);
        persist(updated); resetStockForm(); setShowAddStock(false);
    };
    const updateStock = () => {
        if (!showEditStock) return;
        const updated = portfolios.map((p: any) => p.id === activeId ? { ...p, stocks: p.stocks.map((s: any) => s.id === showEditStock.id ? { ...s, qty: +sQty, buyPrice: +sBuyPrice, currentPrice: +sCurPrice, dividend: +sDividend || 0, buyDate: sBuyDate } : s) } : p);
        persist(updated); resetStockForm(); setShowEditStock(null);
    };
    const deleteStock = (sid: string) => {
        const updated = portfolios.map((p: any) => p.id === activeId ? { ...p, stocks: p.stocks.filter((s: any) => s.id !== sid) } : p);
        persist(updated);
    };
    const openEditStock = (s: any) => { setSTicker(s.ticker); setSQty(String(s.qty)); setSBuyPrice(String(s.buyPrice)); setSCurPrice(String(s.currentPrice)); setSDividend(String(s.dividend)); setSBuyDate(s.buyDate || ""); setShowEditStock(s); };

    const resetFundForm = () => { setFName(""); setFType(""); setFInvested(""); setFCurrent(""); setFRate(""); setFStartDate(""); setFMaturityDate(""); };
    const addFund = () => {
        if (!fName || !fInvested || !fCurrent) return;
        const fund = { id: uid(), name: fName, type: fType || "Unit Trust", invested: +fInvested, currentValue: +fCurrent, rate: +fRate || 0, startDate: fStartDate, maturityDate: fMaturityDate, addedAt: Date.now() };
        const updated = portfolios.map((p: any) => p.id === activeId ? { ...p, funds: [...p.funds, fund] } : p);
        persist(updated); resetFundForm(); setShowAddFund(false);
    };
    const updateFund = () => {
        if (!showEditFund) return;
        const updated = portfolios.map((p: any) => p.id === activeId ? { ...p, funds: p.funds.map((f: any) => f.id === showEditFund.id ? { ...f, name: fName, type: fType, invested: +fInvested, currentValue: +fCurrent, rate: +fRate || 0, startDate: fStartDate, maturityDate: fMaturityDate } : f) } : p);
        persist(updated); resetFundForm(); setShowEditFund(null);
    };
    const deleteFund = (fid: string) => {
        const updated = portfolios.map((p: any) => p.id === activeId ? { ...p, funds: p.funds.filter((f: any) => f.id !== fid) } : p);
        persist(updated);
    };
    const openEditFund = (f: any) => { setFName(f.name); setFType(f.type); setFInvested(String(f.invested)); setFCurrent(String(f.currentValue)); setFRate(String(f.rate || "")); setFStartDate(f.startDate || ""); setFMaturityDate(f.maturityDate || ""); setShowEditFund(f); };

    /* ── derived metrics ── */
    const metrics = (() => {
        if (!activePortfolio) return null;
        const { stocks, funds } = activePortfolio;

        // Use live prices for valuation if available
        const processedStocks = stocks.map((s: any) => {
            const live = liveStocks.find(ls => ls.symbol === s.ticker);
            return {
                ...s,
                currentPrice: live ? live.price : s.currentPrice
            };
        });

        const sv = processedStocks.reduce((a: number, s: any) => a + s.qty * s.currentPrice, 0);
        const si = processedStocks.reduce((a: number, s: any) => a + s.qty * s.buyPrice, 0);
        const fv = funds.reduce((a: number, f: any) => a + f.currentValue, 0);
        const fi = funds.reduce((a: number, f: any) => a + f.invested, 0);
        const div = processedStocks.reduce((a: number, s: any) => a + s.qty * (s.dividend || 0), 0);
        const total = sv + fv;
        const invested = si + fi;
        const gain = total - invested;
        const gainPct = invested ? ((gain / invested) * 100).toFixed(2) : "0";
        const best = [...processedStocks].sort((a: any, b: any) => +pctChange(b.currentPrice, b.buyPrice) - +pctChange(a.currentPrice, a.buyPrice))[0];

        return { sv, si, fv, fi, div, total, invested, gain, gainPct, best, processedStocks };
    })();

    /* ─── RENDER ─── */
    if (authLoading || loading) return (
        <div className="flex min-h-[80vh] items-center justify-center bg-background/95">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
        </div>
    );

    /* ─── AUTH GATE ─── */
    if (!user) return (
        <div className="flex min-h-[80vh] items-center justify-center bg-background/95 p-6">
            <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <div style={{
                background: "#1A3A6E", border: "1px solid #24427E", borderRadius: 24,
                padding: "48px 36px", maxWidth: 460, width: "100%", textAlign: "center",
                fontFamily: "'Outfit', sans-serif", color: "#e8f0fe",
                animation: "pf-fadeIn 0.5s"
            }}>
                <style>{`@keyframes pf-fadeIn { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: none; } }`}</style>
                <div style={{ color: "#D4A017", marginBottom: 20, display: "flex", justifyItems: "center", justifyContent: "center" }}><IconLock /></div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Members Only Feature</div>
                <p style={{ color: "#B0B8C1", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                    The Portfolio section is available only for registered users.
                </p>
                <div style={{ textAlign: "left", marginBottom: 28, padding: "0 12px" }}>
                    <p style={{ color: "#E2E8F0", fontSize: 14, marginBottom: 12 }}>With a YIF Capital account you can:</p>
                    {[
                        "Create your investment portfolio",
                        "Add funds and stocks",
                        "Track profit and performance",
                        "Monitor your investments anytime",
                    ].map(item => (
                        <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4A017", flexShrink: 0 }} />
                            <span style={{ color: "#e8f0fe", fontSize: 14 }}>{item}</span>
                        </div>
                    ))}
                </div>
                <p style={{ color: "#B0B8C1", fontSize: 14, marginBottom: 24 }}>
                    Join YIF Capital today and start growing your wealth.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                    <Link href="/login" style={{
                        background: "transparent", color: "#D4A017", border: "1px solid #D4A01766",
                        borderRadius: 10, padding: "11px 28px", fontSize: 14, fontWeight: 700,
                        textDecoration: "none", transition: "all 0.15s"
                    }}>Login</Link>
                    <Link href="/register" style={{
                        background: "#D4A017", color: "#000", border: "none",
                        borderRadius: 10, padding: "11px 28px", fontSize: 14, fontWeight: 700,
                        textDecoration: "none", transition: "all 0.15s"
                    }}>Create Free Account</Link>
                </div>
            </div>
        </div>
    );

    const tabs = ["overview", "stocks", "funds", "performance"];

    return (
        <div className="min-h-screen bg-background/95">
            {/* Hero Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative overflow-hidden bg-slate-950 py-20 mb-8"
            >
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-zinc-500/20 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-blue-500/10 blur-[100px] rounded-full" />
                </div>

                <div className="container mx-auto px-4 relative z-10 max-w-7xl text-center">
                    <div className="inline-block mb-4 border border-zinc-500/30 text-zinc-400 bg-zinc-500/10 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                        My Investments
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white flex flex-col items-center justify-center gap-2">
                        Investment <span className="text-zinc-400 italic">Portfolio</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                        Track your local assets across multiple strategies with robust analytics.
                    </p>
                </div>
            </motion.div>

            <div style={{ minHeight: "100vh", background: "#0A1F44", color: "#e8f0fe", fontFamily: "'Outfit', sans-serif" }}>
                <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
                <style>{`
            .pf-wrap * { box-sizing: border-box; }
            .pf-wrap input::placeholder { color: #375692; }
            .pf-wrap input:focus { border-color: #D4A017 !important; }
            .pf-wrap ::-webkit-scrollbar { width: 5px; height: 5px; }
            .pf-wrap ::-webkit-scrollbar-track { background: #0A1F44; }
            .pf-wrap ::-webkit-scrollbar-thumb { background: #24427E; border-radius: 3px; }
            @keyframes pf-slideUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: none; } }
            @keyframes pf-fadeIn { from { opacity:0 } to { opacity:1 } }
            .pf-card-hover:hover { border-color: #D4A01799 !important; transform: translateY(-1px); }
          `}</style>

                <div className="pf-wrap">
                    {/* ─── TOP NAV ─── */}
                    <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-2 sticky z-50 rounded-xl" style={{ background: "#051430", border: "1px solid #24427E", padding: "12px 16px", top: 16, margin: "0 16px" }}>
                        <span className="flex items-center gap-2 shrink-0 whitespace-nowrap" style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800 }}>
                            <IconFlag /> <span style={{ color: "#D4A017" }}>YIF Capital</span> <span className="hidden sm:inline">Portfolio</span>
                        </span>

                        <div className="order-3 w-full sm:order-2 sm:flex-1 sm:w-auto flex gap-2 overflow-x-auto pb-1 mt-1 sm:mt-0 hide-scrollbar" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                            {portfolios.map((p: any) => (
                                <button key={p.id} onClick={() => { setActiveId(p.id); setTab("overview"); }} style={{
                                    flexShrink: 0,
                                    background: p.id === activeId ? "#D4A017" : "#1A3A6E",
                                    color: p.id === activeId ? "#000" : "#E2E8F0",
                                    border: `1px solid ${p.id === activeId ? "#D4A017" : "#24427E"}`,
                                    borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600,
                                    cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s"
                                }}>{p.name}</button>
                            ))}
                        </div>

                        <Btn variant="ghost" className="order-2 sm:order-3 shrink-0 whitespace-nowrap" style={{ padding: "7px 14px", fontSize: 13 }} onClick={() => setShowCreatePortfolio(true)}>+ New Portfolio</Btn>
                    </div>

                    {/* ─── EMPTY STATE ─── */}
                    {portfolios.length === 0 && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: 20, animation: "pf-fadeIn 0.6s" }}>
                            <div style={{ color: "#D4A017" }}><IconChart /></div>
                            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, textAlign: "center" }}>Your YIF Capital Portfolio awaits</div>
                            <div style={{ color: "#B0B8C1", maxWidth: 360, textAlign: "center", lineHeight: 1.6 }}>
                                Create your first portfolio to start tracking Tanzanian stocks, funds, bonds, and more — all in TZS.
                            </div>
                            <Btn onClick={() => setShowCreatePortfolio(true)}>Create First Portfolio</Btn>
                        </div>
                    )}

                    {/* ─── PORTFOLIO VIEW ─── */}
                    {activePortfolio && (
                        <>
                            <div style={{ padding: "20px 24px 0", maxWidth: 1000, margin: "0 auto" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
                                    <div className="flex-1">
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800 }}>{activePortfolio.name}</div>
                                            {lastLiveUpdate && (
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Live Sync Active
                                                </div>
                                            )}
                                        </div>
                                        {activePortfolio.desc && <div style={{ color: "#B0B8C1", fontSize: 13, marginTop: 2 }}>{activePortfolio.desc}</div>}
                                    </div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <Btn variant="ghost" onClick={() => setShowAddStock(true)}>+ Stock</Btn>
                                        <Btn variant="ghost" onClick={() => setShowAddFund(true)}>+ Fund</Btn>
                                        <Btn variant="danger" onClick={() => deletePortfolio(activePortfolio.id)}>Delete</Btn>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #24427E", marginTop: 16, overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }} className="hide-scrollbar">
                                    {tabs.map(t => (
                                        <button key={t} onClick={() => setTab(t)} style={{
                                            flexShrink: 0, whiteSpace: "nowrap",
                                            background: "none", border: "none", borderBottom: tab === t ? "2px solid #D4A017" : "2px solid transparent",
                                            color: tab === t ? "#D4A017" : "#B0B8C1", padding: "10px 20px", fontSize: 13, fontWeight: 600,
                                            cursor: "pointer", textTransform: "capitalize" as const, transition: "all 0.15s", letterSpacing: 0.3
                                        }}>{t}</button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 24px 60px", animation: "pf-slideUp 0.4s" }}>

                                {/* ── OVERVIEW TAB ── */}
                                {tab === "overview" && metrics && (
                                    <>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
                                            {[
                                                { label: "Total Value", val: fmtTZS(metrics.total), sub: `${metrics.gainPct}% overall`, accent: "#D4A017" },
                                                { label: "Invested", val: fmtTZS(metrics.invested), sub: "Total cost basis", accent: "#38bdf8" },
                                                { label: "Total Gain / Loss", val: fmtTZS(Math.abs(metrics.gain)), sub: metrics.gain >= 0 ? "Unrealised profit" : "Unrealised loss", accent: metrics.gain >= 0 ? "#D4A017" : "#ff5c5c" },
                                                { label: "Annual Dividends", val: fmtTZS(metrics.div), sub: "From stock holdings", accent: "#F59E0B" },
                                            ].map(k => (
                                                <div key={k.label} className="pf-card-hover" style={{
                                                    background: "#1A3A6E", border: "1px solid #24427E", borderRadius: 14,
                                                    padding: "18px 20px", borderTop: `3px solid ${k.accent}`, transition: "all 0.2s"
                                                }}>
                                                    <div style={{ color: "#B0B8C1", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 6 }}>{k.label}</div>
                                                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 17, fontWeight: 500, color: "#e8f0fe" }}>{k.val}</div>
                                                    <div style={{ color: k.accent, fontSize: 12, marginTop: 4 }}>{k.sub}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, marginBottom: 24 }}>
                                            {/* ── 12-Month Trend Chart ── */}
                                            <div style={{ background: "#1A3A6E", border: "1px solid #24427E", borderRadius: 16, padding: "20px 24px", height: 320, animation: "pf-slideUp 0.3s 0.1s both" }}>
                                                <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Portfolio Value Trend</div>
                                                <ResponsiveContainer width="100%" height="85%">
                                                    <AreaChart data={generateHistory(metrics.total, metrics.invested)} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#D4A017" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#D4A017" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#24427E" vertical={false} />
                                                        <XAxis dataKey="month" stroke="#B0B8C1" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                                        <YAxis stroke="#B0B8C1" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `Tsh ${val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`} dx={-10} width={60} />
                                                        <ReTooltip
                                                            contentStyle={{ background: "#051430", border: "1px solid #24427E", borderRadius: 12, padding: "12px 16px" }}
                                                            itemStyle={{ color: "#e8f0fe", fontSize: 13, fontWeight: 500 }}
                                                            labelStyle={{ color: "#B0B8C1", fontSize: 12, marginBottom: 4 }}
                                                            formatter={(val: number, name: string) => [fmtTZS(val), name === 'value' ? 'Portfolio Value' : 'Cost Basis']}
                                                        />
                                                        <Area type="monotone" dataKey="value" stroke="#D4A017" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                                        <Area type="monotone" dataKey="cost" stroke="#38bdf8" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {(activePortfolio.stocks.length > 0 || activePortfolio.funds.length > 0) && (
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 20, animation: "pf-slideUp 0.3s 0.2s both" }}>
                                                {/* ── Asset Mix Donut ── */}
                                                <div style={{ background: "#1A3A6E", border: "1px solid #24427E", borderRadius: 16, padding: 22, display: "flex", flexDirection: "column" }}>
                                                    <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>Asset Mix</div>
                                                    <div style={{ height: 200, flexShrink: 0 }}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie data={[{ name: 'Stocks', value: metrics.sv }, { name: 'Funds', value: metrics.fv }].filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                                                    <Cell key="cell-stocks" fill="#D4A017" />
                                                                    <Cell key="cell-funds" fill="#F59E0B" />
                                                                </Pie>
                                                                <ReTooltip contentStyle={{ background: "#051430", border: "1px solid #24427E", borderRadius: 8, padding: "8px 12px" }} itemStyle={{ color: "#e8f0fe", fontSize: 13 }} formatter={(val: number) => fmtTZS(val)} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", marginTop: "auto" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: "#D4A017" }} /><span style={{ color: "#E2E8F0", fontSize: 13 }}>Stocks — {fmtTZS(metrics.sv)}</span></div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: "#F59E0B" }} /><span style={{ color: "#E2E8F0", fontSize: 13 }}>Funds — {fmtTZS(metrics.fv)}</span></div>
                                                    </div>
                                                </div>

                                                {/* ── Sector Exposure Donut ── */}
                                                {activePortfolio.stocks.length > 0 && (
                                                    <div style={{ background: "#1A3A6E", border: "1px solid #24427E", borderRadius: 16, padding: 22, display: "flex", flexDirection: "column" }}>
                                                        <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>Sector Exposure (Stocks)</div>
                                                        <div style={{ height: 200, flexShrink: 0 }}>
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <PieChart>
                                                                    <Pie data={Object.entries(activePortfolio.stocks.reduce((acc: any, s: any) => ({ ...acc, [s.sector]: (acc[s.sector] || 0) + s.qty * s.currentPrice }), {})).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                                                                        {Object.entries(activePortfolio.stocks.reduce((acc: any, s: any) => ({ ...acc, [s.sector]: (acc[s.sector] || 0) + s.qty * s.currentPrice }), {})).map(([name, _], i) => (
                                                                            <Cell key={`cell-${i}`} fill={sectorColor(name)} />
                                                                        ))}
                                                                    </Pie>
                                                                    <ReTooltip contentStyle={{ background: "#051430", border: "1px solid #24427E", borderRadius: 8, padding: "8px 12px" }} itemStyle={{ color: "#e8f0fe", fontSize: 13 }} formatter={(val: number) => fmtTZS(val)} />
                                                                </PieChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: "auto", maxHeight: 60, overflowY: "auto", scrollbarWidth: "none" }}>
                                                            {Object.entries(activePortfolio.stocks.reduce((acc: any, s: any) => ({ ...acc, [s.sector]: (acc[s.sector] || 0) + s.qty * s.currentPrice }), {})).map(([name, value]: any) => (
                                                                <div key={name} style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: sectorColor(name) }} /><span style={{ color: "#B0B8C1", fontSize: 11 }}>{name}</span></div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {metrics.best && (
                                            <div style={{ background: "#D4A0171A", border: "1px solid #D4A0174D", borderRadius: 16, padding: 20 }}>
                                                <div style={{ color: "#B0B8C1", fontSize: 12, letterSpacing: 1, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#F59E0B" }}><IconStar /></span> BEST PERFORMER</div>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: 16 }}>{metrics.best.name}</div>
                                                        <Tag color={sectorColor(metrics.best.sector)}>{metrics.best.sector}</Tag>
                                                    </div>
                                                    <div style={{ textAlign: "right" }}>
                                                        <div style={{ fontFamily: "'DM Mono', monospace", color: "#D4A017", fontSize: 22, fontWeight: 500 }}>+{pctChange(metrics.best.currentPrice, metrics.best.buyPrice)}%</div>
                                                        <div style={{ color: "#B0B8C1", fontSize: 12 }}>{fmtTZS(metrics.best.qty * metrics.best.currentPrice)} current value</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activePortfolio.stocks.length === 0 && activePortfolio.funds.length === 0 && (
                                            <div style={{ textAlign: "center", padding: "60px 20px", color: "#B0B8C1" }}>
                                                <div style={{ marginBottom: 12, color: "#E2E8F0", display: "flex", justifyContent: "center" }}><IconEmptyInbox /></div>
                                                <div style={{ fontSize: 16, marginBottom: 8 }}>Portfolio is empty</div>
                                                <div style={{ fontSize: 13, marginBottom: 20 }}>Add stocks or funds to start tracking performance</div>
                                                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                                                    <Btn onClick={() => setShowAddStock(true)}>+ Add Stock</Btn>
                                                    <Btn variant="dark" onClick={() => setShowAddFund(true)}>+ Add Fund</Btn>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ── STOCKS TAB ── */}
                                {tab === "stocks" && (
                                    <>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                            <span style={{ color: "#B0B8C1", fontSize: 13 }}>{activePortfolio.stocks.length} holding{activePortfolio.stocks.length !== 1 ? "s" : ""}</span>
                                            <Btn onClick={() => setShowAddStock(true)}>+ Add Stock</Btn>
                                        </div>
                                        {activePortfolio.stocks.length === 0 ? (
                                            <div style={{ textAlign: "center", padding: "60px 20px", color: "#B0B8C1" }}>
                                                <div style={{ marginBottom: 12, color: "#D4A017", display: "flex", justifyContent: "center" }}><IconTrendUp /></div>
                                                <div>No stocks yet. Add your first Tanzanian stock.</div>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                                {activePortfolio.stocks.map((s: any, i: number) => {
                                                    const val = s.qty * s.currentPrice; const cost = s.qty * s.buyPrice;
                                                    const g = val - cost; const gp = +pctChange(s.currentPrice, s.buyPrice); const up = gp >= 0;
                                                    return (
                                                        <div key={s.id} className="pf-card-hover" style={{
                                                            background: "#1A3A6E", border: "1px solid #24427E", borderRadius: 16,
                                                            padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                                                            transition: "all 0.2s", animation: `pf-slideUp 0.3s ${i * 0.05}s both`
                                                        }}>
                                                            <div style={{ width: 46, height: 46, borderRadius: 12, background: sectorColor(s.sector) + "22", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600, color: sectorColor(s.sector), flexShrink: 0, border: `1px solid ${sectorColor(s.sector)}44` }}>{s.ticker}</div>
                                                            <div style={{ flex: 1, minWidth: 200 }}>
                                                                <div style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</div>
                                                                <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
                                                                    <Tag color={sectorColor(s.sector)}>{s.sector}</Tag>
                                                                    <span style={{ color: "#B0B8C1", fontSize: 12 }}>{s.qty.toLocaleString()} shares</span>
                                                                </div>
                                                                <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                                                                    <div>
                                                                        <div style={{ color: "#B0B8C1", fontSize: 10, letterSpacing: 0.5, marginBottom: 2 }}>BUY → CURRENT</div>
                                                                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{fmt(s.buyPrice)} → {fmt(s.currentPrice)}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ color: "#B0B8C1", fontSize: 10, letterSpacing: 0.5, marginBottom: 2 }}>VALUE & RETURN</div>
                                                                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{fmtTZS(val)} <span style={{ color: up ? "#D4A017" : "#ff5c5c", fontSize: 12 }}>({up ? "+" : ""}{gp}%)</span></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ flex: 1, minWidth: 200 }}>
                                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                                                    <div>
                                                                        <div style={{ color: "#B0B8C1", fontSize: 10, letterSpacing: 0.5, marginBottom: 2 }}>PERIOD & ANNUALISED</div>
                                                                        <div style={{ fontSize: 12, color: "#e8f0fe" }}>Held: {getHoldingPeriod(s.buyDate)}</div>
                                                                        <div style={{ fontSize: 12, color: up ? "#D4A017" : "#ff5c5c" }}>{getAnnualisedReturn(gp, s.buyDate)}% p.a.</div>
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ color: "#B0B8C1", fontSize: 10, letterSpacing: 0.5, marginBottom: 2 }}>DIVIDENDS</div>
                                                                        <div style={{ color: "#F59E0B", fontSize: 12 }}>{s.dividend > 0 ? `${fmtTZS(s.qty * s.dividend)}/yr` : "-"}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: "flex", gap: 6 }}>
                                                                <button onClick={() => openEditStock(s)} style={{ background: "#24427E", border: "none", borderRadius: 8, padding: "8px 12px", color: "#E2E8F0", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center" }}><IconEdit /></button>
                                                                <button onClick={() => deleteStock(s.id)} style={{ background: "#ff5c5c11", border: "1px solid #ff5c5c33", borderRadius: 8, padding: "8px 12px", color: "#ff5c5c", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center" }}><IconTrash /></button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ── FUNDS TAB ── */}
                                {tab === "funds" && (
                                    <>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                            <span style={{ color: "#B0B8C1", fontSize: 13 }}>{activePortfolio.funds.length} fund{activePortfolio.funds.length !== 1 ? "s" : ""}</span>
                                            <Btn onClick={() => setShowAddFund(true)}>+ Add Fund / Bond</Btn>
                                        </div>
                                        {activePortfolio.funds.length === 0 ? (
                                            <div style={{ textAlign: "center", padding: "60px 20px", color: "#B0B8C1" }}>
                                                <div style={{ marginBottom: 12, color: "#38bdf8", display: "flex", justifyContent: "center" }}><IconBank /></div>
                                                <div>No funds yet. Add unit trusts, T-bills, or government bonds.</div>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                                {activePortfolio.funds.map((f: any, i: number) => {
                                                    const g = f.currentValue - f.invested; const gp = +pctChange(f.currentValue, f.invested); const up = gp >= 0;
                                                    return (
                                                        <div key={f.id} className="pf-card-hover" style={{
                                                            background: "#1A3A6E", border: "1px solid #24427E", borderRadius: 16,
                                                            padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                                                            transition: "all 0.2s", animation: `pf-slideUp 0.3s ${i * 0.05}s both`
                                                        }}>
                                                            <div style={{ flex: 1, minWidth: 200 }}>
                                                                <div style={{ fontWeight: 600, fontSize: 15 }}>{f.name}</div>
                                                                <div style={{ marginTop: 4 }}><Tag color={sectorColor(f.type)}>{f.type}</Tag></div>
                                                                <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                                                                    <div>
                                                                        <div style={{ color: "#B0B8C1", fontSize: 10, letterSpacing: 0.5, marginBottom: 2 }}>INVESTED → CURRENT</div>
                                                                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{fmtTZS(f.invested)} → {fmtTZS(f.currentValue)}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ flex: 1, minWidth: 200 }}>
                                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                                                    <div>
                                                                        <div style={{ color: "#B0B8C1", fontSize: 10, letterSpacing: 0.5, marginBottom: 2 }}>RATES & DATES</div>
                                                                        <div style={{ fontSize: 12, color: "#e8f0fe" }}>Rate: {f.rate ? `${f.rate}% p.a.` : "-"}</div>
                                                                        <div style={{ fontSize: 12, color: "#B0B8C1" }}>Till: {f.maturityDate || "-"} {f.maturityDate && `(${getFundDaysToMaturity(f.maturityDate)}d left)`}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ color: "#B0B8C1", fontSize: 10, letterSpacing: 0.5, marginBottom: 2 }}>PROJ. INTEREST</div>
                                                                        <div style={{ color: "#F59E0B", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>{f.rate && f.startDate && f.maturityDate ? `+${fmtTZS(getProjectedInterest(f.invested, f.rate, f.startDate, f.maturityDate))}` : "-"}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: "flex", gap: 6 }}>
                                                                <button onClick={() => openEditFund(f)} style={{ background: "#24427E", border: "none", borderRadius: 8, padding: "8px 12px", color: "#E2E8F0", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center" }}><IconEdit /></button>
                                                                <button onClick={() => deleteFund(f.id)} style={{ background: "#ff5c5c11", border: "1px solid #ff5c5c33", borderRadius: 8, padding: "8px 12px", color: "#ff5c5c", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center" }}><IconTrash /></button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ── PERFORMANCE TAB ── */}
                                {tab === "performance" && metrics && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                        <div style={{ background: "#1A3A6E", border: "1px solid #24427E", borderRadius: 16, overflow: "hidden" }}>
                                            <div style={{ padding: "16px 20px", borderBottom: "1px solid #24427E", fontWeight: 700 }}>Performance Summary</div>
                                            {[
                                                { label: "Total Invested", val: fmtTZS(metrics.invested) },
                                                { label: "Current Portfolio Value", val: fmtTZS(metrics.total) },
                                                { label: "Capital Gain / Loss", val: (metrics.gain >= 0 ? "+" : "-") + fmtTZS(Math.abs(metrics.gain)), color: metrics.gain >= 0 ? "#D4A017" : "#ff5c5c" },
                                                { label: "Overall Return", val: `${metrics.gainPct}%`, color: +metrics.gainPct >= 0 ? "#D4A017" : "#ff5c5c" },
                                                { label: "Annual Dividend Income", val: fmtTZS(metrics.div), color: "#F59E0B" },
                                                { label: "Total Return (incl. dividends)", val: fmtTZS(metrics.gain + metrics.div), color: "#D4A017" },
                                            ].map((row, i) => (
                                                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "13px 20px", borderBottom: i < 5 ? "1px solid #2A4A8E" : "none", background: i % 2 === 0 ? "transparent" : "#0D2654" }}>
                                                    <span style={{ color: "#E2E8F0", fontSize: 13 }}>{row.label}</span>
                                                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: row.color || "#e8f0fe" }}>{row.val}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {activePortfolio.stocks.length > 0 && (
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
                                                {/* ── Cost vs Value Bar Chart ── */}
                                                <div style={{ background: "#1A3A6E", border: "1px solid #24427E", borderRadius: 16, padding: "20px 24px", height: 320, animation: "pf-slideUp 0.3s 0.1s both" }}>
                                                    <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Cost vs Current Value</div>
                                                    <ResponsiveContainer width="100%" height="85%">
                                                        <BarChart data={activePortfolio.stocks.map((s: any) => ({ name: s.ticker, Cost: s.qty * s.buyPrice, Value: s.qty * s.currentPrice }))} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barGap={2} barCategoryGap="20%">
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#24427E" vertical={false} />
                                                            <XAxis dataKey="name" stroke="#B0B8C1" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                                            <YAxis stroke="#B0B8C1" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `Tsh ${(val / 1000).toFixed(0)}k`} dx={-10} width={60} />
                                                            <ReTooltip contentStyle={{ background: "#051430", border: "1px solid #24427E", borderRadius: 12, padding: "12px 16px" }} itemStyle={{ fontSize: 13, fontWeight: 500 }} labelStyle={{ color: "#B0B8C1", fontSize: 12, marginBottom: 4 }} formatter={(val: number) => fmtTZS(val)} cursor={{ fill: "#24427E", opacity: 0.4 }} />
                                                            <Bar dataKey="Cost" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                                                            <Bar dataKey="Value" fill="#D4A017" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>

                                                {/* ── Stock Return % Bar Chart ── */}
                                                <div style={{ background: "#1A3A6E", border: "1px solid #24427E", borderRadius: 16, padding: "20px 24px", height: 320, animation: "pf-slideUp 0.3s 0.2s both" }}>
                                                    <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Stock Return %</div>
                                                    <ResponsiveContainer width="100%" height="85%">
                                                        <BarChart data={[...activePortfolio.stocks].map((s: any) => ({ name: s.ticker, Return: +(pctChange(s.currentPrice, s.buyPrice)) })).sort((a, b) => b.Return - a.Return)} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barCategoryGap="20%">
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#24427E" vertical={false} />
                                                            <XAxis dataKey="name" stroke="#B0B8C1" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                                            <YAxis stroke="#B0B8C1" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} dx={-10} width={40} />
                                                            <ReTooltip contentStyle={{ background: "#051430", border: "1px solid #24427E", borderRadius: 12, padding: "12px 16px" }} itemStyle={{ fontSize: 13, fontWeight: 500 }} labelStyle={{ color: "#B0B8C1", fontSize: 12, marginBottom: 4 }} formatter={(val: number) => `${val}%`} cursor={{ fill: "#24427E", opacity: 0.4 }} />
                                                            <Bar dataKey="Return" radius={[4, 4, 0, 0]}>
                                                                {[...activePortfolio.stocks].sort((a: any, b: any) => +pctChange(b.currentPrice, b.buyPrice) - +pctChange(a.currentPrice, a.buyPrice)).map((entry: any, index: number) => (
                                                                    <Cell key={`cell-${index}`} fill={+pctChange(entry.currentPrice, entry.buyPrice) >= 0 ? "#D4A017" : "#ff5c5c"} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        )}

                                        {metrics.div > 0 && (
                                            <div style={{ background: "#D4A0171A", border: "1px solid #D4A0174D", borderRadius: 16, overflow: "hidden" }}>
                                                <div style={{ padding: "16px 20px", borderBottom: "1px solid #D4A01733", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#F59E0B" }}><IconCoins /></span> Dividend Income Breakdown</div>
                                                {activePortfolio.stocks.filter((s: any) => s.dividend > 0).map((s: any, i: number, arr: any[]) => (
                                                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", borderBottom: i < arr.length - 1 ? "1px solid #2A4A8E" : "none" }}>
                                                        <span style={{ color: "#E2E8F0", fontSize: 13 }}>{s.name} ({s.qty.toLocaleString()} × {fmt(s.dividend)} TZS)</span>
                                                        <span style={{ fontFamily: "'DM Mono', monospace", color: "#F59E0B" }}>{fmtTZS(s.qty * s.dividend)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ─── MODALS ─── */}
                    {showCreatePortfolio && (
                        <Modal title="Create New Portfolio" onClose={() => setShowCreatePortfolio(false)}>
                            <InputField label="Portfolio Name" value={pName} onChange={setPName} placeholder="e.g. My YIF Capital Investments" />
                            <InputField label="Description (optional)" value={pDesc} onChange={setPDesc} placeholder="e.g. Long-term savings" />
                            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                                <Btn onClick={createPortfolio} disabled={!pName.trim()} style={{ flex: 1 }}>Create Portfolio</Btn>
                                <Btn variant="dark" onClick={() => setShowCreatePortfolio(false)}>Cancel</Btn>
                            </div>
                        </Modal>
                    )}

                    {(showAddStock || showEditStock) && (
                        <Modal title={showEditStock ? `Edit ${showEditStock.ticker}` : "Add Tanzanian Stock"} onClose={() => { setShowAddStock(false); setShowEditStock(null); resetStockForm(); }}>
                            {!showEditStock && (
                                <AutocompleteField
                                    label="Ticker Symbol"
                                    value={sTicker}
                                    onChange={(v: string) => setSTicker(v.toUpperCase())}
                                    placeholder="e.g. CRDB"
                                    options={liveStocks.map(s => ({ value: s.symbol, label: s.symbol, sub: `${s.name} — ${s.sector}`, price: s.price }))}
                                    onSelect={(o: any) => {
                                        if (o.price) setSCurPrice(String(o.price));
                                    }}
                                />
                            )}
                            <InputField label="Purchase Date (Optional)" type="date" value={sBuyDate} onChange={setSBuyDate} />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <InputField label="Shares Owned" type="number" value={sQty} onChange={setSQty} placeholder="1000" />
                                <InputField label="Buy Price (TZS)" type="number" value={sBuyPrice} onChange={setSBuyPrice} placeholder="310" />
                                <InputField label="Current Price (TZS)" type="number" value={sCurPrice} onChange={setSCurPrice} placeholder="375" />
                                <InputField label="Dividend/Share (TZS)" type="number" value={sDividend} onChange={setSDividend} placeholder="45" />
                            </div>
                            {sTicker && sBuyPrice && sCurPrice && (
                                <div style={{ background: "#0A1F44", border: "1px solid #24427E", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                                    <div style={{ color: "#B0B8C1", fontSize: 12, marginBottom: 4 }}>Preview</div>
                                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
                                        {sQty && <span>{fmt(+sQty * +sCurPrice)} TZS current value · </span>}
                                        <span style={{ color: +sCurPrice >= +sBuyPrice ? "#D4A017" : "#ff5c5c" }}>{+sCurPrice >= +sBuyPrice ? "+" : ""}{pctChange(+sCurPrice, +sBuyPrice)}%</span>
                                    </div>
                                </div>
                            )}
                            <div style={{ display: "flex", gap: 10 }}>
                                <Btn onClick={showEditStock ? updateStock : addStock} disabled={!sTicker || !sQty || !sBuyPrice || !sCurPrice} style={{ flex: 1 }}>{showEditStock ? "Save Changes" : "Add Stock"}</Btn>
                                <Btn variant="dark" onClick={() => { setShowAddStock(false); setShowEditStock(null); resetStockForm(); }}>Cancel</Btn>
                            </div>
                        </Modal>
                    )}

                    {(showAddFund || showEditFund) && (
                        <Modal title={showEditFund ? "Edit Fund" : "Add Fund / Bond"} onClose={() => { setShowAddFund(false); setShowEditFund(null); resetFundForm(); }}>
                            <AutocompleteField
                                label="Fund / Bond Name"
                                value={fName}
                                onChange={setFName}
                                placeholder="e.g. Umoja Fund"
                                options={FUND_CATALOGUE.map(f => ({ value: f.name, label: f.name, sub: `${f.provider} — ${f.type}`, type: f.type }))}
                                onSelect={(o: any) => {
                                    if (o.type) setFType(o.type);
                                }}
                            />
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", color: "#E2E8F0", fontSize: 12, fontWeight: 600, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" as const }}>Type</label>
                                <select value={fType} onChange={(e: any) => setFType(e.target.value)} style={{
                                    width: "100%", background: "#0A1F44", border: "1px solid #24427E", borderRadius: 10,
                                    padding: "10px 14px", color: "#e8f0fe", fontSize: 14, outline: "none", fontFamily: "'Outfit', sans-serif"
                                }}>
                                    <option value="">Select type…</option>
                                    <option>Unit Trust</option><option>Money Market</option><option>Bond Fund</option><option>T-Bill</option><option>Govt Bond</option><option>Other</option>
                                </select>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                                <InputField label="Rate (% p.a.)" type="number" value={fRate} onChange={setFRate} placeholder="11.5" />
                                <InputField label="Start Date" type="date" value={fStartDate} onChange={setFStartDate} />
                                <InputField label="Maturity Date" type="date" value={fMaturityDate} onChange={setFMaturityDate} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <InputField label="Amount Invested (TZS)" type="number" value={fInvested} onChange={setFInvested} placeholder="1500000" />
                                <InputField label="Current Value (TZS)" type="number" value={fCurrent} onChange={setFCurrent} placeholder="1710000" />
                            </div>
                            {fInvested && fCurrent && (
                                <div style={{ background: "#0A1F44", border: "1px solid #24427E", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, marginBottom: (fRate && fStartDate && fMaturityDate) ? 8 : 0 }}>
                                        Gain: <span style={{ color: +fCurrent >= +fInvested ? "#D4A017" : "#ff5c5c" }}>{fmtTZS(Math.abs(+fCurrent - +fInvested))} ({pctChange(+fCurrent, +fInvested)}%)</span>
                                    </div>
                                    {fRate && fStartDate && fMaturityDate && (
                                        <div style={{ color: "#F59E0B", fontSize: 12, borderTop: "1px dashed #24427E", paddingTop: 8 }}>
                                            Projected Interest: <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>+{fmtTZS(getProjectedInterest(+fInvested, +fRate, fStartDate, fMaturityDate))}</span> at maturity
                                        </div>
                                    )}
                                </div>
                            )}
                            <div style={{ display: "flex", gap: 10 }}>
                                <Btn onClick={showEditFund ? updateFund : addFund} disabled={!fName || !fInvested || !fCurrent} style={{ flex: 1 }}>{showEditFund ? "Save Changes" : "Add Fund"}</Btn>
                                <Btn variant="dark" onClick={() => { setShowAddFund(false); setShowEditFund(null); resetFundForm(); }}>Cancel</Btn>
                            </div>
                        </Modal>
                    )}
                </div>
            </div>
        </div>
    );
}
