// Shared fund ID mapping - maps URL slugs (from static list / links) to database fundIds
// The funds page uses static fund_ids (e.g. orbit-inuka-dozen); API/DB use source fundIds (e.g. orbit)
export const FUND_ID_MAP: Record<string, string> = {
    "zansec": "zansec-bond",
    "zan-timiza": "zansec-bond",
    "utt-amis": "utt-amis",
    "utt-umoja": "utt-amis",
    "utt-watoto": "utt-amis",
    "utt-jikiku": "utt-amis",
    "utt-wekeza-maisha": "utt-amis",
    "utt-bond": "utt-amis",
    "utt-liquid": "utt-amis",
    "whi": "whi-income",
    "whi-faida": "whi-income",
    "vertex": "vertex-bond",
    "vertex-bond": "vertex-bond",
    "sanlam-pesa": "sanlam-pesa",
    "sanlam-usd": "sanlam-pesa",
    "itrust": "itrust",
    "itrust-icash": "itrust",
    "itrust-igrowth": "itrust",
    "itrust-iincome": "itrust",
    "itrust-idollar": "itrust",
    "itrust-iimaan": "itrust",
    "itrust-isave": "itrust",
    "orbit": "orbit",
    "orbit-inuka-mm": "orbit",
    "orbit-inuka-dozen": "orbit",
    "tsl": "tsl",
    "tsl-imara": "tsl",
    "tsl-kesho": "tsl",
    "apef": "apef",
    "apef-ziada": "apef",
}

export function resolveFundId(urlId: string): string {
    return FUND_ID_MAP[urlId] ?? urlId
}

/**
 * Keywords used to match a URL slug to a schemeName stored in FundDailySummary.
 * When a single DB fund record holds data for multiple sub-funds (e.g. all iTrust
 * sub-funds share fundId="itrust"), these keywords pick the right scheme rows.
 */
export const SLUG_TO_SCHEME_KEYWORDS: Record<string, string[]> = {
    // iTrust sub-funds
    "itrust-icash":   ["i-cash", "icash", "cash"],
    "itrust-idollar": ["i-dollar", "idollar", "dollar", "usd"],
    "itrust-igrowth": ["i-growth", "igrowth", "growth"],
    "itrust-iincome": ["i-income", "iincome", "income"],
    "itrust-iimaan":  ["i-imaan", "iimaan", "imaan"],
    "itrust-isave":   ["i-save", "isave", "save"],
    // UTT AMIS sub-funds
    "utt-umoja":          ["umoja"],
    "utt-watoto":         ["watoto"],
    "utt-jikiku":         ["jikimu", "jikiku"],
    "utt-wekeza-maisha":  ["wekeza", "maisha"],
    "utt-bond":           ["bond"],
    "utt-liquid":         ["liquid"],
    // Sanlam sub-funds
    "sanlam-usd":     ["dollar", "usd"],
    // Orbit sub-funds
    "orbit-inuka-mm":     ["inuka", "money market", "mm"],
    "orbit-inuka-dozen":  ["dozen", "inuka dozen"],
    // TSL sub-funds
    "tsl-imara":  ["imara"],
    "tsl-kesho":  ["kesho"],
    // APEF sub-funds
    "apef-ziada": ["ziada"],
    // Zansec sub-funds
    "zan-timiza": ["timiza"],
    // WHI sub-funds
    "whi-faida":  ["faida"],
}

/**
 * Given a URL slug and the list of schemeName values available in the DB,
 * returns the best-matching schemeName for that sub-fund.
 * Returns null if no keywords are defined for this slug or no match is found.
 */
export function resolveTargetScheme(urlSlug: string, schemes: string[]): string | null {
    const keywords = SLUG_TO_SCHEME_KEYWORDS[urlSlug]
    if (!keywords || schemes.length === 0) return null

    return (
        schemes.find(s =>
            keywords.some(kw => s.toLowerCase().includes(kw.toLowerCase()))
        ) ?? null
    )
}
