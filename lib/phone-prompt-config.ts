/**
 * Users with createdAt **strictly before** this instant are considered "pre-existing"
 * and may be prompted to add a phone number (if missing).
 * Override with env `PHONE_COLLECTION_CUTOFF_DATE` (ISO 8601, e.g. 2025-03-25T00:00:00.000Z).
 */
export function getPhoneCollectionCutoff(): Date {
  const raw = process.env.PHONE_COLLECTION_CUTOFF_DATE
  if (raw) {
    const d = new Date(raw)
    if (!Number.isNaN(d.getTime())) return d
  }
  return new Date("2025-03-25T00:00:00.000Z")
}

export function isPreExistingUser(createdAt: Date): boolean {
  return createdAt.getTime() < getPhoneCollectionCutoff().getTime()
}
