"use client";

import { useT, useLocale } from "@/i18n/provider";
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
  const [error, setError] = useState<string | null>(null);

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
      setError(err instanceof Error ? err.message : "Failed to load statistics");
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
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {value}
            </p>
            {trend && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                {trend}
              </p>
            )}
          </div>
          <div
            className={`p-3 rounded-lg ${
              color === "blue"
                ? "bg-blue-100 dark:bg-blue-900/20"
                : color === "green"
                ? "bg-green-100 dark:bg-green-900/20"
                : color === "purple"
                ? "bg-purple-100 dark:bg-purple-900/20"
                : color === "orange"
                ? "bg-orange-100 dark:bg-orange-900/20"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            <Icon
              className={`w-6 h-6 ${
                color === "blue"
                  ? "text-blue-600 dark:text-blue-400"
                  : color === "green"
                  ? "text-green-600 dark:text-green-400"
                  : color === "purple"
                  ? "text-purple-600 dark:text-purple-400"
                  : color === "orange"
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stats) return null;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Marketplace overview and management center
        </p>
      </div>

      {/* Pending Actions Alert */}
      {(stats.workers.pending > 0 || stats.reports.pending > 0) && (
        <Alert className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-900/10">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            You have {stats.workers.pending} pending worker approvals and{" "}
            {stats.reports.pending} pending reports requiring attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          icon={Users}
          color="blue"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          color="purple"
        />
      </div>

      {/* Detailed Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Worker Status */}
        <Card>
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
