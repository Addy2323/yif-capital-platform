"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { dseStocks, etfs, ipos, marketNews, tanzanianFunds, Stock, ETF, IPO, MarketNews, Fund } from "@/lib/market-data"

// Storage keys
const STORAGE_KEYS = {
    STOCKS: "yif_admin_stocks",
    ETFS: "yif_admin_etfs",
    IPOS: "yif_admin_ipos",
    NEWS: "yif_admin_news",
    FUNDS: "yif_admin_funds",
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

    // Funds
    fundList: Fund[]
    addFund: (fund: Fund) => void
    updateFund: (id: string, data: Partial<Fund>) => void
    deleteFund: (id: string) => void

    // Helpers
    getStockBySymbol: (symbol: string) => Stock | undefined
    getEtfBySymbol: (symbol: string) => ETF | undefined
    getIpoBySymbol: (symbol: string) => IPO | undefined
    getFundById: (id: string) => Fund | undefined
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined)

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
    const [stocks, setStocks] = useState<Stock[]>([])
    const [etfList, setEtfList] = useState<ETF[]>([])
    const [ipoList, setIpoList] = useState<IPO[]>([])
    const [newsList, setNewsList] = useState<MarketNews[]>([])
    const [fundList, setFundList] = useState<Fund[]>([])
    const [isInitialized, setIsInitialized] = useState(false)

    // Load data from localStorage on mount
    useEffect(() => {
        if (typeof window === "undefined") return

        const savedStocks = localStorage.getItem(STORAGE_KEYS.STOCKS)
        const savedEtfs = localStorage.getItem(STORAGE_KEYS.ETFS)
        const savedIpos = localStorage.getItem(STORAGE_KEYS.IPOS)
        const savedNews = localStorage.getItem(STORAGE_KEYS.NEWS)
        const savedFunds = localStorage.getItem(STORAGE_KEYS.FUNDS)

        setStocks(savedStocks ? JSON.parse(savedStocks) : dseStocks)
        setEtfList(savedEtfs ? JSON.parse(savedEtfs) : etfs)
        setIpoList(savedIpos ? JSON.parse(savedIpos) : ipos)
        setNewsList(savedNews ? JSON.parse(savedNews) : marketNews)

        // Fetch funds from API instead of just local mocks
        const fetchFunds = async () => {
            try {
                const response = await fetch("/api/funds")
                const result = await response.json()
                if (result.success) {
                    setFundList(result.data)
                } else {
                    setFundList(savedFunds ? JSON.parse(savedFunds) : tanzanianFunds)
                }
            } catch (error) {
                console.error("Failed to fetch funds:", error)
                setFundList(savedFunds ? JSON.parse(savedFunds) : tanzanianFunds)
            }
        }

        fetchFunds()
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
        localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(newsList))
    }, [newsList, isInitialized])

    useEffect(() => {
        if (!isInitialized || typeof window === "undefined") return
        localStorage.setItem(STORAGE_KEYS.FUNDS, JSON.stringify(fundList))
    }, [fundList, isInitialized])

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

    // Fund operations
    const addFund = (fund: Fund) => setFundList(prev => [...prev, fund])
    const updateFund = (id: string, data: Partial<Fund>) =>
        setFundList(prev => prev.map(f => f.id === id ? { ...f, ...data } : f))
    const deleteFund = (id: string) => setFundList(prev => prev.filter(f => f.id !== id))

    const getStockBySymbol = (symbol: string) => stocks.find(s => s.symbol === symbol)
    const getEtfBySymbol = (symbol: string) => etfList.find(e => e.symbol === symbol)
    const getIpoBySymbol = (symbol: string) => ipoList.find(i => i.symbol === symbol)
    const getFundById = (id: string) => fundList.find(f => f.id === id)

    return (
        <AdminDataContext.Provider value={{
            stocks, etfList, ipoList, newsList, fundList,
            addStock, updateStock, deleteStock,
            addEtf, updateEtf, deleteEtf,
            addIpo, updateIpo, deleteIpo,
            addNews, updateNews, deleteNews,
            addFund, updateFund, deleteFund,
            getStockBySymbol, getEtfBySymbol, getIpoBySymbol, getFundById
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
            fundList: tanzanianFunds,
            getStockBySymbol: (symbol: string) => dseStocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase()),
            getEtfBySymbol: (symbol: string) => etfs.find(e => e.symbol.toUpperCase() === symbol.toUpperCase()),
            getIpoBySymbol: (symbol: string) => ipos.find(i => i.symbol.toUpperCase() === symbol.toUpperCase()),
            getFundById: (id: string) => tanzanianFunds.find(f => f.id === id),
        }
    }
    return {
        stocks: context.stocks,
        etfList: context.etfList,
        ipoList: context.ipoList,
        newsList: context.newsList,
        fundList: context.fundList,
        getStockBySymbol: context.getStockBySymbol,
        getEtfBySymbol: context.getEtfBySymbol,
        getIpoBySymbol: context.getIpoBySymbol,
        getFundById: context.getFundById,
    }
}
