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
