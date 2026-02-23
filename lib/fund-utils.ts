// Shared fund ID mapping - maps URL slugs to database fundIds
// This is needed because some funds use different slugs in URLs vs their DB fundId
export const FUND_ID_MAP: Record<string, string> = {
    "zansec": "zansec-bond",
    "utt-amis": "utt-amis",
    "whi": "whi-income",
    "vertex": "vertex-bond",
    "sanlam-pesa": "sanlam-pesa",
    "itrust": "itrust",
}

export function resolveFundId(urlId: string): string {
    return FUND_ID_MAP[urlId] || urlId
}
