/**
 * Admin Dashboard Statistics
 * Provides aggregated statistics for admin dashboard
 */

import { createAdminClient } from './supabase/server'
import { Result, ErrorCodes } from './types'

export interface DashboardStats {
  users: {
    total: number
    workers: number
    employers: number
    admins: number
    active: number
    suspended: number
    banned: number
  }
  workers: {
    total: number
    pending: number
    approved: number
    rejected: number
    active: number
    suspended: number
    verified: number
  }
  employers: {
    total: number
    active: number
    verified: number
  }
  bookings: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
    totalRevenue: number
  }
  reviews: {
    total: number
    averageRating: number
    hidden: number
  }
  reports: {
    total: number
    pending: number
    investigating: number
    resolved: number
    dismissed: number
  }
  recentActivity: {
    newWorkersToday: number
    newEmployersToday: number
    newBookingsToday: number
    newReportsToday: number
  }
}

/**
 * Get comprehensive dashboard statistics
 */
export async function getDashboardStats(): Promise<Result<DashboardStats>> {
  try {
    const supabase = createAdminClient()

    // Get today's date for recent activity
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    // Fetch all data in parallel
    const [
      usersResult,
      workersResult,
      employersResult,
      workerProfilesResult,
      employerProfilesResult,
      bookingsResult,
      reviewsResult,
      reportsResult,
    ] = await Promise.all([
      // Users stats
      supabase.from('users').select('role, account_status, created_at'),

      // Workers stats
      supabase
        .from('users')
        .select('id, created_at')
        .eq('role', 'worker')
        .gte('created_at', todayISO),

      // Employers stats
      supabase
        .from('users')
        .select('id, created_at')
        .eq('role', 'employer')
        .gte('created_at', todayISO),

      // Worker profiles stats
      supabase
        .from('worker_profiles')
        .select('approval_status, profile_status, is_verified'),

      // Employer profiles stats
      supabase.from('employer_profiles').select('is_verified'),

      // Bookings stats
      supabase
        .from('bookings')
        .select('status, total_amount, currency, created_at'),

      // Reviews stats
      supabase.from('reviews').select('rating, is_hidden'),

      // Reports stats
      supabase.from('reports').select('status, created_at'),
    ])

    // Process users data
    const users = usersResult.data || []
    const userStats = {
      total: users.length,
      workers: users.filter((u) => u.role === 'worker').length,
      employers: users.filter((u) => u.role === 'employer').length,
      admins: users.filter((u) => u.role === 'admin').length,
      active: users.filter((u) => u.account_status === 'active').length,
      suspended: users.filter((u) => u.account_status === 'suspended').length,
      banned: users.filter((u) => u.account_status === 'banned').length,
    }

    // Process worker profiles data
    const workerProfiles = workerProfilesResult.data || []
    const workerStats = {
      total: workerProfiles.length,
      pending: workerProfiles.filter((w) => w.approval_status === 'pending')
        .length,
      approved: workerProfiles.filter((w) => w.approval_status === 'approved')
        .length,
      rejected: workerProfiles.filter((w) => w.approval_status === 'rejected')
        .length,
      active: workerProfiles.filter((w) => w.profile_status === 'active')
        .length,
      suspended: workerProfiles.filter((w) => w.profile_status === 'suspended')
        .length,
      verified: workerProfiles.filter((w) => w.is_verified).length,
    }

    // Process employer profiles data
    const employerProfiles = employerProfilesResult.data || []
    const employerStats = {
      total: employerProfiles.length,
      active: userStats.employers - userStats.suspended - userStats.banned,
      verified: employerProfiles.filter((e) => e.is_verified).length,
    }

    // Process bookings data
    const bookings = bookingsResult.data || []
    const bookingStats = {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
      totalRevenue: bookings
        .filter((b) => b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0),
    }

    // Process reviews data
    const reviews = reviewsResult.data || []
    const reviewStats = {
      total: reviews.length,
      averageRating:
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            reviews.length
          : 0,
      hidden: reviews.filter((r) => r.is_hidden).length,
    }

    // Process reports data
    const reports = reportsResult.data || []
    const reportStats = {
      total: reports.length,
      pending: reports.filter((r) => r.status === 'pending').length,
      investigating: reports.filter((r) => r.status === 'investigating').length,
      resolved: reports.filter((r) => r.status === 'resolved').length,
      dismissed: reports.filter((r) => r.status === 'dismissed').length,
    }

    // Recent activity
    const recentActivity = {
      newWorkersToday: workersResult.data?.length || 0,
      newEmployersToday: employersResult.data?.length || 0,
      newBookingsToday: bookings.filter((b) => b.created_at >= todayISO).length,
      newReportsToday: reports.filter((r) => r.created_at >= todayISO).length,
    }

    const stats: DashboardStats = {
      users: userStats,
      workers: workerStats,
      employers: employerStats,
      bookings: bookingStats,
      reviews: reviewStats,
      reports: reportStats,
      recentActivity,
    }

    return { success: true, data: stats }
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'Failed to fetch dashboard statistics',
        details: error instanceof Error ? error.message : String(error),
      },
    }
  }
}

/**
 * Get user growth statistics over time
 */
export async function getUserGrowthStats(
  days = 30
): Promise<
  Result<{
    labels: string[]
    workers: number[]
    employers: number[]
  }>
> {
  try {
    const supabase = createAdminClient()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('users')
      .select('role, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch user growth stats',
          details: error.message,
        },
      }
    }

    // Group by date
    const dailyStats: Record<
      string,
      { workers: number; employers: number }
    > = {}

    // Initialize all dates
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      dailyStats[dateStr] = { workers: 0, employers: 0 }
    }

    // Count users per day
    data.forEach((user) => {
      const dateStr = user.created_at.split('T')[0]
      if (dailyStats[dateStr]) {
        if (user.role === 'worker') {
          dailyStats[dateStr].workers++
        } else if (user.role === 'employer') {
          dailyStats[dateStr].employers++
        }
      }
    })

    const labels = Object.keys(dailyStats).sort()
    const workers = labels.map((date) => dailyStats[date].workers)
    const employers = labels.map((date) => dailyStats[date].employers)

    return {
      success: true,
      data: { labels, workers, employers },
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
    }
  }
}

/**
 * Get revenue statistics
 */
export async function getRevenueStats(
  days = 30
): Promise<
  Result<{
    labels: string[]
    revenue: number[]
    totalRevenue: number
    averageBookingValue: number
  }>
> {
  try {
    const supabase = createAdminClient()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('bookings')
      .select('total_amount, created_at, status')
      .gte('created_at', startDate.toISOString())
      .eq('status', 'completed')
      .order('created_at', { ascending: true })

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch revenue stats',
          details: error.message,
        },
      }
    }

    // Group by date
    const dailyRevenue: Record<string, number> = {}

    // Initialize all dates
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      dailyRevenue[dateStr] = 0
    }

    // Sum revenue per day
    let totalRevenue = 0
    data.forEach((booking) => {
      const dateStr = booking.created_at.split('T')[0]
      const amount = booking.total_amount || 0
      if (dailyRevenue[dateStr] !== undefined) {
        dailyRevenue[dateStr] += amount
      }
      totalRevenue += amount
    })

    const labels = Object.keys(dailyRevenue).sort()
    const revenue = labels.map((date) => dailyRevenue[date])
    const averageBookingValue =
      data.length > 0 ? totalRevenue / data.length : 0

    return {
      success: true,
      data: { labels, revenue, totalRevenue, averageBookingValue },
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
    }
  }
}
