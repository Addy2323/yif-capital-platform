// ============================================
// FUND ANALYTICS PLATFORM - TYPE DEFINITIONS
// ============================================
// Matches PRD API Contracts for all 9 modules

// ============================================
// CORE ENUMS & BASE TYPES
// ============================================

export type FundType =
  | 'balanced'
  | 'fixed_income'
  | 'income'
  | 'bond'
  | 'fund_family'
  | 'money_market'
  | 'equity'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export type ComplianceStatus = 'COMPLIANT' | 'WATCH' | 'BREACH'

export type Timeframe =
  | '1W'
  | '1M'
  | '3M'
  | '6M'
  | 'YTD'
  | '1Y'
  | '3Y'
  | '5Y'
  | 'SINCE_INCEPTION'

export type DataMode = 'live' | 'eod' | 'cached'

export type KPIFormat = 'currency' | 'percent' | 'number' | 'ratio'

// ============================================
// API RESPONSE ENVELOPE
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error?: string | null
  metadata: {
    fund_id: string
    timeframe: Timeframe
    last_updated_at: string
    data_source: DataMode
    currency: string
  }
}

// ============================================
// FUND OBJECT (Core Registry)
// ============================================

export interface Fund {
  fund_id: string
  fund_slug: string
  fund_name: string
  fund_type: FundType
  manager_name: string
  manager_id?: string | null
  description: string
  logo_url?: string | null
  inception_date: string
  base_currency: string
  benchmark_id?: string | null
  benchmark_name?: string | null
  is_active: boolean
  // Computed fields for listing
  current_nav?: number | null
  nav_change_1d?: number | null
  nav_change_ytd?: number | null
  return_1y?: number | null
  aum?: number | null
  volatility?: number | null
  date?: string | null
}

// ============================================
// MODULE 1: OVERVIEW DASHBOARD
// ============================================

export interface OverviewData {
  // KPI Cards
  aum: number | null
  aum_change_pct: number | null
  nav: number | null
  nav_change_1d: number | null
  nav_change_ytd: number | null
  return_mtd: number | null
  return_ytd: number | null
  return_1y: number | null
  return_since_inception: number | null
  expense_ratio: number | null
  cash_position_pct: number | null

  // Summary Stats Strip
  tracking_error: number | null
  alpha: number | null
  beta: number | null
  sharpe_ratio: number | null
  volatility_1y: number | null
  max_drawdown: number | null

  // Chart Data
  nav_history: NavHistoryPoint[]
  fund_vs_benchmark: FundBenchmarkPoint[]
}

export interface NavHistoryPoint {
  date: string
  nav: number
}

export interface NavRecord {
  date: string
  nav_per_unit: number
  total_nav: number
  units: number
  scheme_name?: string
}

export interface FundBenchmarkPoint {
  date: string
  fund_return: number
  benchmark_return: number
}

// ============================================
// MODULE 2: PERFORMANCE ANALYTICS
// ============================================

export interface PerformanceData {
  // Performance Metrics
  return_absolute: number | null
  cagr: number | null
  rolling_3m: number | null
  rolling_6m: number | null
  rolling_1y: number | null
  alpha: number | null
  beta: number | null
  sharpe_ratio: number | null
  sortino_ratio: number | null
  volatility: number | null

  // Chart Data
  cumulative_returns: CumulativeReturnPoint[]
  multi_series_returns?: any[]
  rolling_returns_heatmap: RollingReturnHeatmapPoint[]
  risk_return_scatter: RiskReturnScatterPoint[]
}

export interface CumulativeReturnPoint {
  date: string
  cumulative_return_pct: number
  benchmark_cumulative_return?: number
}

export interface RollingReturnHeatmapPoint {
  year: number
  month: number
  return_pct: number | null
}

export interface RiskReturnScatterPoint {
  fund_id: string
  fund_name: string
  return_pct: number
  volatility_pct: number
  is_current_fund: boolean
}

// ============================================
// MODULE 3: PORTFOLIO COMPOSITION
// ============================================

export interface PortfolioData {
  // Allocation Breakdowns
  asset_allocation: AllocationItem[]
  sector_allocation: AllocationItem[]
  geo_allocation: GeoAllocationItem[]
  market_cap_exposure: AllocationItem[]

  // Top Holdings
  top_holdings: HoldingItem[]
  total_holdings: number
}

export interface AllocationItem {
  label: string
  pct: number
}

export interface GeoAllocationItem {
  country: string
  pct: number
}

export interface HoldingItem {
  name: string
  asset_type: string | null
  weight_pct: number
  value: number | null
  change_pct: number | null
  isin?: string
  sector?: string
}

// ============================================
// MODULE 4: RISK ANALYTICS
// ============================================

export interface RiskData {
  // Risk Indicator KPIs
  max_drawdown: number | null
  var_95: number | null
  cvar_95: number | null
  downside_deviation: number | null
  volatility_1y: number | null
  sharpe_ratio: number | null
  sortino_ratio: number | null
  risk_level: RiskLevel | null
  risk_score: number | null

  // Bond/Fixed Income specific
  duration_years: number | null
  credit_ratings: CreditRatingItem[]

  // Chart Data
  drawdown_series: DrawdownPoint[]
  volatility_series: VolatilityPoint[]
  stress_tests: StressTestItem[]
}

export interface CreditRatingItem {
  rating: string
  pct: number
}

export interface DrawdownPoint {
  date: string
  drawdown_pct: number
}

export interface VolatilityPoint {
  date: string
  rolling_vol_pct: number
}

export interface StressTestItem {
  scenario_name: string
  impact_pct: number
  description: string
}

// ============================================
// MODULE 5: INCOME & CASH FLOW
// ============================================

export interface IncomeData {
  // Income & Liquidity KPIs
  daily_liquidity_ratio: number | null
  interest_income: number | null
  dividend_income: number | null
  total_income: number | null
  expense_ratio: number | null
  net_investment_income: number | null
  cash_inflows: number | null
  cash_outflows: number | null

  // Chart Data
  cash_flow_timeline: CashFlowPoint[]
  maturity_profile: MaturityBucket[]
}

export interface CashFlowPoint {
  date: string
  inflow: number
  outflow: number
  net: number
}

export interface MaturityBucket {
  bucket_label: string
  value: number
  pct_of_aum: number
}

// ============================================
// MODULE 6: FINANCIAL STATEMENTS
// ============================================

export interface FinancialsData {
  income_statement: IncomeStatement
  balance_sheet: BalanceSheet
  cash_flow: CashFlowStatement
  ratios: FinancialRatios
}

export interface IncomeStatement {
  interest_income: number
  dividend_income: number
  unrealized_gains_losses: number
  realized_gains_losses: number
  management_fees: number
  custody_fees: number
  other_expenses: number
  net_investment_income: number
  total_comprehensive_income: number

  // Analytics
  expense_ratio_trend: TrendPoint[]
  net_income_margin_pct: number | null
  income_yield_pct: number | null
  fee_drag_pct: number | null
  income_vs_expense_chart: IncomeExpensePoint[]
}

export interface BalanceSheet {
  assets: {
    cash: number
    investments: number
    receivables: number
  }
  total_assets: number
  liabilities: {
    payables: number
    mgmt_fees: number
  }
  total_liabilities: number
  net_assets: number
  units_outstanding: number
  nav_per_unit: number

  // Analytics
  liquidity_ratio: number | null
  net_assets_trend: TrendPoint[]
}

export interface CashFlowStatement {
  operating: {
    investment_income_cash: number
    expenses_paid: number
    net: number
  }
  investing: {
    purchases: number
    proceeds: number
    net: number
  }
  financing: {
    units_issued: number
    units_redeemed: number
    distributions: number
    net: number
  }
  net_cash_movement: number

  // Analytics
  waterfall: WaterfallItem[]
  net_movement_timeline: TrendPoint[]
  sub_redemption_ratio: number | null
}

export interface FinancialRatios {
  nav_net_assets_variance: number | null
  cash_coverage: number | null
  distribution_coverage: number | null
  accrual_vs_cash_variance: number | null
}

export interface TrendPoint {
  date: string
  value: number
}

export interface IncomeExpensePoint {
  period: string
  income: number
  expense: number
}

export interface WaterfallItem {
  label: string
  value: number
  type: 'increase' | 'decrease' | 'total'
}

// ============================================
// MODULE 7: BENCHMARK & PEER COMPARISON
// ============================================

export interface BenchmarkingData {
  // Benchmark Comparison
  fund_return: number | null
  benchmark_return: number | null
  benchmark_name: string | null
  alpha: number | null
  beta: number | null
  tracking_error: number | null
  information_ratio: number | null

  // Peer Comparison
  peers: PeerFund[]
  rank_percentile: number | null

  // Radar Chart
  radar_axes: RadarAxis[]
}

export interface PeerFund {
  fund_id: string
  fund_name: string
  return_pct: number
  volatility: number
  sharpe_ratio: number
  max_drawdown: number
  rank: number
}

export interface RadarAxis {
  axis_label: string
  fund_score: number
  benchmark_score: number
}

// ============================================
// MODULE 8: COMPLIANCE & POLICY MONITORING
// ============================================

export interface ComplianceData {
  // Overall Status
  overall_status: ComplianceStatus
  green_count: number
  amber_count: number
  red_count: number

  // Compliance Checks
  checks: ComplianceCheck[]
}

export interface ComplianceCheck {
  rule_name: string
  rule_type: 'regulatory' | 'mandate'
  current_value: number | string
  limit_value: number | string
  format: string
  status: 'green' | 'amber' | 'red'
  last_checked_at: string
  breach_history: BreachRecord[]
}

export interface BreachRecord {
  date: string
  value: number | string
  resolved_at?: string
}

// ============================================
// MODULE 9: ATTRIBUTION ANALYSIS
// ============================================

export interface AttributionData {
  // Attribution Effects
  total_return: number | null
  benchmark_return: number | null
  asset_allocation_effect: number | null
  security_selection_effect: number | null
  interaction_effect: number | null
  active_return: number | null

  // Waterfall Chart
  waterfall: AttributionWaterfallItem[]
}

export interface AttributionWaterfallItem {
  label: string
  value: number
  type: 'base' | 'positive' | 'negative' | 'total'
}

// ============================================
// GLOBAL COMPONENTS TYPES
// ============================================

export interface KPICardProps {
  label: string
  value: number | string | null
  change?: number | null
  changePeriod?: string
  format: KPIFormat
  currency?: string
  icon?: React.ReactNode
  description?: string
}

export interface TimeframeSelectorProps {
  value: Timeframe
  onChange: (timeframe: Timeframe) => void
  options?: Timeframe[]
}

export interface FundCardProps {
  fund: Fund
}

export interface ModuleLayoutProps {
  fundId: string
  fund: Fund
  activeModule: string
  children: React.ReactNode
  lastUpdated?: string
  dataSource?: DataMode
}

// ============================================
// FUND DETAIL PAGE TABS
// ============================================

export const FUND_MODULE_TABS = [
  { id: 'overview', label: 'Overview', route: '/funds/[fund_id]/overview' },
  { id: 'performance', label: 'Performance', route: '/funds/[fund_id]' },
  { id: 'portfolio', label: 'Portfolio', route: '/funds/[fund_id]/portfolio' },
  { id: 'risk', label: 'Risk', route: '/funds/[fund_id]/risk' },
  { id: 'income', label: 'Income & Liquidity', route: '/funds/[fund_id]/income' },
  { id: 'financials', label: 'Financials', route: '/funds/[fund_id]/financials' },
  { id: 'benchmarking', label: 'Benchmarking', route: '/funds/[fund_id]/benchmarking' },
  { id: 'compliance', label: 'Compliance', route: '/funds/[fund_id]/compliance' },
  { id: 'attribution', label: 'Attribution', route: '/funds/[fund_id]/attribution' },
] as const

export type FundModuleId = typeof FUND_MODULE_TABS[number]['id']

// ============================================
// FUND TYPE CONFIG
// ============================================

export const FUND_TYPE_CONFIG: Record<FundType, { label: string; color: string }> = {
  balanced: { label: 'Balanced', color: 'bg-blue-500' },
  fixed_income: { label: 'Fixed Income', color: 'bg-emerald-500' },
  income: { label: 'Income', color: 'bg-amber-500' },
  bond: { label: 'Bond', color: 'bg-purple-500' },
  fund_family: { label: 'Fund Family', color: 'bg-pink-500' },
  money_market: { label: 'Money Market', color: 'bg-cyan-500' },
  equity: { label: 'Equity', color: 'bg-orange-500' },
}

// Fund types that should show duration/credit rating sections
export const BOND_FUND_TYPES: FundType[] = ['bond', 'fixed_income']

// Fund types that should NOT show sector allocation
export const NO_SECTOR_ALLOCATION_TYPES: FundType[] = ['money_market', 'bond', 'fixed_income']

// Fund types that should NOT show market cap exposure
export const NO_MARKET_CAP_TYPES: FundType[] = ['money_market', 'bond', 'fixed_income', 'income']
