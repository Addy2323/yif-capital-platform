// @ts-nocheck
/**
 * Seed script to populate Fund registry from existing FundDailySummary data
 * Run with: npx ts-node prisma/seed-funds.ts
 */

const { PrismaClient } = require('../lib/generated/client')


const prisma = new PrismaClient()

// Fund metadata mapping
const FUND_METADATA = {
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
  'zansec': {
    fundSlug: 'zansec',
    fundName: 'Zan Securities Fixed Income Fund',
    fundType: 'FIXED_INCOME',
    managerName: 'Zan Securities',
    description: 'Fixed income and bond fund focused on secure, steady returns.',
    logoUrl: '/logo payment/background/zansecurity.png',
    inceptionDate: '2015-06-01',
    baseCurrency: 'TZS',
  },
  'whi': {
    fundSlug: 'whi',
    fundName: 'Watumishi Housing Investment Fund',
    fundType: 'INCOME',
    managerName: 'Watumishi Housing Investments',
    description: 'Income fund focused on real estate and housing sector investments.',
    logoUrl: '/logo payment/background/WHI.jpg',
    inceptionDate: '2012-03-15',
    baseCurrency: 'TZS',
  },
  'vertex': {
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
  'zansec-bond': {
    fundSlug: 'zansec-bond',
    fundName: 'Zan Securities Bond Fund',
    fundType: 'BOND',
    managerName: 'Zan Securities',
    description: 'Specialized bond fund offering diversified fixed-income exposure.',
    logoUrl: '/logo payment/background/zansecurity.png',
    inceptionDate: '2016-01-01',
    baseCurrency: 'TZS',
  },
  'utt-umoja': {
    fundSlug: 'utt-umoja',
    fundName: 'UTT AMIS Umoja Fund',
    fundType: 'BALANCED',
    managerName: 'UTT AMIS',
    description: 'The flagship balanced fund by UTT AMIS, offering long-term capital growth.',
    logoUrl: '/logo payment/background/uttamislogof.png',
    inceptionDate: '2005-05-16',
    baseCurrency: 'TZS',
  },
  'vertex-bond': {
    fundSlug: 'vertex-bond',
    fundName: 'Vertex Bond Fund',
    fundType: 'BOND',
    managerName: 'Vertex International Securities',
    description: 'Secure, steady fixed-income investment approved by CMSA.',
    logoUrl: '/logo payment/background/vertex.png',
    inceptionDate: '2018-01-01',
    baseCurrency: 'TZS',
  },
  'whi-income': {
    fundSlug: 'whi-income',
    fundName: 'Watumishi Housing Investment Income Fund',
    fundType: 'INCOME',
    managerName: 'Watumishi Housing Investments',
    description: 'Income fund focused on real estate and housing sector investments.',
    logoUrl: '/logo payment/background/WHI.jpg',
    inceptionDate: '2012-03-15',
    baseCurrency: 'TZS',
  },
}



async function main() {
  console.log('Starting fund registry seed...')

  // Get unique fund IDs from FundDailySummary
  const existingFunds = await prisma.fundDailySummary.groupBy({
    by: ['fundId'],
    _count: { fundId: true },
    _max: { date: true },
  })

  console.log(`Found ${existingFunds.length} funds in FundDailySummary`)

  for (const fund of existingFunds) {
    const fundId = fund.fundId
    const metadata = FUND_METADATA[fundId]

    if (!metadata) {
      console.log(`No metadata for fund ${fundId}, skipping...`)
      continue
    }

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
          fundType: metadata.fundType,
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
          fundType: metadata.fundType,
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
