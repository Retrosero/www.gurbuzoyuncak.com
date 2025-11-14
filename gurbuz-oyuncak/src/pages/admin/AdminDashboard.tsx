import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  Package, ShoppingBag, Users, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, AlertTriangle,
  BarChart3, PieChart as PieChartIcon, Activity, DollarSign, Warehouse, Star, RefreshCw,
  Download, Calendar, TrendingDown, Filter, Search, Maximize2, Minimize2, Settings,
  Zap, Globe, Smartphone, Target, Award, ShoppingCart, Eye, ThumbsUp, MessageCircle, Database
} from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, isValid } from 'date-fns'
import { tr } from 'date-fns/locale'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts'

// TypeScript uyumluluk için recharts componentlerini any olarak tip atama
const RechartLineChart = LineChart as any
const RechartLine = Line as any
const RechartBarChart = BarChart as any
const RechartBar = Bar as any
const RechartPieChart = PieChart as any
const RechartPie = Pie as any
const RechartCell = Cell as any
const RechartXAxis = XAxis as any
const RechartYAxis = YAxis as any
const RechartCartesianGrid = CartesianGrid as any
const RechartTooltip = Tooltip as any
const RechartLegend = Legend as any
const RechartResponsiveContainer = ResponsiveContainer as any
const RechartAreaChart = AreaChart as any
const RechartArea = Area as any
const RechartComposedChart = ComposedChart as any

interface DateRange {
  start: Date
  end: Date
}

interface Stats {
  totalProducts: number
  totalCategories: number
  totalBrands: number
  totalOrders: number
  totalCustomers: number
  monthlyRevenue: number
  dailyRevenue: number
  weeklyRevenue: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  activeProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  totalRevenue: number
  activeStockAlerts: number
  criticalStockAlerts: number
  growthRate?: number
  conversionRate?: number
  avgOrderValue?: number
  customerRetention?: number
}

interface DashboardConfig {
  autoRefresh: boolean
  refreshInterval: number
  dateRange: DateRange
  selectedMetrics: string[]
  chartType: 'line' | 'bar' | 'area' | 'mixed'
  showRealTime: boolean
  compactMode: boolean
}

interface SalesData {
  daily: any[]
  weekly: any[]
  monthly: any[]
}

interface CategoryPerformance {
  category_name: string
  product_count: number
  total_sales: number
  avg_price: number
}

interface BrandPerformance {
  brand_name: string
  product_count: number
  total_sales: number
  avg_rating: number
}

interface StockAlert {
  id: string
  name: string
  stock_quantity: number
  category_name: string
}

interface RealtimeUpdate {
  type: 'order' | 'product' | 'customer' | 'stock'
  data: any
  timestamp: Date
}

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  dateRange: DateRange
  includeCharts: boolean
  includeSummary: boolean
}

interface VirtualItem {
  id: string
  height: number
  data: any
}

// Cache interface
interface DashboardCache {
  stats: Stats | null
  salesData: SalesData | null
  categoryPerformance: CategoryPerformance[]
  brandPerformance: BrandPerformance[]
  stockAlerts: StockAlert[]
  lastUpdated: number
  dateRange: DateRange
  version: string
}

// Chart data interface
interface ChartDataPoint {
  date: string
  value: number
  label?: string
  category?: string
}

export default function AdminDashboard() {
  // Core states
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalOrders: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    weeklyRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalRevenue: 0,
    activeStockAlerts: 0,
    criticalStockAlerts: 0
  })
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  // Data states
  const [salesData, setSalesData] = useState<SalesData>({ daily: [], weekly: [], monthly: [] })
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([])
  const [brandPerformance, setBrandPerformance] = useState<BrandPerformance[]>([])
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([])
  const [realtimeUpdates, setRealtimeUpdates] = useState<RealtimeUpdate[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  
  // Configuration states
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [config, setConfig] = useState<DashboardConfig>({
    autoRefresh: true,
    refreshInterval: 30000,
    dateRange: {
      start: subDays(new Date(), 30),
      end: new Date()
    },
    selectedMetrics: ['revenue', 'orders', 'customers'],
    chartType: 'area',
    showRealTime: true,
    compactMode: false
  })
  
  // UI states
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'products' | 'customers'>('overview')
  
  // Refs for performance
  const intervalRef = useRef<NodeJS.Timeout>()
  const realtimeChannelRef = useRef<any>()

  // Enhanced cache system
  const CACHE_DURATION = 2 * 60 * 1000 // 2 dakika cache
  const cache = useRef<DashboardCache>({
    stats: null,
    salesData: null,
    categoryPerformance: [],
    brandPerformance: [],
    stockAlerts: [],
    lastUpdated: 0,
    dateRange: config.dateRange,
    version: '2.0.0'
  })

  // Cache validation with versioning
  const isCacheValid = useCallback(() => {
    const now = Date.now()
    const isValidTime = now - cache.current.lastUpdated < CACHE_DURATION
    const isValidRange = cache.current.dateRange.start.getTime() === config.dateRange.start.getTime() &&
                         cache.current.dateRange.end.getTime() === config.dateRange.end.getTime()
    return isValidTime && isValidRange
  }, [config.dateRange])

  // Cache update with versioning
  const updateCache = useCallback((data: Partial<DashboardCache>) => {
    cache.current = {
      ...cache.current,
      ...data,
      dateRange: { ...config.dateRange },
      lastUpdated: Date.now(),
      version: '2.0.0'
    }
  }, [config.dateRange])

  // Optimized data fetching with materialized views
  const fetchFromMaterializedViews = useCallback(async () => {
    try {
      const [statsResult, salesResult, categoryResult, brandResult, alertsResult] = await Promise.all([
        supabase.from('mv_dashboard_stats').select('*').single(),
        supabase.from('mv_daily_sales').select('*').order('sale_date', { ascending: false }),
        supabase.from('mv_category_performance').select('*').order('total_sales', { ascending: false }).limit(10),
        supabase.from('mv_brand_performance').select('*').order('total_sales', { ascending: false }).limit(10),
        supabase.from('mv_stock_alerts_summary').select('*').limit(10)
      ])

      if (statsResult.data) {
        const mvStats = statsResult.data
        setStats(prev => ({
          ...prev,
          ...mvStats,
          growthRate: calculateGrowthRate(mvStats.monthly_revenue, 0),
          conversionRate: prev.totalOrders > 0 ? (prev.completedOrders / prev.totalOrders) * 100 : 0,
          avgOrderValue: mvStats.total_revenue > 0 ? mvStats.total_revenue / (prev.totalOrders || 1) : 0
        }))
      }

      // Process sales data for charts
      if (salesResult.data) {
        setSalesData({
          daily: processChartData(salesResult.data, 'sale_date', 'total_sales'),
          weekly: [],
          monthly: []
        })
      }

      if (categoryResult.data) setCategoryPerformance(categoryResult.data)
      if (brandResult.data) setBrandPerformance(brandResult.data)
      if (alertsResult.data) setStockAlerts(alertsResult.data)

    } catch (error) {
      console.error('Materialized views fetch error:', error)
      // Fallback to regular queries
      return false
    }
    return true
  }, [])

  // Growth rate calculation
  const calculateGrowthRate = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  // Chart data processing
  const processChartData = (data: any[], dateField: string, valueField: string) => {
    return data.map(item => ({
      date: item[dateField],
      value: item[valueField],
      label: format(new Date(item[dateField]), 'dd MMM', { locale: tr }),
      fullDate: format(new Date(item[dateField]), 'dd MMMM yyyy', { locale: tr })
    }))
  }

  // Memoized statistics calculations
  const memoizedStats = useMemo(() => ({
    stockHealth: {
      healthy: stats.totalProducts - stats.lowStockProducts - stats.outOfStockProducts,
      critical: stats.outOfStockProducts,
      warning: stats.lowStockProducts,
      healthScore: stats.totalProducts > 0 ? 
        Math.round(((stats.totalProducts - stats.lowStockProducts - stats.outOfStockProducts) / stats.totalProducts) * 100) : 0
    },
    salesMetrics: {
      dailyGrowth: 0, // Calculate with previous day data
      weeklyGrowth: 0, // Calculate with previous week data
      conversionRate: stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0,
      avgOrderValue: stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0
    }
  }), [stats])

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    dataSize: 0,
    cacheHitRate: 0
  })

  // Real-time data setup with Supabase Realtime
  useEffect(() => {
    if (!config.showRealTime) return

    realtimeChannelRef.current = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders' 
      }, (payload) => {
        const update: RealtimeUpdate = {
          type: 'order',
          data: payload.new,
          timestamp: new Date()
        }
        setRealtimeUpdates(prev => [update, ...prev.slice(0, 19)]) // Keep last 20
        if (autoRefresh) {
          loadDashboardData(true) // Silent update
        }
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products' 
      }, (payload) => {
        const update: RealtimeUpdate = {
          type: 'product',
          data: payload.new,
          timestamp: new Date()
        }
        setRealtimeUpdates(prev => [update, ...prev.slice(0, 19)])
        if (autoRefresh) {
          loadDashboardData(true)
        }
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        const update: RealtimeUpdate = {
          type: 'customer',
          data: payload.new,
          timestamp: new Date()
        }
        setRealtimeUpdates(prev => [update, ...prev.slice(0, 19)])
      })
      .subscribe()

    return () => {
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe()
      }
    }
  }, [config.showRealTime, autoRefresh])

  useEffect(() => {
    loadDashboardData()
    
    // Enhanced auto refresh with interval control
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        loadDashboardData(true) // Silent refresh
      }, config.refreshInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoRefresh, config.refreshInterval, config.dateRange])

  // Fullscreen mode effect
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const loadDashboardData = async (silent = false) => {
    const startTime = Date.now()
    
    try {
      if (!silent) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      // Try materialized views first for performance
      if (!silent) {
        const mvSuccess = await fetchFromMaterializedViews()
        if (mvSuccess) {
          updateCache({ stats, salesData, categoryPerformance, brandPerformance, stockAlerts })
          setLoading(false)
          setRefreshing(false)
          return
        }
      }

      // Cache kontrolü
      if (!silent && isCacheValid()) {
        setStats(cache.current.stats!)
        setSalesData(cache.current.salesData!)
        setCategoryPerformance(cache.current.categoryPerformance)
        setBrandPerformance(cache.current.brandPerformance)
        setStockAlerts(cache.current.stockAlerts)
        setLoading(false)
        setRefreshing(false)
        return
      }

      // Fallback to regular queries
      await Promise.all([
        fetchEnhancedStats(),
        fetchSalesData(),
        fetchCategoryPerformance(),
        fetchBrandPerformance(),
        fetchStockAlerts(),
        fetchRecentActivities()
      ])

      // Cache'i güncelle
      updateCache({
        stats,
        salesData,
        categoryPerformance,
        brandPerformance,
        stockAlerts
      })

      // Performance metrics
      const loadTime = Date.now() - startTime
      setPerformanceMetrics(prev => ({
        ...prev,
        loadTime,
        renderTime: Date.now() - startTime
      }))

    } catch (error) {
      console.error('Dashboard verileri yüklenemedi:', error)
      toast.error('Dashboard verileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Enhanced stats fetching with improved queries
  const fetchEnhancedStats = async () => {
    try {
      const { data: statsData } = await supabase.from('dashboard_stats').select('*').single()
      
      if (statsData) {
        setStats(prev => ({
          ...prev,
          totalProducts: statsData.total_products || 0,
          totalCategories: statsData.total_categories || 0,
          totalBrands: statsData.total_brands || 0,
          totalOrders: statsData.total_orders || 0,
          totalCustomers: statsData.total_customers || 0,
          monthlyRevenue: statsData.monthly_revenue || 0,
          dailyRevenue: statsData.daily_revenue || 0,
          weeklyRevenue: statsData.weekly_revenue || 0,
          pendingOrders: statsData.pending_orders || 0,
          completedOrders: statsData.completed_orders || 0,
          cancelledOrders: statsData.cancelled_orders || 0,
          activeProducts: statsData.active_products || 0,
          lowStockProducts: statsData.low_stock_products || 0,
          outOfStockProducts: statsData.out_of_stock_products || 0,
          totalRevenue: statsData.total_revenue || 0,
          activeStockAlerts: statsData.active_stock_alerts || 0,
          criticalStockAlerts: statsData.critical_stock_alerts || 0
        }))
      }
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error)
    }
  }

  // Recent activities fetch
  const fetchRecentActivities = async () => {
    try {
      const { data: activities } = await supabase
        .from('recent_activities')
        .select('*')
        .limit(20)
      
      setRecentActivities(activities || [])
    } catch (error) {
      console.error('Son aktiviteler yüklenemedi:', error)
    }
  }

  // Refresh materialized views
  const refreshMaterializedViews = async () => {
    try {
      toast.loading('Dashboard verileri yenileniyor...', { id: 'refresh' })
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      const response = await fetch(`${supabaseUrl}/functions/v1/refresh-dashboard-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'refresh', view_name: 'all' })
      })

      if (response.ok) {
        toast.success('Dashboard verileri başarıyla yenilendi', { id: 'refresh' })
        loadDashboardData()
      } else {
        throw new Error('Refresh failed')
      }
    } catch (error) {
      console.error('Materialized views refresh error:', error)
      toast.error('Dashboard verileri yenilenemedi', { id: 'refresh' })
    }
  }

  const fetchLegacyStats = async () => {
    try {
      // Temel sayılar
      const [totalProducts, totalCategories, totalBrands, totalOrders, totalCustomers] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('brands').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ])

      // Aktif ürünler
      const { count: activeProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Stok durumları
      const { count: lowStockProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lt('stock', 10)
        .gt('stock', 0)

      const { count: outOfStockProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('stock', 0)

      // Stok uyarıları
      const [activeStockAlerts, criticalStockAlerts] = await Promise.all([
        supabase.from('stock_alerts').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('stock_alerts').select('*', { count: 'exact', head: true }).eq('status', 'active').in('priority', ['critical', 'high'])
      ])

      // Sipariş durumları
      const [pendingOrders, completedOrders, cancelledOrders] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'pending'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'delivered'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'cancelled')
      ])

      // Ciro hesaplamaları
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      const [todayOrders, weekOrders, monthOrders, allTimeOrders] = await Promise.all([
        supabase.from('orders').select('total_amount').gte('created_at', today.toISOString()).eq('payment_status', 'paid'),
        supabase.from('orders').select('total_amount').gte('created_at', thisWeek.toISOString()).eq('payment_status', 'paid'),
        supabase.from('orders').select('total_amount').gte('created_at', thisMonth.toISOString()).eq('payment_status', 'paid'),
        supabase.from('orders').select('total_amount').eq('payment_status', 'paid')
      ])

      const dailyRevenue = todayOrders.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0
      const weeklyRevenue = weekOrders.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0
      const monthlyRevenue = monthOrders.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0
      const totalRevenue = allTimeOrders.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0

      const newStats = {
        totalProducts: totalProducts.count || 0,
        totalCategories: totalCategories.count || 0,
        totalBrands: totalBrands.count || 0,
        totalOrders: totalOrders.count || 0,
        totalCustomers: totalCustomers.count || 0,
        monthlyRevenue,
        dailyRevenue,
        weeklyRevenue,
        pendingOrders: pendingOrders.count || 0,
        completedOrders: completedOrders.count || 0,
        cancelledOrders: cancelledOrders.count || 0,
        activeProducts: activeProducts || 0,
        lowStockProducts: lowStockProducts || 0,
        outOfStockProducts: outOfStockProducts || 0,
        totalRevenue,
        activeStockAlerts: lowStockProducts || 0,
        criticalStockAlerts: outOfStockProducts || 0
      }

      setStats(newStats)
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error)
    }
  }

  const fetchSalesData = async () => {
    try {
      const now = new Date()
      
      // Günlük (son 30 gün)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const dailyOrders = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .eq('payment_status', 'paid')

      // Haftalık (son 12 hafta)
      const twelveWeeksAgo = new Date(now.getTime() - 84 * 24 * 60 * 60 * 1000)
      const weeklyOrders = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .gte('created_at', twelveWeeksAgo.toISOString())
        .eq('payment_status', 'paid')

      // Aylık (son 12 ay)
      const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      const monthlyOrders = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .gte('created_at', twelveMonthsAgo.toISOString())
        .eq('payment_status', 'paid')

      const dailyData = processDailyData(dailyOrders.data || [])
      const weeklyData = processWeeklyData(weeklyOrders.data || [])
      const monthlyData = processMonthlyData(monthlyOrders.data || [])

      setSalesData({
        daily: dailyData,
        weekly: weeklyData,
        monthly: monthlyData
      })
    } catch (error) {
      console.error('Satış verileri yüklenemedi:', error)
    }
  }

  const processDailyData = (orders: any[]) => {
    const days = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayOrders = orders.filter(order => 
        order.created_at.split('T')[0] === dateStr
      )
      
      days.push({
        date: dateStr,
        name: date.getDate(),
        sales: dayOrders.reduce((sum, order) => sum + order.total_amount, 0),
        orders: dayOrders.length
      })
    }
    
    return days
  }

  const processWeeklyData = (orders: any[]) => {
    const weeks = []
    const today = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      const weekOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate >= weekStart && orderDate < weekEnd
      })
      
      weeks.push({
        week: `${i + 1}. Hafta`,
        sales: weekOrders.reduce((sum, order) => sum + order.total_amount, 0),
        orders: weekOrders.length
      })
    }
    
    return weeks
  }

  const processMonthlyData = (orders: any[]) => {
    const months = []
    const today = new Date()
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 
                       'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate >= monthStart && orderDate <= monthEnd
      })
      
      months.push({
        month: monthNames[monthDate.getMonth()],
        year: monthDate.getFullYear(),
        sales: monthOrders.reduce((sum, order) => sum + order.total_amount, 0),
        orders: monthOrders.length
      })
    }
    
    return months
  }

  const fetchCategoryPerformance = async () => {
    try {
      // Kategori performansını hesapla
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .eq('level', 1)
        .eq('is_active', true)

      if (!categories) return

      const performance = await Promise.all(
        categories.map(async (category) => {
          // Bu kategorideki ürünler
          const { data: products } = await supabase
            .from('products')
            .select('id, price')
            .eq('category_id', category.id)
            .eq('is_active', true)

          if (!products || products.length === 0) {
            return {
              category_name: category.name,
              product_count: 0,
              total_sales: 0,
              avg_price: 0
            }
          }

          // Bu kategorideki siparişler
          const productIds = products.map(p => p.id)
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('quantity, unit_price')
            .in('product_id', productIds)

          const totalSales = orderItems?.reduce((sum, item) => 
            sum + (item.quantity * item.unit_price), 0) || 0

          const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length

          return {
            category_name: category.name,
            product_count: products.length,
            total_sales: totalSales,
            avg_price: avgPrice
          }
        })
      )

      // En çok satan kategorileri al
      const sorted = performance
        .filter(p => p.total_sales > 0)
        .sort((a, b) => b.total_sales - a.total_sales)
        .slice(0, 10)

      setCategoryPerformance(sorted)
    } catch (error) {
      console.error('Kategori performansı yüklenemedi:', error)
    }
  }

  const fetchBrandPerformance = async () => {
    try {
      const { data: brands } = await supabase
        .from('brands')
        .select('id, name')
        .eq('is_active', true)

      if (!brands) return

      const performance = await Promise.all(
        brands.map(async (brand) => {
          // Bu markadaki ürünler
          const { data: products } = await supabase
            .from('products')
            .select('id, price, rating')
            .eq('brand_id', brand.id)
            .eq('is_active', true)

          if (!products || products.length === 0) {
            return {
              brand_name: brand.name,
              product_count: 0,
              total_sales: 0,
              avg_rating: 0
            }
          }

          // Bu markadaki siparişler
          const productIds = products.map(p => p.id)
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('quantity, unit_price')
            .in('product_id', productIds)

          const totalSales = orderItems?.reduce((sum, item) => 
            sum + (item.quantity * item.unit_price), 0) || 0

          const avgRating = products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length

          return {
            brand_name: brand.name,
            product_count: products.length,
            total_sales: totalSales,
            avg_rating: avgRating
          }
        })
      )

      // En çok satan markaları al
      const sorted = performance
        .filter(p => p.total_sales > 0)
        .sort((a, b) => b.total_sales - a.total_sales)
        .slice(0, 10)

      setBrandPerformance(sorted)
    } catch (error) {
      console.error('Marka performansı yüklenemedi:', error)
    }
  }

  const fetchStockAlerts = async () => {
    try {
      const { data } = await supabase
        .from('stock_alerts_summary')
        .select('*')
        .order('alert_priority', { ascending: true })
        .limit(15)
      
      setStockAlerts(data || [])
    } catch (error) {
      console.error('Stok uyarıları yüklenemedi:', error)
    }
  }

  // Export functionality
  const exportDashboard = async (format: 'pdf' | 'excel' | 'csv') => {
    setExporting(true)
    
    try {
      const exportData = {
        stats,
        salesData,
        categoryPerformance,
        brandPerformance,
        stockAlerts,
        dateRange: config.dateRange,
        generatedAt: new Date().toISOString()
      }

      switch (format) {
        case 'pdf':
          await exportToPDF(exportData)
          break
        case 'excel':
          await exportToExcel(exportData)
          break
        case 'csv':
          await exportToCSV(exportData)
          break
      }
      
      toast.success(`Dashboard başarıyla ${format.toUpperCase()} formatında dışa aktarıldı`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export işlemi başarısız oldu')
    } finally {
      setExporting(false)
    }
  }

  // PDF export with charts
  const exportToPDF = async (data: any) => {
    // Simple PDF export using browser's print functionality
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Gürbüz Oyuncak - Dashboard Raporu</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f5f5f5; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Gürbüz Oyuncak - Dashboard Raporu</h1>
            <p>Genereted: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: tr })}</p>
            <p>Date Range: ${format(data.dateRange.start, 'dd MMM yyyy')} - ${format(data.dateRange.end, 'dd MMM yyyy')}</p>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Toplam Ürün</h3>
              <p style="font-size: 24px; font-weight: bold;">${data.stats.totalProducts.toLocaleString('tr-TR')}</p>
            </div>
            <div class="stat-card">
              <h3>Toplam Sipariş</h3>
              <p style="font-size: 24px; font-weight: bold;">${data.stats.totalOrders.toLocaleString('tr-TR')}</p>
            </div>
            <div class="stat-card">
              <h3>Aylık Ciro</h3>
              <p style="font-size: 24px; font-weight: bold;">₺${data.stats.monthlyRevenue.toLocaleString('tr-TR')}</p>
            </div>
          </div>
          
          <h2>En Çok Satan Kategoriler</h2>
          <table class="table">
            <thead>
              <tr><th>Kategori</th><th>Ürün Sayısı</th><th>Toplam Satış</th></tr>
            </thead>
            <tbody>
              ${data.categoryPerformance.slice(0, 10).map((cat: any) => 
                `<tr><td>${cat.category_name}</td><td>${cat.product_count}</td><td>₺${cat.total_sales.toLocaleString('tr-TR')}</td></tr>`
              ).join('')}
            </tbody>
          </table>
          
          <h2>Stok Uyarıları</h2>
          <table class="table">
            <thead>
              <tr><th>Ürün</th><th>Kategori</th><th>Stok</th></tr>
            </thead>
            <tbody>
              ${data.stockAlerts.slice(0, 10).map((alert: any) => 
                `<tr><td>${alert.name}</td><td>${alert.category_name}</td><td>${alert.stock_quantity}</td></tr>`
              ).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 500)
  }

  // Excel export
  const exportToExcel = async (data: any) => {
    // Convert data to CSV format for Excel
    const csvData = [
      ['Metric', 'Value'],
      ['Total Products', data.stats.totalProducts],
      ['Total Orders', data.stats.totalOrders],
      ['Monthly Revenue', data.stats.monthlyRevenue],
      ['Daily Revenue', data.stats.dailyRevenue],
      ['Weekly Revenue', data.stats.weeklyRevenue],
      ['Low Stock Products', data.stats.lowStockProducts],
      ['Out of Stock Products', data.stats.outOfStockProducts],
      [''],
      ['Category Performance'],
      ['Category', 'Product Count', 'Total Sales'],
      ...data.categoryPerformance.map((cat: any) => [cat.category_name, cat.product_count, cat.total_sales]),
      [''],
      ['Stock Alerts'],
      ['Product', 'Category', 'Stock'],
      ...data.stockAlerts.map((alert: any) => [alert.name, alert.category_name, alert.stock_quantity])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `gurbuz-oyuncak-dashboard-${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // CSV export
  const exportToCSV = async (data: any) => {
    const csvData = [
      ['Dashboard Data Export'],
      [`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`],
      [`Date Range: ${format(data.dateRange.start, 'yyyy-MM-dd')} to ${format(data.dateRange.end, 'yyyy-MM-dd')}`],
      [''],
      ['Statistics'],
      ['Total Products', data.stats.totalProducts],
      ['Active Products', data.stats.activeProducts],
      ['Total Categories', data.stats.totalCategories],
      ['Total Brands', data.stats.totalBrands],
      ['Total Orders', data.stats.totalOrders],
      ['Total Customers', data.stats.totalCustomers],
      ['Daily Revenue', data.stats.dailyRevenue],
      ['Weekly Revenue', data.stats.weeklyRevenue],
      ['Monthly Revenue', data.stats.monthlyRevenue],
      ['Total Revenue', data.stats.totalRevenue],
      [''],
      ['Category Performance'],
      ['Category Name', 'Product Count', 'Total Sales', 'Average Price'],
      ...data.categoryPerformance.map((cat: any) => [
        cat.category_name,
        cat.product_count,
        cat.total_sales,
        cat.avg_price
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `dashboard-export-${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const orderStatusData = [
    { name: 'Bekliyor', value: stats.pendingOrders, color: '#f59e0b' },
    { name: 'Tamamlandı', value: stats.completedOrders, color: '#10b981' },
    { name: 'İptal', value: stats.cancelledOrders, color: '#ef4444' },
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  // Enhanced loading state
  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm ${config.compactMode ? 'p-4' : 'p-8'}`}>
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-6 h-6 text-green-600 animate-pulse" />
          </div>
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-gray-800">Dashboard Yükleniyor</h3>
          <p className="text-sm text-gray-600 mt-1">Gürbüz Oyuncak verileri hazırlanıyor...</p>
          <div className="mt-2">
            <div className="w-48 bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${config.compactMode ? 'p-4' : 'p-6'}`}>
      {/* Enhanced Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Dashboard</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Globe className="w-4 h-4" />
                <span>Gürbüz Oyuncak Yönetim Paneli</span>
                <span className="text-gray-400">•</span>
                <span>Son güncelleme: {format(new Date(), 'HH:mm:ss')}</span>
                {config.showRealTime && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-600 font-medium">Canlı</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Selector */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {format(config.dateRange.start, 'dd MMM', { locale: tr })} - {format(config.dateRange.end, 'dd MMM', { locale: tr })}
                </span>
              </button>
              
              {showDatePicker && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
                  <div className="space-y-2">
                    <button 
                      onClick={() => { 
                        setConfig(prev => ({ ...prev, dateRange: { start: subDays(new Date(), 7), end: new Date() } }))
                        setShowDatePicker(false)
                      }}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm"
                    >
                      Son 7 Gün
                    </button>
                    <button 
                      onClick={() => { 
                        setConfig(prev => ({ ...prev, dateRange: { start: subDays(new Date(), 30), end: new Date() } }))
                        setShowDatePicker(false)
                      }}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm"
                    >
                      Son 30 Gün
                    </button>
                    <button 
                      onClick={() => { 
                        setConfig(prev => ({ ...prev, dateRange: { start: subMonths(new Date(), 3), end: new Date() } }))
                        setShowDatePicker(false)
                      }}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm"
                    >
                      Son 3 Ay
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Auto Refresh Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <span className="text-sm text-gray-600">Otomatik Yenileme</span>
            </div>

            {/* Export Options */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportDashboard('pdf')}
                disabled={exporting}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                title="PDF Export"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={() => exportDashboard('csv')}
                disabled={exporting}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 border border-green-200 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50"
                title="CSV Export"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">CSV</span>
              </button>
            </div>

            {/* View Options */}
            <button
              onClick={() => setConfig(prev => ({ ...prev, compactMode: !prev.compactMode }))}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
              title="Compact Mode"
            >
              {config.compactMode ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => loadDashboardData()}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Yenileniyor...' : 'Yenile'}
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-green-100 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Yükleme Süresi:</span>
              <span className="text-sm font-semibold text-gray-800">{performanceMetrics.loadTime}ms</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Cache Hit:</span>
              <span className="text-sm font-semibold text-green-600">{performanceMetrics.cacheHitRate}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">Veri Boyutu:</span>
              <span className="text-sm font-semibold text-purple-600">{((performanceMetrics.dataSize || 0) / 1024).toFixed(1)} KB</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshMaterializedViews}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              MV Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Ana İstatistikler */}
      <div className={`grid ${config.compactMode ? 'grid-cols-2 lg:grid-cols-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'} gap-4 lg:gap-6`}>
        <EnhancedStatCard
          icon={<Package className="w-6 h-6" />}
          title="Toplam Ürün"
          value={stats.totalProducts.toLocaleString('tr-TR')}
          subtitle={`${stats.activeProducts} aktif ürün`}
          trend="+12%"
          color="blue"
          progress={stats.totalProducts > 0 ? (stats.activeProducts / stats.totalProducts) * 100 : 0}
          details={[
            { label: 'Kategoriler', value: stats.totalCategories },
            { label: 'Markalar', value: stats.totalBrands },
            { label: 'Düşük Stok', value: stats.lowStockProducts }
          ]}
        />
        <EnhancedStatCard
          icon={<ShoppingCart className="w-6 h-6" />}
          title="Toplam Sipariş"
          value={stats.totalOrders.toLocaleString('tr-TR')}
          subtitle={`${stats.pendingOrders} bekleyen`}
          trend="+8%"
          color="green"
          progress={stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0}
          details={[
            { label: 'Tamamlandı', value: stats.completedOrders },
            { label: 'İptal', value: stats.cancelledOrders },
            { label: 'Bekleyen', value: stats.pendingOrders }
          ]}
        />
        <EnhancedStatCard
          icon={<Users className="w-6 h-6" />}
          title="Müşteri Sayısı"
          value={stats.totalCustomers.toLocaleString('tr-TR')}
          subtitle={`Aktif taban`}
          trend="+23%"
          color="purple"
          details={[
            { label: 'Markalar', value: stats.totalBrands },
            { label: 'Aylık Yeni', value: Math.floor(stats.totalCustomers * 0.1) }
          ]}
        />
        <EnhancedStatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Aylık Ciro"
          value={`₺${stats.monthlyRevenue.toLocaleString('tr-TR')}`}
          subtitle={`Bugün: ₺${stats.dailyRevenue.toLocaleString('tr-TR')}`}
          trend={typeof memoizedStats.salesMetrics.dailyGrowth === 'number' && !isNaN(memoizedStats.salesMetrics.dailyGrowth) && memoizedStats.salesMetrics.dailyGrowth !== null ? 
                `${memoizedStats.salesMetrics.dailyGrowth > 0 ? '+' : ''}${(memoizedStats.salesMetrics.dailyGrowth || 0).toFixed(1)}%` : '0%'}
          color="orange"
          progress={stats.totalRevenue > 0 ? (stats.monthlyRevenue / stats.totalRevenue) * 100 : 0}
          details={[
            { label: 'Günlük', value: `₺${stats.dailyRevenue.toLocaleString('tr-TR')}` },
            { label: 'Haftalık', value: `₺${stats.weeklyRevenue.toLocaleString('tr-TR')}` },
            { label: 'Toplam', value: `₺${stats.totalRevenue.toLocaleString('tr-TR')}` }
          ]}
        />
        <EnhancedStatCard
          icon={<Warehouse className="w-6 h-6" />}
          title="Stok Sağlığı"
          value={`${memoizedStats.stockHealth.healthScore}%`}
          subtitle={`${stats.totalProducts} toplam ürün`}
          trend={memoizedStats.stockHealth.healthScore >= 80 ? "Sağlıklı" : memoizedStats.stockHealth.healthScore >= 60 ? "Dikkat" : "Kritik"}
          color={memoizedStats.stockHealth.healthScore >= 80 ? "green" : memoizedStats.stockHealth.healthScore >= 60 ? "yellow" : "red"}
          details={[
            { label: 'Sağlıklı', value: memoizedStats.stockHealth.healthy },
            { label: 'Düşük', value: memoizedStats.stockHealth.warning },
            { label: 'Kritik', value: memoizedStats.stockHealth.critical }
          ]}
          isPercentage={true}
        />
        <EnhancedStatCard
          icon={<Eye className="w-6 h-6" />}
          title="Dönüşüm Oranı"
          value={`${typeof memoizedStats.salesMetrics.conversionRate === 'number' && !isNaN(memoizedStats.salesMetrics.conversionRate) ? memoizedStats.salesMetrics.conversionRate.toFixed(1) : '0'}%`}
          subtitle="Sipariş → Tamamlanma"
          trend="+2.3%"
          color="indigo"
          progress={memoizedStats.salesMetrics.conversionRate}
          details={[
            { label: 'Ort. Sipariş', value: `₺${memoizedStats.salesMetrics.avgOrderValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}` }
          ]}
          isPercentage={true}
        />
      </div>

      {/* Real-time Updates & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Updates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-800">Canlı Güncellemeler</h3>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Aktif</span>
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {realtimeUpdates.length > 0 ? (
              realtimeUpdates.slice(0, 5).map((update, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                    update.type === 'order' ? 'bg-green-500' :
                    update.type === 'product' ? 'bg-green-500' :
                    update.type === 'customer' ? 'bg-purple-500' :
                    'bg-orange-500'
                  }`}>
                    {update.type === 'order' ? <ShoppingBag className="w-4 h-4" /> :
                     update.type === 'product' ? <Package className="w-4 h-4" /> :
                     update.type === 'customer' ? <Users className="w-4 h-4" /> :
                     <AlertCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {update.type === 'order' ? 'Yeni sipariş' :
                       update.type === 'product' ? 'Ürün güncellendi' :
                       update.type === 'customer' ? 'Yeni müşteri' :
                       'Stok uyarısı'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(update.timestamp, 'HH:mm:ss')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Henüz canlı güncelleme yok</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickStatCard
              icon={<DollarSign />}
              label="Günlük Ciro"
              value={`₺${stats.dailyRevenue.toLocaleString('tr-TR')}`}
              color="blue"
              trend="+5%"
              details={`${(memoizedStats.salesMetrics.dailyGrowth || 0) > 0 ? '+' : ''}${(memoizedStats.salesMetrics.dailyGrowth || 0).toFixed(1)}%`}
            />
            <QuickStatCard
              icon={<BarChart3 />}
              label="Haftalık Ciro"
              value={`₺${stats.weeklyRevenue.toLocaleString('tr-TR')}`}
              color="green"
              trend="+12%"
              details={`${stats.totalOrders > 0 ? (stats.weeklyRevenue / stats.totalOrders).toFixed(0) : 0} ort. sipariş`}
            />
            <QuickStatCard
              icon={<TrendingUp />}
              label="Aylık Büyüme"
              value={`₺${stats.monthlyRevenue.toLocaleString('tr-TR')}`}
              color="purple"
              trend="+15%"
              details={`₺${(stats.totalRevenue / Math.max(stats.totalOrders, 1)).toFixed(0)} ort. değer`}
            />
            <QuickStatCard
              icon={<Award />}
              label="Müşteri Memnuniyeti"
              value={`${typeof memoizedStats.salesMetrics.conversionRate === 'number' && !isNaN(memoizedStats.salesMetrics.conversionRate) ? memoizedStats.salesMetrics.conversionRate.toFixed(1) : '0'}%`}
              color="orange"
              trend="+2.3%"
              details={`${stats.totalCustomers} aktif müşteri`}
              isPercentage={true}
            />
          </div>
        </div>
      </div>

      {/* Stok Durumu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickStatCard
          icon={<Warehouse />}
          label="Düşük Stok"
          value={stats.lowStockProducts}
          color="yellow"
          subtitle="10'dan az"
        />
        <QuickStatCard
          icon={<XCircle />}
          label="Tükenmiş"
          value={stats.outOfStockProducts}
          color="red"
          subtitle="Stokta yok"
        />
        <QuickStatCard
          icon={<CheckCircle />}
          label="Aktif Ürünler"
          value={stats.activeProducts}
          color="green"
          subtitle={`/ ${stats.totalProducts} toplam`}
        />
      </div>

      {/* Stok Uyarıları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 text-red-700 w-12 h-12 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-gray-600 text-sm">Aktif Stok Uyarıları</p>
              <p className="text-3xl font-bold text-gray-800">{stats.activeStockAlerts}</p>
              <p className="text-xs text-gray-500 mt-1">Yönetilmesi gereken uyarı</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 text-orange-700 w-12 h-12 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-gray-600 text-sm">Kritik Uyarılar</p>
              <p className="text-3xl font-bold text-gray-800">{stats.criticalStockAlerts}</p>
              <p className="text-xs text-gray-500 mt-1">Acil müdahale gerekli</p>
            </div>
          </div>
        </div>
      </div>

      {/* Satış Grafikleri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Günlük Satış Trendi */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Günlük Satış Trendi (Son 30 Gün)</h3>
          <RechartResponsiveContainer width="100%" height={300}>
            <RechartAreaChart data={salesData.daily}>
              <RechartCartesianGrid strokeDasharray="3 3" />
              <RechartXAxis dataKey="name" />
              <RechartYAxis />
              <RechartTooltip formatter={(value: any) => [`₺${value.toLocaleString('tr-TR')}`, 'Satış']} />
              <RechartLegend />
              <RechartArea type="monotone" dataKey="sales" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Satış (₺)" />
            </RechartAreaChart>
          </RechartResponsiveContainer>
        </div>

        {/* Haftalık Satış */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Haftalık Satış (Son 12 Hafta)</h3>
          <RechartResponsiveContainer width="100%" height={300}>
            <RechartBarChart data={salesData.weekly}>
              <RechartCartesianGrid strokeDasharray="3 3" />
              <RechartXAxis dataKey="week" />
              <RechartYAxis />
              <RechartTooltip formatter={(value: any) => [`₺${value.toLocaleString('tr-TR')}`, 'Satış']} />
              <RechartLegend />
              <RechartBar dataKey="sales" fill="#10b981" name="Satış (₺)" />
            </RechartBarChart>
          </RechartResponsiveContainer>
        </div>

        {/* Aylık Satış Trendi */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Aylık Satış Trendi (Son 12 Ay)</h3>
          <RechartResponsiveContainer width="100%" height={300}>
            <RechartLineChart data={salesData.monthly}>
              <RechartCartesianGrid strokeDasharray="3 3" />
              <RechartXAxis dataKey="month" />
              <RechartYAxis />
              <RechartTooltip formatter={(value: any) => [`₺${value.toLocaleString('tr-TR')}`, 'Satış']} />
              <RechartLegend />
              <RechartLine type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={3} name="Satış (₺)" />
            </RechartLineChart>
          </RechartResponsiveContainer>
        </div>

        {/* Sipariş Durumları */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sipariş Durumları</h3>
          <RechartResponsiveContainer width="100%" height={300}>
            <RechartComposedChart data={orderStatusData}>
              <RechartCartesianGrid strokeDasharray="3 3" />
              <RechartXAxis dataKey="name" />
              <RechartYAxis />
              <RechartTooltip />
              <RechartLegend />
              <RechartBar dataKey="value" name="Sipariş Sayısı">
                {orderStatusData.map((entry, index) => (
                  <RechartCell key={`cell-${index}`} fill={entry.color} />
                ))}
              </RechartBar>
            </RechartComposedChart>
          </RechartResponsiveContainer>
        </div>
      </div>

      {/* Performans Analizleri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kategori Performansı */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">En Çok Satan Kategoriler</h3>
          <div className="space-y-4">
            {categoryPerformance.slice(0, 8).map((category, index) => (
              <div key={category.category_name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{category.category_name}</p>
                    <p className="text-sm text-gray-600">{category.product_count} ürün</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">₺{(category.total_sales || 0).toLocaleString('tr-TR')}</p>
                  <p className="text-sm text-gray-600">Ort. ₺{Math.round(category.avg_price || 0).toLocaleString('tr-TR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marka Performansı */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">En Çok Satan Markalar</h3>
          <div className="space-y-4">
            {brandPerformance.slice(0, 8).map((brand, index) => (
              <div key={brand.brand_name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{brand.brand_name}</p>
                    <p className="text-sm text-gray-600">{brand.product_count} ürün</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">₺{(brand.total_sales || 0).toLocaleString('tr-TR')}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <p className="text-sm text-gray-600">{(brand.avg_rating || 0).toFixed(1)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stok Uyarıları ve Son Aktiviteler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stok Uyarıları */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-orange-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">Stok Uyarıları</h3>
          </div>
          <div className="space-y-3">
            {stockAlerts.length > 0 ? (
              stockAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800">{alert.name}</p>
                    <p className="text-sm text-gray-600">{alert.category_name}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    alert.stock_quantity === 0 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {alert.stock_quantity === 0 ? 'Tükendi' : `${alert.stock_quantity} adet`}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Stok uyarısı bulunmuyor</p>
            )}
          </div>
        </div>

        {/* Enhanced Son Aktiviteler */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="text-green-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Son Aktiviteler</h3>
            </div>
            <button 
              onClick={() => fetchRecentActivities()}
              className="text-xs text-green-600 hover:text-green-800 font-medium"
            >
              Yenile
            </button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 8).map((activity, index) => {
                const getIcon = (type: string) => {
                  switch (type) {
                    case 'order':
                      return <ShoppingCart className="text-green-600" size={16} />
                    case 'product':
                      return <Package className="text-green-600" size={16} />
                    case 'customer':
                      return <Users className="text-purple-600" size={16} />
                    default:
                      return <Activity className="text-gray-600" size={16} />
                  }
                }
                
                return (
                  <EnhancedActivityItem
                    key={index}
                    icon={getIcon(activity.activity_type)}
                    text={activity.activity_description}
                    time={format(new Date(activity.activity_time), 'HH:mm', { locale: tr })}
                    type={activity.activity_type}
                  />
                )
              })
            ) : (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Henüz aktivite yok</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EnhancedStatCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color, 
  trend, 
  progress = 0, 
  details = [], 
  isPercentage = false,
  onClick 
}: {
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'indigo' | 'pink'
  trend?: string
  progress?: number
  details?: { label: string, value: string | number }[]
  isPercentage?: boolean
  onClick?: () => void
}) {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      text: 'text-green-600',
      bgLight: 'bg-green-50',
      border: 'border-green-200'
    },
    green: {
      bg: 'from-green-500 to-green-600',
      text: 'text-green-600',
      bgLight: 'bg-green-50',
      border: 'border-green-200'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      text: 'text-purple-600',
      bgLight: 'bg-purple-50',
      border: 'border-purple-200'
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      text: 'text-orange-600',
      bgLight: 'bg-orange-50',
      border: 'border-orange-200'
    },
    red: {
      bg: 'from-red-500 to-red-600',
      text: 'text-red-600',
      bgLight: 'bg-red-50',
      border: 'border-red-200'
    },
    yellow: {
      bg: 'from-yellow-500 to-yellow-600',
      text: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
      border: 'border-yellow-200'
    },
    indigo: {
      bg: 'from-indigo-500 to-indigo-600',
      text: 'text-indigo-600',
      bgLight: 'bg-indigo-50',
      border: 'border-indigo-200'
    },
    pink: {
      bg: 'from-pink-500 to-pink-600',
      text: 'text-pink-600',
      bgLight: 'bg-pink-50',
      border: 'border-pink-200'
    }
  }

  const colors = colorClasses[color]
  const isPositiveTrend = trend?.startsWith('+') || trend === 'Sağlıklı'
  const isNegativeTrend = trend?.startsWith('-') || trend === 'Kritik'

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-gray-200 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="p-4 lg:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1">{title}</p>
            <h3 className="text-xl lg:text-3xl font-bold text-gray-800 mb-1">
              {isPercentage && typeof value === 'number' && !isNaN(value) ? `${value.toFixed(1)}%` : value || '0'}
            </h3>
            <p className="text-gray-500 text-xs">{subtitle}</p>
          </div>
          <div className={`bg-gradient-to-br ${colors.bg} w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-white shadow-lg`}>
            {icon}
          </div>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${colors.bg} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Progress: {typeof progress === 'number' && !isNaN(progress) ? progress.toFixed(0) : '0'}%</p>
          </div>
        )}

        {/* Details */}
        {details.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {details.slice(0, 3).map((detail, index) => (
              <div key={index} className={`text-center p-2 ${colors.bgLight} rounded-xl border ${colors.border}`}>
                <p className="text-xs text-gray-600">{detail.label}</p>
                <p className="text-sm font-semibold text-gray-800">
                  {typeof detail.value === 'number' ? detail.value.toLocaleString('tr-TR') : detail.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Trend */}
        {trend && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <span className={`text-xs font-medium ${
                isPositiveTrend ? 'text-green-600' : 
                isNegativeTrend ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {trend}
              </span>
              <span className="text-xs text-gray-500">geçen döneme göre</span>
            </div>
            {isPercentage && (
              <div className={`w-2 h-2 rounded-full ${
                isPositiveTrend ? 'bg-green-500' : 
                isNegativeTrend ? 'bg-red-500' : 
                'bg-gray-400'
              }`}></div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function QuickStatCard({ 
  icon, 
  label, 
  value, 
  color, 
  trend, 
  subtitle, 
  details,
  isPercentage = false 
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: 'yellow' | 'green' | 'red' | 'blue' | 'purple' | 'orange'
  trend?: string
  subtitle?: string
  details?: string
  isPercentage?: boolean
}) {
  const colorClasses = {
    yellow: {
      bg: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      accent: 'bg-yellow-500'
    },
    green: {
      bg: 'bg-green-100 text-green-700 border-green-200',
      accent: 'bg-green-500'
    },
    red: {
      bg: 'bg-red-100 text-red-700 border-red-200',
      accent: 'bg-red-500'
    },
    blue: {
      bg: 'bg-green-100 text-green-700 border-green-200',
      accent: 'bg-green-500'
    },
    purple: {
      bg: 'bg-purple-100 text-purple-700 border-purple-200',
      accent: 'bg-purple-500'
    },
    orange: {
      bg: 'bg-orange-100 text-orange-700 border-orange-200',
      accent: 'bg-orange-500'
    }
  }

  const colors = colorClasses[color]
  const isPositiveTrend = trend?.startsWith('+') 

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 p-4 lg:p-6">
      <div className="flex items-start gap-4">
        <div className={`${colors.bg} w-12 h-12 rounded-xl flex items-center justify-center border ${colors.accent} border-opacity-20`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-xl lg:text-2xl font-bold text-gray-800">
              {isPercentage && typeof value === 'number' && !isNaN(value) ? `${value.toFixed(1)}%` : value || '0'}
            </p>
            {trend && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                isPositiveTrend 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {trend}
              </span>
            )}
          </div>
          {details && (
            <p className="text-xs text-gray-500 mb-1">{details}</p>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      
      {/* Mini trend indicator */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Performans</span>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${colors.accent}`}></div>
            <span className="text-xs text-gray-600">Aktif</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function EnhancedActivityItem({ 
  icon, 
  text, 
  time, 
  type 
}: {
  icon: React.ReactNode
  text: string
  time: string
  type: string
}) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-green-50 border-green-200'
      case 'product':
        return 'bg-green-50 border-green-200'
      case 'customer':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${getTypeColor(type)} hover:shadow-md hover:border-green-500/50 transition-all duration-200`}>
      <div className="mt-0.5 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 font-medium">{text}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-gray-500">{time}</p>
          <div className={`w-1.5 h-1.5 rounded-full ${
            type === 'order' ? 'bg-green-400' :
            type === 'product' ? 'bg-green-400' :
            type === 'customer' ? 'bg-purple-400' :
            'bg-gray-400'
          } animate-pulse`}></div>
        </div>
      </div>
    </div>
  )
}
