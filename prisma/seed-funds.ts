/**
 * Seed script to populate Fund registry from existing FundDailySummary data
 * Run with: npx ts-node prisma/seed-funds.ts
 */

// @ts-ignore - Importing from custom generated path
import { PrismaClient } from '../lib/generated/client'

const prisma = new PrismaClient()

// Fund metadata mapping
// These keys must match the IDs used in fundMap within app/api/funds/update/route.ts
const FUND_METADATA: Record<string, {
  fundSlug: string
  fundName: string
  fundType: string
  managerName: string
  description: string
  logoUrl?: string
  inceptionDate: string
  baseCurrency: string
  benchmarkName?: string
}> = {
  'utt-amis': {
    fundSlug: 'utt-amis',
    fundName: 'UTT AMIS Fund',
    fundType: 'BALANCED',
    managerName: 'UTT AMIS',
    description: 'Comprehensive balanced fund offering diversified investment across multiple asset classes.',
    logoUrl: '/logo payment/background/uttamislogof.png',
    inceptionDate: '2010-01-01',
    baseCurrency: 'TZS',
    benchmarkName: 'DSE All Share Index',
  },
  'zansec-bond': {
    fundSlug: 'zansec',
    fundName: 'Zan Securities Fixed Income Fund',
    fundType: 'FIXED_INCOME',
    managerName: 'Zan Securities',
    description: 'Fixed income and bond fund focused on secure, steady returns.',
    logoUrl: '/logo payment/background/zansecurity.png',
    inceptionDate: '2015-06-01',
    baseCurrency: 'TZS',
  },
  'whi-income': {
    fundSlug: 'whi',
    fundName: 'Watumishi Housing Investment Fund',
    fundType: 'INCOME',
    managerName: 'Watumishi Housing Investments',
    description: 'Income fund focused on real estate and housing sector investments.',
    logoUrl: '/logo payment/background/WHI.jpg',
    inceptionDate: '2012-03-15',
    baseCurrency: 'TZS',
  },
  'vertex-bond': {
    fundSlug: 'vertex',
    fundName: 'Vertex Bond Fund',
    fundType: 'BOND',
    managerName: 'Vertex International Securities',
    description: 'Secure, steady fixed-income investment approved by CMSA.',
    logoUrl: '/logo payment/background/vertex.png',
    inceptionDate: '2018-01-01',
    baseCurrency: 'TZS',
  },
  'itrust': {
    fundSlug: 'itrust',
    fundName: 'iTrust Finance Fund Family',
    fundType: 'MONEY_MARKET',
    managerName: 'iTrust Finance',
    description: '6 expertly designed funds: iCash, iGrowth, iSave, iIncome, Imaan & iDollar.',
    logoUrl: '/logo payment/background/itrust.svg',
    inceptionDate: '2019-01-01',
    baseCurrency: 'TZS',
  },
  'sanlam-pesa': {
    fundSlug: 'sanlam-pesa',
    fundName: 'SanlamAllianz Pesa Fund',
    fundType: 'MONEY_MARKET',
    managerName: 'Sanlam Allianz Investments',
    description: 'Earn compounded interest. Invest from as low as TZS 10,000.',
    logoUrl: '/logo payment/background/sanlama.svg',
    inceptionDate: '2017-07-01',
    baseCurrency: 'TZS',
    benchmarkName: 'Tanzania 91-Day T-Bill Rate',
  },
}

async function main() {
  console.log('Starting fund registry seed...')

  // Seed all funds defined in metadata
  const fundIds = Object.keys(FUND_METADATA)
  console.log(`Found ${fundIds.length} funds in metadata registry`)

  for (const fundId of fundIds) {
    const metadata = FUND_METADATA[fundId]

    // Check if fund already exists
    const existing = await prisma.fund.findUnique({
      where: { fundId },
    })

    if (existing) {
      console.log(`Fund ${fundId} already exists, updating...`)
      await prisma.fund.update({
        where: { fundId },
        data: {
          fundSlug: metadata.fundSlug,
          fundName: metadata.fundName,
          fundType: metadata.fundType as any,
          managerName: metadata.managerName,
          description: metadata.description,
          logoUrl: metadata.logoUrl,
          inceptionDate: new Date(metadata.inceptionDate),
          baseCurrency: metadata.baseCurrency,
          benchmarkName: metadata.benchmarkName,
          isActive: true,
        },
      })
    } else {
      console.log(`Creating fund ${fundId}...`)
      await prisma.fund.create({
        data: {
          fundId,
          fundSlug: metadata.fundSlug,
          fundName: metadata.fundName,
          fundType: metadata.fundType as any,
          managerName: metadata.managerName,
          description: metadata.description,
          logoUrl: metadata.logoUrl,
          inceptionDate: new Date(metadata.inceptionDate),
          baseCurrency: metadata.baseCurrency,
          benchmarkName: metadata.benchmarkName,
          isActive: true,
        },
      })
    }
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
