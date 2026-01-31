"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { dseStocks, etfs, ipos, marketNews, Stock, ETF, IPO, MarketNews } from "@/lib/market-data"

// Storage keys
const STORAGE_KEYS = {
    STOCKS: "yif_admin_stocks",
    ETFS: "yif_admin_etfs",
    IPOS: "yif_admin_ipos",
    NEWS: "yif_admin_news",
}

interface AdminDataContextType {
    // Stocks
    stocks: Stock[]
    addStock: (stock: Stock) => void
    updateStock: (symbol: string, data: Partial<Stock>) => void
    deleteStock: (symbol: string) => void

    // ETFs
    etfList: ETF[]
    addEtf: (etf: ETF) => void
    updateEtf: (symbol: string, data: Partial<ETF>) => void
    deleteEtf: (symbol: string) => void

    // IPOs
    ipoList: IPO[]
    addIpo: (ipo: IPO) => void
    updateIpo: (symbol: string, data: Partial<IPO>) => void
    deleteIpo: (symbol: string) => void

    // News
    newsList: MarketNews[]
    addNews: (news: MarketNews) => void
    updateNews: (id: string, data: Partial<MarketNews>) => void
    deleteNews: (id: string) => void
    // Helpers
    getStockBySymbol: (symbol: string) => Stock | undefined
    getEtfBySymbol: (symbol: string) => ETF | undefined
    getIpoBySymbol: (symbol: string) => IPO | undefined
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined)

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
    const [stocks, setStocks] = useState<Stock[]>([])
    const [etfList, setEtfList] = useState<ETF[]>([])
    const [ipoList, setIpoList] = useState<IPO[]>([])
    const [newsList, setNewsList] = useState<MarketNews[]>([])
    const [isInitialized, setIsInitialized] = useState(false)

    // Load data from localStorage on mount
    useEffect(() => {
        if (typeof window === "undefined") return

        const savedStocks = localStorage.getItem(STORAGE_KEYS.STOCKS)
        const savedEtfs = localStorage.getItem(STORAGE_KEYS.ETFS)
        const savedIpos = localStorage.getItem(STORAGE_KEYS.IPOS)
        const savedNews = localStorage.getItem(STORAGE_KEYS.NEWS)

        setStocks(savedStocks ? JSON.parse(savedStocks) : dseStocks)
        setEtfList(savedEtfs ? JSON.parse(savedEtfs) : etfs)
        setIpoList(savedIpos ? JSON.parse(savedIpos) : ipos)
        setNewsList(savedNews ? JSON.parse(savedNews) : marketNews)
        setIsInitialized(true)
    }, [])

    // Save to localStorage whenever data changes
    useEffect(() => {
        if (!isInitialized || typeof window === "undefined") return
        localStorage.setItem(STORAGE_KEYS.STOCKS, JSON.stringify(stocks))
    }, [stocks, isInitialized])

    useEffect(() => {
        if (!isInitialized || typeof window === "undefined") return
        localStorage.setItem(STORAGE_KEYS.ETFS, JSON.stringify(etfList))
    }, [etfList, isInitialized])

    useEffect(() => {
        if (!isInitialized || typeof window === "undefined") return
        localStorage.setItem(STORAGE_KEYS.IPOS, JSON.stringify(ipoList))
    }, [ipoList, isInitialized])

    useEffect(() => {
        if (!isInitialized || typeof window === "undefined") return
        // This useEffect will now only handle addNews and updateNews, as deleteNews updates localStorage directly.
        localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(newsList))
    }, [newsList, isInitialized])

    // Stock operations
    const addStock = (stock: Stock) => setStocks(prev => [...prev, stock])
    const updateStock = (symbol: string, data: Partial<Stock>) =>
        setStocks(prev => prev.map(s => s.symbol === symbol ? { ...s, ...data } : s))
    const deleteStock = (symbol: string) => setStocks(prev => prev.filter(s => s.symbol !== symbol))

    // ETF operations
    const addEtf = (etf: ETF) => setEtfList(prev => [...prev, etf])
    const updateEtf = (symbol: string, data: Partial<ETF>) =>
        setEtfList(prev => prev.map(e => e.symbol === symbol ? { ...e, ...data } : e))
    const deleteEtf = (symbol: string) => setEtfList(prev => prev.filter(e => e.symbol !== symbol))

    // IPO operations
    const addIpo = (ipo: IPO) => setIpoList(prev => [...prev, ipo])
    const updateIpo = (symbol: string, data: Partial<IPO>) =>
        setIpoList(prev => prev.map(i => i.symbol === symbol ? { ...i, ...data } : i))
    const deleteIpo = (symbol: string) => setIpoList(prev => prev.filter(i => i.symbol !== symbol))

    // News operations
    const addNews = (news: MarketNews) => setNewsList(prev => [news, ...prev])
    const updateNews = (id: string, data: Partial<MarketNews>) =>
        setNewsList(prev => prev.map(n => n.id === id ? { ...n, ...data } : n))
    const deleteNews = (id: string) => {
        const updated = newsList.filter(n => n.id !== id)
        setNewsList(updated)
        localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(updated))
    }

    const getStockBySymbol = (symbol: string) => stocks.find(s => s.symbol === symbol)
    const getEtfBySymbol = (symbol: string) => etfList.find(e => e.symbol === symbol)
    const getIpoBySymbol = (symbol: string) => ipoList.find(i => i.symbol === symbol)

    return (
        <AdminDataContext.Provider value={{
            stocks, etfList, ipoList, newsList,
            addStock, updateStock, deleteStock,
            addEtf, updateEtf, deleteEtf,
            addIpo, updateIpo, deleteIpo,
            addNews, updateNews, deleteNews,
            getStockBySymbol, getEtfBySymbol, getIpoBySymbol
        }}>
            {children}
        </AdminDataContext.Provider>
    )
}

export function useAdminData() {
    const context = useContext(AdminDataContext)
    if (context === undefined) {
        throw new Error("useAdminData must be used within an AdminDataProvider")
    }
    return context
}

// Helper hook for read-only access in dashboard
export function useMarketData() {
    const context = useContext(AdminDataContext)
    if (context === undefined) {
        // Return default data if not wrapped in provider (for backwards compatibility)
        return {
            stocks: dseStocks,
            etfList: etfs,
            ipoList: ipos,
            newsList: marketNews,
            getStockBySymbol: (symbol: string) => dseStocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase()),
            getEtfBySymbol: (symbol: string) => etfs.find(e => e.symbol.toUpperCase() === symbol.toUpperCase()),
            getIpoBySymbol: (symbol: string) => ipos.find(i => i.symbol.toUpperCase() === symbol.toUpperCase()),
        }
    }
    return {
        stocks: context.stocks,
        etfList: context.etfList,
        ipoList: context.ipoList,
        newsList: context.newsList,
        getStockBySymbol: context.getStockBySymbol,
        getEtfBySymbol: context.getEtfBySymbol,
        getIpoBySymbol: context.getIpoBySymbol,
    }
}
