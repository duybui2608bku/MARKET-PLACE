"use client";

import { useT, useLocale } from "@/i18n/provider";
import { toast } from "@/lib/toast";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Flag,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DashboardStats {
  users: {
    total: number;
    workers: number;
    employers: number;
    admins: number;
    active: number;
    suspended: number;
    banned: number;
  };
  workers: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    active: number;
    suspended: number;
    verified: number;
  };
  employers: {
    total: number;
    active: number;
    verified: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
  };
  reviews: {
    total: number;
    averageRating: number;
    hidden: number;
  };
  reports: {
    total: number;
    pending: number;
    investigating: number;
    resolved: number;
    dismissed: number;
  };
  recentActivity: {
    newWorkersToday: number;
    newEmployersToday: number;
    newBookingsToday: number;
    newReportsToday: number;
  };
}

export default function AdminDashboard() {
  const t = useT();
  const locale = useLocale();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
      const response = await fetch("/api/admin/stats?type=dashboard", {
        headers: {
          "x-admin-secret": adminSecret || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load statistics";
      toast.error("Error loading dashboard", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    trend?: string;
  }) => {
    const getColorClasses = () => {
      const colors: Record<string, string> = {
        blue: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 text-blue-600 dark:text-blue-400",
        green: "bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 text-green-600 dark:text-green-400",
        purple: "bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 text-purple-600 dark:text-purple-400",
        orange: "bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 text-orange-600 dark:text-orange-400",
        primary: "bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 text-primary dark:text-primary",
      };
      return colors[color] || colors.primary;
    };

    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border-border/40 bg-gradient-to-br from-white to-accent/20 dark:from-gray-900 dark:to-gray-800 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                {title}
              </p>
              <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                {value}
              </p>
              {trend && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {trend}
                </p>
              )}
            </div>
            <div className={`p-3.5 rounded-2xl shadow-lg ${getColorClasses()} group-hover:scale-110 transition-transform`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Failed to load dashboard statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Marketplace overview and management center
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-border/40 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Pending Actions Alert */}
      {(stats.workers.pending > 0 || stats.reports.pending > 0) && (
        <Alert className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-orange-50/50 dark:from-orange-900/20 dark:to-orange-900/10 shadow-lg">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <AlertDescription className="text-orange-900 dark:text-orange-200 font-medium">
            ⚡ You have <strong>{stats.workers.pending}</strong> pending worker approvals and{" "}
            <strong>{stats.reports.pending}</strong> pending reports requiring attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          icon={Users}
          color="primary"
          trend={`+${stats.recentActivity.newWorkersToday + stats.recentActivity.newEmployersToday} today`}
        />
        <StatCard
          title="Total Workers"
          value={stats.workers.total}
          icon={Briefcase}
          color="green"
          trend={`+${stats.recentActivity.newWorkersToday} today`}
        />
        <StatCard
          title="Total Bookings"
          value={stats.bookings.total}
          icon={Calendar}
          color="purple"
          trend={`+${stats.recentActivity.newBookingsToday} today`}
        />
        <StatCard
          title="Total Reports"
          value={stats.reports.total}
          icon={Flag}
          color="orange"
          trend={`${stats.reports.pending} pending`}
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Workers"
          value={stats.workers.active}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.workers.pending}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Completed Bookings"
          value={stats.bookings.completed}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Average Rating"
          value={stats.reviews.averageRating.toFixed(1)}
          icon={TrendingUp}
          color="primary"
        />
      </div>

      {/* Detailed Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Worker Status */}
        <Card className="border-border/40 bg-gradient-to-br from-white to-accent/20 dark:from-gray-900 dark:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Worker Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Pending Approval
                </span>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  {stats.workers.pending}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Approved
                </span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {stats.workers.approved}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Rejected
                </span>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {stats.workers.rejected}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Verified
                </span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {stats.workers.verified}
                </Badge>
              </div>
            </div>
            <Link
              href={`/${locale}/admin/workers`}
              className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              Manage Workers →
            </Link>
          </CardContent>
        </Card>

        {/* Report Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Reports & Disputes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Pending
                </span>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  {stats.reports.pending}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Investigating
                </span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {stats.reports.investigating}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Resolved
                </span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {stats.reports.resolved}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Dismissed
                </span>
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  {stats.reports.dismissed}
                </Badge>
              </div>
            </div>
            <Link
              href={`/${locale}/admin/reports`}
              className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              View All Reports →
            </Link>
          </CardContent>
        </Card>

        {/* Booking Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Booking Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Pending
                </span>
                <Badge variant="outline">{stats.bookings.pending}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Confirmed
                </span>
                <Badge variant="outline">{stats.bookings.confirmed}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </span>
                <Badge variant="outline">{stats.bookings.completed}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Revenue
                </span>
                <span className="text-sm font-semibold">
                  ${stats.bookings.totalRevenue.toLocaleString()}
                </span>
              </div>
            </div>
            <Link
              href={`/${locale}/admin/bookings`}
              className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              Manage Bookings →
            </Link>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              User Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Active
                </span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {stats.users.active}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Suspended
                </span>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  {stats.users.suspended}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Banned
                </span>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {stats.users.banned}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Employers
                </span>
                <Badge variant="outline">{stats.employers.total}</Badge>
              </div>
            </div>
            <Link
              href={`/${locale}/admin/clients`}
              className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              Manage Clients →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/${locale}/admin/workers?status=pending`}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-center"
            >
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Approve Workers
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.workers.pending} pending
              </p>
            </Link>
            <Link
              href={`/${locale}/admin/reports?status=pending`}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-center"
            >
              <Flag className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Review Reports
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.reports.pending} pending
              </p>
            </Link>
            <Link
              href={`/${locale}/admin/bookings`}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-center"
            >
              <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                View Bookings
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.bookings.total} total
              </p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
